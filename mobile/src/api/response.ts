import { z } from "zod";

export class ApiError extends Error {
  statusCode: number;
  error?: string;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    error?: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function requireServerId(value: string, field: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new ApiError(`${field} is required`, 400, "INVALID_REQUEST");
  }
  return normalized;
}

export type ResponseAdapter<T> = (value: unknown) => T;

export function parseApiData<T>(
  value: unknown,
  adapter: ResponseAdapter<T>,
): T {
  try {
    return adapter(value);
  } catch (_) {
    throw new ApiError("INVALID_RESPONSE", 502, "INVALID_RESPONSE");
  }
}

export function zodAdapter<T>(schema: z.ZodType<T>): ResponseAdapter<T> {
  return (value) => schema.parse(value);
}

export function noContentAdapter(value: unknown): void {
  if (value !== undefined) {
    throw new Error("Expected an empty response body");
  }
}

/**
 * The one object guard for the whole client boundary.
 *
 * Four private copies of this check existed: one that threw, two that returned
 * undefined, one type predicate, plus two inlined versions. Callers silently
 * disagreed about whether a non-object was an error or a normal outcome, so
 * the two intents are now named explicitly rather than left to call-site taste.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** For values that must be an object; a non-object is a contract violation. */
export function asRecordOrThrow(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Expected an object response");
  }
  return value;
}

/** For values where a non-object is an expected outcome, not a failure. */
export function asRecordOrUndefined(
  value: unknown,
): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

export function arrayAdapter<T>(
  adapter: ResponseAdapter<T>,
): ResponseAdapter<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new Error("Expected an array response");
    }
    return value.map((item) => adapter(item));
  };
}

export function collectionAdapter<T>(
  adapter: ResponseAdapter<T>,
): ResponseAdapter<T[]> {
  return (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => adapter(item));
    }
    const record = asRecordOrThrow(value);
    if (!Array.isArray(record.data)) {
      throw new Error("Expected a collection response");
    }
    return record.data.map((item) => adapter(item));
  };
}

export interface PaginatedMeta {
  itemCount: number;
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginatedMeta;
}

const paginatedMetaSchema: z.ZodType<PaginatedMeta> = z.object({
  itemCount: z.number(),
  totalItems: z.number(),
  itemsPerPage: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

export function paginatedAdapter<T>(
  adapter: ResponseAdapter<T>,
): ResponseAdapter<PaginatedResult<T>> {
  return (value) => {
    const record = asRecordOrThrow(value);
    if (!Array.isArray(record.data)) {
      throw new Error("Expected a paginated response");
    }

    return {
      data: record.data.map((item) => adapter(item)),
      meta: paginatedMetaSchema.parse(record.meta),
    };
  };
}

export function withQueryParams(
  path: string,
  params: Readonly<Record<string, string | number | undefined>>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  }
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

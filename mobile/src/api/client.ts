/**
 * PsiKita Core API — Universal Fetch Client
 * Mendukung autentikasi Bearer token, timeout, error handling, dan health check
 */

import { secureStorage } from "../utils/storage";
import { ApiError, noContentAdapter, parseApiData } from "./response";
import { devFixtureFor, isDevVoidFixture } from "@/config/devFixtureRouter";

import type { ResponseAdapter } from "./response";

export {
  ApiError,
  noContentAdapter,
  parseApiData,
  zodAdapter,
} from "./response";
export type { ResponseAdapter } from "./response";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

const TOKEN_KEY = "psikita_access_token";
let currentAccessToken: string | null = null;
let tokenEpoch = 0;
let authContextEpoch = 0;
let tokenStorageQueue: Promise<void> = Promise.resolve();

/**
 * Set when the most recent token write to secure storage failed. The queue keeps
 * running after a failure so one bad write cannot wedge every later token
 * operation, but the failure is recorded rather than discarded: a caller can then
 * tell "persisted" apart from "looked persisted".
 */
let lastTokenStorageFailure: unknown = null;

const enqueueTokenStorage = (operation: () => Promise<void>) => {
  const next = tokenStorageQueue.then(operation, operation);
  tokenStorageQueue = next.catch((error) => {
    lastTokenStorageFailure = error;
  });
};

/** True when a token write to secure storage has failed since the last success. */
export const hasTokenStorageFailed = (): boolean => lastTokenStorageFailure !== null;

const hydrateAccessToken = async () => {
  const readEpoch = tokenEpoch;
  const token = await secureStorage.getItem(TOKEN_KEY);
  if (readEpoch !== tokenEpoch) {
    return;
  }
  if (token) {
    currentAccessToken = token;
  }
};

void hydrateAccessToken().catch(() => undefined);

export function invalidateAuthContext(): void {
  authContextEpoch += 1;
}

export const setAuthToken = (token: string | null): Promise<void> => {
  tokenEpoch += 1;
  invalidateAuthContext();
  currentAccessToken = token;
  enqueueTokenStorage(() =>
    token
      ? secureStorage.setItem(TOKEN_KEY, token)
      : secureStorage.removeItem(TOKEN_KEY),
  );
  return tokenStorageQueue;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (currentAccessToken) {
    return currentAccessToken;
  }

  const queuedEpoch = tokenEpoch;
  await tokenStorageQueue;
  if (queuedEpoch !== tokenEpoch || currentAccessToken) {
    return currentAccessToken;
  }

  // The epoch must be captured BEFORE the read. It exists to detect a logout or
  // a token change that happens while this read is in flight, so a read that
  // started before the change must not be allowed to restore the old token
  // afterwards. Capturing it after the await made the comparison below always
  // true and silently defeated the guard.
  const readEpoch = tokenEpoch;

  // A SecureStore read that FAILS means "could not tell", which is not the same
  // as "no token stored". Letting the rejection escape here would turn one
  // transient Keystore error into a signed-out session, so it is treated as an
  // unknown token rather than as a confirmed absence.
  let token: string | null = null;
  try {
    token = await secureStorage.getItem(TOKEN_KEY);
  } catch {
    return currentAccessToken;
  }

  if (readEpoch === tokenEpoch && !currentAccessToken) {
    currentAccessToken = token;
  }
  return currentAccessToken;
};

export interface RequestOptions<T = unknown> extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  /** Runtime response contract. Successful requests fail closed when omitted. */
  adapter?: ResponseAdapter<T>;
}

/**
 * Universal API Request Handler
 */
type AbortReason = "caller" | "timeout";

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

function createAbortError(): Error {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";
  return error;
}

function resolveApiUrl(endpoint: string): string {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "0.0.0.0"
  );
}

function parseApiUrl(url: string): URL {
  try {
    return new URL(url);
  } catch (_) {
    throw new ApiError("INVALID_API_URL", 0, "INVALID_API_URL");
  }
}

function assertApiUrl(url: string): void {
  const parsed = parseApiUrl(url);
  const isLocalHttp =
    parsed.protocol === "http:" && isLocalHostname(parsed.hostname);
  if (parsed.protocol !== "https:" && !isLocalHttp) {
    throw new ApiError("INSECURE_API_URL", 0, "INSECURE_API_URL");
  }
}

function assertRedirectUrl(originalUrl: string, finalUrl: string): void {
  const original = parseApiUrl(originalUrl);
  const final = parseApiUrl(finalUrl);
  if (original.protocol === "https:" && final.protocol !== "https:") {
    throw new ApiError("INSECURE_API_URL", 0, "INSECURE_API_URL");
  }
  assertApiUrl(finalUrl);
}

function getContentType(response: Response): string {
  const contentType = response.headers?.get?.("content-type");
  return typeof contentType === "string" ? contentType.toLowerCase() : "";
}

function isJsonResponse(response: Response): boolean {
  const contentType = getContentType(response);
  return (
    contentType.includes("application/json") || contentType.includes("+json")
  );
}

function isEmptyResponse(response: Response): boolean {
  return (
    response.status === 204 ||
    response.status === 205 ||
    response.body === null ||
    response.headers?.get?.("content-length") === "0"
  );
}

function toSafeHttpError(statusCode: number, data: unknown): ApiError {
  let message = `HTTP ${statusCode}`;
  let errorName: string | undefined;

  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    const record = data as Record<string, unknown>;
    const rawMessage = record.message;
    if (Array.isArray(rawMessage)) {
      const messages = rawMessage.filter(
        (item): item is string => typeof item === "string",
      );
      if (messages.length > 0) {
        message = messages.join(", ");
      }
    } else if (typeof rawMessage === "string" && rawMessage.trim()) {
      message = rawMessage;
    }

    if (typeof record.error === "string") {
      errorName = record.error;
      if (message === `HTTP ${statusCode}`) {
        message = record.error;
      }
    }
  }

  return new ApiError(message, statusCode, errorName);
}

function requireResponseAdapter<T>(
  adapter: ResponseAdapter<T> | undefined,
): ResponseAdapter<T> {
  if (typeof adapter !== "function") {
    throw new ApiError("INVALID_RESPONSE", 502, "MISSING_RESPONSE_ADAPTER");
  }
  return adapter;
}

function invalidResponseError(): ApiError {
  return new ApiError("INVALID_RESPONSE", 502, "INVALID_RESPONSE");
}

/**
 * Universal API Request Handler
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions<T> = {},
): Promise<T> {
  const {
    timeoutMs = 10000,
    skipAuth = false,
    headers = {},
    signal: callerSignal,
    adapter,
    ...restOptions
  } = options;
  const requestAuthEpoch = skipAuth ? null : authContextEpoch;
  const throwIfAuthContextChanged = (): void => {
    if (requestAuthEpoch !== null && requestAuthEpoch !== authContextEpoch) {
      throw new ApiError(
        "Sesi autentikasi berubah sebelum respons selesai diterima",
        409,
        "AUTH_CONTEXT_CHANGED",
      );
    }
  };
  // Development fixture interception. Returns undefined for every endpoint that
  // has no fixture, and undefined outright when the flag is off, so the request
  // below proceeds exactly as it did before this check existed.
  const fixture = devFixtureFor(endpoint, options?.body);
  if (fixture !== undefined) {
    if (isDevVoidFixture(fixture)) {
      if (adapter) {
        return parseApiData(undefined, requireResponseAdapter(adapter));
      }
      return undefined as T;
    }

    let adapterInput = fixture;
    if (
      Array.isArray(fixture) &&
      (fixture as any).data !== undefined &&
      (fixture as any).meta !== undefined
    ) {
      adapterInput = {
        data: (fixture as any).data,
        meta: (fixture as any).meta,
      };
    }

    if (adapter) {
      return parseApiData(adapterInput, requireResponseAdapter(adapter));
    }
    return adapterInput as T;
  }

  const responseAdapter = requireResponseAdapter(adapter);
  const url = resolveApiUrl(endpoint);
  assertApiUrl(url);

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    throwIfAuthContextChanged();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  let abortReason: AbortReason | undefined;
  const onCallerAbort = () => {
    if (!abortReason) {
      abortReason = "caller";
    }
    controller.abort();
  };

  if (callerSignal) {
    if (callerSignal.aborted) {
      onCallerAbort();
    } else {
      callerSignal.addEventListener("abort", onCallerAbort, { once: true });
    }
  }

  const timeout = setTimeout(() => {
    if (!abortReason) {
      abortReason = "timeout";
    }
    controller.abort();
  }, timeoutMs);

  const throwIfAborted = (): void => {
    if (abortReason === "timeout") {
      throw new ApiError(
        "Request timeout. Server backend tidak merespons.",
        408,
        "TIMEOUT",
      );
    }
    if (abortReason === "caller") {
      throw createAbortError();
    }
  };

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
      redirect: "error",
      signal: controller.signal,
    });

    throwIfAborted();
    throwIfAuthContextChanged();
    if (response.redirected || response.url) {
      assertRedirectUrl(url, response.url);
    }

    if (isEmptyResponse(response)) {
      if (!response.ok) {
        throw toSafeHttpError(response.status, undefined);
      }
      if (responseAdapter !== noContentAdapter) {
        throw invalidResponseError();
      }
      return parseApiData(undefined, responseAdapter);
    }

    let data: unknown;
    let jsonResponse = false;
    try {
      jsonResponse = isJsonResponse(response);
      if (jsonResponse) {
        if (typeof response.json !== "function") {
          throw invalidResponseError();
        }
        data = await response.json();
      } else if (typeof response.text === "function") {
        data = await response.text();
      } else {
        throw invalidResponseError();
      }
    } catch (error) {
      if (isAbortError(error) || response.ok) {
        throw error;
      }
      data = undefined;
    }

    throwIfAborted();
    throwIfAuthContextChanged();

    if (!response.ok) {
      throw toSafeHttpError(response.status, data);
    }

    if (data === undefined) {
      if (responseAdapter !== noContentAdapter) {
        throw invalidResponseError();
      }
      return parseApiData(undefined, responseAdapter);
    }

    if (!jsonResponse) {
      if (data === "") {
        if (responseAdapter !== noContentAdapter) {
          throw invalidResponseError();
        }
        return parseApiData(undefined, responseAdapter);
      }
      throw invalidResponseError();
    }

    return parseApiData(data, responseAdapter);
  } catch (error) {
    if (isAbortError(error)) {
      if (abortReason === "timeout") {
        throw new ApiError(
          "Request timeout. Server backend tidak merespons.",
          408,
          "TIMEOUT",
        );
      }
      if (abortReason === "caller" || callerSignal?.aborted) {
        throw error;
      }
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener?.("abort", onCallerAbort);
  }
}

/**
 * Cek apakah backend active dan siap menerima request
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    await apiRequest<void>("/health/live", {
      timeoutMs: 3000,
      skipAuth: true,
      adapter: noContentAdapter,
    });
    return true;
  } catch {
    // Every failure here means the backend is NOT serving this client correctly.
    // A 502 gateway error and a 200 that returned an HTML error page were both
    // being reported as healthy, which inverts the signal this function exists to
    // provide. There is no response shape for which "could not confirm health"
    // should be reported as "healthy".
    return false;
  }
}

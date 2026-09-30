import { isRecord } from "@/api/response";

/**
 * Centralized Type-Safe Query Key Factory for TanStack Query v5
 * Mencegah fragmentasi cache, query key collision, dan memastikan invalidasi presisi
 */

export type PageParams = {
  page?: number;
  limit?: number;
};

export type RoomMessageParams = PageParams & {
  before?: string;
  after?: string;
};

type ArticleListParams = {
  category?: string;
  query?: string;
};

type ListParams = Readonly<Record<string, unknown>>;
type JsonRecord = Record<string, unknown>;

const privacySalt = `${Date.now().toString(36)}:${Math.random().toString(36).slice(2)}`;
const publicQueryFields = new Set([
  "page",
  "limit",
  "type",
  "verificationStatus",
  "availabilityStatus",
  "status",
  "category",
]);


function stableSerialize(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  return `{${Object.keys(value as JsonRecord)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableSerialize((value as JsonRecord)[key])}`,
    )
    .join(",")}}`;
}

function privacyDigest(value: unknown): string {
  const input = `${privacySalt}:${stableSerialize(value)}`;
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `p${(hash >>> 0).toString(36)}`;
}

function privacyScope(value: unknown, fieldName?: string): unknown {
  if (
    fieldName &&
    publicQueryFields.has(fieldName) &&
    !Array.isArray(value) &&
    !isRecord(value)
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => privacyScope(item));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, privacyScope(value[key], key)]),
    );
  }
  if (value === null || value === undefined) return value;
  return privacyDigest(value);
}

function privacyParams<T extends object>(params?: T): T | undefined {
  return params === undefined ? undefined : (privacyScope(params) as T);
}

function privacyToken(value: string | undefined): string | undefined {
  return value === undefined ? undefined : privacyDigest(value);
}

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  patient: {
    all: ["patient"] as const,
    me: () => [...queryKeys.patient.all, "me"] as const,
    list: (params?: ListParams) =>
      [...queryKeys.patient.all, "list", privacyParams(params)] as const,
    detail: (id: string) =>
      [...queryKeys.patient.all, "detail", privacyToken(id)] as const,
  },
  practitioner: {
    all: ["practitioner"] as const,
    me: () => [...queryKeys.practitioner.all, "me"] as const,
    list: (params?: ListParams) =>
      [...queryKeys.practitioner.all, "list", privacyParams(params)] as const,
    detail: (id?: string) =>
      [...queryKeys.practitioner.all, "detail", privacyToken(id)] as const,
  },
  matching: {
    all: ["matching"] as const,
    waitingRoom: () => [...queryKeys.matching.all, "waitingRoom"] as const,
  },
  triage: {
    all: ["triage"] as const,
    queue: () => [...queryKeys.triage.all, "queue"] as const,
    detail: (id: string) =>
      [...queryKeys.triage.all, "detail", privacyToken(id)] as const,
  },
  prescriptions: {
    all: ["prescriptions"] as const,
    list: (params?: ListParams) =>
      params === undefined
        ? ([...queryKeys.prescriptions.all, "list"] as const)
        : ([
            ...queryKeys.prescriptions.all,
            "list",
            privacyParams(params),
          ] as const),
    detail: (id: string) =>
      [...queryKeys.prescriptions.all, "detail", privacyToken(id)] as const,
  },
  ledger: {
    all: ["ledger"] as const,
    accounts: (params?: ListParams) =>
      params === undefined
        ? ([...queryKeys.ledger.all, "accounts"] as const)
        : ([
            ...queryKeys.ledger.all,
            "accounts",
            privacyParams(params),
          ] as const),
    journals: (params?: ListParams) =>
      [...queryKeys.ledger.all, "journals", privacyParams(params)] as const,
  },
  consultations: {
    all: ["consultations"] as const,
    list: (params?: ListParams) =>
      [...queryKeys.consultations.all, "list", privacyParams(params)] as const,
    detail: (id: string) =>
      [...queryKeys.consultations.all, "detail", privacyToken(id)] as const,
    roomMessages: (roomId: string, params?: RoomMessageParams) =>
      params === undefined
        ? ([
            ...queryKeys.consultations.all,
            "room",
            privacyToken(roomId),
            "messages",
          ] as const)
        : ([
            ...queryKeys.consultations.all,
            "room",
            privacyToken(roomId),
            "messages",
            privacyParams(params),
          ] as const),
    notes: (consultationId: string) =>
      [
        ...queryKeys.consultations.all,
        "notes",
        privacyToken(consultationId),
      ] as const,
    referral: (consultationId: string) =>
      [
        ...queryKeys.consultations.all,
        "referral",
        privacyToken(consultationId),
      ] as const,
    iceServers: (roomId: string) =>
      [
        ...queryKeys.consultations.all,
        "iceServers",
        privacyToken(roomId),
      ] as const,
  },
  articles: {
    all: ["articles"] as const,
    list: (params?: ArticleListParams | string, search?: string) => {
      // The object form used to drop `search` entirely, so
      // list(undefined, "anxiety"), list(undefined, "depression") and list() all
      // produced the same key and different searches shared one cache entry.
      // Both forms now serialise the search term.
      const normalized =
        typeof params === "string"
          ? { category: params, query: search }
          : { ...(params ?? {}), query: params?.query ?? search };
      return [
        ...queryKeys.articles.all,
        "list",
        privacyParams(normalized),
      ] as const;
    },
    detail: (id?: string) =>
      [...queryKeys.articles.all, "detail", privacyToken(id)] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (category?: string) =>
      [...queryKeys.notifications.all, "list", { category }] as const,
  },
};

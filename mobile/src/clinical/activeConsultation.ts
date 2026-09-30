import { z } from "zod";
import {
  CONSULTATION_STATUSES,
  type ConsultationStatus,
} from "@/constants/enums";

export { isConsultationStatus } from "@/constants/enums";
export type { ConsultationStatus } from "@/constants/enums";


import { ApiError, asRecordOrUndefined } from "@/api/response";
import {
  clearTrustedConsultationContexts,
  isTrustedConsultationContext,

} from "@/api/consultation.service";
import {
  clearTrustedMatchingConsultationContexts,
  isTrustedMatchingConsultationContext,
} from "@/api/matching.service";
import type { ActiveConsultationContext } from "@/types/api";

export type { ActiveConsultationContext } from "@/types/api";

const ACTIVE_CONSULTATION_STATUSES = [
  "WAITING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
] as const;

export type ActiveConsultationStatus =
  (typeof ACTIVE_CONSULTATION_STATUSES)[number];

const activeConsultationSchema = z
  .object({
    consultationId: z.string().trim().min(1),
    roomId: z.string().trim().min(1),
    patientId: z.string().trim().min(1),
    practitionerId: z.string().trim().min(1),
    status: z.enum(ACTIVE_CONSULTATION_STATUSES),
  })
  .strict();

function hasTrustedContextOrigin(value: unknown): boolean {
  return (
    isTrustedConsultationContext(value) ||
    isTrustedMatchingConsultationContext(value)
  );
}


function normalizeExpectedId(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

/**
 * Read a context already attached by a response adapter. This function never
 * creates or re-brands a context from route/UI data.
 */
export function activeConsultationContextFromResponse(
  value: unknown,
  expectedConsultationId?: string,
): ActiveConsultationContext | undefined {
  const candidate = isActiveConsultationContext(value)
    ? value
    : asRecordOrUndefined(value)?.activeConsultation;
  if (!isActiveConsultationContext(candidate)) {
    return undefined;
  }

  const expected = normalizeExpectedId(expectedConsultationId);
  return expected && candidate.consultationId !== expected
    ? undefined
    : candidate;
}

/** Invalidate all context brands when the authenticated identity changes. */
export function clearActiveConsultationContextCache(): void {
  clearTrustedConsultationContexts();
  clearTrustedMatchingConsultationContexts();
}

export function isActiveConsultationContext(
  value: unknown,
): value is ActiveConsultationContext {
  return (
    typeof value === "object" &&
    value !== null &&
    hasTrustedContextOrigin(value) &&
    activeConsultationSchema.safeParse(value).success
  );
}

export function requireActiveConsultationContext(
  value: unknown,
): ActiveConsultationContext {
  if (!isActiveConsultationContext(value)) {
    throw new ApiError(
      "Konteks konsultasi dari server belum tersedia",
      400,
      "CONSULTATION_CONTEXT_UNAVAILABLE",
    );
  }
  return value;
}

/** Terminal means the session cannot change again, so polling must stop. */
const TERMINAL_CONSULTATION_STATUSES: ReadonlySet<string> = new Set<string>([
  "FINISHED",
  "CANCELLED",
]);

export function isTerminalConsultationStatus(value: unknown): boolean {
  return typeof value === "string" && TERMINAL_CONSULTATION_STATUSES.has(value);
}

/** The Indonesian label a patient or practitioner sees for a server status. */
export function consultationStatusLabel(status: string): string {
  if (status === "FINISHED") return "Selesai";
  if (status === "WAITING" || status === "ACTIVE") return "Berjalan";
  if (status === "CANCELLED") return "Batal";
  return "Status lainnya";
}

/** The tab a server status belongs under in the history screens. */
export function consultationStatusBucket(status: string): string {
  if (status === "FINISHED") return "Selesai";
  if (status === "WAITING" || status === "ACTIVE") return "Berjalan";
  if (status === "CANCELLED") return "Batal";
  return "Semua";
}

export const HISTORY_TABS = [
  "Semua",
  "Berjalan/Aktif",
  "Selesai",
  "Batal",
] as const;

export function matchesHistoryTab(status: string, tab: string): boolean {
  const normTab = tab.toLowerCase().trim();
  if (normTab === "semua" || normTab === "all") return true;
  const bucket = consultationStatusBucket(status).toLowerCase();
  if (
    normTab === "berjalan/aktif" ||
    normTab === "berjalan" ||
    normTab === "aktif"
  ) {
    return bucket === "berjalan" || status === "WAITING" || status === "ACTIVE";
  }
  if (normTab === "selesai" || normTab === "finished") {
    return bucket === "selesai" || status === "FINISHED";
  }
  if (normTab === "batal" || normTab === "cancelled") {
    return bucket === "batal" || status === "CANCELLED";
  }
  return bucket === normTab;
}

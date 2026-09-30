/**
 * Types and helpers shared by the domain query modules.
 *
 * Extracted verbatim from the former single-file useApiQueries.ts. Only the
 * export keyword was added so each domain module can import them.
 */
import type { PaginatedResult } from "@/api/response";
import type { PractitionerResponseDto } from "@/types/api";
import type { PractitionerType } from "@/constants/enums";
import type { PageParams } from "../useQueryKeys";
import { isTerminalConsultationStatus } from "@/clinical/activeConsultation"; 
export type PatientListParams = PageParams & {
  fullName?: string;
};

export type PractitionerListParams = PageParams & {
  type?: PractitionerType;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  availabilityStatus?: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
};

export type LedgerListParams = PageParams & {
  type?: string;
  name?: string;
  referenceId?: string;
  status?: string;
};

export type PrescriptionListParams = PageParams & {
  patientId?: string;
  practitionerId?: string;
  consultationId?: string;
};

export type CompatibleListResult<T> = PaginatedResult<T> & {
  total: number;
};

export type PractitionerListResult = CompatibleListResult<PractitionerResponseDto>;

export function toCompatibleListResult<T>(
  result: PaginatedResult<T>,
): CompatibleListResult<T> {
  return { ...result, total: result.meta.totalItems };
}

export function toListData<T>(result: T[] | PaginatedResult<T>): T[] {
  return Array.isArray(result) ? result : result.data;
}

export function callWithSignal<TResult>(
  service: (...args: any[]) => Promise<TResult>,
  signal: AbortSignal,
  ...args: any[]
): Promise<TResult> {
  return service(...args, signal);
}

/**
 * Helper to calculate polling interval with random jitter (+/- 15%)
 * Mencegah ribuan client menembak server pada milidetik yang sama persis (Thundering Herd)
 */
export function getJitteredInterval(baseMs: number): number {
  const variance = baseMs * 0.15;
  const offset = (Math.random() * 2 - 1) * variance;
  return Math.round(baseMs + offset);
}

export function shouldPollRoom(roomId: string, consultationStatus?: string): boolean {
  const normalizedRoomId = roomId.trim().toLowerCase();
  const normalizedStatus = consultationStatus?.trim().toUpperCase();
  return (
    Boolean(roomId.trim()) &&
    !["fixed", "unavailable"].includes(normalizedRoomId) &&
    !["FIXED", "UNAVAILABLE"].includes(normalizedStatus ?? "") &&
    !isTerminalConsultationStatus(normalizedStatus)
  );
}


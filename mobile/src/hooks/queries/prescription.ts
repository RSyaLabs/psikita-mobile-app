import {
  useQuery,
} from "@tanstack/react-query";
import type { PaginatedResult } from "@/api/response";
import {
  prescriptionService,
} from "@/api";
import {
  PrescriptionResponseDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * prescription queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  PrescriptionListParams,
  callWithSignal,
} from "./shared";

/**
 * Hook to get digital prescriptions
 */
export function usePrescriptions(params?: PrescriptionListParams) {
  const query = useQuery<PaginatedResult<PrescriptionResponseDto>, Error>({
    queryKey: queryKeys.prescriptions.list(params),
    queryFn: ({ signal }) =>
      callWithSignal(prescriptionService.getPrescriptions, signal, params),
  });

  return {
    ...query,
    data: query.data?.data,
    meta: query.data?.meta,
  };
}

/**
 * Hook to search nearest hospitals & psychiatric facilities
 */
export function useNearestFacilities(params?: {
  latitude?: number;
  longitude?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [
      ...queryKeys.referrals.all,
      "nearest-facilities",
      params?.latitude,
      params?.longitude,
    ] as const,
    queryFn: ({ signal }) =>
      prescriptionService.getNearestFacilities(params, signal),
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Hook to get digital referral letter details
 */
export function useReferralLetter(referralId?: string) {
  return useQuery({
    queryKey: [...queryKeys.referrals.all, "letter", referralId ?? ""] as const,
    queryFn: ({ signal }) =>
      prescriptionService.getReferralLetter(referralId!, signal),
    enabled: Boolean(referralId),
  });
}

/**
 * Hook to get medication suggestions based on diagnosis
 */
export function useMedicationSuggestions(
  diagnosisCode?: string,
  patientId?: string,
) {
  return useQuery({
    queryKey: ["medications", "suggestions", diagnosisCode, patientId] as const,
    queryFn: ({ signal }) =>
      prescriptionService.getMedicationSuggestions(
        { diagnosisCode: diagnosisCode!, patientId },
        signal,
      ),
    enabled: Boolean(diagnosisCode),
  });
}

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  patientService,
} from "@/api";
import {
  UpdatePatientDto,
  CreatePatientDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * patient queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
} from "./shared";

/**
 * Hook to retrieve current logged-in patient profile
 */
export function usePatientProfile() {
  return useQuery({
    queryKey: queryKeys.patient.me(),
    queryFn: ({ signal }) =>
      callWithSignal(patientService.getMyProfile, signal),
  });
}

/**
 * Mutation hook for creating a new patient profile
 */
export function useCreatePatientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePatientDto) => patientService.createProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patient.me() });
    },
  });
}

/**
 * Mutation hook for updating patient profile
 */
export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      patientId,
      dto,
    }: {
      patientId: string;
      dto: UpdatePatientDto;
    }) => patientService.updateProfile(patientId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patient.me() });
    },
  });
}

/**
 * Hook to retrieve all finished consultation results for authenticated patient
 */
export function usePatientResults() {
  return useQuery({
    queryKey: [...queryKeys.patient.all, "results"] as const,
    queryFn: ({ signal }) => patientService.getMyResults(signal),
  });
}

/**
 * Hook to retrieve specific consultation result detail
 */
export function usePatientResultDetail(consultationId?: string) {
  return useQuery({
    queryKey: [
      ...queryKeys.patient.all,
      "results",
      consultationId ?? "",
    ] as const,
    queryFn: ({ signal }) =>
      patientService.getResultDetail(consultationId!, signal),
    enabled: Boolean(consultationId),
  });
}

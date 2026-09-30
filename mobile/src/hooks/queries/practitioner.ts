import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  patientService,
  practitionerService,
} from "@/api";
import {
  PractitionerResponseDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * practitioner queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  PatientListParams,
  PractitionerListParams,
  PractitionerListResult,
  toCompatibleListResult,
  callWithSignal,
} from "./shared";

/**
 * Hook to list available practitioners with native structural sharing (select option)
 */
export function usePractitioners<T = PractitionerListResult>(
  filters?: PractitionerListParams,
  options?: {
    select?: (data: PractitionerListResult) => T;
  },
) {
  return useQuery({
    queryKey: queryKeys.practitioner.list(filters),
    queryFn: async ({ signal }) =>
      toCompatibleListResult(
        await callWithSignal(
          practitionerService.getPractitioners,
          signal,
          filters,
        ),
      ),
    staleTime: 3 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    select: options?.select,
  });
}

/**
 * Hook to get current logged-in practitioner profile
 */
export function usePractitionerProfile() {
  return useQuery({
    queryKey: queryKeys.practitioner.me(),
    queryFn: ({ signal }) =>
      callWithSignal(practitionerService.getMyProfile, signal),
  });
}

/**
 * Mutation hook for practitioner toggling availability status with OPTIMISTIC UPDATE
 * UI toggle berubah seketika (0ms), otomatis rollback jika koneksi gagal
 */
export function useChangeAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      practitionerId,
      status,
    }: {
      practitionerId: string;
      status: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
    }) => practitionerService.changeAvailability(practitionerId, status),
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.practitioner.me(),
      });
      const prevProfile = queryClient.getQueryData<PractitionerResponseDto>(
        queryKeys.practitioner.me(),
      );

      if (prevProfile) {
        queryClient.setQueryData<PractitionerResponseDto>(
          queryKeys.practitioner.me(),
          {
            ...prevProfile,
            availabilityStatus: status,
          },
        );
      }

      return { prevProfile };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevProfile) {
        queryClient.setQueryData(
          queryKeys.practitioner.me(),
          context.prevProfile,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practitioner.all });
    },
  });
}

/**
 * Hook to retrieve a specific practitioner by ID
 */
export function usePractitioner(id?: string) {
  return useQuery({
    queryKey: queryKeys.practitioner.detail(id),
    queryFn: ({ signal }) =>
      id ? callWithSignal(practitionerService.getById, signal, id) : null,
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to retrieve paginated list of patients (admin)
 */
export function usePatients(params?: PatientListParams) {
  return useQuery({
    queryKey: queryKeys.patient.list(params),
    queryFn: async ({ signal }) =>
      toCompatibleListResult(
        await callWithSignal(patientService.getPatients, signal, params),
      ),
  });
}

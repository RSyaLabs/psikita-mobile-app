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

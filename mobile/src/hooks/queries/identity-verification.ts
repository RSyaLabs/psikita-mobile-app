import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../useQueryKeys";
import {
  identityVerificationService,
  IdentityVerificationStatusDto,
  IdentityVerificationSessionDto,
} from "@/api/identity-verification.service";

/**
 * Hook to retrieve the current user's Didit KYC verification status
 */
export function useMyVerificationStatus() {
  return useQuery<IdentityVerificationStatusDto>({
    queryKey: queryKeys.identityVerification.my(),
    queryFn: ({ signal }) =>
      identityVerificationService.getMyVerificationStatus(signal),
    staleTime: 60 * 1000,
  });
}

/**
 * Hook to start a Didit verification session for the signed-in user
 */
export function useStartDiditVerification() {
  const queryClient = useQueryClient();

  return useMutation<IdentityVerificationSessionDto, Error, void>({
    mutationFn: () => identityVerificationService.startAccountVerification(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.identityVerification.all,
      });
    },
  });
}

/**
 * Hook to start a Didit verification session for a practitioner
 */
export function useStartPractitionerVerification() {
  const queryClient = useQueryClient();

  return useMutation<IdentityVerificationSessionDto, Error, string>({
    mutationFn: (practitionerId: string) =>
      identityVerificationService.startPractitionerVerification(practitionerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.identityVerification.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.practitioner.all,
      });
    },
  });
}

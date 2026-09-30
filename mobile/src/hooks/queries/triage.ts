import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  isTerminalConsultationStatus,
} from "@/clinical/activeConsultation";
import {
  matchingService,
  triageService,
} from "@/api";
import {
  SubmitTriageDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * triage queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
  getJitteredInterval,
} from "./shared";

/**
 * Hook to query patient waiting room status with Smart Jittered Polling
 */
export function useWaitingRoomStatus() {
  return useQuery({
    queryKey: queryKeys.matching.waitingRoom(),
    queryFn: ({ signal }) =>
      callWithSignal(matchingService.getMyWaitingRoomStatus, signal),
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      if (isTerminalConsultationStatus(status) || status === "MATCHED")
        return false;
      return getJitteredInterval(12000); // 10-14s dengan jitter
    },
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to query triage queue for practitioners with Smart Jittered Polling
 */
export function useTriageQueue() {
  return useQuery({
    queryKey: queryKeys.triage.queue(),
    queryFn: ({ signal }) =>
      callWithSignal(triageService.getTriageQueue, signal),
    refetchInterval: () => getJitteredInterval(15000), // 13-17s dengan jitter
    refetchIntervalInBackground: false,
  });
}

/**
 * Mutation hook for triage submission
 */
export function useSubmitTriage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SubmitTriageDto) => triageService.submitTriage(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.matching.waitingRoom(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.triage.queue() });
    },
  });
}

export function useTriageAssessment(id?: string) {
  const normalizedId = id?.trim() || "";
  return useQuery({
    queryKey: queryKeys.triage.detail(normalizedId),
    queryFn: ({ signal }) =>
      callWithSignal(triageService.getById, signal, normalizedId),
    enabled: Boolean(normalizedId),
  });
}

/**
 * Mutation hook for claiming matching request
 */
export function useClaimMatching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchingRequestId: string) =>
      matchingService.claimMatchingRequest(matchingRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.triage.queue() });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all });
    },
  });
}

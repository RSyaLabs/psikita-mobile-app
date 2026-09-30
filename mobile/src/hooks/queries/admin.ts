import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  practitionerService,
  ledgerService,
} from "@/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * admin queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  LedgerListParams,
  toCompatibleListResult,
  callWithSignal,
} from "./shared";

/**
 * Mutation hook for admin approving a practitioner
 */
export function useApprovePractitioner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (practitionerId: string) =>
      practitionerService.approveProfile(practitionerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practitioner.all });
    },
  });
}

/**
 * Mutation hook for admin rejecting a practitioner
 */
export function useRejectPractitioner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason = "Dokumen tidak memenuhi persyaratan.",
    }: {
      id: string;
      reason?: string;
    }) => practitionerService.rejectProfile(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practitioner.all });
    },
  });
}

/**
 * Hook to retrieve financial ledger accounts (admin)
 */
export function useLedgerAccounts(params?: LedgerListParams) {
  return useQuery({
    queryKey: queryKeys.ledger.accounts(params),
    queryFn: async ({ signal }) =>
      toCompatibleListResult(
        await callWithSignal(ledgerService.getAccounts, signal, params),
      ),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to retrieve financial ledger journals / transactions (admin)
 */
export function useLedgerJournals(params?: LedgerListParams) {
  return useQuery({
    queryKey: queryKeys.ledger.journals(params),
    queryFn: async ({ signal }) =>
      toCompatibleListResult(
        await callWithSignal(ledgerService.getJournals, signal, params),
      ),
  });
}

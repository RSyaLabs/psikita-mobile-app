import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payoutService } from "@/api/payout.service";
import {
  PayoutBankAccountStatusDto,
  SavePayoutBankAccountDto,
} from "@/types/api";

const PAYOUT_QUERY_KEYS = {
  bankAccount: ["payout", "bankAccount", "me"] as const,
};

export function usePayoutBankAccountQuery() {
  return useQuery<PayoutBankAccountStatusDto>({
    queryKey: PAYOUT_QUERY_KEYS.bankAccount,
    queryFn: () => payoutService.getMyBankAccountStatus(),
    staleTime: 60 * 1000,
  });
}

export function useSavePayoutBankAccountMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    PayoutBankAccountStatusDto,
    Error,
    SavePayoutBankAccountDto
  >({
    mutationFn: (dto) => payoutService.saveMyBankAccount(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(PAYOUT_QUERY_KEYS.bankAccount, data);
    },
  });
}

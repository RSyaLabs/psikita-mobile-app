import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { refundService } from "@/api/refund.service";
import {
  RefundCaseViewDto,
  RequestRefundCaseDto,
} from "@/types/api";

const REFUND_QUERY_KEYS = {
  list: ["refunds", "list"] as const,
  detail: (id: string) => ["refunds", "detail", id] as const,
};

export function useRefundCaseQuery(id?: string) {
  return useQuery<RefundCaseViewDto>({
    queryKey: REFUND_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => refundService.getRefundCaseById(id ?? ""),
    enabled: Boolean(id && id.trim().length > 0),
    staleTime: 10 * 1000,
  });
}

export function useRequestRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation<RefundCaseViewDto, Error, RequestRefundCaseDto>({
    mutationFn: (dto) => refundService.requestRefund(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: REFUND_QUERY_KEYS.list });
      queryClient.setQueryData(REFUND_QUERY_KEYS.detail(data.id), data);
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { refundService } from "@/api/refund.service";
import {
  RefundCaseListDto,
  RefundCaseViewDto,
  RefundDestinationsDto,
  RequestRefundCaseDto,
} from "@/types/api";

export const REFUND_QUERY_KEYS = {
  destinations: ["refunds", "destinations"] as const,
  list: ["refunds", "list"] as const,
  detail: (id: string) => ["refunds", "detail", id] as const,
};

export function useRefundDestinationsQuery() {
  return useQuery<RefundDestinationsDto>({
    queryKey: REFUND_QUERY_KEYS.destinations,
    queryFn: () => refundService.getDestinations(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefundCasesQuery() {
  return useQuery<RefundCaseListDto>({
    queryKey: REFUND_QUERY_KEYS.list,
    queryFn: () => refundService.getRefundCases(),
    staleTime: 30 * 1000,
  });
}

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

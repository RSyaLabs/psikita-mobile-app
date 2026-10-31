import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  requireActiveConsultationContext,
} from "@/clinical/activeConsultation";
import {
  prescriptionService,
  paymentService,
} from "@/api";
import type { ActiveConsultationContext } from "@/clinical/activeConsultation";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * engagement queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
} from "./shared";

/**
 * Mutation hook for submitting post-session rating and feedback
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      context,
      star,
      comment,
    }: {
      context: ActiveConsultationContext;
      star: number;
      comment: string;
    }) => {
      const validatedContext = requireActiveConsultationContext(context);
      if (validatedContext.status !== "FINISHED") {
        throw new ApiError(
          "Sesi tidak dapat menerima ulasan pada status ini",
          409,
          "CONSULTATION_NOT_FINISHED",
        );
      }
      return paymentService.submitFeedback(validatedContext.consultationId, {
        star,
        comment,
      });
    },
    onSuccess: (_result, { context }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.detail(context.consultationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.all,
      });
    },
  });
}

/**
 * Hook to retrieve hospital referral for a consultation
 */
export function useReferral(consultationId?: string) {
  return useQuery({
    queryKey: queryKeys.consultations.referral(consultationId ?? ""),
    queryFn: ({ signal }) =>
      consultationId
        ? callWithSignal(
            prescriptionService.getReferralByConsultation,
            signal,
            consultationId,
          )
        : Promise.resolve(null),
    enabled: !!consultationId,
    staleTime: 10 * 60 * 1000,
  });
}

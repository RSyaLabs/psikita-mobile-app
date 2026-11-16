import { useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type MutateOptions,
} from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  isServerPaymentContext,
} from "@/api/payment.service";
import { assertCapabilityLive } from "@/config/capabilities";
import {
  paymentService,
} from "@/api";
import {
  CreateBillingOrderDto,
  BillingOrderResponseDto,
  CreatePaymentInput,
  BpjsEligibilityDto,
  BpjsEligibilityInput,
  PaymentMethodsDto,
  PaymentResponseDto,
} from "@/types/api";


/**
 * Mengambil katalog metode pembayaran Duitku dengan estimasi biaya resmi server.
 */
export function usePaymentMethods(amount?: number, currency = "IDR") {
  return useQuery<PaymentMethodsDto>({
    queryKey: ["paymentMethods", amount, currency],
    queryFn: () => paymentService.getPaymentMethods(amount!, currency),
    enabled: typeof amount === "number" && amount > 0,
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation hook untuk membuat billing order resmi dari server.
 */
export function useCreateBillingOrder() {
  const queryClient = useQueryClient();
  return useMutation<
    BillingOrderResponseDto,
    Error,
    { consultationId: string; dto: CreateBillingOrderDto }
  >({
    mutationFn: ({ consultationId, dto }) =>
      paymentService.createBillingOrder(consultationId, dto),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({queryKey: ["billingOrderCurrent", order.consultationId]});
    },
  });
}

/** Server-side practitioner rate preview; no client amount is trusted. */
export function useInitialBillingPreview(consultationId?: string, gatewayChannel?: string) {
  return useQuery({
    queryKey: ["initialBillingPreview", consultationId, gatewayChannel],
    queryFn: () => paymentService.previewBillingOrder(consultationId!, gatewayChannel),
    enabled: Boolean(consultationId),
    staleTime: 30 * 1000,
  });
}

/** Restore checkout using the new authenticated billing-order endpoint. */
export function useValidatedServerPaymentContext(consultationId?: string) {
  const query = useQuery({
    queryKey: ["billingOrderCurrent", consultationId],
    queryFn: () => paymentService.getCurrentBillingOrder(consultationId!),
    enabled: Boolean(consultationId),
    refetchOnMount: "always" as const,
  });
  const context = paymentService.serverPaymentContextFromBillingOrder(query.data);
  return {
    context,
    order: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    status: query.status,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useServerPaymentStatus(paymentId?: string, billingOrderId?: string) {
  return useQuery({
    queryKey: ["paymentStatus", paymentId, billingOrderId],
    queryFn: () => paymentService.getPayment(paymentId!, billingOrderId!),
    enabled: Boolean(paymentId && billingOrderId),
    refetchInterval: (query) =>
      !query.state.data || query.state.data.status === "PENDING" ? 4000 : false,
  });
}

/**
 * One-shot BPJS eligibility request. A 201 is represented by the explicit
 * accepted/unknown sentinel; retries and duplicate attempts are disabled.
 */
export function useCheckBpjsEligibility() {
  const mutation = useMutation({
    mutationFn: ({ context, memberNumber }: BpjsEligibilityInput) => {
      if (!isServerPaymentContext(context)) {
        throw new ApiError(
          "A validated server payment context is required",
          400,
          "PAYMENT_CONTEXT_UNAVAILABLE",
        );
      }

      assertCapabilityLive("bpjsEligibility");

      return paymentService.checkBpjsEligibility(context, memberNumber);
    },
  });
  const pendingRef = useRef(false);

  const mutate = useCallback(
    (
      input: BpjsEligibilityInput,
      options?: MutateOptions<BpjsEligibilityDto, Error, BpjsEligibilityInput>,
    ) => {
      if (pendingRef.current) return;

      pendingRef.current = true;
      mutation.mutate(input, {
        ...options,
        onSettled: (...args: any[]) => {
          pendingRef.current = false;
          (
            options?.onSettled as ((...settledArgs: any[]) => void) | undefined
          )?.(...args);
        },
      });
    },
    [mutation],
  );

  const mutateAsync = useCallback(
    async (input: BpjsEligibilityInput) => {
      if (pendingRef.current) {
        throw new Error("A BPJS eligibility submission is already pending");
      }

      pendingRef.current = true;
      try {
        return await mutation.mutateAsync(input);
      } finally {
        pendingRef.current = false;
      }
    },
    [mutation],
  );

  return { ...mutation, mutate, mutateAsync };
}

/**
 * Mutation hook to submit a payment. A ref guard closes the small window
 * before React Query re-renders `isPending`, so two taps cannot submit twice.
 */
export function useCreatePayment() {
  const mutation = useMutation({
    mutationFn: (input: CreatePaymentInput) => {
      if (!isServerPaymentContext(input?.context)) {
        throw new ApiError(
          "A validated server payment context is required",
          400,
          "PAYMENT_CONTEXT_UNAVAILABLE",
        );
      }

      assertCapabilityLive("payment");

      return paymentService.createPayment(input);
    },
  });
  const pendingRef = useRef(false);

  const mutate = useCallback(
    (
      input: CreatePaymentInput,
      options?: MutateOptions<PaymentResponseDto, Error, CreatePaymentInput>,
    ) => {
      if (pendingRef.current) return;

      pendingRef.current = true;
      mutation.mutate(input, {
        ...options,
        onSettled: (...args: any[]) => {
          pendingRef.current = false;
          (
            options?.onSettled as ((...settledArgs: any[]) => void) | undefined
          )?.(...args);
        },
      });
    },
    [mutation],
  );

  const mutateAsync = useCallback(
    async (input: CreatePaymentInput) => {
      if (pendingRef.current) {
        throw new Error("A payment submission is already pending");
      }

      pendingRef.current = true;
      try {
        return await mutation.mutateAsync(input);
      } finally {
        pendingRef.current = false;
      }
    },
    [mutation],
  );

  return { ...mutation, mutate, mutateAsync };
}

import { useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
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

import {
  useConsultation,
} from "./consultation";

/**
 * Mengambil katalog metode pembayaran Duitku dengan estimasi biaya resmi server.
 */
export function usePaymentMethods(amount?: number, currency = "IDR") {
  return useQuery<PaymentMethodsDto>({
    queryKey: ["paymentMethods", amount, currency],
    queryFn: () => paymentService.getPaymentMethods(amount ?? 50000, currency),
    enabled: typeof amount === "number" && amount > 0,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch the active billing order for a consultation (`GET /consultations/{id}/billing-orders/current`)
 * and extract its API-adapter-minted ServerPaymentContext. If no billing order exists yet (404),
 * returns undefined context so checkout can mint one explicitly via createBillingOrder.
 */
export function useValidatedServerPaymentContext(consultationId?: string) {
  const normalizedId = typeof consultationId === "string" ? consultationId.trim() : "";
  const isRealConsultationId =
    Boolean(normalizedId) &&
    normalizedId !== "demo-consultation-id" &&
    normalizedId !== "pending-order";

  const consultationQuery = useConsultation(isRealConsultationId ? normalizedId : "");
  const billingQuery = useQuery({
    queryKey: ["billingOrder", "current", normalizedId],
    enabled: isRealConsultationId,
    retry: false,
    queryFn: async ({ signal }) => {
      try {
        return await paymentService.getCurrentBillingOrder(normalizedId, signal);
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  const context =
    paymentService.serverPaymentContextFromApiResponse(billingQuery.data) ??
    paymentService.serverPaymentContextFromApiResponse(consultationQuery.data);

  return {
    context,
    billingOrder: billingQuery.data ?? null,
    isLoading: billingQuery.isLoading || consultationQuery.isLoading,
    isFetching: billingQuery.isFetching || consultationQuery.isFetching,
    isSuccess: billingQuery.isSuccess || consultationQuery.isSuccess,
    status: billingQuery.status,
    isError: billingQuery.isError,
    error: billingQuery.error,
    refetch: billingQuery.refetch,
  };
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

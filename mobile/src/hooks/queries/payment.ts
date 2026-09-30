import { useCallback, useRef } from "react";
import {
  useMutation,
  type MutateOptions,
} from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  createBillingOrderIdempotencyKey,
  isServerPaymentContext,
} from "@/api/payment.service";
import { assertCapabilityLive } from "@/config/capabilities";
import {
  paymentService,
} from "@/api";
import {
  CreateBillingOrderDto,
  CreatePaymentInput,
  BpjsEligibilityDto,
  BpjsEligibilityInput,
  PaymentResponseDto,
} from "@/types/api";

import { useConsultation } from "./consultation";

/**
 * The current consultation contract has no payment-context field. This hook
 * returns only a context already branded by the API adapter, plus its query
 * state; route values are never promoted to server provenance.
 */
export function useValidatedServerPaymentContext(consultationId?: string) {
  const query = useConsultation(consultationId ?? "");
  const context = paymentService.serverPaymentContextFromApiResponse(
    query.data,
  );

  return {
    context,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    status: query.status,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * The contract requires `idempotencyKey` on CreateBillingOrderDto. It was left to
 * the caller, which means a screen could either omit it and fail zod validation at
 * submit time, or invent a fresh random one per attempt and defeat the purpose of
 * the field entirely. The key is derived from the order intent instead, so the same
 * intent always produces the same key and a retried submit is deduplicated by the
 * server rather than charged twice.
 */
type CreateBillingOrderVariables = {
  consultationId: string;
  dto: Omit<CreateBillingOrderDto, "idempotencyKey">;
};

/** Guarded no-content billing-order mutation; no screen uses this as context. */
export function useCreateBillingOrder() {
  const mutation = useMutation({
    mutationFn: ({ consultationId, dto }: CreateBillingOrderVariables) => {
      assertCapabilityLive("payment");
      const idempotencyKey = createBillingOrderIdempotencyKey(
        consultationId,
        dto as CreateBillingOrderDto,
      );

      return paymentService.createBillingOrder(consultationId, {
        ...dto,
        idempotencyKey,
      });
    },
  });
  const pendingRef = useRef(false);

  const mutate = useCallback(
    (
      variables: CreateBillingOrderVariables,
      options?: MutateOptions<void, Error, CreateBillingOrderVariables>,
    ) => {
      if (pendingRef.current) return;

      pendingRef.current = true;
      mutation.mutate(variables, {
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
    async (variables: CreateBillingOrderVariables) => {
      if (pendingRef.current) {
        throw new Error("A billing-order submission is already pending");
      }

      pendingRef.current = true;
      try {
        return await mutation.mutateAsync(variables);
      } finally {
        pendingRef.current = false;
      }
    },
    [mutation],
  );

  return { ...mutation, mutate, mutateAsync };
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

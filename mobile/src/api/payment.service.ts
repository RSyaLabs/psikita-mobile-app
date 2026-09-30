import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import { isRecord, noContentAdapter } from "./response";
import { assertCapabilityLive } from "@/config/capabilities";
import { PRACTITIONER_TYPES } from "@/constants/enums";
import {
  ConsultationFeedbackDto,
  ConsultationFeedbackResponseDto,
  CreateBillingOrderDto,
  BpjsEligibilityDto,
  CreatePaymentDto,
  CreatePaymentInput,
  PaymentResponseDto,
  PaymentTransactionStatus,
  ServerPaymentContext,
} from "@/types/api";

const serverPaymentContextSchema = z
  .object({
    consultationId: z.string().trim().min(1),
    billingOrderId: z.string().trim().min(1),
  })
  .strict();

const validatedServerPaymentContexts = new WeakSet<object>();

/**
 * API-adapter-only minter for a server-issued payment context.
 * Screens and route parameters must never call this directly.
 */
function mintServerPaymentContext(value: unknown): ServerPaymentContext {
  const context = serverPaymentContextSchema.parse(value);
  const brandedContext = Object.freeze({ ...context });
  validatedServerPaymentContexts.add(brandedContext);
  return brandedContext;
}

export function isServerPaymentContext(
  value: unknown,
): value is ServerPaymentContext {
  return (
    typeof value === "object" &&
    value !== null &&
    validatedServerPaymentContexts.has(value) &&
    serverPaymentContextSchema.safeParse(value).success
  );
}

const validatedBillingOrderContextSchema = z
  .object({
    consultationId: z.string().trim().min(1),
    orderId: z.string().trim().min(1),
  })
  .strict();

/**
 * Private adapter seam for a future documented billing-order response. The
 * response's consultation ID must match the already-validated consultation
 * before the private minter is called. The current contract has no such
 * response, so production never invokes this seam.
 */
function adaptValidatedBillingOrderContext(
  value: unknown,
  validatedConsultationId: string,
): ServerPaymentContext {
  const response = validatedBillingOrderContextSchema.parse(value);
  if (response.consultationId !== validatedConsultationId.trim()) {
    throw new Error(
      "Billing-order context does not belong to the consultation",
    );
  }
  return mintServerPaymentContext({
    consultationId: response.consultationId,
    billingOrderId: response.orderId,
  });
}

/** Accepts only a context already branded by an API adapter. */
export function serverPaymentContextFromApiResponse(
  value: unknown,
): ServerPaymentContext | undefined {
  if (isServerPaymentContext(value)) {
    return value;
  }

  const holder = isRecord(value) ? value : undefined;
  if (holder) {
    const candidate = holder.serverPaymentContext;
    return isServerPaymentContext(candidate) ? candidate : undefined;
  }

  return undefined;
}

const paymentInstructionSchema = z.discriminatedUnion("methodType", [
  z.object({
    methodType: z.literal("E_WALLET"),
    provider: z.union([z.string(), z.record(z.string(), z.unknown())]),
    checkoutUrl: z.string().optional(),
  }),
  z.object({
    methodType: z.literal("VIRTUAL_ACCOUNT"),
    bankCode: z.string(),
    accountNumber: z.string().optional(),
  }),
  z.object({
    methodType: z.literal("QRIS"),
    qrUrl: z.string().optional(),
  }),
]);

const paymentStatusSchema = z.enum([
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "EXPIRED",
  "CANCELLED",
]);

const paymentSchema = z
  .object({
    id: z.string().trim().min(1),
    status: paymentStatusSchema,
    amount: z.number().finite(),
    contextType: z.literal("BILLING_ORDER"),
    contextId: z.string().trim().min(1),
    instruction: paymentInstructionSchema.nullable().optional(),
  })
  .strict();

const billingOrderSchema = z
  .object({
    orderType: z.enum(["INITIAL", "EXTENSION"]),
    durationMinutes: z.number().positive(),
    payerType: z.enum(["SELF_PAY", "BPJS"]),
    practitionerType: z.enum(PRACTITIONER_TYPES),
    level: z.record(z.string(), z.unknown()),
    discountCode: z.string().optional(),
    idempotencyKey: z.string().min(1),
  })
  .strict();

const paymentRequestSchema = z
  .object({
    methodType: z.enum(["E_WALLET", "VIRTUAL_ACCOUNT", "QRIS"]),
    channelCode: z.string().min(1),
    contextType: z.literal("BILLING_ORDER"),
    contextId: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const paymentInputSchema = z
  .object({
    methodType: z.enum(["E_WALLET", "VIRTUAL_ACCOUNT", "QRIS"]),
    channelCode: z.string().min(1),
    context: z.unknown(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const bpjsEligibilityRequestSchema = z
  .object({
    memberNumber: z.string().min(1),
  })
  .strict();

const paymentStatusMap: Record<
  z.infer<typeof paymentStatusSchema>,
  PaymentTransactionStatus
> = {
  PENDING: "PENDING",
  SUCCESS: "SETTLEMENT",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  EXPIRED: "EXPIRE",
  CANCELLED: "CANCEL",
};

export const BPJS_ELIGIBILITY_ACCEPTED: BpjsEligibilityDto = Object.freeze({
  accepted: true,
  eligibility: "UNKNOWN",
});

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(",")}}`;
}

export type BillingOrderIntent = Omit<
  CreateBillingOrderDto,
  "idempotencyKey"
> & {
  idempotencyKey?: string;
};

export function createBillingOrderIdempotencyKey(
  consultationId: string,
  intent: BillingOrderIntent,
): string {
  const normalizedConsultationId = consultationId.trim();
  const parts = [
    normalizedConsultationId,
    intent.orderType,
    String(intent.durationMinutes),
    intent.payerType,
    intent.practitionerType,
    stableSerialize(intent.level),
    intent.discountCode ?? "",
  ];

  return `billing-order:${parts.map((part) => encodeURIComponent(part)).join("|")}`;
}

function parseRequest<T>(schema: z.ZodType<T>, value: unknown): T {
  try {
    return schema.parse(value);
  } catch {
    throw new ApiError("Invalid request", 400, "INVALID_REQUEST");
  }
}

function requireContextValue(value: string | undefined, field: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new ApiError(
      `${field} is required`,
      400,
      "PAYMENT_CONTEXT_UNAVAILABLE",
    );
  }
  return normalized;
}

function requireServerPaymentContext(value: unknown): ServerPaymentContext {
  if (!isServerPaymentContext(value)) {
    throw new ApiError(
      "A validated server payment context is required",
      400,
      "PAYMENT_CONTEXT_UNAVAILABLE",
    );
  }
  return value;
}

const paymentAdapter = (
  value: unknown,
  expectedContext: CreatePaymentDto,
): PaymentResponseDto => {
  const payment = paymentSchema.parse(value);

  if (
    payment.contextType !== undefined &&
    payment.contextType !== expectedContext.contextType
  ) {
    throw new Error("Payment context type does not match the request");
  }

  if (
    payment.contextId !== undefined &&
    payment.contextId !== expectedContext.contextId
  ) {
    throw new Error("Payment context ID does not match the request");
  }

  const instruction = payment.instruction;
  return {
    id: payment.id,
    status: payment.status,
    billingOrderId: payment.contextId,
    transactionStatus: paymentStatusMap[payment.status],
    paymentType: instruction?.methodType ?? payment.contextType,
    grossAmount: payment.amount,
    paymentUrl:
      instruction && "checkoutUrl" in instruction
        ? instruction.checkoutUrl
        : undefined,
    qrCodeUrl:
      instruction && "qrUrl" in instruction ? instruction.qrUrl : undefined,
  };
};

/** Validates a payment response without minting or authorizing a context. */
export function parsePaymentResponse(
  value: unknown,
  expectedContextId: string,
): PaymentResponseDto {
  return paymentAdapter(value, {
    methodType: "E_WALLET",
    channelCode: "response-adapter",
    contextType: "BILLING_ORDER",
    contextId: expectedContextId,
  });
}

const feedbackRequestSchema = z
  .object({
    star: z.number().finite().min(1).max(5),
    comment: z.string(),
  })
  .strict();

const feedbackSchema = z
  .object({
    id: z.string().trim().min(1),
    consultationId: z.string().trim().min(1),
    patientId: z.string().trim().min(1),
    star: z.number().finite().min(1).max(5),
    comment: z.string(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .strict();

function feedbackAdapter(expectedConsultationId: string) {
  const normalizedConsultationId = expectedConsultationId.trim();
  return (value: unknown): ConsultationFeedbackResponseDto => {
    const feedback = feedbackSchema.parse(value);
    if (feedback.consultationId !== normalizedConsultationId) {
      throw new Error("Feedback does not belong to the requested consultation");
    }
    return feedback;
  };
}

export function isPaymentSettled(
  payment:
    | Pick<
        PaymentResponseDto,
        "id" | "status" | "transactionStatus" | "billingOrderId" | "grossAmount"
      >
    | null
    | undefined,
  expectedContextId: string,
): boolean {
  const expectedId =
    typeof expectedContextId === "string" ? expectedContextId.trim() : "";
  return Boolean(
    expectedId &&
    typeof payment?.id === "string" &&
    payment.id.trim() &&
    payment.status === "SUCCESS" &&
    payment.transactionStatus === "SETTLEMENT" &&
    payment.billingOrderId === expectedId &&
    Number.isFinite(payment.grossAmount),
  );
}

export const paymentService = {
  serverPaymentContextFromApiResponse,

  /**
   * Create a billing order. The checked-in contract intentionally returns no
   * content, so this method never manufactures an order ID or amount.
   */
  async createBillingOrder(
    consultationId: string,
    dto: CreateBillingOrderDto,
  ): Promise<void> {
    assertCapabilityLive("payment");
    const normalizedConsultationId = requireContextValue(
      consultationId,
      "consultationId",
    );
    const payload = dto;

    return apiRequest<void>(
      `/consultations/${encodeURIComponent(normalizedConsultationId)}/billing-orders`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        adapter: noContentAdapter,
      },
    );
  },

  /**
   * Submit a payment using only a server-issued billing-order context.
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentResponseDto> {
    assertCapabilityLive("payment");
    const inputPayload = input;
    const context = requireServerPaymentContext(inputPayload.context);
    const payload: CreatePaymentDto = {
      methodType: inputPayload.methodType,
      channelCode: inputPayload.channelCode,
      contextType: "BILLING_ORDER",
      contextId: context.billingOrderId,
      ...(inputPayload.metadata === undefined
        ? {}
        : { metadata: inputPayload.metadata }),
    };

    return apiRequest<PaymentResponseDto>("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
      adapter: (value) => parsePaymentResponse(value, payload.contextId),
    });
  },

  /**
   * Request BPJS eligibility. A 201 no-content response is not an eligibility
   * result; callers must keep the benefit state unknown.
   */
  async checkBpjsEligibility(
    context: ServerPaymentContext,
    memberNumber: string,
  ): Promise<BpjsEligibilityDto> {
    assertCapabilityLive("bpjsEligibility");
    const validatedContext = requireServerPaymentContext(context);
    const normalizedMemberNumber = requireContextValue(
      memberNumber,
      "memberNumber",
    );
    const payload = {
      memberNumber: normalizedMemberNumber,
    };

    await apiRequest<void>(
      `/billing-orders/${encodeURIComponent(validatedContext.billingOrderId)}/bpjs/eligibility`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        adapter: noContentAdapter,
      },
    );

    return BPJS_ELIGIBILITY_ACCEPTED;
  },

  /**
   * Kirim Ulasan dan Penilaian Konsultasi
   */
  async submitFeedback(
    consultationId: string,
    dto: ConsultationFeedbackDto,
  ): Promise<ConsultationFeedbackResponseDto> {
    const normalizedConsultationId = requireContextValue(
      consultationId,
      "consultationId",
    );
    const payload = parseRequest(feedbackRequestSchema, {
      star: dto.star,
      comment: dto.comment,
    });

    return apiRequest<ConsultationFeedbackResponseDto>(
      `/consultations/${encodeURIComponent(normalizedConsultationId)}/feedback`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        adapter: feedbackAdapter(normalizedConsultationId),
      },
    );
  },
};

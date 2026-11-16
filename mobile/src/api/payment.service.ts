import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import { isRecord, noContentAdapter, zodAdapter } from "./response";
import { assertCapabilityLive } from "@/config/capabilities";
import { PRACTITIONER_TYPES } from "@/constants/enums";
import {
  BillingOrderResponseDto,
  ConsultationFeedbackDto,
  ConsultationFeedbackResponseDto,
  CreateBillingOrderDto,
  BpjsEligibilityDto,
  CreatePaymentDto,
  CreatePaymentInput,
  PaymentMethodsDto,
  PaymentResponseDto,
  PaymentTransactionStatus,
  ServerPaymentContext,
} from "@/types/api";

export const paymentMethodMoneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.literal("IDR"),
});

export const paymentMethodItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  iconUrl: z.string().nullable(),
  available: z.boolean(),
  providerVerified: z.boolean(),
  fee: paymentMethodMoneySchema,
  feeLabel: z.string(),
  feeBearer: z.enum(["PATIENT", "INCLUDED"]),
  totalPayable: paymentMethodMoneySchema,
  disabledReason: z.string().nullable(),
});

export const paymentMethodGroupSchema = z.object({
  label: z.string().min(1),
  methodType: z.enum(["VIRTUAL_ACCOUNT", "QRIS", "E_WALLET"]),
  methods: z.array(paymentMethodItemSchema),
});

export const paymentMethodsSchema = z.object({
  schemaVersion: z.literal(1),
  currency: z.literal("IDR"),
  baseAmount: paymentMethodMoneySchema,
  generatedAt: z.string(),
  estimate: z.boolean(),
  groups: z.array(paymentMethodGroupSchema),
});

/** The Core API catalog publishes canonical keys, not provider method codes. */
function channelCodeFromCanonicalKey(
  key: string,
  methodType: "VIRTUAL_ACCOUNT" | "QRIS" | "E_WALLET",
): string {
  if (methodType === "VIRTUAL_ACCOUNT" && key.startsWith("VA_")) {
    return key.slice(3);
  }
  if (methodType === "QRIS" && key.startsWith("QRIS_")) {
    return key;
  }
  if (methodType === "E_WALLET" && key.startsWith("EWALLET_")) {
    return key.slice("EWALLET_".length);
  }
  throw new Error("Unexpected canonical payment channel");
}

function adaptPaymentMethods(value: unknown): PaymentMethodsDto {
  const catalog = paymentMethodsSchema.parse(value);
  return {
    ...catalog,
    groups: catalog.groups.map((group) => ({
      groupName: group.label,
      methodType: group.methodType,
      methods: group.methods.map((item) => ({
        ...item,
        name: item.label,
        methodType: group.methodType,
        channelCode: channelCodeFromCanonicalKey(item.key, group.methodType),
      })),
    })),
  };
}

export const billingOrderResponseSchema = z.object({
  id: z.string().min(1),
  consultationId: z.string().min(1),
  patientId: z.string().min(1),
  payerType: z.string(),
  orderType: z.string(),
  durationMinutes: z.number(),
  grossAmount: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
  currency: z.literal("IDR"),
  paymentStatus: z.string(),
  gatewayChannel: z.string().nullable().optional(),
  claimStatus: z.string().optional(),
  paymentId: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const billingOrderPreviewSchema = z.object({
  consultationId: z.string().min(1),
  orderType: z.string(),
  durationMinutes: z.number(),
  payerType: z.enum(["SELF_PAY", "BPJS"]),
  currency: z.literal("IDR"),
  baseAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative(),
  netAmount: z.number().nonnegative(),
  estimate: z.boolean(),
  estimateExpiresAt: z.string(),
  gatewayChannel: z.string().optional(),
  estimatedGatewayFee: z.number().optional(),
  estimatedTotalPayable: z.number().optional(),
});

export type BillingOrderPreviewDto = z.infer<typeof billingOrderPreviewSchema>;
const validatedBillingOrders = new WeakSet<object>();

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
export function mintServerPaymentContext(value: unknown): ServerPaymentContext {
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
    qrString: z.string().optional(),
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
  .strip();

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
    intent.practitionerType ?? "",
    stableSerialize(intent.level),
    intent.discountCode ?? "",
    intent.gatewayChannel ?? "",
  ];

  return `billing-order:${parts.map((part) => encodeURIComponent(part ?? "")).join("|")}`;
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
    qrString:
      instruction && "qrString" in instruction ? instruction.qrString : undefined,
    bankCode:
      instruction && "bankCode" in instruction ? instruction.bankCode : undefined,
    accountNumber:
      instruction && "accountNumber" in instruction ? instruction.accountNumber : undefined,
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
   * Mengambil katalog metode pembayaran Duitku dan kalkulasi biaya resmi dari server.
   */
  async getPaymentMethods(
    amount: number,
    currency = "IDR",
  ): Promise<PaymentMethodsDto> {
    assertCapabilityLive("payment");
    const intAmount = Math.max(0, Math.floor(amount));
    const endpoint = `/payments/methods?amount=${encodeURIComponent(intAmount)}&currency=${encodeURIComponent(currency)}`;
    return apiRequest<PaymentMethodsDto>(endpoint, {
      method: "GET",
      adapter: adaptPaymentMethods,
    });
  },

  /** Quote is read-only; it does not reserve a billing order. */
  async previewBillingOrder(
    consultationId: string,
    gatewayChannel?: string,
  ): Promise<BillingOrderPreviewDto> {
    const id = requireContextValue(consultationId, "consultationId");
    return apiRequest<BillingOrderPreviewDto>(
      `/consultations/${encodeURIComponent(id)}/billing-orders/preview`,
      {
        method: "POST",
        body: JSON.stringify({
          orderType: "INITIAL",
          durationMinutes: 60,
          payerType: "SELF_PAY",
          ...(gatewayChannel ? { gatewayChannel } : {}),
        }),
        adapter: zodAdapter(billingOrderPreviewSchema),
      },
    );
  },

  /** Restore an initial order from the authenticated patient's consultation. */
  async getCurrentBillingOrder(
    consultationId: string,
  ): Promise<BillingOrderResponseDto | null> {
    const id = requireContextValue(consultationId, "consultationId");
    return apiRequest<BillingOrderResponseDto | null>(
      `/consultations/${encodeURIComponent(id)}/billing-orders/current`,
      {
        method: "GET",
        adapter: (value) => {
          if (value == null) return null;
          const order = billingOrderResponseSchema.parse(value);
          if (order.consultationId !== id || order.orderType !== "INITIAL") {
            throw new Error("Billing order does not belong to this consultation");
          }
          validatedBillingOrders.add(order);
          return order;
        },
      },
    );
  },

  /** Status is authoritative; only server responses can unlock consultation. */
  async getPayment(paymentId: string, expectedBillingOrderId: string): Promise<PaymentResponseDto> {
    const id = requireContextValue(paymentId, "paymentId");
    const contextId = requireContextValue(expectedBillingOrderId, "billingOrderId");
    return apiRequest<PaymentResponseDto>(`/payments/${encodeURIComponent(id)}`, {
      method: "GET",
      adapter: (value) => parsePaymentResponse(value, contextId),
    });
  },

  serverPaymentContextFromBillingOrder(order: BillingOrderResponseDto | null | undefined) {
    if (!order || !validatedBillingOrders.has(order)) return undefined;
    if (order.payerType !== "SELF_PAY" || order.orderType !== "INITIAL") return undefined;
    return mintServerPaymentContext({
      consultationId: order.consultationId,
      billingOrderId: order.id,
    });
  },

  /**
   * Create a billing order. Returns the server-issued BillingOrderResponseDto
   * and mints a validated ServerPaymentContext.
   */
  async createBillingOrder(
    consultationId: string,
    dto: CreateBillingOrderDto,
  ): Promise<BillingOrderResponseDto> {
    assertCapabilityLive("payment");
    const normalizedConsultationId = requireContextValue(
      consultationId,
      "consultationId",
    );

    const response = await apiRequest<BillingOrderResponseDto>(
      `/consultations/${encodeURIComponent(normalizedConsultationId)}/billing-orders`,
      {
        method: "POST",
        body: JSON.stringify(dto),
        adapter: zodAdapter(billingOrderResponseSchema),
      },
    );

    // Revalidate consultation provenance before minting payment context.
    if (response.consultationId !== normalizedConsultationId) {
      throw new Error("Billing order consultation does not match the request");
    }
    validatedBillingOrders.add(response);
    return response;
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
   * Cek langsung kelayakan peserta BPJS via Bridging Core
   */
  async bridgeBpjsEligibility(memberNumber: string): Promise<any> {
    const normalized = requireContextValue(memberNumber, "memberNumber");
    return apiRequest<any>("/bpjs/bridging/eligibility", {
      method: "POST",
      body: JSON.stringify({ memberNumber: normalized }),
    });
  },

  /**
   * Ambil rujukan faskes BPJS berdasarkan nomor rujukan
   */
  async getBpjsReferral(
    referralNumber: string,
    signal?: AbortSignal,
  ): Promise<any> {
    const normalized = requireContextValue(referralNumber, "referralNumber");
    return apiRequest<any>(
      `/bpjs/bridging/referrals/${encodeURIComponent(normalized)}`,
      { signal },
    );
  },

  /**
   * Submit klaim BPJS untuk billing order
   */
  async submitBillingOrderBpjs(
    billingOrderId: string,
    payload: Record<string, unknown>,
  ): Promise<any> {
    const id = requireContextValue(billingOrderId, "billingOrderId");
    return apiRequest<any>(
      `/billing-orders/${encodeURIComponent(id)}/bpjs/submit`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
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

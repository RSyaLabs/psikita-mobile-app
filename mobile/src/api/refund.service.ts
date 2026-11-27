import { z } from "zod";
import { apiRequest } from "./client";
import { zodAdapter } from "./response";
import {
  RefundCaseListDto,
  RefundCaseViewDto,
  RefundDestinationsDto,
  RequestRefundCaseDto,
} from "@/types/api";

const refundQuoteSchema = z
  .union([
    z.object({
      amount: z.number().int().nonnegative(),
      currency: z.literal("IDR"),
      deductions: z.number().int().nonnegative().optional(),
      netRefund: z.number().int().nonnegative(),
    }),
    z
      .object({
        schemaVersion: z.number(),
        currency: z.string(),
        grossUserPayment: z.number(),
        userReceives: z.number(),
        transferFee: z.number().optional(),
      })
      .passthrough()
      .transform((q) => ({
        amount: q.grossUserPayment,
        currency: q.currency,
        deductions: q.transferFee,
        netRefund: q.userReceives,
      })),
  ])
  .nullable()
  .optional()
  .transform((q) => q ?? { amount: 0, currency: "IDR", netRefund: 0 });

const refundCaseStatusSchema = z.enum([
  "REQUESTED",
  "UNDER_REVIEW",
  "APPROVED",
  "QUEUED",
  "PROCESSING",
  "DELIVERED",
  "COMPLETED",
  "FAILED",
  "RETURNED",
  "DISPUTED",
  "CANCELLED",
]);

export const refundCaseViewSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    paymentId: z.string().min(1),
    status: refundCaseStatusSchema.or(z.string()),
    beneficiaryVerified: z.boolean(),
    earningHold: z.boolean(),
    transferAvailable: z.boolean(),
    disabledReason: z
      .enum([
        "REFUND_DISABLED",
        "REFUND_TRANSFER_UNVERIFIED",
        "BENEFICIARY_UNVERIFIED",
      ])
      .or(z.string())
      .nullable()
      .optional(),
    deliveryStatus: z.string().nullable().optional(),
    actualTransferFee: z.number().int().nullable().optional(),
    deliveryConfirmedAt: z.string().nullable().optional(),
    quote: refundQuoteSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
    audit: z.array(z.unknown()).optional(),
  })
  .passthrough();

export const refundCaseListSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(refundCaseViewSchema),
  limit: z.number().int().positive(),
});

const refundDestinationItemSchema = z.union([
  z.object({
    type: z.enum(["BANK", "E_WALLET"]),
    code: z.string().min(1),
    name: z.string().min(1),
  }),
  z
    .object({
      key: z.string().min(1),
      kind: z.enum(["BANK", "E_WALLET"]),
      label: z.string().min(1),
      maximum: z
        .object({
          amount: z.number(),
          currency: z.string(),
        })
        .optional(),
    })
    .transform((d) => ({
      type: d.kind,
      code: d.key,
      name: d.label,
    })),
]);

export const refundDestinationsSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(refundDestinationItemSchema),
});

export const requestRefundCaseSchema = z.object({
  paymentId: z.string().min(26).max(26), // ULID standard
  idempotencyKey: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z0-9:_-]+$/, "Karakter idempotency key tidak valid"),
});

export function maskBeneficiaryAccount(accountNumber?: string): string {
  if (!accountNumber) return "";
  const cleaned = accountNumber.trim();
  if (cleaned.length <= 4) return cleaned;
  const lastFour = cleaned.substring(cleaned.length - 4);
  return `••••••${lastFour}`;
}

export const refundService = {
  /**
   * Mengambil daftar destinasi bank dan e-wallet yang didukung untuk pencairan refund.
   */
  async getDestinations(): Promise<RefundDestinationsDto> {
    return apiRequest<RefundDestinationsDto>("/refunds/destinations", {
      method: "GET",
      adapter: zodAdapter(refundDestinationsSchema),
    });
  },

  /**
   * Mengajukan kasus pengembalian dana (refund case intake) untuk pembayaran yang sah.
   */
  async requestRefund(dto: RequestRefundCaseDto): Promise<RefundCaseViewDto> {
    const validatedDto = requestRefundCaseSchema.parse(dto);

    return apiRequest<RefundCaseViewDto>("/refunds", {
      method: "POST",
      body: JSON.stringify(validatedDto),
      adapter: zodAdapter(refundCaseViewSchema),
    });
  },

  /**
   * Mengambil daftar kasus refund milik pasien yang sedang login.
   */
  async getRefundCases(): Promise<RefundCaseListDto> {
    return apiRequest<RefundCaseListDto>("/refunds", {
      method: "GET",
      adapter: zodAdapter(refundCaseListSchema),
    });
  },

  /**
   * Memeriksa status terkini kasus refund tertentu berdasarkan ID.
   */
  async getRefundCaseById(id: string): Promise<RefundCaseViewDto> {
    return apiRequest<RefundCaseViewDto>(
      `/refunds/${encodeURIComponent(id.trim())}`,
      {
        method: "GET",
        adapter: zodAdapter(refundCaseViewSchema),
      },
    );
  },
};

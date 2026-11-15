import { z } from "zod";
import { apiRequest } from "./client";
import { zodAdapter } from "./response";
import {
  RefundCaseListDto,
  RefundCaseViewDto,
  RefundDestinationsDto,
  RequestRefundCaseDto,
} from "@/types/api";

export const refundQuoteSchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.literal("IDR"),
  deductions: z.number().int().nonnegative().optional(),
  netRefund: z.number().int().nonnegative(),
});

export const refundCaseStatusSchema = z.enum([
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

export const refundCaseViewSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  paymentId: z.string().min(1),
  status: refundCaseStatusSchema.or(z.string()),
  beneficiaryVerified: z.boolean(),
  earningHold: z.boolean(),
  transferAvailable: z.boolean(),
  disabledReason: z
    .enum(["REFUND_DISABLED", "REFUND_TRANSFER_UNVERIFIED"])
    .nullable()
    .optional(),
  deliveryStatus: z.string().optional(),
  actualTransferFee: z.number().int().optional(),
  deliveryConfirmedAt: z.string().optional(),
  quote: refundQuoteSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  audit: z.array(z.unknown()).optional(),
});

export const refundCaseListSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(refundCaseViewSchema),
  limit: z.number().int().positive(),
});

export const refundDestinationItemSchema = z.object({
  type: z.enum(["BANK", "E_WALLET"]),
  code: z.string().min(1),
  name: z.string().min(1),
});

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

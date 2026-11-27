import { z } from "zod";
import { apiRequest } from "./client";
import { zodAdapter, noContentAdapter } from "./response";
import {
  PayoutBankAccountStatusDto,
  SavePayoutBankAccountDto,
} from "@/types/api";

export const payoutBankAccountStatusSchema = z.object({
  status: z.enum(["NOT_CONFIGURED", "PENDING", "VERIFIED", "BLOCKED"]),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const savePayoutBankAccountSchema = z.object({
  bankCode: z.string().trim().min(1, "Bank wajib dipilih"),
  accountNumber: z
    .string()
    .trim()
    .min(5, "Nomor rekening minimal 5 digit")
    .regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka"),
  accountName: z.string().trim().min(2, "Nama pemilik rekening wajib diisi"),
});

export function maskAccountNumber(accountNumber?: string): string {
  if (!accountNumber) return "";
  const cleaned = accountNumber.trim();
  if (cleaned.length <= 4) return cleaned;
  const lastFour = cleaned.substring(cleaned.length - 4);
  return `••••••${lastFour}`;
}

export const payoutService = {
  /**
   * Mengambil status verifikasi rekening bank milik praktisi yang sedang login.
   * Tidak memerlukan otoritas admin.
   */
  async getMyBankAccountStatus(): Promise<PayoutBankAccountStatusDto> {
    return apiRequest<PayoutBankAccountStatusDto>("/payout/bank-account/me", {
      method: "GET",
      adapter: zodAdapter(payoutBankAccountStatusSchema),
    });
  },

  /**
   * Mendaftarkan atau memperbarui rekening bank milik praktisi untuk pencairan insentif.
   * Rekening yang dikirim akan berstatus PENDING hingga diverifikasi secara server-side.
   */
  async saveMyBankAccount(
    dto: SavePayoutBankAccountDto,
  ): Promise<PayoutBankAccountStatusDto> {
    const validatedDto = savePayoutBankAccountSchema.parse(dto);

    return apiRequest<PayoutBankAccountStatusDto>("/payout/bank-account/me", {
      method: "PUT",
      body: JSON.stringify(validatedDto),
      adapter: zodAdapter(payoutBankAccountStatusSchema),
    });
  },

  /**
   * Kirim data NPWP profil pajak praktisi (PUT /payout/tax-profile/me).
   */
  async submitTaxProfile(dto: { npwp: string }): Promise<void> {
    const cleanedNpwp = dto.npwp.replace(/[^\d]/g, "");
    if (cleanedNpwp.length !== 15 && cleanedNpwp.length !== 16) {
      throw new Error("Nomor NPWP harus terdiri dari 15 atau 16 digit.");
    }
    const normalizedNpwp =
      cleanedNpwp.length === 15 ? `0${cleanedNpwp}` : cleanedNpwp;
    await apiRequest<void>("/payout/tax-profile/me", {
      method: "PUT",
      body: JSON.stringify({ npwp: normalizedNpwp }),
      adapter: noContentAdapter,
    });
  },

  /**
   * Setujui perjanjian pencairan insentif praktisi (POST /payout/agreements/accept).
   */
  async acceptPayoutAgreement(): Promise<void> {
    await apiRequest<void>("/payout/agreements/accept", {
      method: "POST",
      adapter: noContentAdapter,
    });
  },
};

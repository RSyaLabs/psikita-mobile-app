import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import {
  collectionAdapter,
  paginatedAdapter,
  requireServerId,
  withQueryParams,
  type PaginatedResult,
} from "./response";
import { PrescriptionResponseDto, ReferralResponseDto } from "@/types/api";

const prescriptionItemSchema = z.object({
  id: z.string(),
  medication: z.object({ id: z.string(), name: z.string() }),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  refill: z.number(),
});

const prescriptionSchema = z.object({
  // The contract requires all seven. `items` in particular must not default:
  // an absent items array used to parse as a valid prescription with zero
  // medications, which a patient reads as "I have been prescribed nothing"
  // rather than "the server sent something malformed". The six display
  // fields the 30 September work added are not in the contract at all and
  // were removed; a screen must not show a value the server never sent.
  id: z.string(),
  patientId: z.string(),
  consultationId: z.string(),
  practitionerId: z.string(),
  items: z.array(prescriptionItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const prescriptionAdapter = (value: unknown): PrescriptionResponseDto => {
  const prescription = prescriptionSchema.parse(value);
  return {
    id: prescription.id,
    patientId: prescription.patientId,
    consultationId: prescription.consultationId,
    practitionerId: prescription.practitionerId,
    medications: prescription.items.map((item) => ({
      name: item.medication.name,
      dosage: item.dosage,
      frequency: item.frequency,
      refill: item.refill,
      duration: item.duration,
    })),
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
  };
};

const referralReasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const referralHistorySchema = z.object({
  id: z.string(),
  status: z.string(),
  timestamp: z.string(),
  comment: z.string().optional(),
});

const referralSchema = z.object({
  id: z.string(),
  consultationId: z.string(),
  // The checked-in contract documents exactly these fields. Fields such as
  // referralNumber, targetHospital, validUntil and qrCodeUrl are not in it, and
  // filling them in here means a screen shows a value the server never sent.
  destinationInstitutionId: z.string(),
  currentStatus: z.string(),
  reason: referralReasonSchema,
  histories: z.array(referralHistorySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const referralAdapter = (value: unknown): ReferralResponseDto => {
  const referral = referralSchema.parse(value);
  return {
    id: referral.id,
    consultationId: referral.consultationId,
    destinationInstitutionId: referral.destinationInstitutionId,
    currentStatus: referral.currentStatus,
    icd10Code: referral.reason.id,
    icd10Description: referral.reason.description,
    createdAt: referral.createdAt,
    updatedAt: referral.updatedAt,
  };
};

const prescriptionListAdapter = paginatedAdapter(prescriptionAdapter);

export const prescriptionService = {
  /**
   * Ambil Resep Digital Berdasarkan Konsultasi
   */
  async getPrescriptions(
    params?: {
      page?: number;
      limit?: number;
      patientId?: string;
      practitionerId?: string;
      consultationId?: string;
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PrescriptionResponseDto>> {
    const path = withQueryParams("/prescriptions", {
      page: params?.page,
      limit: params?.limit,
      patientId: params?.patientId,
      practitionerId: params?.practitionerId,
      consultationId: params?.consultationId,
    });
    return apiRequest<PaginatedResult<PrescriptionResponseDto>>(path, {
      adapter: prescriptionListAdapter,
      signal,
    });
  },

  /**
   * Ambil resep tunggal untuk konsultasi tertentu
   */
  async getPrescriptionByConsultation(
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<PrescriptionResponseDto> {
    const path = withQueryParams("/prescriptions", {
      consultationId,
      limit: 1,
    });
    const result = await apiRequest<PaginatedResult<PrescriptionResponseDto>>(
      path,
      {
        adapter: prescriptionListAdapter,
        signal,
      },
    );
    const prescription = result.data[0];
    if (!prescription) {
      throw new ApiError(
        "Resep tidak ditemukan",
        404,
        "PRESCRIPTION_NOT_FOUND",
      );
    }
    return prescription;
  },

  /**
   * Ambil Rujukan Rumah Sakit Satu Sehat
   */
  async getReferralByConsultation(
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<ReferralResponseDto | null> {
    const id = requireServerId(consultationId, "consultationId");
    const referrals = await apiRequest<ReferralResponseDto[]>(
      `/consultation/${encodeURIComponent(id)}/referral`,
      { adapter: collectionAdapter(referralAdapter), signal },
    );
    return referrals[0] ?? null;
  },
};

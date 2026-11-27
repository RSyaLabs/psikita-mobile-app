import { z } from "zod";
import { apiRequest } from "./client";
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

export interface FacilityResponseDto {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  hasPsychiatry: boolean;
  latitude: number;
  longitude: number;
  city?: string;
  type?: string;
  phone?: string;
  bpjsCovered?: boolean;
}

export interface ReferralLetterResponseDto {
  referralId: string;
  letterNumber?: string;
  pdfUrl?: string;
  downloadUrl?: string;
  issuedAt?: string;
  validUntil?: string;
}

export interface MedicationSuggestionsDto {
  diagnosisCode: string;
  patientId?: string;
  cdssAlerts?: any[];
  suggestions: Array<{
    id?: string;
    name: string;
    genericName?: string;
    dosageForm?: string;
    strength?: string;
    rationale?: string;
  }>;
}

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

  /**
   * Cari faskes dan RS rujukan jiwa terdekat dari domisili pasien
   */
  async getNearestFacilities(
    params?: { latitude?: number; longitude?: number; limit?: number },
    signal?: AbortSignal,
  ): Promise<FacilityResponseDto[]> {
    const path = params
      ? withQueryParams("/referral/nearest-facilities", params)
      : "/referral/nearest-facilities";
    const res = await apiRequest<unknown>(path, { signal, adapter: (v) => v });
    if (Array.isArray(res)) return res as FacilityResponseDto[];
    if (res && Array.isArray((res as any).data)) {
      return (res as any).data as FacilityResponseDto[];
    }
    return [];
  },

  /**
   * Unduh informasi surat rujukan digital
   */
  async getReferralLetter(
    referralId: string,
    signal?: AbortSignal,
  ): Promise<ReferralLetterResponseDto> {
    const id = requireServerId(referralId, "referralId");
    return apiRequest<ReferralLetterResponseDto>(
      `/consultation/referral/${encodeURIComponent(id)}/letter`,
      {
        signal,
        adapter: (v) => {
          const rec = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
          const letterUrl = typeof rec.letterUrl === "string" ? rec.letterUrl : undefined;
          return {
            ...(rec as unknown as ReferralLetterResponseDto),
            referralId: typeof rec.referralId === "string" ? rec.referralId : id,
            pdfUrl: typeof rec.pdfUrl === "string" ? rec.pdfUrl : letterUrl,
            downloadUrl: typeof rec.downloadUrl === "string" ? rec.downloadUrl : letterUrl,
          };
        },
      },
    );
  },

  /**
   * Buat / generate surat rujukan digital
   */
  async generateReferralLetter(
    referralId: string,
  ): Promise<ReferralLetterResponseDto> {
    const id = requireServerId(referralId, "referralId");
    return apiRequest<ReferralLetterResponseDto>(
      `/consultation/referral/${encodeURIComponent(id)}/letter`,
      {
        method: "POST",
        adapter: (v) => {
          const rec = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
          const letterUrl = typeof rec.letterUrl === "string" ? rec.letterUrl : undefined;
          return {
            ...(rec as unknown as ReferralLetterResponseDto),
            referralId: typeof rec.referralId === "string" ? rec.referralId : id,
            pdfUrl: typeof rec.pdfUrl === "string" ? rec.pdfUrl : letterUrl,
            downloadUrl: typeof rec.downloadUrl === "string" ? rec.downloadUrl : letterUrl,
          };
        },
      },
    );
  },

  /**
   * Rekomendasi obat berdasarkan diagnosis & CDSS
   */
  async getMedicationSuggestions(
    params: { diagnosisCode: string; patientId?: string },
    signal?: AbortSignal,
  ): Promise<MedicationSuggestionsDto> {
    const path = withQueryParams("/medications/suggestions", params);
    return apiRequest<MedicationSuggestionsDto>(path, {
      signal,
      adapter: (v) => {
        const rec = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
        const rawSuggestions = Array.isArray(rec.suggestions) ? rec.suggestions : [];
        const normalized = rawSuggestions.map((item: unknown) => {
          const s = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
          const med =
            s.medication && typeof s.medication === "object"
              ? (s.medication as Record<string, unknown>)
              : undefined;
          return {
            id: typeof s.id === "string" ? s.id : typeof med?.id === "string" ? med.id : undefined,
            name: String(s.name ?? med?.name ?? med?.genericName ?? "Obat"),
            genericName:
              typeof s.genericName === "string"
                ? s.genericName
                : typeof med?.genericName === "string"
                  ? med.genericName
                  : undefined,
            dosageForm:
              typeof s.dosageForm === "string"
                ? s.dosageForm
                : typeof med?.dosageForm === "string"
                  ? med.dosageForm
                  : undefined,
            strength:
              typeof s.strength === "string"
                ? s.strength
                : typeof med?.strength === "string"
                  ? med.strength
                  : undefined,
            rationale:
              typeof s.rationale === "string"
                ? s.rationale
                : typeof s.therapyLine === "string"
                  ? s.therapyLine
                  : undefined,
          };
        });
        return {
          ...(rec as unknown as MedicationSuggestionsDto),
          diagnosisCode:
            typeof rec.diagnosisCode === "string" ? rec.diagnosisCode : params.diagnosisCode,
          suggestions: normalized,
        };
      },
    });
  },
};

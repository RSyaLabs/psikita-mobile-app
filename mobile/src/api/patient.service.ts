import { z } from "zod";
import { apiRequest } from "./client";
import {
  noContentAdapter,
  paginatedAdapter,
  withQueryParams,
  type PaginatedResult,
} from "./response";
import { requireServerId } from "./response";
import {
  PatientResponseDto,
  CreatePatientDto,
  UpdatePatientDto,
} from "@/types/api";

const patientApiSchema = z.object({
  patientId: z.string(),
  status: z.enum(["PENDING_MANUAL_REVIEW", "ACTIVE", "REJECTED", "SUSPENDED"]),
  fullName: z.string(),
  birthDate: z.string(),
  gender: z.enum(["MALE", "FEMALE"]),
  phoneNumber: z.string(),
  address: z.string(),
  medicalRecordNumber: z.string(),
  nik: z.string().optional(),
  bpjsNumber: z.string().optional(),
  faskes1: z.string().optional(),
  updatedAt: z.string().optional(),
  createdAt: z.string().optional(),
});

const patientDtoAdapter = (value: unknown): PatientResponseDto => {
  const patient = patientApiSchema.parse(value);
  return {
    id: patient.patientId,
    patientId: patient.patientId,
    fullName: patient.fullName,
    birthDate: patient.birthDate,
    gender: patient.gender,
    phoneNumber: patient.phoneNumber,
    medicalRecordNumber: patient.medicalRecordNumber,
    address: patient.address,
    status: patient.status,
    createdAt: patient.createdAt,
    nik: patient.nik,
    bpjsNumber: patient.bpjsNumber,
    faskes1: patient.faskes1,
  };
};
const patientListAdapter = paginatedAdapter(patientDtoAdapter);

export interface PatientConsultationResultDto {
  consultationId: string;
  sessionDate: string;
  practitionerName: string;
  patientFacingAdvice: string;
  referral?: Record<string, unknown> | null;
  referrals?: Array<Record<string, unknown>>;
  prescriptionCode?: string | null;
  prescriptionStatus?:
    | "ACTIVE"
    | "CLAIMED"
    | "USED"
    | "EXPIRED"
    | "REVOKED"
    | null;
  prescriptionExpiresAt?: string | null;
}

export const patientService = {
  /**
   * Profil Pasien saat ini (me)
   */
  async getMyProfile(signal?: AbortSignal): Promise<PatientResponseDto> {
    return apiRequest<PatientResponseDto>("/patient/me", {
      adapter: patientDtoAdapter,
      signal,
    });
  },

  /**
   * Buat Profil Pasien Baru
   */
  async createProfile(dto: CreatePatientDto): Promise<PatientResponseDto> {
    return apiRequest<PatientResponseDto>("/patient", {
      method: "POST",
      body: JSON.stringify(dto),
      adapter: patientDtoAdapter,
    });
  },

  /**
   * Update Profil Pasien
   */
  async updateProfile(
    patientId: string,
    dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    const id = requireServerId(patientId, "patientId");
    return apiRequest<PatientResponseDto>(`/patient/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      adapter: patientDtoAdapter,
    });
  },

  /**
   * Ambil daftar pasien terdaftar (admin)
   */
  async getPatients(
    params?: { page?: number; limit?: number; fullName?: string },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PatientResponseDto>> {
    const path = withQueryParams("/patient", {
      page: params?.page,
      limit: params?.limit,
      fullName: params?.fullName,
    });
    return apiRequest<PaginatedResult<PatientResponseDto>>(path, {
      adapter: patientListAdapter,
      signal,
    });
  },

  /**
   * Hasil akhir konsultasi pasien (Results Tab)
   */
  async getMyResults(
    signal?: AbortSignal,
  ): Promise<PatientConsultationResultDto[]> {
    const res = await apiRequest<unknown>("/patient/me/results", { signal });
    if (Array.isArray(res)) return res as PatientConsultationResultDto[];
    if (res && Array.isArray((res as any).data)) {
      return (res as any).data as PatientConsultationResultDto[];
    }
    return [];
  },

  /**
   * Detail hasil akhir konsultasi spesifik
   */
  async getResultDetail(
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<PatientConsultationResultDto> {
    const id = requireServerId(consultationId, "consultationId");
    return apiRequest<PatientConsultationResultDto>(
      `/patient/me/results/${encodeURIComponent(id)}`,
      { signal },
    );
  },
};

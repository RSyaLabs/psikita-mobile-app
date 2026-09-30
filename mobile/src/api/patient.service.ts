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
  async createProfile(dto: CreatePatientDto): Promise<void> {
    return apiRequest<void>("/patient", {
      method: "POST",
      body: JSON.stringify(dto),
      adapter: noContentAdapter,
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
};

import { z } from "zod";
import { PRACTITIONER_TYPES, type PractitionerType } from "@/constants/enums";
import { apiRequest } from "./client";
import {
  noContentAdapter,
  paginatedAdapter,
  requireServerId,
  withQueryParams,
  type PaginatedResult,
} from "./response";
import {
  PractitionerResponseDto,
  CreatePractitionerDto,
  UpdateAvailabilityDto,
  RejectPractitionerDto,
} from "@/types/api";

const educationSchema = z
  .object({
    id: z.string(),
    institution: z.string(),
    degree: z.string(),
    // Required by the contract. These used to be optional and then invented:
    // `?? ""` rendered an empty major and `?? 2020` rendered the year 2020 on
    // a practitioner's credentials. An absent field is now absent, and the
    // screen shows a placeholder instead.
    major: z.string(),
    graduationYear: z.number(),
  })
  .transform((e) => ({
    id: e.id,
    institution: e.institution,
    degree: e.degree,
    major: e.major,
    graduationYear: e.graduationYear,
  }));

const experienceSchema = z
  .object({
    id: z.string(),
    facilityName: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
  })
  .transform((e) => ({
    id: e.id,
    facilityName: e.facilityName,
    position: e.position,
    startDate: e.startDate,
    endDate: e.endDate,
  }));

// The contract declares `type` as a plain string with `"psychologist"` as its
// documented example, while the request-side enums are uppercase. Validating
// the response against the uppercase enum therefore 502s the entire
// practitioner directory the moment the server follows its own document.
// Uppercasing before the check honours the contract without loosening it: an
// unknown value is still rejected. The casing the server actually returns is
// recorded in docs/CONTRACT-AUDIT-2026-09-30.md as an open question for the
// backend team.
const uppercased = (value: unknown) =>
  typeof value === "string" ? value.toUpperCase() : value;

const practitionerApiSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.preprocess(uppercased, z.enum(PRACTITIONER_TYPES)),
  fullName: z.string().optional(),
  title: z.string().optional(),
  specialization: z.string().optional(),
  avatar: z.string().optional(),
  consultationFee: z.number().optional(),
  totalSessions: z.number().optional(),
  experienceYears: z.number().optional(),
  supportsBpjs: z.boolean().optional(),
  nik: z.string(),
  nikVerificationStatus: z.enum([
    "VERIFIED",
    "NOT_VERIFIED",
    "RETRYABLE",
    "MANUAL_REVIEW",
  ]),
  taxIdentificationNumber: z.string(),
  availabilityStatus: z.preprocess(
    uppercased,
    z.enum(["AVAILABLE", "ON_LEAVE", "SUSPENDED", "INACTIVE"]),
  ),
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  averageRating: z.number(),
  educations: z.array(educationSchema),
  experiences: z.array(experienceSchema),
  psychologistProfile: z
    .object({
      level: z.string(),
      totalPracticeHours: z.number(),
      sippNumber: z.string(),
    })
    .optional(),
  psychiatristProfile: z
    .object({
      strNumber: z.string(),
      sipNumber: z.string(),
      canPrescribe: z.boolean(),
    })
    .optional(),
});

const practitionerAdapter = (value: unknown): PractitionerResponseDto => {
  const practitioner = practitionerApiSchema.parse(value);
  const isPsychiatrist = practitioner.type === "PSYCHIATRIST";
  const psychiatristProfile = practitioner.psychiatristProfile;
  const psychologistProfile = practitioner.psychologistProfile;
  const sippNumber = isPsychiatrist
    ? psychiatristProfile?.sipNumber
    : psychologistProfile?.sippNumber;
  if (!sippNumber) {
    throw new Error(
      "Documented practitioner profile is missing its registration number",
    );
  }

  return {
    id: practitioner.id,
    userId: practitioner.userId,
    fullName: practitioner.fullName,
    title: practitioner.title,
    specialization: practitioner.specialization,
    avatar: practitioner.avatar,
    consultationFee: practitioner.consultationFee,
    totalSessions: practitioner.totalSessions,
    experienceYears: practitioner.experienceYears,
    supportsBpjs: practitioner.supportsBpjs,
    strNumber: isPsychiatrist ? psychiatristProfile?.strNumber : undefined,
    sippNumber,
    type: practitioner.type,
    availabilityStatus: practitioner.availabilityStatus,
    verificationStatus: practitioner.verificationStatus,
    rating: practitioner.averageRating,
    educations: practitioner.educations,
    experiences: practitioner.experiences,
  };
};

const practitionerListAdapter = paginatedAdapter(practitionerAdapter);

export const practitionerService = {
  /**
   * Profil Praktisi saat ini (me)
   */
  async getMyProfile(signal?: AbortSignal): Promise<PractitionerResponseDto> {
    return apiRequest<PractitionerResponseDto>("/practitioner/me", {
      adapter: practitionerAdapter,
      signal,
    });
  },

  /**
   * Pendaftaran / Registrasi profil praktisi baru
   */
  async createProfile(
    dto: CreatePractitionerDto,
  ): Promise<PractitionerResponseDto> {
    return apiRequest<PractitionerResponseDto>("/practitioner", {
      method: "POST",
      body: JSON.stringify(dto),
      adapter: practitionerAdapter,
    });
  },

  /**
   * Ambil daftar praktisi (bisa difilter status, tipe, dsb.)
   */
  async getPractitioners(
    params?: {
      type?: PractitionerType;
      availabilityStatus?: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
      verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<PractitionerResponseDto>> {
    const path = withQueryParams("/practitioner", {
      type: params?.type,
      availabilityStatus: params?.availabilityStatus,
      verificationStatus: params?.verificationStatus,
      page: params?.page,
      limit: params?.limit,
    });
    return apiRequest<PaginatedResult<PractitionerResponseDto>>(path, {
      adapter: practitionerListAdapter,
      signal,
    });
  },

  /**
   * Detail praktisi berdasarkan ID
   */
  async getById(
    practitionerId: string,
    signal?: AbortSignal,
  ): Promise<PractitionerResponseDto> {
    const id = requireServerId(practitionerId, "practitionerId");
    return apiRequest<PractitionerResponseDto>(
      `/practitioner/${encodeURIComponent(id)}`,
      {
        adapter: practitionerAdapter,
        signal,
      },
    );
  },

  /**
   * Ubah status ketersediaan (Online/Offline/Cuti)
   */
  async changeAvailability(
    practitionerId: string,
    status: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE",
  ): Promise<void> {
    const id = requireServerId(practitionerId, "practitionerId");
    const dto: UpdateAvailabilityDto = { status };
    return apiRequest<void>(`/practitioner/${encodeURIComponent(id)}/availability`, {
      method: "PATCH",
      body: JSON.stringify(dto),
      adapter: noContentAdapter,
    });
  },

  /**
   * Admin: Menyetujui praktisi
   */
  async approveProfile(practitionerId: string): Promise<void> {
    const id = requireServerId(practitionerId, "practitionerId");
    return apiRequest<void>(`/practitioner/${encodeURIComponent(id)}/approve`, {
      method: "PUT",
      adapter: noContentAdapter,
    });
  },

  /**
   * Admin: Menolak pengajuan praktisi dengan catatan
   */
  async rejectProfile(practitionerId: string, reason: string): Promise<void> {
    const id = requireServerId(practitionerId, "practitionerId");
    const dto: RejectPractitionerDto = { reason };
    return apiRequest<void>(`/practitioner/${encodeURIComponent(id)}/reject`, {
      method: "PUT",
      body: JSON.stringify(dto),
      adapter: noContentAdapter,
    });
  },
};

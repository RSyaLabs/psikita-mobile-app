/**
 * PsiKita Core API — Data Transfer Objects (DTOs)
 * Sesuai dengan spesifikasi OpenAPI 3.0 (openapi-21-09-2026.json)
 */

import type {
  PractitionerType,
  ServerRole,
} from "@/constants/enums";

// ============================================================================
// IAM & AUTH DTOs
// ============================================================================

export interface PasswordLoginDto {
  username?: string;
  usernameOrEmail?: string;
  password: string;
}

export interface PasswordRegisterDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface RequestOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  /** staging-openapi.json VerifyOtpDto names this `otp`. Sending `code`
   *  returned 422 {"otp":{"message":"OTP code must consist of digits only"}}. */
  otp: string;
}

export interface OtpVerifyResponseDto {
  message: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface TokenResponseDto {
  accessToken: string;
  /** staging-openapi.json TokenResponseDto requires refreshToken. */
  refreshToken: string;
  /** Not in the contract. A deployed server may send it; nothing may rely on
   *  it, because no documented endpoint returns the caller's role. */
  user?: {
    id: string;
    username: string;
    email: string;
    role: ServerRole;
    isActive: boolean;
  };
}

export interface RegisterResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

// ============================================================================
// PATIENT DTOs
// ============================================================================

export interface PatientResponseDto {
  id: string;
  patientId?: string;
  userId?: string;
  fullName: string;
  nik?: string;
  phoneNumber: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE";
  medicalRecordNumber?: string;
  bpjsNumber?: string;
  faskes1?: string;
  address?: string;
  status?: string;
  createdAt?: string;
}

export interface CreatePatientDto {
  fullName: string;
  nik?: string;
  phoneNumber: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE";
  bpjsNumber?: string;
  healthCoverageType?: string;
  healthInsuranceId?: string;
}

export interface UpdatePatientDto {
  fullName?: string;
  phoneNumber?: string;
  nik?: string;
  bpjsNumber?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE";
  address?: string;
}

// ============================================================================
// TRIAGE DTOs
// ============================================================================

export interface SubmitTriageDto {
  score?: number;
  hasRedFlags?: boolean;
  assessmentType?: "SELF_ASSESSMENT" | "PRACTITIONER_ASSESSMENT";
  answers: Record<string, unknown>;
  notes?: string;
}

export type TriageAssessmentType =
  "SELF_ASSESSMENT" | "PRACTITIONER_ASSESSMENT";
export type TriageLevel = "GREEN" | "YELLOW" | "RED";
export type TriageDisposition =
  "PENDING" | "COUNSELING" | "CRISIS" | "COMPLETED";

export interface TriageResponseDto {
  id: string;
  patientId: string;
  assessedBy: string;
  assessmentType: TriageAssessmentType;
  score: number;
  hasRedFlags: boolean;
  level: TriageLevel;
  disposition: TriageDisposition;
  answers: Record<string, unknown>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  /** Legacy display aliases are never used as clinical authority. */
  status?: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "TRANSFERRED";
  priorityScore?: number;
  activeConsultation?: ActiveConsultationContext;
}

// ============================================================================
// MATCHING DTOs
// ============================================================================

export interface WaitingRoomStatusDto {
  status: string;
  position: number;
  estimatedWaitSeconds: number;
  matchingRequestId?: string;
  assignedDoctor?: {
    id: string;
    name: string;
    title: string;
    rating: number;
    avatar?: string;
  };
}

export interface MatchingResponseDto {
  id: string;
  patientId: string;
  practitionerId?: string;
  status: Record<string, unknown>;
  matchScore?: number;
  createdAt: string;
  triageId: string;
  requiredLevel: "level_1" | "level_2" | "level_3" | "level_4";
  candidatePractitionerIds: string[];
  assignedPractitionerId?: string | null;
  deadlineAt?: string | null;
  updatedAt?: string;
  /** Present only when the claim response carries a validated consultation. */
  activeConsultation?: ActiveConsultationContext;
}

// ============================================================================
// CONSULTATION & CHAT DTOs
// ============================================================================

export interface ActiveConsultationContext {
  consultationId: string;
  roomId: string;
  patientId: string;
  practitionerId: string;
  status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
}

export interface CreateConsultationDto {
  practitionerId: string;
  matchingRequestId?: string;
  durationMinutes?: number;
  /** Legacy client fields are accepted by types but are not sent to the server. */
  patientId?: string;
  scheduledAt?: string;
}

export interface ConsultationResponseDto {
  id: string;
  patientId: string;
  practitionerId: string;
  status: "WAITING" | "ACTIVE" | "FINISHED" | "CANCELLED";
  participants?: Array<{
    id: string;
    userId: string;
    role: "PATIENT" | "PRACTITIONER";
    joinedAt?: string | null;
    leftAt?: string | null;
  }>;
  startedAt?: string;
  finishedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  durationMinutes: number;
  /** Only populated when returned by the server response. */
  roomId?: string;
  activeConsultation?: ActiveConsultationContext;
  fee?: number;
  practitionerName?: string;
  practitionerTitle?: string;
  practitionerSpecialization?: string;
  practitionerAvatar?: string;
  patientName?: string;
  patientAvatar?: string;
  icdCode?: string;
  note?: string;
}

export interface MessageResponseDto {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: "PATIENT" | "PRACTITIONER" | "SYSTEM" | "UNKNOWN";
  content: string;
  contentType: "TEXT" | "IMAGE" | "DOCUMENT" | "AUDIO" | "UNKNOWN";
  createdAt: string;
}

export interface RtcConfigurationResponseDto {
  iceServers: {
    urls: string | string[];
    username?: string;
    credential?: string;
  }[];
}

// ============================================================================
// CLINICAL NOTES & SOAP DTOs
// ============================================================================

export interface CreateSoapNoteDto {
  messageIds?: string[];
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  /** Local display metadata; not part of the documented SOAP request. */
  icd10Code?: string;
  icd10Description?: string;
  severity?: "Ringan" | "Sedang" | "Berat";
}

export interface NoteResponseDto {
  id: string;
  consultationId: string;
  contentType?: "text" | "soap";
  text?: string;
  soap?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  createdAt: string;
  updatedAt?: string;
  /** Compatibility view for existing consumers; never synthesized. */
  type?: "SOAP" | "FREE_TEXT";
  content?: string;
  soapData?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    icd10Code?: string;
    icd10Description?: string;
    severity?: string;
  };
  isFinalized?: boolean;
}

// ============================================================================
// PRESCRIPTION & REFERRAL DTOs
// ============================================================================

export interface MedicationItemDto {
  name: string;
  dosage: string;
  frequency: string;
  quantity?: number;
  refill?: number;
  notes?: string;
  duration?: string;
}

export interface PrescriptionResponseDto {
  id: string;
  patientId?: string;
  consultationId: string;
  practitionerId?: string;
  prescriptionNumber?: string;
  doctorName?: string;
  doctorSip?: string;
  medications: MedicationItemDto[];
  notes?: string;
  qrCodeUrl?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralResponseDto {
  id: string;
  consultationId: string;
  destinationInstitutionId?: string;
  currentStatus?: string;
  referralNumber?: string;
  targetHospital?: string;
  hospitalAddress?: string;
  targetDepartment?: string;
  icd10Code?: string;
  icd10Description?: string;
  validUntil?: string;
  qrCodeUrl?: string;
  bpjsCovered?: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// PAYMENT & BPJS DTOs
// ============================================================================

export interface CreateBillingOrderDto {
  orderType: "INITIAL" | "EXTENSION";
  durationMinutes: number;
  payerType: "SELF_PAY" | "BPJS";
  practitionerType: PractitionerType;
  level: Record<string, unknown>;
  discountCode?: string;
  idempotencyKey: string;
}

export interface CreatePaymentDto {
  methodType: "E_WALLET" | "VIRTUAL_ACCOUNT" | "QRIS";
  channelCode: string;
  contextType: "BILLING_ORDER";
  contextId: string;
  metadata?: Record<string, unknown>;
}

/** Input accepted by the client wrapper; the request DTO is built server-side. */
export interface CreatePaymentInput {
  methodType: CreatePaymentDto["methodType"];
  channelCode: string;
  context: ServerPaymentContext;
  metadata?: Record<string, unknown>;
}

/**
 * Internal handoff for a future server-issued payment context. It is never
 * reconstructed from route parameters or client pricing data.
 */
export interface ServerPaymentContext {
  consultationId: string;
  billingOrderId: string;
}

export interface BpjsEligibilityInput {
  context: ServerPaymentContext;
  memberNumber: string;
}

export type PaymentStatus =
  "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | "EXPIRED" | "CANCELLED";

export type PaymentTransactionStatus =
  "PENDING" | "SETTLEMENT" | "EXPIRE" | "CANCEL" | "FAILED" | "REFUNDED";

export interface PaymentResponseDto {
  id: string;
  status: PaymentStatus;
  billingOrderId: string;
  transactionStatus: PaymentTransactionStatus;
  paymentType?: string;
  grossAmount: number;
  qrCodeUrl?: string;
  paymentUrl?: string;
  expiryTime?: string;
  createdAt?: string;
}

export interface BpjsEligibilityDto {
  accepted: true;
  eligibility: "UNKNOWN";
}

// ============================================================================
// PRACTITIONER DTOs
// ============================================================================

export interface CreatePractitionerDto {
  fullName: string;
  title: string;
  strNumber: string;
  sippNumber: string;
  specialization: string;
  type: PractitionerType;
  nik?: string;
  phone?: string;
  almamater?: string;
  consultationFee?: number;
}

export interface PractitionerEducationDto {
  id: string;
  institution: string;
  degree: string;
  major: string;
  graduationYear: number;
}

export interface PractitionerExperienceDto {
  id: string;
  facilityName: string;
  position: string;
  startDate: string;
  endDate?: string;
}

export interface PractitionerResponseDto {
  id: string;
  userId: string;
  fullName?: string;
  title?: string;
  strNumber?: string;
  sippNumber: string;
  specialization?: string;
  type: PractitionerType;
  availabilityStatus: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  rating?: number;
  totalSessions?: number;
  experienceYears?: number;
  consultationFee?: number;
  avatar?: string;
  supportsBpjs?: boolean;
  createdAt?: string;
  educations?: PractitionerEducationDto[];
  experiences?: PractitionerExperienceDto[];
}

export interface UpdateAvailabilityDto {
  status: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
}

export interface RejectPractitionerDto {
  reason: string;
}

// ============================================================================
// FEEDBACK DTOs
// ============================================================================

/** Request body for consultation feedback; consultationId is a URL path parameter. */
export interface ConsultationFeedbackDto {
  star: number;
  comment: string;
}

export interface ConsultationFeedbackResponseDto {
  id: string;
  consultationId: string;
  patientId: string;
  star: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

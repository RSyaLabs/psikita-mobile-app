import { ApiError } from "../api/response";

export type CapabilityState = "live" | "unavailable";

export type CapabilityKey =
  | "patientProfile"
  | "triage"
  | "matching"
  | "payment"
  | "bpjsEligibility"
  | "chatWrite"
  | "prescriptions"
  | "crisisEscalation";

const CAPABILITY_MAP: Record<CapabilityKey, CapabilityState> = {
  patientProfile: "live",
  triage: "live",
  matching: "live",
  payment: "live",
  bpjsEligibility: "live",
  chatWrite: "unavailable",
  prescriptions: "live",
  crisisEscalation: "unavailable",
};

export function getCapability(key: CapabilityKey): CapabilityState {
  return CAPABILITY_MAP[key] ?? "unavailable";
}

/**
 * Canonical per-capability failure copy.
 */
const CAPABILITY_FAILURE: Record<CapabilityKey, { message: string; code: string }> = {
  patientProfile: {
    message: "Profil pasien belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
  triage: { message: "Triase belum tersedia", code: "CAPABILITY_UNAVAILABLE" },
  matching: { message: "Pencocokan belum tersedia", code: "CAPABILITY_UNAVAILABLE" },
  payment: {
    message: "Pembayaran belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
  bpjsEligibility: {
    message: "Kelayakan BPJS belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
  chatWrite: {
    message: "Pengiriman pesan belum tersedia",
    code: "CHAT_WRITE_UNAVAILABLE",
  },
  prescriptions: {
    message: "Resep belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
  crisisEscalation: {
    message: "Eskalasi krisis belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
};

/**
 * The single gate every write path must go through.
 */
export function assertCapabilityLive(key: CapabilityKey): void {
  if (getCapability(key) === "live") {
    return;
  }

  const failure = CAPABILITY_FAILURE[key];
  throw new ApiError(failure.message, 501, failure.code);
}

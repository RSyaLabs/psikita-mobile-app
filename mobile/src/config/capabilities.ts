import { isDemoMode } from "./demoMode";
import { ApiError } from "../api/response";

export type CapabilityState = "live" | "demo" | "unavailable";

export type CapabilityKey =
  | "patientProfile"
  | "triage"
  | "matching"
  | "payment"
  | "bpjsEligibility"
  | "articles"
  | "notifications"
  | "chatWrite"
  | "withdrawal"
  | "prescriptions"
  | "crisisEscalation";

const CAPABILITY_MAP: Record<CapabilityKey, CapabilityState> = {
  patientProfile: "live",
  triage: "live",
  matching: "live",
  // GET /payments answers 200 against staging, so the endpoint is live. The
  // feature was still marked unavailable, which left a working backend path
  // switched off in the client. The payment context stays WeakSet-branded in
  // payment.service.ts, so a screen still cannot invent an amount or an order
  // id; the server has to issue one.
  payment: "live",
  bpjsEligibility: "live",
  articles: "demo",
  notifications: "demo",
  chatWrite: "unavailable",
  withdrawal: "unavailable",
  prescriptions: "live",
  crisisEscalation: "unavailable",
};

export function getCapability(
  key: CapabilityKey,
  // Overridable so a test can decide the demo half without touching env. The
  // default is the single gate, so production and local runs cannot drift.
  demoMode = isDemoMode(),
): CapabilityState {
  const auditedState = CAPABILITY_MAP[key];

  if (auditedState === "live") {
    return "live";
  }

  return auditedState === "demo" && demoMode ? "demo" : "unavailable";
}

/**
 * Canonical per-capability failure copy. Keeping the message and the error code
 * in one table is what stops the same guard from surfacing two different errors
 * depending on which hook rejected first.
 *
 * `chatWrite` keeps CHAT_WRITE_UNAVAILABLE because consultation.service.ts and
 * two test suites already treat that as its contract. Every other capability
 * uses CAPABILITY_UNAVAILABLE.
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
  articles: { message: "Artikel belum tersedia", code: "CAPABILITY_UNAVAILABLE" },
  notifications: {
    message: "Notifikasi belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
  },
  chatWrite: {
    message: "Pengiriman pesan belum tersedia",
    code: "CHAT_WRITE_UNAVAILABLE",
  },
  withdrawal: {
    message: "Penarikan belum tersedia",
    code: "CAPABILITY_UNAVAILABLE",
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
 *
 * It refuses when the capability is not live AND when demo mode is on. Both
 * halves are mandatory: dropping the demo half previously let a guarded write
 * through in demo mode while the sibling hook for the same capability blocked
 * it, so the same user action behaved differently depending on which layer
 * rejected first.
 */
export function assertCapabilityLive(key: CapabilityKey): void {
  if (getCapability(key) === "live" && !isDemoMode()) {
    return;
  }

  const failure = CAPABILITY_FAILURE[key];
  throw new ApiError(failure.message, 501, failure.code);
}

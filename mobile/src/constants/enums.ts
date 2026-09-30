/**
 * The server enums that were written out by hand in a dozen places each.
 *
 * Adding a practitioner type or a role used to mean editing twelve
 * declarations, and nothing stopped the copies from drifting apart. The
 * contract of record is `staging-openapi.json`, which matches the live staging
 * API exactly:
 *
 *   CreatePractitionerDto.practitionerType -> ["PSYCHOLOGIST","PSYCHIATRIST"]
 *   CreateRateDto.practitionerType          -> ["PSYCHOLOGIST","PSYCHIATRIST"]
 *   CreateBillingOrderDto.practitionerType -> ["PSYCHOLOGIST","PSYCHIATRIST"]
 *   role query parameter                   -> ["ADMIN","USER","PSYCHIATRIST","PSYCHOLOGIST"]
 *   ConsultationResponseDto.status         -> ["WAITING","ACTIVE","FINISHED","CANCELLED"]
 *
 * The TypeScript types, the zod schemas, and every runtime check derive from the
 * arrays below, so a new value is one edit here rather than twelve.
 *
 * This module deliberately imports nothing. `api/consultation.service.ts`
 * already imports `clinical/activeConsultation.ts`, and that module imports
 * `api/matching.service.ts`, so a shared constant living in either of them
 * would close a cycle. A leaf module can be depended on by all of them.
 */

export const PRACTITIONER_TYPES = ["PSYCHOLOGIST", "PSYCHIATRIST"] as const;

export type PractitionerType = (typeof PRACTITIONER_TYPES)[number];

/**
 * The role carried in the access token. This is the server's vocabulary, not a
 * client-side permission model: the server is what actually authorizes, and a
 * role value read from a token says nothing on its own about what the user may
 * do.
 */
export const SERVER_ROLES = [
  "ADMIN",
  "USER",
  "PSYCHIATRIST",
  "PSYCHOLOGIST",
] as const;

export type ServerRole = (typeof SERVER_ROLES)[number];

export const CONSULTATION_STATUSES = [
  "WAITING",
  "ACTIVE",
  "FINISHED",
  "CANCELLED",
] as const;

export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

/** True when the value is one the server can actually send. */
export function isServerRole(value: unknown): value is ServerRole {
  return (
    typeof value === "string" &&
    (SERVER_ROLES as readonly string[]).includes(value)
  );
}

/** True when the value is one the server can actually send. */
export function isPractitionerType(value: unknown): value is PractitionerType {
  return (
    typeof value === "string" &&
    (PRACTITIONER_TYPES as readonly string[]).includes(value)
  );
}

/** True when the value is one ConsultationResponseDto.status can be. */
export function isConsultationStatus(
  value: unknown,
): value is ConsultationStatus {
  return (
    typeof value === "string" &&
    (CONSULTATION_STATUSES as readonly string[]).includes(value)
  );
}

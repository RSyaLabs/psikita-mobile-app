import { z } from "zod";
import { apiRequest, ApiError } from "./client";
import { zodAdapter } from "./response";

export const identityVerificationSessionSchema = z.object({
  sessionId: z.string().min(1),
  sessionToken: z.string().optional().default(""),
  url: z.string().min(1),
  status: z.string(),
});

export type IdentityVerificationSessionDto = z.infer<
  typeof identityVerificationSessionSchema
>;

export const identityVerificationStatusSchema = z.object({
  status: z.string().optional().default("NOT_STARTED"),
  verifiedAt: z.string().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  vendor: z.string().optional(),
}).passthrough();

export type IdentityVerificationStatusDto = z.infer<
  typeof identityVerificationStatusSchema
>;

const sessionAdapter = zodAdapter(identityVerificationSessionSchema);
const statusAdapter = (val: unknown): IdentityVerificationStatusDto => {
  if (typeof val === "object" && val !== null) {
    return val as IdentityVerificationStatusDto;
  }
  return { status: "NOT_STARTED" };
};

export const identityVerificationService = {
  /**
   * Start Didit KYC verification for the signed-in account (Patient / User)
   * POST /identity/verification/didit/session
   */
  startAccountVerification: async (
    signal?: AbortSignal,
  ): Promise<IdentityVerificationSessionDto> => {
    return apiRequest<IdentityVerificationSessionDto>(
      "/identity/verification/didit/session",
      {
        method: "POST",
        signal,
        adapter: sessionAdapter,
      },
    );
  },

  /**
   * Get the signed-in account identity verification status
   * GET /identity/verification/me
   */
  getMyVerificationStatus: async (
    signal?: AbortSignal,
  ): Promise<IdentityVerificationStatusDto> => {
    try {
      return await apiRequest<IdentityVerificationStatusDto>(
        "/identity/verification/me",
        {
          signal,
          adapter: statusAdapter,
        },
      );
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return { status: "NOT_STARTED" };
      }
      throw err;
    }
  },

  /**
   * Start an asynchronous Didit KYC identity verification session for practitioner
   * POST /practitioner/{practitionerId}/verify-identity
   */
  startPractitionerVerification: async (
    practitionerId: string,
    signal?: AbortSignal,
  ): Promise<IdentityVerificationSessionDto> => {
    return apiRequest<IdentityVerificationSessionDto>(
      `/practitioner/${encodeURIComponent(practitionerId)}/verify-identity`,
      {
        method: "POST",
        signal,
        adapter: sessionAdapter,
      },
    );
  },
};

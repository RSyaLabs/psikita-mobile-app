import { decodeBase64Url } from "@/utils/base64";
import { z } from "zod";
import { SERVER_ROLES } from "@/constants/enums";

/**
 * The login response carries no user object. It does not need to: the access
 * token is a JWT, and its payload already contains the subject, email, role,
 * activity flag and expiry. Captured from staging:
 *
 *   { sub, sid, email, role, isActive, iat, exp }
 *
 * so the role was never missing from the system. The client simply was not
 * reading it, then concluded the server had no role to give.
 *
 * This decodes the payload. It does NOT verify the signature. That is
 * deliberate and is not a security boundary: a tampered token would still be
 * accepted here. Authorization is enforced per request by the server, which is
 * the only place it can be enforced anyway.
 */

const claimsSchema = z.object({
  sub: z.string().trim().min(1),
  email: z.string().trim().min(1),
  role: z.enum(SERVER_ROLES),
  isActive: z.boolean().optional(),
  exp: z.number().optional(),
});

export type AccessTokenClaims = z.infer<typeof claimsSchema>;

export function decodeAccessToken(token: string): AccessTokenClaims | null {
  if (typeof token !== "string") return null;

  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    const json = decodeBase64Url(segments[1] ?? "");
    if (json === null) return null;
    const parsed = claimsSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(
  claims: AccessTokenClaims | null,
  skewSeconds = 30,
): boolean {
  if (!claims || typeof claims.exp !== "number") return false;
  return claims.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
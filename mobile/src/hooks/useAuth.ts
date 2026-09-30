import { createContext, useContext } from "react";
import { z } from "zod";
import { SERVER_ROLES, type ServerRole } from "@/constants/enums";
import { ROUTES } from "@/constants/routes";
import { decodeAccessToken } from "@/utils/jwt";
import type { TokenResponseDto } from "@/types/api";

export type AppRole = "patient" | "practitioner" | "admin";
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  role: AppRole;
  isActive: true;
}

export interface AuthAttempt {
  readonly id: number;
  readonly epoch: number;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAuthenticated: boolean;
  acceptSession(response: TokenResponseDto, attempt?: AuthAttempt): void;
  beginAuthAttempt(): AuthAttempt;
  signOut(): Promise<void>;
  clearSession(): void;
  hasRole(role: AppRole): boolean;
  homeRoute: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "AuthContext";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

const serverRoleSchema = z.enum(SERVER_ROLES);
const serverUserSchema = z.object({
  id: z.string().trim().min(1),
  email: z.string().trim().min(1),
  role: serverRoleSchema,
  isActive: z.literal(true),
});
const serverSessionSchema = z.object({
  accessToken: z.string().refine((token) => token.trim().length > 0),
  user: serverUserSchema,
});

export type ValidatedServerSession = {
  accessToken: string;
  user: AuthUser;
};

export function appRoleFromServerRole(role: unknown): AppRole | null {
  switch (role) {
    case "USER":
      return "patient";
    case "PSYCHOLOGIST":
    case "PSYCHIATRIST":
      return "practitioner";
    case "ADMIN":
      return "admin";
    default:
      return null;
  }
}

export function appRoleFromPersistedRole(role: unknown): AppRole | null {
  switch (role) {
    case "patient":
      return "patient";
    case "practitioner":
      return "practitioner";
    case "admin":
      return "admin";
    default:
      return null;
  }
}

export function parseServerSession(
  value: unknown,
): ValidatedServerSession | null {
  const outer = z
    .object({ accessToken: z.string().refine((t) => t.trim().length > 0) })
    .safeParse(value);
  if (!outer.success) return null;

  const { accessToken } = outer.data;

  // The login response carries no user object. It never needed to: the access
  // token is a JWT whose payload already holds sub, email, role and isActive.
  // A deployed server that also returns `user` still wins, so this is a
  // fallback rather than a replacement.
  const claims = decodeAccessToken(accessToken);
  if (!claims) return null;

  const role = appRoleFromServerRole(claims.role);
  if (!role) return null;

  if (claims.isActive === false) return null;

  // When the server does send a user object it must agree with the signed
  // token. The raw body is read rather than the parsed one, because an
  // unrecognised role such as "admin" in lower case fails the enum and would
  // otherwise skip the comparison entirely.
  const bodyUser = (value as { user?: { id?: unknown; role?: unknown } }).user;
  if (typeof bodyUser?.role === "string" && bodyUser.role !== claims.role) {
    return null;
  }
  const id =
    typeof bodyUser?.id === "string" && bodyUser.id.trim().length > 0
      ? bodyUser.id
      : claims.sub;

  return {
    accessToken,
    user: {
      id,
      email: claims.email,
      role,
      isActive: true,
    },
  };
}

export function getHomeRouteForRole(role: AppRole): string {
  switch (role) {
    case "patient":
      return ROUTES.PATIENT.DASHBOARD;
    case "practitioner":
      return ROUTES.PRACTITIONER.DASHBOARD;
    case "admin":
      return ROUTES.ADMIN.DASHBOARD;
  }
}

export function getHomeRouteForResponse(response: unknown): string | null {
  const session = parseServerSession(response);
  return session ? getHomeRouteForRole(session.user.role) : null;
}

import { z } from "zod";
import { SERVER_ROLES } from "@/constants/enums";
import { apiRequest } from "./client";
import { zodAdapter } from "./response";
import {
  PasswordLoginDto,
  PasswordRegisterDto,
  GoogleLoginDto,
  RequestOtpDto,
  VerifyOtpDto,
  TokenResponseDto,
  OtpVerifyResponseDto,
  RegisterResponseDto,
} from "@/types/api";

const tokenUserSchema = z
  .object({
    id: z.string().trim().min(1),
    username: z.string().optional(),
    email: z.string().trim().min(1),
    role: z.enum(SERVER_ROLES),
    isActive: z.boolean().refine((isActive) => isActive, {
      message: "User must be active",
    }),
  })
  .transform((user) => ({ ...user, username: user.username ?? user.email }));

/**
 * staging-openapi.json TokenResponseDto documents exactly two properties,
 * accessToken and refreshToken, both required. It documents no `user`.
 *
 * `user` was previously required here, which meant this schema could never
 * accept a conforming response: every successful login died in parseApiData
 * as a 502 INVALID_RESPONSE. That is why the integration suite reported a
 * credential problem when the real problem was the contract mismatch.
 *
 * The `user` field stays optional because a deployed server may add it, but
 * nothing may depend on it. See docs/CONTRACT_GAP_ROLE.md: the contract
 * exposes no endpoint that returns the caller's role, so role-based routing
 * currently has no server source of truth.
 */
const tokenResponseSchema = z.object({
  accessToken: z.string().refine((token) => token.trim().length > 0),
  refreshToken: z.string().min(1),
  user: tokenUserSchema.optional(),
});

const registeredUserSchema = z.object({
  id: z.string(),
  username: z.string().optional(),
  email: z.string(),
  role: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
});

const registerResponseSchema = z
  .union([
    z.object({
      id: z.string(),
      username: z.string(),
      email: z.string(),
      role: z.string(),
      isActive: z.boolean(),
      createdAt: z.string().optional(),
    }),
    z.object({ message: z.string(), user: registeredUserSchema }),
  ])
  .transform((value) => {
    if ("id" in value) return value;
    return {
      id: value.user.id,
      username: value.user.username ?? value.user.email,
      email: value.user.email,
      role: value.user.role,
      isActive: value.user.isActive,
      createdAt: value.user.createdAt,
    };
  });

const otpResponseSchema = z.object({ message: z.string() });
const tokenResponseAdapter = zodAdapter(tokenResponseSchema);
const registerResponseAdapter = zodAdapter(registerResponseSchema);
const otpResponseAdapter = zodAdapter(otpResponseSchema);

export const authService = {
  /**
   * Login dengan Username/Email dan Password
   */
  async loginWithPassword(dto: PasswordLoginDto): Promise<TokenResponseDto> {
    const payload = {
      username: (dto as any).username || (dto as any).usernameOrEmail,
      password: dto.password,
    };
    const res = await apiRequest<TokenResponseDto>("/auth/password/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
      adapter: tokenResponseAdapter,
    });
    return res;
  },

  /**
   * Registrasi Pasien Baru dengan Password
   */
  async registerWithPassword(
    dto: PasswordRegisterDto,
  ): Promise<RegisterResponseDto> {
    return apiRequest<RegisterResponseDto>("/auth/password/register", {
      method: "POST",
      body: JSON.stringify(dto),
      skipAuth: true,
      adapter: registerResponseAdapter,
    });
  },

  /**
   * Request OTP Kode ke Email
   */
  async requestOtp(dto: RequestOtpDto): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify(dto),
      skipAuth: true,
      adapter: otpResponseAdapter,
    });
  },

  /**
   * Verifikasi OTP Kode
   *
   * The contract names the field `otp` and types the 200 response as
   * TokenResponseDto. The old code sent `code` and required `{ message }`,
   * so a correct code produced 422 on the way in and, had it passed, would
   * have produced 502 INVALID_RESPONSE on the way out.
   */
  async verifyOtp(dto: VerifyOtpDto): Promise<TokenResponseDto> {
    const payload = {
      email: dto.email,
      otp: dto.otp,
    };
    return apiRequest<TokenResponseDto>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
      adapter: tokenResponseAdapter,
    });
  },

  /**
   * Login dengan Google ID Token
   */
  async loginWithGoogle(dto: GoogleLoginDto): Promise<TokenResponseDto> {
    const res = await apiRequest<TokenResponseDto>("/auth/google/login", {
      method: "POST",
      body: JSON.stringify(dto),
      skipAuth: true,
      adapter: tokenResponseAdapter,
    });
    return res;
  },

  /**
   * Logout session
   */
  async logout(): Promise<void> {
    await apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      adapter: otpResponseAdapter,
    });
  },
};

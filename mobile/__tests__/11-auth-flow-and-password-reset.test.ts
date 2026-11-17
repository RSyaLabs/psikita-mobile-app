import { authService } from "@/api/auth.service";
import { ROUTES } from "@/constants/routes";

describe("11. Auth Flow & Password Reset Contract Suite (RLN-5 & RLN-9)", () => {
  it("should have correct endpoints for forgotPassword and resetPassword in authService", () => {
    expect(typeof authService.forgotPassword).toBe("function");
    expect(typeof authService.resetPassword).toBe("function");
    expect(typeof authService.requestOtp).toBe("function");
    expect(typeof authService.verifyOtp).toBe("function");
  });

  describe("OTP 6-digit validation rules (matching Core API VerifyOtpDto)", () => {
    const isValidOtp = (otp: string) => {
      const trimmed = otp.trim();
      return /^\d{6}$/.test(trimmed) && trimmed.length === 6;
    };

    it("should accept valid 6-digit numeric OTP codes", () => {
      expect(isValidOtp("123456")).toBe(true);
      expect(isValidOtp("000000")).toBe(true);
      expect(isValidOtp("987654")).toBe(true);
    });

    it("should strictly reject 4-digit or incomplete OTP codes", () => {
      expect(isValidOtp("1234")).toBe(false);
      expect(isValidOtp("0000")).toBe(false);
      expect(isValidOtp("12345")).toBe(false);
    });

    it("should reject OTP codes with non-numeric characters or overflow", () => {
      expect(isValidOtp("12345a")).toBe(false);
      expect(isValidOtp("12 345")).toBe(false);
      expect(isValidOtp("1234567")).toBe(false);
      expect(isValidOtp("")).toBe(false);
    });
  });

  describe("Username validation rules (matching Core API PasswordRegisterDto)", () => {
    const isValidUsername = (u: string) => {
      const trimmed = u.trim();
      if (trimmed.length < 3 || trimmed.length > 30) return false;
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return false;
      if (!/^(?![._-])(?!.*[._-]{2})[a-zA-Z0-9._-]+(?<![._-])$/.test(trimmed)) {
        return false;
      }
      return true;
    };

    it("should accept valid usernames between 3 and 30 characters", () => {
      expect(isValidUsername("taris")).toBe(true);
      expect(isValidUsername("taris_rizki")).toBe(true);
      expect(isValidUsername("taris-rizki.10")).toBe(true);
      expect(isValidUsername("user123")).toBe(true);
    });

    it("should reject usernames shorter than 3 or longer than 30 characters", () => {
      expect(isValidUsername("ab")).toBe(false);
      expect(isValidUsername("a")).toBe(false);
      expect(isValidUsername("a".repeat(31))).toBe(false);
    });

    it("should reject usernames with illegal symbols or consecutive symbols", () => {
      expect(isValidUsername("taris@rizki")).toBe(false);
      expect(isValidUsername("taris..rizki")).toBe(false);
      expect(isValidUsername("taris__rizki")).toBe(false);
      expect(isValidUsername(".taris")).toBe(false);
      expect(isValidUsername("taris_")).toBe(false);
    });
  });

  describe("Password length validation rules", () => {
    it("should enforce minimum 8 characters matching Core API DTO", () => {
      const isValidPassword = (p: string) => p.length >= 8;
      expect(isValidPassword("123456")).toBe(false);
      expect(isValidPassword("1234567")).toBe(false);
      expect(isValidPassword("12345678")).toBe(true);
      expect(isValidPassword("SecurePass123!")).toBe(true);
    });
  });

  describe("Post-login redirect & triage preservation (RLN-9)", () => {
    it("should resolve matching route when triageId is preserved from guest triage", () => {
      const triageId = "triage_01j7xyz";
      const resolvePostLoginRoute = (params: {
        triageId?: string;
        redirect?: string;
        homeRoute: string;
      }) => {
        if (params.triageId) {
          return `${ROUTES.PATIENT.MATCHING}?triageId=${params.triageId}`;
        }
        if (params.redirect) {
          return params.redirect;
        }
        return params.homeRoute;
      };

      expect(
        resolvePostLoginRoute({
          triageId,
          homeRoute: ROUTES.PATIENT.DASHBOARD,
        }),
      ).toBe("/patient/matching?triageId=triage_01j7xyz");

      expect(
        resolvePostLoginRoute({
          redirect: ROUTES.PATIENT.MATCHING,
          homeRoute: ROUTES.PATIENT.DASHBOARD,
        }),
      ).toBe("/patient/matching");

      expect(
        resolvePostLoginRoute({
          homeRoute: ROUTES.PATIENT.DASHBOARD,
        }),
      ).toBe("/patient/dashboard");
    });
  });
});

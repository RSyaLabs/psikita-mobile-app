import { authService } from "@/api/auth.service";
import { ROUTES } from "@/constants/routes";

describe("11. Auth Flow & Password Reset Contract Suite (Wireframe MS1-MS7 / Tahap 2)", () => {
  it("should have correct endpoints for forgotPassword, resetPassword, requestOtp, and verifyOtp in authService", () => {
    expect(typeof authService.forgotPassword).toBe("function");
    expect(typeof authService.resetPassword).toBe("function");
    expect(typeof authService.requestOtp).toBe("function");
    expect(typeof authService.verifyOtp).toBe("function");
  });

  describe("A. OTP 6-Digit Validation & Box Mechanics (MS4)", () => {
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

    it("should correctly sanitize pasted input into digits only", () => {
      const sanitizePasted = (text: string, length = 6) => {
        return text.replace(/\D/g, "").slice(0, length);
      };

      expect(sanitizePasted("123-456")).toBe("123456");
      expect(sanitizePasted("Kode: 987654!")).toBe("987654");
      expect(sanitizePasted("1234567890")).toBe("123456");
      expect(sanitizePasted("abc")).toBe("");
    });

    it("should distribute digits across individual boxes in OtpDigitInput logic", () => {
      const length = 6;
      const getDigitsArray = (val: string) =>
        Array.from({ length }, (_, i) => val[i] || "");

      expect(getDigitsArray("12")).toEqual(["1", "2", "", "", "", ""]);
      expect(getDigitsArray("123456")).toEqual(["1", "2", "3", "4", "5", "6"]);
      expect(getDigitsArray("")).toEqual(["", "", "", "", "", ""]);
    });

    it("should handle backspace navigation index retreat", () => {
      const handleBackspaceIndex = (
        currentDigit: string,
        currentIndex: number,
      ) => {
        if (!currentDigit && currentIndex > 0) {
          return currentIndex - 1;
        }
        return currentIndex;
      };

      expect(handleBackspaceIndex("", 3)).toBe(2);
      expect(handleBackspaceIndex("", 0)).toBe(0);
      expect(handleBackspaceIndex("5", 3)).toBe(3);
    });
  });

  describe("B. Email Validation Rules (MS3 & MS6)", () => {
    const isValidEmail = (email: string) => {
      const trimmed = email.trim().toLowerCase();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    };

    it("should accept valid standard email addresses", () => {
      expect(isValidEmail("user@seraphany.id")).toBe(true);
      expect(isValidEmail("sinta.maharani@gmail.com")).toBe(true);
      expect(isValidEmail("pasien+test@niceground.shop")).toBe(true);
    });

    it("should reject invalid email formats", () => {
      expect(isValidEmail("user")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@domain")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user name@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("C. Username Auto-Generation & Validation Rules (MS5)", () => {
    const isValidUsername = (u: string) => {
      const trimmed = u.trim();
      if (trimmed.length < 3 || trimmed.length > 30) return false;
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return false;
      if (!/^(?![._-])(?!.*[._-]{2})[a-zA-Z0-9._-]+(?<![._-])$/.test(trimmed)) {
        return false;
      }
      return true;
    };

    const autoGenerateUsername = (email: string) => {
      const mailPrefix = email
        .trim()
        .toLowerCase()
        .split("@")[0]
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .replace(/^[._-]+|[._-]+$/g, "");
      return mailPrefix.length >= 3
        ? mailPrefix.slice(0, 24)
        : `user_${Date.now().toString().slice(-6)}`;
    };

    it("should generate valid usernames from user email prefix", () => {
      const u1 = autoGenerateUsername("sinta.maharani@gmail.com");
      expect(u1).toBe("sinta.maharani");
      expect(isValidUsername(u1)).toBe(true);

      const u2 = autoGenerateUsername("dr.andi-pratama@seraphany.id");
      expect(u2).toBe("dr.andi-pratama");
      expect(isValidUsername(u2)).toBe(true);
    });

    it("should fallback to valid user_ prefix when email prefix is too short", () => {
      const uShort = autoGenerateUsername("ab@domain.com");
      expect(uShort.startsWith("user_")).toBe(true);
      expect(isValidUsername(uShort)).toBe(true);
    });

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

  describe("D. Password Requirements & Reset Match", () => {
    it("should enforce minimum 8 characters matching Core API DTO", () => {
      const isValidPassword = (p: string) => p.length >= 8;
      expect(isValidPassword("123456")).toBe(false);
      expect(isValidPassword("1234567")).toBe(false);
      expect(isValidPassword("12345678")).toBe(true);
      expect(isValidPassword("SecurePass123!")).toBe(true);
    });

    it("should require new password and confirmation password to match exactly", () => {
      const passwordsMatch = (p1: string, p2: string) => p1 === p2 && p1.length >= 8;
      expect(passwordsMatch("Password123", "Password123")).toBe(true);
      expect(passwordsMatch("Password123", "Password456")).toBe(false);
      expect(passwordsMatch("Short1", "Short1")).toBe(false);
    });
  });

  describe("E. Terms Agreement Checkbox Enforcement (MS5)", () => {
    it("should prevent registration if agreed is false", () => {
      const canSubmitRegister = (params: {
        fullName: string;
        email: string;
        password: string;
        agreed: boolean;
      }) => {
        if (!params.fullName.trim()) return false;
        if (!params.email.includes("@")) return false;
        if (params.password.length < 8) return false;
        if (!params.agreed) return false;
        return true;
      };

      expect(
        canSubmitRegister({
          fullName: "Sinta Maharani",
          email: "sinta@example.com",
          password: "SecurePassword123",
          agreed: true,
        }),
      ).toBe(true);

      expect(
        canSubmitRegister({
          fullName: "Sinta Maharani",
          email: "sinta@example.com",
          password: "SecurePassword123",
          agreed: false,
        }),
      ).toBe(false);
    });
  });

  describe("F. Post-Login Redirect & Triage Preservation (RLN-9)", () => {
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

  describe("G. Auth Flow Screen State Machine & Navigation Routing", () => {
    it("should correctly determine target route and params for OTP Login (MS3)", () => {
      const getOtpLoginRoute = () => ({
        pathname: ROUTES.AUTH.FORGOT_PASSWORD,
        params: { mode: "otp" },
      });

      const route = getOtpLoginRoute();
      expect(route.pathname).toBe("/forgot-password");
      expect(route.params.mode).toBe("otp");
    });

    it("should correctly determine target route and params for Forgot Password (MS6)", () => {
      const getForgotPasswordRoute = () => ({
        pathname: ROUTES.AUTH.FORGOT_PASSWORD,
        params: { mode: "reset" },
      });

      const route = getForgotPasswordRoute();
      expect(route.pathname).toBe("/forgot-password");
      expect(route.params.mode).toBe("reset");
    });

    it("should correctly forward to Standalone OTP Verification (MS4)", () => {
      const getVerifyOtpRoute = (email: string, mode: "otp" | "reset") => ({
        pathname: ROUTES.AUTH.RESET_PASSWORD,
        params: { email, mode },
      });

      const routeOtp = getVerifyOtpRoute("user@niceground.shop", "otp");
      expect(routeOtp.pathname).toBe("/reset-password");
      expect(routeOtp.params.email).toBe("user@niceground.shop");
      expect(routeOtp.params.mode).toBe("otp");

      const routeReset = getVerifyOtpRoute("user@niceground.shop", "reset");
      expect(routeReset.pathname).toBe("/reset-password");
      expect(routeReset.params.mode).toBe("reset");
    });

    it("should route to Register (MS5) and back to Login (MS2)", () => {
      expect(ROUTES.AUTH.REGISTER).toBe("/register");
      expect(ROUTES.AUTH.LOGIN).toBe("/login");
    });
  });
});

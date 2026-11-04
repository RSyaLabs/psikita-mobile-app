import {
  formatRupiah,
  formatCompactCurrency,
  getInitials,
  formatMessageTime,
} from "@/utils/format";
import { parseRupiahInput, isAmountWithinBounds } from "@/utils/money-input";
import { decodeBase64Url } from "@/utils/base64";
import { decodeAccessToken, isTokenExpired } from "@/utils/jwt";

describe("06. SeraPhany Core Utilities & Formatting Engine Suite", () => {
  describe("Currency & Financial Formatting (format.ts)", () => {
    it("should format numbers into Indonesian Rupiah format", () => {
      const formatted = formatRupiah(150000);
      expect(formatted).toMatch(/^Rp\s*150[.,]000/);
    });

    it("should preserve negative amounts for ledger balances", () => {
      const negative = formatRupiah(-50000);
      expect(negative).toMatch(/^-Rp\s*50[.,]000|^Rp\s*-50[.,]000/);
    });

    it("should format string numbers safely", () => {
      const formatted = formatRupiah("250000");
      expect(formatted).toMatch(/^Rp\s*250[.,]000/);
    });

    it("should format compact currency for millions and billions", () => {
      expect(formatCompactCurrency(1500000)).toBe("Rp 1,5Jt");
      expect(formatCompactCurrency(2500000000)).toBe("Rp 2,5M");
      expect(formatCompactCurrency(50000)).toMatch(/^Rp\s*50[.,]000/);
    });
  });

  describe("Name Cleaning & Initials Extraction (getInitials)", () => {
    it("should strip doctor and academic titles", () => {
      expect(getInitials("dr. Andi Pratama, Sp.KJ")).toBe("AP");
      expect(getInitials("drg. Siti Rahma")).toBe("SR");
      expect(getInitials("prof. Budi Santoso")).toBe("BS");
      expect(getInitials("ns. Maria Ulfah")).toBe("MU");
    });

    it("should handle single names and short strings", () => {
      expect(getInitials("Ratna")).toBe("RA");
    });

    it("should return default fallback 'PK' when name is absent or undefined", () => {
      expect(getInitials(undefined)).toBe("PK");
      expect(getInitials("")).toBe("PK");
    });
  });

  describe("Timestamp & Message Time Formatting", () => {
    it("should format a valid ISO timestamp to time string", () => {
      const timeStr = formatMessageTime("2026-11-05T14:30:00.000Z");
      expect(timeStr).not.toBe("Waktu belum tersedia");
      expect(typeof timeStr).toBe("string");
    });

    it("should return fallback when timestamp is invalid", () => {
      expect(formatMessageTime("invalid-date-xyz")).toBe("Waktu belum tersedia");
    });
  });

  describe("Form Money Input Parsing (money-input.ts)", () => {
    it("should strip dots, commas, spaces and parse valid integer", () => {
      expect(parseRupiahInput("150.000")).toBe(150000);
      expect(parseRupiahInput(" 250,000 ")).toBe(250000);
      expect(parseRupiahInput("1 000 000")).toBe(1000000);
      expect(parseRupiahInput("50_000")).toBe(50000);
    });

    it("should reject non-numeric, zero or negative inputs", () => {
      expect(parseRupiahInput("abc")).toBeNull();
      expect(parseRupiahInput("0")).toBeNull();
      expect(parseRupiahInput("-50000")).toBeNull();
      expect(parseRupiahInput("")).toBeNull();
    });

    it("should validate amounts within boundary ranges", () => {
      expect(isAmountWithinBounds(50000, 10000, 100000)).toBe(true);
      expect(isAmountWithinBounds(5000, 10000, 100000)).toBe(false);
      expect(isAmountWithinBounds(150000, 10000, 100000)).toBe(false);
      expect(isAmountWithinBounds(null, 10000, 100000)).toBe(false);
    });
  });

  describe("Hermes/Web Compatible Base64URL Decoder (base64.ts)", () => {
    it("should decode ASCII and UTF-8 strings without Node Buffer", () => {
      // "Hello World" in base64url is "SGVsbG8gV29ybGQ"
      expect(decodeBase64Url("SGVsbG8gV29ybGQ")).toBe("Hello World");

      // JSON string `{"test":123}` in base64url: "eyJ0ZXN0IjoxMjN9"
      expect(decodeBase64Url("eyJ0ZXN0IjoxMjN9")).toBe('{"test":123}');
    });

    it("should return null on invalid base64url characters", () => {
      expect(decodeBase64Url("SGVsbG8!@#$%^")).toBeNull();
    });
  });

  describe("JWT Claims Decoder & Expiration Check (jwt.ts)", () => {
    // Construct a sample JWT payload
    const payload = {
      sub: "usr_core_001",
      email: "user@seraphany.id",
      role: "USER",
      isActive: true,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in future
    };

    // Helper to base64url encode JSON for test setup
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const validJwt = `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.signature`;

    it("should decode valid JWT claims from access token", () => {
      const claims = decodeAccessToken(validJwt);
      expect(claims).not.toBeNull();
      expect(claims?.sub).toBe("usr_core_001");
      expect(claims?.email).toBe("user@seraphany.id");
      expect(claims?.role).toBe("USER");
      expect(claims?.isActive).toBe(true);
    });

    it("should return null for malformed tokens", () => {
      expect(decodeAccessToken("not-a-jwt")).toBeNull();
      expect(decodeAccessToken("only.two")).toBeNull();
      expect(decodeAccessToken("")).toBeNull();
    });

    it("should correctly evaluate token expiration status", () => {
      const activeClaims = {
        sub: "usr_1",
        email: "a@b.com",
        role: "USER" as const,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1h in future
      };
      expect(isTokenExpired(activeClaims)).toBe(false);

      const expiredClaims = {
        sub: "usr_2",
        email: "c@d.com",
        role: "USER" as const,
        exp: Math.floor(Date.now() / 1000) - 60, // 1m in past
      };
      expect(isTokenExpired(expiredClaims)).toBe(true);

      expect(isTokenExpired(null)).toBe(false);
    });
  });
});

import {
  formatRupiah,
  formatCompactCurrency,
  getInitials,
  formatMessageTime,
} from "../src/utils/format";
import { decodeAccessToken, isTokenExpired } from "../src/utils/jwt";
import { parseRupiahInput, isAmountWithinBounds } from "../src/utils/money-input";
import { decodeBase64Url } from "../src/utils/base64";

describe("SeraPhany Core Utilities Suite", () => {
  describe("Currency & String Formatters", () => {
    it("should format numbers into Indonesian Rupiah format", () => {
      expect(formatRupiah(150000)).toMatch(/Rp\s*150\.000/);
      expect(formatRupiah("75000")).toMatch(/Rp\s*75\.000/);
      expect(formatRupiah(0)).toMatch(/Rp\s*0/);
    });

    it("should format compact currency values with appropriate suffixes", () => {
      expect(formatCompactCurrency(1500000)).toBe("Rp 1,5Jt");
      expect(formatCompactCurrency(2500000000)).toBe("Rp 2,5M");
      expect(formatCompactCurrency(25000)).toMatch(/Rp\s*25\.000/);
    });

    it("should strip medical/honorific titles and extract initials", () => {
      expect(getInitials("dr. Andi Pratama, Sp.KJ")).toBe("AP");
      expect(getInitials("dr. Siti Rahma")).toBe("SR");
      expect(getInitials("Prof. Budi")).toBe("BU");
      expect(getInitials(undefined)).toBe("PK");
      expect(getInitials("")).toBe("PK");
    });

    it("should format valid ISO timestamp into locale time string", () => {
      expect(formatMessageTime("2026-11-01T12:00:00Z")).not.toBe("Waktu belum tersedia");
      expect(formatMessageTime("invalid")).toBe("Waktu belum tersedia");
    });
  });

  describe("Base64Url & JWT Token Engine", () => {
    it("should decode base64url encoded strings safely", () => {
      expect(decodeBase64Url("U2VyYVBoYW55")).toBe("SeraPhany");
      expect(decodeBase64Url("")).toBeNull();
      expect(decodeBase64Url(undefined as any)).toBeNull();
    });

    it("should decode server JWT access tokens into structured claims", () => {
      const payload = {
        sub: "usr-01",
        email: "pasien@seraphany.id",
        role: "USER",
        isActive: true,
        exp: Math.floor(Date.now() / 1000) + 7200,
      };

      const headerB64 = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const sampleJwt = `${headerB64}.${payloadB64}.sample-sig`;

      const claims = decodeAccessToken(sampleJwt);
      expect(claims).not.toBeNull();
      expect(claims?.sub).toBe("usr-01");
      expect(claims?.email).toBe("pasien@seraphany.id");
      expect(claims?.role).toBe("USER");
      expect(claims?.isActive).toBe(true);
    });

    it("should return null for malformed tokens", () => {
      expect(decodeAccessToken("not-a-token")).toBeNull();
      expect(decodeAccessToken("part1.part2")).toBeNull();
      expect(decodeAccessToken(null as any)).toBeNull();
    });

    it("should correctly identify expired vs valid tokens", () => {
      const valid = {
        sub: "u1",
        email: "test@seraphany.id",
        role: "USER" as const,
        exp: Math.floor(Date.now() / 1000) + 600,
      };
      expect(isTokenExpired(valid)).toBe(false);

      const expired = {
        sub: "u1",
        email: "test@seraphany.id",
        role: "USER" as const,
        exp: Math.floor(Date.now() / 1000) - 60,
      };
      expect(isTokenExpired(expired)).toBe(true);
    });
  });

  describe("Money Input Validator", () => {
    it("should parse typed currency strings strictly", () => {
      expect(parseRupiahInput("150.000")).toBe(150000);
      expect(parseRupiahInput(" 500,000 ")).toBe(500000);
      expect(parseRupiahInput("abc")).toBeNull();
      expect(parseRupiahInput("-100")).toBeNull();
    });

    it("should check boundaries correctly", () => {
      expect(isAmountWithinBounds(100000, 10000, 500000)).toBe(true);
      expect(isAmountWithinBounds(5000, 10000, 500000)).toBe(false);
      expect(isAmountWithinBounds(600000, 10000, 500000)).toBe(false);
      expect(isAmountWithinBounds(null, 10000, 500000)).toBe(false);
    });
  });
});

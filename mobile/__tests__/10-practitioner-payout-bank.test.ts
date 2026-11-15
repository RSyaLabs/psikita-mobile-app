import fs from "fs";
import path from "path";
import {
  payoutService,
  maskAccountNumber,
  payoutBankAccountStatusSchema,
  savePayoutBankAccountSchema,
} from "../src/api/payout.service";
import { setAuthTokens, ApiError } from "../src/api/client";
import { secureStorage } from "../src/utils/storage";

describe("10. Practitioner Payout Bank Status & Zero Transfer Authority Suite (RLN-22)", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthTokens({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_access",
      refreshToken: "01J7XYZPRACTITIONERTOKEN01",
    });
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthTokens(null);
  });

  describe("Practitioner Self-Service Bank Status (GET /payout/bank-account/me)", () => {
    it("should fetch verified practitioner bank account status", async () => {
      const mockStatus = {
        status: "VERIFIED",
        bankCode: "BCA",
        accountNumber: "8274012345",
        accountName: "Dr. Sarah Sp.KJ",
        updatedAt: "2026-11-15T10:00:00Z",
      };

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockStatus),
        }),
      );

      const status = await payoutService.getMyBankAccountStatus();
      expect(status.status).toBe("VERIFIED");
      expect(status.bankCode).toBe("BCA");
      expect(status.accountName).toBe("Dr. Sarah Sp.KJ");
    });

    it("should parse NOT_CONFIGURED status for unconfigured practitioner", async () => {
      const mockStatus = {
        status: "NOT_CONFIGURED",
      };

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockStatus),
        }),
      );

      const status = await payoutService.getMyBankAccountStatus();
      expect(status.status).toBe("NOT_CONFIGURED");
      expect(status.bankCode).toBeUndefined();
    });

    it("should reject invalid status string in schema", () => {
      expect(() =>
        payoutBankAccountStatusSchema.parse({
          status: "INVALID_STATUS",
        }),
      ).toThrow();
    });
  });

  describe("Register / Update Bank Account (PUT /payout/bank-account/me)", () => {
    it("should submit valid bank account details with digit-only account number", async () => {
      let sentBody = "";
      global.fetch = jest.fn().mockImplementation((url, init) => {
        sentBody = String(init?.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              status: "PENDING",
              bankCode: "BCA",
              accountNumber: "8274012345",
              accountName: "Dr. Sarah Sp.KJ",
              updatedAt: "2026-11-15T12:00:00Z",
            }),
        });
      });

      const response = await payoutService.saveMyBankAccount({
        bankCode: "BCA",
        accountNumber: "8274012345",
        accountName: "Dr. Sarah Sp.KJ",
      });

      const parsed = JSON.parse(sentBody);
      expect(parsed.bankCode).toBe("BCA");
      expect(parsed.accountNumber).toBe("8274012345");
      expect(response.status).toBe("PENDING");
    });

    it("should strictly reject non-digit account number", () => {
      expect(() =>
        savePayoutBankAccountSchema.parse({
          bankCode: "BCA",
          accountNumber: "8274-ABC-45",
          accountName: "Dr. Sarah Sp.KJ",
        }),
      ).toThrow();
    });

    it("should reject account number shorter than 5 digits", () => {
      expect(() =>
        savePayoutBankAccountSchema.parse({
          bankCode: "BCA",
          accountNumber: "1234",
          accountName: "Dr. Sarah Sp.KJ",
        }),
      ).toThrow();
    });

    it("should reject empty bank code or account name", () => {
      expect(() =>
        savePayoutBankAccountSchema.parse({
          bankCode: "",
          accountNumber: "8274012345",
          accountName: "",
        }),
      ).toThrow();
    });
  });

  describe("Security Boundary: Zero Client-Side Transfer Authority", () => {
    it("should ensure no payout execution endpoints (/payout/runs) are referenced in client source", () => {
      const srcDir = path.resolve(__dirname, "../src");
      const appDir = path.resolve(__dirname, "../app");

      function scanDir(dir: string): string[] {
        const results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results.push(...scanDir(fullPath));
          } else if (
            entry.name.endsWith(".ts") ||
            entry.name.endsWith(".tsx")
          ) {
            const content = fs.readFileSync(fullPath, "utf-8");
            if (
              content.includes("/payout/runs") ||
              content.includes("executePayout") ||
              content.includes("approvePayout")
            ) {
              results.push(fullPath);
            }
          }
        }
        return results;
      }

      const violations = [...scanDir(srcDir), ...scanDir(appDir)];
      expect(violations).toHaveLength(0);
    });
  });

  describe("Account Number Masking Helper", () => {
    it("should mask account number preserving only last 4 digits", () => {
      expect(maskAccountNumber("8274012345")).toBe("••••••2345");
      expect(maskAccountNumber("12345")).toBe("••••••2345");
      expect(maskAccountNumber("1234")).toBe("1234");
      expect(maskAccountNumber("")).toBe("");
      expect(maskAccountNumber(undefined)).toBe("");
    });
  });
});

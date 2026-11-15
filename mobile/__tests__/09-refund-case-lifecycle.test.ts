import {
  refundService,
  maskBeneficiaryAccount,
  requestRefundCaseSchema,
  refundCaseViewSchema,
  refundCaseListSchema,
  refundDestinationsSchema,
} from "../src/api/refund.service";
import { setAuthTokens, ApiError } from "../src/api/client";
import { secureStorage } from "../src/utils/storage";

describe("09. Patient Refund Case Requests & Lifecycle Tracking Suite (RLN-21)", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthTokens({
      accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_access",
      refreshToken: "01J7XYZPATIENTREFRESHTOKEN01",
    });
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthTokens(null);
  });

  describe("Refund Destinations (GET /refunds/destinations)", () => {
    const mockDestinations = {
      schemaVersion: 1,
      items: [
        { type: "BANK", code: "BCA", name: "Bank Central Asia" },
        { type: "BANK", code: "MANDIRI", name: "Bank Mandiri" },
        { type: "BANK", code: "BNI", name: "Bank Negara Indonesia" },
        { type: "BANK", code: "BRI", name: "Bank Rakyat Indonesia" },
        { type: "E_WALLET", code: "GOPAY", name: "GoPay" },
        { type: "E_WALLET", code: "OVO", name: "OVO" },
      ],
    };

    it("should fetch supported bank and e-wallet refund destinations", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockDestinations),
        }),
      );

      const result = await refundService.getDestinations();
      expect(result.schemaVersion).toBe(1);
      expect(result.items).toHaveLength(6);
      expect(result.items[0]).toEqual({
        type: "BANK",
        code: "BCA",
        name: "Bank Central Asia",
      });
    });

    it("should validate destinations schema correctly", () => {
      expect(() => refundDestinationsSchema.parse(mockDestinations)).not.toThrow();
      expect(() =>
        refundDestinationsSchema.parse({
          schemaVersion: 2,
          items: [],
        }),
      ).toThrow();
    });
  });

  describe("Request Refund Case Intake (POST /refunds)", () => {
    const validUlidPaymentId = "01J7XYZPAYMENT000000000001"; // exactly 26 chars
    const mockRefundCase = {
      schemaVersion: 1,
      id: "01J7XYZREFUND00000000000001",
      paymentId: validUlidPaymentId,
      status: "REQUESTED",
      beneficiaryVerified: false,
      earningHold: true,
      transferAvailable: false,
      disabledReason: null,
      quote: {
        amount: 150000,
        currency: "IDR",
        netRefund: 150000,
      },
      createdAt: "2026-11-15T12:00:00Z",
      updatedAt: "2026-11-15T12:00:00Z",
    };

    it("should submit refund request with valid ULID and idempotency key", async () => {
      let sentBody = "";
      global.fetch = jest.fn().mockImplementation((url, init) => {
        sentBody = String(init?.body);
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockRefundCase),
        });
      });

      const result = await refundService.requestRefund({
        paymentId: validUlidPaymentId,
        idempotencyKey: "refund:01J7XYZPAYMENT000000000001:1731672000000",
      });

      const parsed = JSON.parse(sentBody);
      expect(parsed.paymentId).toBe(validUlidPaymentId);
      expect(parsed.idempotencyKey).toBe(
        "refund:01J7XYZPAYMENT000000000001:1731672000000",
      );
      expect(result.id).toBe("01J7XYZREFUND00000000000001");
      expect(result.status).toBe("REQUESTED");
      expect(result.quote.netRefund).toBe(150000);
    });

    it("should strictly reject non-26-char paymentId", () => {
      expect(() =>
        requestRefundCaseSchema.parse({
          paymentId: "short-id",
          idempotencyKey: "refund:123",
        }),
      ).toThrow();
    });

    it("should reject invalid idempotencyKey with spaces", () => {
      expect(() =>
        requestRefundCaseSchema.parse({
          paymentId: validUlidPaymentId,
          idempotencyKey: "invalid key with spaces",
        }),
      ).toThrow();
    });

    it("should handle 409 Conflict when refund case is already requested", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              code: "REFUND_ALREADY_REQUESTED",
              message: "Kasus pengembalian dana sudah diajukan untuk transaksi ini",
            }),
        }),
      );

      await expect(
        refundService.requestRefund({
          paymentId: validUlidPaymentId,
          idempotencyKey: "refund:unique:key",
        }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe("Query Refund Cases & Status Tracking (GET /refunds & GET /refunds/{id})", () => {
    const mockCaseList = {
      schemaVersion: 1,
      items: [
        {
          schemaVersion: 1,
          id: "01J7XYZREFUND00000000000001",
          paymentId: "01J7XYZPAYMENT0000000000001",
          status: "COMPLETED",
          beneficiaryVerified: true,
          earningHold: false,
          transferAvailable: true,
          deliveryStatus: "SUCCESS",
          deliveryConfirmedAt: "2026-11-15T13:00:00Z",
          disabledReason: null,
          quote: {
            amount: 150000,
            currency: "IDR",
            netRefund: 150000,
          },
          createdAt: "2026-11-15T12:00:00Z",
          updatedAt: "2026-11-15T13:00:00Z",
        },
        {
          schemaVersion: 1,
          id: "01J7XYZREFUND00000000000002",
          paymentId: "01J7XYZPAYMENT0000000000002",
          status: "UNDER_REVIEW",
          beneficiaryVerified: false,
          earningHold: true,
          transferAvailable: false,
          disabledReason: "REFUND_TRANSFER_UNVERIFIED",
          quote: {
            amount: 250000,
            currency: "IDR",
            netRefund: 245000,
          },
          createdAt: "2026-11-15T14:00:00Z",
          updatedAt: "2026-11-15T14:00:00Z",
        },
      ],
      limit: 20,
    };

    it("should list refund cases with schemaVersion 1", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockCaseList),
        }),
      );

      const list = await refundService.getRefundCases();
      expect(list.schemaVersion).toBe(1);
      expect(list.items).toHaveLength(2);
      expect(list.items[0].status).toBe("COMPLETED");
      expect(list.items[1].disabledReason).toBe("REFUND_TRANSFER_UNVERIFIED");
    });

    it("should retrieve single refund case by id", async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockCaseList.items[0]),
        }),
      );

      const single = await refundService.getRefundCaseById(
        "01J7XYZREFUND00000000000001",
      );
      expect(single.id).toBe("01J7XYZREFUND00000000000001");
      expect(single.beneficiaryVerified).toBe(true);
      expect(single.deliveryStatus).toBe("SUCCESS");
    });
  });

  describe("Masking Helper for Beneficiary Bank Account", () => {
    it("should mask account number correctly", () => {
      expect(maskBeneficiaryAccount("1234567890")).toBe("••••••7890");
      expect(maskBeneficiaryAccount("52701234")).toBe("••••••1234");
      expect(maskBeneficiaryAccount("1234")).toBe("1234");
      expect(maskBeneficiaryAccount("12")).toBe("12");
      expect(maskBeneficiaryAccount("")).toBe("");
      expect(maskBeneficiaryAccount(undefined)).toBe("");
    });
  });
});

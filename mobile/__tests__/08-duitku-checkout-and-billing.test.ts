import fs from "fs";
import path from "path";
import {
  paymentService,
  mintServerPaymentContext,
  isServerPaymentContext,
  createBillingOrderIdempotencyKey,
  paymentMethodsSchema,
  billingOrderResponseSchema,
} from "../src/api/payment.service";
import { setAuthTokens, ApiError } from "../src/api/client";
import { secureStorage } from "../src/utils/storage";

describe("08. Duitku Payment Catalog, Server Checkout & Billing Suite (RLN-20 & RLN-14)", () => {
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

  describe("Dynamic Duitku Payment Methods Catalog (GET /payments/methods)", () => {
    const mockPaymentMethods = {
      schemaVersion: 1,
      currency: "IDR",
      baseAmount: {
        amount: 150000,
        currency: "IDR",
      },
      generatedAt: "2026-11-15T12:00:00Z",
      estimate: false,
      groups: [
        {
          groupName: "Virtual Account",
          methodType: "VIRTUAL_ACCOUNT",
          methods: [
            {
              key: "va-bca",
              name: "BCA Virtual Account",
              methodType: "VIRTUAL_ACCOUNT",
              channelCode: "VA_BCA",
              available: true,
              providerVerified: true,
              fee: { amount: 4000, currency: "IDR" },
              feeBearer: "PATIENT",
              totalPayable: { amount: 154000, currency: "IDR" },
              disabledReason: null,
            },
            {
              key: "va-mandiri",
              name: "Mandiri Virtual Account",
              methodType: "VIRTUAL_ACCOUNT",
              channelCode: "VA_MANDIRI",
              available: false,
              providerVerified: true,
              fee: { amount: 4000, currency: "IDR" },
              feeBearer: "PATIENT",
              totalPayable: { amount: 154000, currency: "IDR" },
              disabledReason: "Gangguan integrasi bank sementara",
            },
          ],
        },
        {
          groupName: "E-Wallet & QRIS",
          methodType: "E_WALLET",
          methods: [
            {
              key: "qris",
              name: "QRIS (Semua Pembayaran)",
              methodType: "QRIS",
              channelCode: "QRIS",
              available: true,
              providerVerified: true,
              fee: { amount: 1050, currency: "IDR" },
              feeBearer: "PATIENT",
              totalPayable: { amount: 151050, currency: "IDR" },
              disabledReason: null,
            },
          ],
        },
      ],
    };

    it("should fetch payment methods with integer amount and currency query params", async () => {
      let requestedUrl = "";
      global.fetch = jest.fn().mockImplementation((url) => {
        requestedUrl = String(url);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockPaymentMethods),
        });
      });

      const result = await paymentService.getPaymentMethods(150000.75, "IDR");

      expect(requestedUrl).toContain("/payments/methods?amount=150000&currency=IDR");
      expect(result.schemaVersion).toBe(1);
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].methods[0].name).toBe("BCA Virtual Account");
      expect(result.groups[0].methods[0].totalPayable.amount).toBe(154000);
      expect(result.groups[0].methods[1].disabledReason).toBe("Gangguan integrasi bank sementara");
    });

    it("should strictly reject non-integer or invalid schema version", () => {
      const invalidData = {
        ...mockPaymentMethods,
        schemaVersion: 2, // invalid schemaVersion
      };

      expect(() => paymentMethodsSchema.parse(invalidData)).toThrow();
    });

    it("should strictly reject currency other than IDR", () => {
      const invalidCurrencyData = {
        ...mockPaymentMethods,
        currency: "USD",
      };

      expect(() => paymentMethodsSchema.parse(invalidCurrencyData)).toThrow();
    });
  });

  describe("Server-Authoritative Billing Order (POST /consultations/{id}/billing-orders)", () => {
    const mockBillingOrderResponse = {
      id: "01J7XYZORDER000000000000001",
      consultationId: "01J7XYZCONSULTATION00000001",
      patientId: "01J7XYZPATIENT0000000000001",
      payerType: "SELF_PAY",
      orderType: "INITIAL_ASSESSMENT",
      durationMinutes: 60,
      grossAmount: 150000,
      discountAmount: 0,
      totalAmount: 150000,
      currency: "IDR",
      paymentStatus: "UNPAID",
      createdAt: "2026-11-15T12:00:00Z",
      updatedAt: "2026-11-15T12:00:00Z",
    };

    it("should create billing order with HTTP 201 response and mint server payment context", async () => {
      let sentBody = "";
      let sentUrl = "";

      global.fetch = jest.fn().mockImplementation((url, init) => {
        sentUrl = String(url);
        sentBody = String(init?.body);
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve(mockBillingOrderResponse),
        });
      });

      const response = await paymentService.createBillingOrder(
        "01J7XYZCONSULTATION00000001",
        {
          orderType: "INITIAL",
          durationMinutes: 60,
          payerType: "SELF_PAY",
          practitionerType: "PSYCHOLOGIST",
          idempotencyKey: "billing-order:test-key",
        },
      );

      expect(sentUrl).toContain(
        "/consultations/01J7XYZCONSULTATION00000001/billing-orders",
      );
      expect(JSON.parse(sentBody)).toEqual({
        orderType: "INITIAL",
        durationMinutes: 60,
        payerType: "SELF_PAY",
        practitionerType: "PSYCHOLOGIST",
        idempotencyKey: "billing-order:test-key",
      });
      expect(response.id).toBe("01J7XYZORDER000000000000001");
      expect(response.totalAmount).toBe(150000);
      expect(response.currency).toBe("IDR");
    });

    it("should mint and validate server payment context correctly", () => {
      const minted = mintServerPaymentContext({
        consultationId: "01J7XYZCONSULTATION00000001",
        billingOrderId: "01J7XYZORDER000000000000001",
      });

      expect(isServerPaymentContext(minted)).toBe(true);

      // Raw unbranded object must fail validation
      const fakeContext = {
        consultationId: "01J7XYZCONSULTATION00000001",
        billingOrderId: "01J7XYZORDER000000000000001",
      };
      expect(isServerPaymentContext(fakeContext)).toBe(false);
    });

    it("should prevent createPayment with unvalidated payment context", async () => {
      const unvalidatedContext: any = {
        consultationId: "fake-consultation",
        billingOrderId: "fake-order",
      };

      await expect(
        paymentService.createPayment({
          context: unvalidatedContext,
          methodType: "VIRTUAL_ACCOUNT",
          channelCode: "VA_BCA",
        }),
      ).rejects.toThrow(ApiError);
    });

    it("should successfully invoke payment checkout with server context", async () => {
      const validContext = mintServerPaymentContext({
        consultationId: "01J7XYZCONSULTATION00000001",
        billingOrderId: "01J7XYZORDER000000000000001",
      });

      let sentPaymentPayload = "";
      global.fetch = jest.fn().mockImplementation((url, init) => {
        sentPaymentPayload = String(init?.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: () =>
            Promise.resolve({
              id: "01J7XYZPAYMENT0000000000001",
              status: "PENDING",
              amount: 154000,
              contextType: "BILLING_ORDER",
              contextId: "01J7XYZORDER000000000000001",
              instruction: {
                methodType: "VIRTUAL_ACCOUNT",
                bankCode: "BCA",
                accountNumber: "82740812345678",
              },
            }),
        });
      });

      const paymentResult = await paymentService.createPayment({
        context: validContext,
        methodType: "VIRTUAL_ACCOUNT",
        channelCode: "VA_BCA",
      });

      const parsedPayload = JSON.parse(sentPaymentPayload);
      expect(parsedPayload.contextId).toBe("01J7XYZORDER000000000000001");
      expect(parsedPayload.contextType).toBe("BILLING_ORDER");
      expect(paymentResult.id).toBe("01J7XYZPAYMENT0000000000001");
      expect(paymentResult.grossAmount).toBe(154000);
    });
  });

  describe("Deterministic Billing Order Idempotency Key", () => {
    it("should generate stable idempotency keys for identical order intents", () => {
      const consultationId = "01J7XYZCONSULTATION00000001";
      const intent: Parameters<typeof createBillingOrderIdempotencyKey>[1] = {
        orderType: "INITIAL",
        durationMinutes: 60,
        payerType: "SELF_PAY",
        practitionerType: "PSYCHOLOGIST",
        level: { code: "LEVEL_1", multiplier: 1 },
        discountCode: "SERAPHANY10",
      };

      const key1 = createBillingOrderIdempotencyKey(consultationId, intent);
      const key2 = createBillingOrderIdempotencyKey(consultationId, intent);

      expect(key1).toBe(key2);
      expect(key1).toContain("INITIAL");
      expect(key1).toContain("SERAPHANY10");
    });
  });

  describe("UI Component Parity & Zero Midtrans Branding", () => {
    it("should assert that PaymentMethodSelector does not contain hardcoded Midtrans branding", () => {
      const componentPath = path.resolve(
        __dirname,
        "../src/components/patient/payment/PaymentMethodSelector.tsx",
      );
      const content = fs.readFileSync(componentPath, "utf-8");

      expect(content).not.toContain("Midtrans");
      expect(content).toContain("Duitku • Pembayaran Aman");
    });
  });
});

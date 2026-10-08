import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/api/response";
import { paymentService, isPaymentSettled } from "@/api/payment.service";
import * as paymentApi from "@/api/payment.service";
import * as apiBarrel from "@/api";
import * as hooks from "@/hooks/useApiQueries";
import * as capabilities from "@/config/capabilities";
import * as demoMode from "@/config/demoMode";
import { createTestQueryClient } from "../utils/test-utils";

const originalFetch = global.fetch;

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "",
    body: body === undefined ? null : {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
  } as unknown as Response;
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

  /**
   * Makes the capability gate refuse, the way the real guard does when the
   * capability is not live. The payment module calls assertCapabilityLive, so
   * that is the seam this suite drives. Whether the guard decides to refuse is
   * covered in config/capabilities.test.ts, so no part of the failure table is
   * duplicated here.
   */
  function capabilityRefuses(code: string, message: string) {
    (capabilities.assertCapabilityLive as jest.Mock).mockImplementation(() => {
      throw new ApiError(message, 501, code);
    });
  }

describe("payment context and boundary guards", () => {
  beforeEach(() => {
    jest.spyOn(capabilities, "getCapability").mockReturnValue("live");
    jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    // The payment module reaches the capability check through
    // assertCapabilityLive, which reads getCapability through its own local
    // binding. A spy on getCapability alone therefore no longer reaches the
    // guard, so this suite drives the gate the payment module actually calls.
    // The guard decides for itself whether to refuse, and that decision is
    // covered in config/capabilities.test.ts, so no part of the failure table
    // is duplicated here.
    jest.spyOn(capabilities, "assertCapabilityLive").mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("requires the expected server context and all settlement invariants", () => {
    const settled = {
      id: "payment-1",
      status: "SUCCESS",
      transactionStatus: "SETTLEMENT",
      billingOrderId: "server-order-1",
      grossAmount: 1,
    };

    expect((isPaymentSettled as any)(settled, "server-order-1")).toBe(true);
    expect((isPaymentSettled as any)(settled, "other-order")).toBe(false);
    expect(
      (isPaymentSettled as any)(
        { ...settled, billingOrderId: undefined },
        "server-order-1",
      ),
    ).toBe(false);
    expect(
      (isPaymentSettled as any)(
        { transactionStatus: "SETTLEMENT" },
        "server-order-1",
      ),
    ).toBe(false);
  });

  it("does not promote route-shaped IDs to a server context", () => {
    const fromResponse = (paymentApi as any)
      .serverPaymentContextFromApiResponse;
    const isContext = (paymentApi as any).isServerPaymentContext;

    expect(
      fromResponse({
        consultationId: "consultation-1",
        billingOrderId: "fabricated",
      }),
    ).toBeUndefined();
    expect(
      fromResponse({
        consultationId: "consultation-1",
        orderId: "fabricated",
        serverPaymentContext: {
          consultationId: "consultation-1",
          billingOrderId: "fabricated",
        },
      }),
    ).toBeUndefined();
    expect(
      isContext({
        consultationId: "consultation-1",
        billingOrderId: "fabricated",
      }),
    ).toBe(false);
  });

  it("does not expose a public context minter or barrel re-export", () => {
    expect((paymentApi as any).createServerPaymentContext).toBeUndefined();
    expect((apiBarrel as any).createServerPaymentContext).toBeUndefined();
    expect((paymentApi as any).mintServerPaymentContext).toBeUndefined();
  });

  it("keeps minting private and binds a future adapter to the validated consultation", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../src/api/payment.service.ts"),
      "utf8",
    );

    expect(source).toContain("function mintServerPaymentContext");
    expect(source).not.toContain("export function mintServerPaymentContext");
    expect(source).toContain("function adaptValidatedBillingOrderContext");
    expect(source).toContain(
      "response.consultationId !== validatedConsultationId.trim()",
    );
    expect(source).toContain("billingOrderId: response.orderId");
  });

  it("rejects fabricated context before a payment fetch", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;
    await expect(
      paymentService.createPayment({
        methodType: "E_WALLET",
        channelCode: "GOPAY",
        context: {
          consultationId: "consultation-1",
          billingOrderId: "fabricated",
        },
      } as any),
    ).rejects.toMatchObject({ error: "PAYMENT_CONTEXT_UNAVAILABLE" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects payment service calls when capability is unavailable before fetch", async () => {
    capabilityRefuses("CAPABILITY_UNAVAILABLE", "Pembayaran belum tersedia");
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(
      paymentService.createPayment({
        methodType: "E_WALLET",
        channelCode: "GOPAY",
        context: {
          consultationId: "consultation-1",
          billingOrderId: "server-order-1",
        },
      } as any),
    ).rejects.toMatchObject({ error: "CAPABILITY_UNAVAILABLE" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    [
      "payment",
      () =>
        paymentService.createPayment({
          methodType: "E_WALLET",
          channelCode: "GOPAY",
          context: {
            consultationId: "consultation-1",
            billingOrderId: "server-order-1",
          } as any,
        }),
    ],
    [
      "BPJS eligibility",
      () =>
        paymentService.checkBpjsEligibility(
          {
            consultationId: "consultation-1",
            billingOrderId: "server-order-1",
          } as any,
          "member-1",
        ),
    ],
    [
      "billing order",
      () =>
        paymentService.createBillingOrder("consultation-1", {
          orderType: "INITIAL",
        } as any),
    ],
  ])("blocks %s in demo mode before fetch", async (_name, operation) => {
    // Demo mode is the real guard own decision, so the stub installed in
    // beforeEach is dropped here and the actual guard runs against the
    // mocked isDemoMode. This keeps the assertion about the payment path
    // not reaching fetch, rather than about the guard table.
    (capabilities.assertCapabilityLive as jest.Mock).mockRestore();
    (capabilities.getCapability as jest.Mock).mockReturnValue("live");
    (demoMode.isDemoMode as jest.Mock).mockReturnValue(true);
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(operation()).rejects.toMatchObject({
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it.each([
    [
      "payment",
      () =>
        paymentService.createPayment({
          methodType: "E_WALLET",
          channelCode: "GOPAY",
          context: {
            consultationId: "consultation-1",
            billingOrderId: "server-order-1",
          } as any,
        }),
    ],
    [
      "BPJS eligibility",
      () =>
        paymentService.checkBpjsEligibility(
          {
            consultationId: "consultation-1",
            billingOrderId: "server-order-1",
          } as any,
          "member-1",
        ),
    ],
    [
      "billing order",
      () =>
        paymentService.createBillingOrder("consultation-1", {
          orderType: "INITIAL",
        } as any),
    ],
  ])(
    "blocks %s when capability is unavailable before fetch",
    async (_name, operation) => {
      capabilityRefuses("CAPABILITY_UNAVAILABLE", "Pembayaran belum tersedia");
      global.fetch = jest.fn() as unknown as typeof fetch;

      await expect(operation()).rejects.toMatchObject({
        error: "CAPABILITY_UNAVAILABLE",
      });
      expect(global.fetch).not.toHaveBeenCalled();
    },
  );

  it("blocks an unbranded context at the reusable payment hook", async () => {
    const createPayment = jest.spyOn(paymentService, "createPayment");
    const { result } = renderHook(() => hooks.useCreatePayment(), { wrapper });

    result.current.mutate({
      methodType: "E_WALLET",
      channelCode: "GOPAY",
      context: {
        consultationId: "consultation-1",
        billingOrderId: "fabricated",
      },
    } as any);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(createPayment).not.toHaveBeenCalled();
  });

  it("blocks rapid duplicate BPJS submissions synchronously", async () => {
    // Test-only module boundary; production uses the private adapter brand.
    jest.spyOn(paymentApi, "isServerPaymentContext").mockReturnValue(true);
    const context = {
      consultationId: "consultation-1",
      billingOrderId: "server-order-1",
    } as any;
    const request = deferred<any>();
    const check = jest
      .spyOn(paymentService, "checkBpjsEligibility")
      .mockReturnValue(request.promise);
    const { result } = renderHook(() => hooks.useCheckBpjsEligibility(), {
      wrapper,
    });

    result.current.mutate({
      context,
      memberNumber: "member-1",
    });
    result.current.mutate({
      context,
      memberNumber: "member-1",
    });

    await waitFor(() => expect(check).toHaveBeenCalledTimes(1));
    request.resolve({ accepted: true, eligibility: "UNKNOWN" });
  });

  it("blocks the billing-order service when payment capability is unavailable", async () => {
    capabilityRefuses("CAPABILITY_UNAVAILABLE", "Pembayaran belum tersedia");
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(
      paymentService.createBillingOrder("fabricated", {
        orderType: "INITIAL",
        durationMinutes: 30,
        payerType: "SELF_PAY",
        practitionerType: "PSYCHOLOGIST",
        level: {},
        idempotencyKey: "test-idem-key",
      }),
    ).rejects.toThrow("Pembayaran belum tersedia");
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

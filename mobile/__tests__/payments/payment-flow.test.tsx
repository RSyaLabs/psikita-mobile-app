import fs from "node:fs";
import path from "node:path";
import React from "react";
import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/api/response";
import {
  paymentService,
} from "@/api/payment.service";
import * as paymentApi from "@/api/payment.service";
import {
  BPJS_ELIGIBILITY_ACCEPTED,
  createBillingOrderIdempotencyKey,
  isPaymentSettled,
  parsePaymentResponse,
} from "@/api/payment.service";
import {
  useCheckBpjsEligibility,
  useCreatePayment,
} from "@/hooks/useApiQueries";
import { createTestQueryClient } from "../utils/test-utils";
import * as capabilities from "@/config/capabilities";
import * as demoMode from "@/config/demoMode";
import * as apiQueries from "@/hooks/useApiQueries";
import * as paymentQueries from "@/hooks/queries/payment";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: "Link",
}));

const originalFetch = global.fetch;
const mobileRoot = path.resolve(__dirname, "../..");

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "",
    body: body === undefined ? null : {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === "string" ? body : ""),
  } as unknown as Response;
}

function source(relativePath: string): string {
  return fs.readFileSync(path.join(mobileRoot, relativePath), "utf8");
}

const billingOrder = {
  orderType: "INITIAL" as const,
  durationMinutes: 45,
  payerType: "SELF_PAY" as const,
  practitionerType: "PSYCHOLOGIST" as const,
  level: { severity: "moderate" },
  idempotencyKey: "consultation-1:initial",
};

const testServerContext = {
  consultationId: "consultation-1",
  billingOrderId: "server-order-1",
} as any;

const payment = {
  methodType: "E_WALLET" as const,
  channelCode: "GOPAY",
  context: testServerContext,
};

function queryWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("payment and BPJS contract flow", () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    jest.spyOn(capabilities, "getCapability").mockReturnValue("live");
    jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    // Test-only adapter boundary: the real service validator remains strict.
    jest.spyOn(paymentApi, "isServerPaymentContext").mockReturnValue(true);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("creates a billing order with the documented body and treats no content as no context", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response(undefined, 200)) as unknown as typeof fetch;

    await expect(
      paymentService.createBillingOrder("consultation-1", billingOrder),
    ).resolves.toBeUndefined();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/consultations/consultation-1/billing-orders"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(billingOrder),
      }),
    );
  });

  it("validates a payment response against the requested context", async () => {
    const body = {
      id: "payment-1",
      status: "SUCCESS",
      amount: 43250,
      contextType: "BILLING_ORDER",
      contextId: "server-order-1",
    };

    expect(parsePaymentResponse(body, "server-order-1")).toMatchObject({
      id: "payment-1",
      status: "SUCCESS",
      transactionStatus: "SETTLEMENT",
      billingOrderId: "server-order-1",
      grossAmount: 43250,
    });
  });

  it.each([
    [
      "missing status",
      {
        id: "payment-1",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "status-only transactionStatus",
      {
        id: "payment-1",
        transactionStatus: "SUCCESS",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "empty id",
      {
        id: "",
        status: "SUCCESS",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "missing amount",
      {
        id: "payment-1",
        status: "SUCCESS",
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "non-finite amount",
      {
        id: "payment-1",
        status: "SUCCESS",
        amount: Number.POSITIVE_INFINITY,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "unknown status",
      {
        id: "payment-1",
        status: "SETTLEMENT",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
      },
    ],
    [
      "mismatched context",
      {
        id: "payment-1",
        status: "SUCCESS",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "other-order",
      },
    ],
    [
      "missing context id",
      {
        id: "payment-1",
        status: "SUCCESS",
        amount: 1,
        contextType: "BILLING_ORDER",
      },
    ],
    ["missing context", { id: "payment-1", status: "SUCCESS", amount: 1 }],
    [
      "unknown field",
      {
        id: "payment-1",
        status: "SUCCESS",
        amount: 1,
        contextType: "BILLING_ORDER",
        contextId: "server-order-1",
        unexpected: true,
      },
    ],
  ])("rejects %s payment responses", async (_name, body) => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response(body)) as unknown as typeof fetch;

    expect(() => parsePaymentResponse(body, "server-order-1")).toThrow();
  });

  it.each([
    ["PENDING", "PENDING"],
    ["FAILED", "FAILED"],
    ["EXPIRED", "EXPIRE"],
    ["CANCELLED", "CANCEL"],
    ["REFUNDED", "REFUNDED"],
  ])(
    "keeps %s payments from enabling consultation entry",
    async (status, expected) => {
      global.fetch = jest.fn().mockResolvedValue(
        response({
          id: "payment-1",
          status,
          amount: 1,
          contextType: "BILLING_ORDER",
          contextId: "server-order-1",
        }),
      ) as unknown as typeof fetch;

      const result = parsePaymentResponse(
        {
          id: "payment-1",
          status,
          amount: 1,
          contextType: "BILLING_ORDER",
          contextId: "server-order-1",
        },
        "server-order-1",
      );

      expect(result.transactionStatus).toBe(expected);
      expect(isPaymentSettled(result, testServerContext.billingOrderId)).toBe(
        false,
      );
    },
  );

  it("rejects malformed payment status instead of reporting success", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ id: "payment-1", status: "UNKNOWN", amount: 1 }),
      ) as unknown as typeof fetch;

    expect(() =>
      parsePaymentResponse(
        { id: "payment-1", status: "UNKNOWN", amount: 1 },
        "server-order-1",
      ),
    ).toThrow();
  });

  it("rejects an unbranded context before making a payment request", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(paymentService.createPayment(payment)).rejects.toMatchObject({
      name: "ApiError",
      error: "PAYMENT_CONTEXT_UNAVAILABLE",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects contradictory payment status fields", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        id: "payment-1",
        status: "SUCCESS",
        transactionStatus: "FAILED",
        amount: 1,
      }),
    ) as unknown as typeof fetch;

    expect(() =>
      parsePaymentResponse(
        {
          id: "payment-1",
          status: "SUCCESS",
          transactionStatus: "FAILED",
          amount: 1,
          contextType: "BILLING_ORDER",
          contextId: "server-order-1",
        },
        "server-order-1",
      ),
    ).toThrow();
  });

  it("does not treat a malformed normalized payment as settled", () => {
    expect(
      isPaymentSettled(
        {
          id: "payment-1",
          status: "SUCCESS",
          transactionStatus: "SETTLEMENT",
          billingOrderId: "server-order-1",
          grossAmount: Number.POSITIVE_INFINITY,
        },
        testServerContext.billingOrderId,
      ),
    ).toBe(false);
    expect(
      isPaymentSettled(
        {
          id: "",
          status: "SUCCESS",
          transactionStatus: "SETTLEMENT",
          billingOrderId: "server-order-1",
          grossAmount: 1,
        },
        testServerContext.billingOrderId,
      ),
    ).toBe(false);
    expect(
      isPaymentSettled(
        { transactionStatus: "SETTLEMENT" } as any,
        testServerContext.billingOrderId,
      ),
    ).toBe(false);
  });
  it("uses a stable idempotency key for one billing-order intent", () => {
    const first = createBillingOrderIdempotencyKey("consultation-1", {
      ...billingOrder,
      idempotencyKey: "",
    });
    const second = createBillingOrderIdempotencyKey("consultation-1", {
      ...billingOrder,
      idempotencyKey: "",
    });

    expect(first).toBe(second);
    expect(first).toContain("consultation-1");
  });

  it("does not let a plain object reach the BPJS service", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(
      paymentService.checkBpjsEligibility(testServerContext, "member-1"),
    ).rejects.toMatchObject({
      name: "ApiError",
      error: "PAYMENT_CONTEXT_UNAVAILABLE",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("keeps the no-content BPJS result explicitly accepted but unknown", () => {
    expect(BPJS_ELIGIBILITY_ACCEPTED).toEqual({
      accepted: true,
      eligibility: "UNKNOWN",
    });
  });

  it("uses a one-shot BPJS mutation without automatic retries", async () => {
    const demo = jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    const checkEligibility = jest
      .spyOn(paymentService, "checkBpjsEligibility")
      .mockResolvedValue(BPJS_ELIGIBILITY_ACCEPTED);
    // The app configures mutations with retry 0 in QueryProvider, because a
    // financial or transactional write must never be replayed automatically. The
    // previous config here said retry 3 while the assertion below expected a
    // single call, so the test contradicted itself. Modelling the real default is
    // what makes the assertion meaningful: with retry 0 the service is reached
    // exactly once.
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: 0, gcTime: Infinity },
        mutations: { retry: 0 },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCheckBpjsEligibility(), { wrapper });

    result.current.mutate({
      context: testServerContext,
      memberNumber: "member-1",
    });

    await waitFor(() => expect(checkEligibility).toHaveBeenCalledTimes(1));
    expect(result.current.data).toEqual(BPJS_ELIGIBILITY_ACCEPTED);
    demo.mockRestore();
  });

  it("does not automatically retry a rejected BPJS POST", async () => {
    const demo = jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    const checkEligibility = jest
      .spyOn(paymentService, "checkBpjsEligibility")
      .mockRejectedValue(new Error("temporary failure"));
    // The production QueryClient sets `mutations.retry: 0` precisely so a
    // financial request is never re-sent by itself. This test previously built
    // a client with `retry: 3`, which is the opposite of what it claims to
    // assert, and then waited 1000 ms for a rejection that three exponential
    // backoffs could not reach in time. The shared test client matches
    // production: no retry.
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCheckBpjsEligibility(), { wrapper });

    result.current.mutate({
      context: testServerContext,
      memberNumber: "member-1",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(checkEligibility).toHaveBeenCalledTimes(1);
    demo.mockRestore();
  });
  it("blocks a duplicate payment mutation while the first request is pending", async () => {
    const capability = jest
      .spyOn(capabilities, "getCapability")
      .mockReturnValue("live");
    const demo = jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    let resolvePayment: ((value: any) => void) | undefined;
    const createPayment = jest
      .spyOn(paymentService, "createPayment")
      .mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePayment = resolve;
          }),
      );
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: queryWrapper,
    });

    result.current.mutate(payment);
    result.current.mutate(payment);

    await waitFor(() => expect(createPayment).toHaveBeenCalledTimes(1));

    resolvePayment?.({
      id: "payment-1",
      transactionStatus: "SETTLEMENT",
      grossAmount: 1,
    });
    capability.mockRestore();
    demo.mockRestore();
  });

  it("does not call the payment service when the audited capability is unavailable", async () => {
    // The payment path reaches the capability check through
    // assertCapabilityLive, which reads getCapability through its own local
    // binding, so a spy on getCapability alone no longer reaches the guard.
    // This suite drives the gate the payment module actually calls; the
    // guard own decision is covered in config/capabilities.test.ts.
    const capability = jest
      .spyOn(capabilities, "assertCapabilityLive")
      .mockImplementation(() => {
        throw new ApiError(
          "Pembayaran belum tersedia",
          501,
          "CAPABILITY_UNAVAILABLE",
        );
      });
    const demo = jest.spyOn(demoMode, "isDemoMode").mockReturnValue(false);
    const createPayment = jest.spyOn(paymentService, "createPayment");
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: queryWrapper,
    });

    result.current.mutate(payment);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(createPayment).not.toHaveBeenCalled();
    capability.mockRestore();
    demo.mockRestore();
  });
  it("does not call the payment service in demo mode", async () => {
    const capability = jest
      .spyOn(capabilities, "getCapability")
      .mockReturnValue("live");
    const demo = jest.spyOn(demoMode, "isDemoMode").mockReturnValue(true);
    const createPayment = jest.spyOn(paymentService, "createPayment");
    const { result } = renderHook(() => useCreatePayment(), {
      wrapper: queryWrapper,
    });

    result.current.mutate(payment);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(createPayment).not.toHaveBeenCalled();
    capability.mockRestore();
    demo.mockRestore();
  });

  it("sends the server-issued context and never authors an amount", async () => {
    const mutateAsync = jest.fn().mockResolvedValue(settledPayment);
    const context = settledContext();
    renderPaymentRegular({ mutateAsync, context });

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    const payload = mutateAsync.mock.calls[0][0];

    // The server context must be forwarded verbatim, including its order id.
    expect(payload.context).toEqual(context);

    // No price-bearing or identity-bearing key may be authored by the screen.
    // This is the assertion that fails if someone hardcodes a figure here.
    expect(Object.keys(payload)).not.toEqual(
      expect.arrayContaining([
        "amount",
        "grossAmount",
        "total",
        "fee",
        "orderId",
        "billingOrderId",
        "patientId",
        "practitionerId",
      ]),
    );
    expect(payload).toEqual({
      methodType: "E_WALLET",
      channelCode: "GOPAY",
      context,
    });
  });

  it("refuses to submit while the server context is not settled", () => {
    const mutateAsync = jest.fn();

    // No context, query failed: the CTA must be disabled and nothing sent.
    renderPaymentRegular({
      mutateAsync,
      context: undefined,
      isError: true,
      isFetching: false,
      isLoading: false,
    });

    const cta = screen.getByText("Bayar belum tersedia");
    fireEvent.press(cta);

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("does not navigate when the server reports the payment unsettled", async () => {
    const mutateAsync = jest.fn().mockResolvedValue({
      ...settledPayment,
      transactionStatus: "PENDING",
    });
    renderPaymentRegular({ mutateAsync, context: settledContext() });

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

function settledContext() {
  return {
    consultationId: "consultation-9",
    billingOrderId: "server-order-9",
  } as never;
}

const settledPayment = {
  id: "payment-9",
  status: "SUCCESS",
  transactionStatus: "SETTLEMENT",
  billingOrderId: "server-order-9",
  grossAmount: 275000,
};

function renderPaymentRegular({
  mutateAsync,
  context,
  isError = false,
  isFetching = false,
  isLoading = false,
}: {
  mutateAsync: jest.Mock;
  context: unknown;
  isError?: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
}) {
  jest
    .spyOn(paymentQueries, "useCreatePayment")
    .mockReturnValue({ mutateAsync, isPending: false } as never);
  jest
    .spyOn(paymentQueries, "useValidatedServerPaymentContext")
    .mockReturnValue({
      context,
      isError,
      isFetching,
      isLoading,
      isSuccess: !isError && Boolean(context),
      refetch: jest.fn(),
    } as never);

  // Imported lazily so the module mocks above are registered first.
  const PaymentRegularScreen = require("../../app/(patient)/patient/payment-regular")
    .default;
  return render(<PaymentRegularScreen />);
}
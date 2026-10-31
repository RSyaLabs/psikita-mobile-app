import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { renderWithClient } from "../utils/test-utils";
import CheckoutScreen from "../../app/(patient)/patient/checkout";
import PaymentRegularScreen from "../../app/(patient)/patient/payment-regular";
import PaymentBpjsScreen from "../../app/(patient)/patient/payment-bpjs";
import { BPJS_ELIGIBILITY_ACCEPTED } from "@/api/payment.service";
import { ROUTES } from "@/constants";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};
const mockUseLocalSearchParams = jest.fn(() => ({}));
const mockGetCapability = jest.fn();
const mockUsePractitioner = jest.fn();
const mockUsePatientProfile = jest.fn();
const mockUseCreatePayment = jest.fn();
const mockUseCheckBpjsEligibility = jest.fn();
const mockUseValidatedServerPaymentContext = jest.fn();
const mockPaymentMutateAsync = jest.fn();
const mockPaymentMutate = jest.fn();
const mockBpjsMutate = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock("@/config/capabilities", () => ({
  getCapability: (key: string) => mockGetCapability(key),
}));

jest.mock("@/hooks/useApiQueries", () => ({
  usePractitioner: (...args: unknown[]) => mockUsePractitioner(...args),
  usePatientProfile: (...args: unknown[]) => mockUsePatientProfile(...args),
  useCreatePayment: (...args: unknown[]) => mockUseCreatePayment(...args),
  useCheckBpjsEligibility: (...args: unknown[]) =>
    mockUseCheckBpjsEligibility(...args),
  useValidatedServerPaymentContext: (...args: unknown[]) =>
    mockUseValidatedServerPaymentContext(...args),
}));

// Test-only adapter boundary. Production screens receive this only from the
// validated consultation/payment response hook.
const serverContext = {
  consultationId: "consultation-1",
  billingOrderId: "server-order-1",
} as any;

const settledPayment = {
  id: "payment-1",
  status: "SUCCESS" as const,
  transactionStatus: "SETTLEMENT" as const,
  billingOrderId: "server-order-1",
  grossAmount: 1,
};

function setPaymentMutation(overrides: Record<string, unknown> = {}) {
  mockUseCreatePayment.mockReturnValue({
    isPending: false,
    mutate: mockPaymentMutate,
    mutateAsync: mockPaymentMutateAsync,
    ...overrides,
  });
}

function setBpjsMutation(overrides: Record<string, unknown> = {}) {
  mockUseCheckBpjsEligibility.mockReturnValue({
    isPending: false,
    isSuccess: false,
    isError: false,
    mutate: mockBpjsMutate,
    ...overrides,
  });
}

describe("payment screen fail-closed interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
    mockGetCapability.mockImplementation((key: string) => {
      if (key === "bpjsEligibility") return "live";
      return "unavailable";
    });
    mockUsePractitioner.mockReturnValue({ data: undefined });
    mockUsePatientProfile.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    mockUseValidatedServerPaymentContext.mockReturnValue(undefined);
    setPaymentMutation();
    setBpjsMutation();
  });

  it("keeps checkout payment disabled without a server payment context", () => {
    renderWithClient(<CheckoutScreen />);

    const cta = screen.getByText("Pembayaran belum tersedia");
    fireEvent.press(cta);

    expect(cta).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockPaymentMutateAsync).not.toHaveBeenCalled();
  });

  it("keeps regular payment disabled without a server context or capability", () => {
    renderWithClient(<PaymentRegularScreen />);

    const cta = screen.getByText("Bayar belum tersedia");
    fireEvent.press(cta);

    expect(cta).toBeTruthy();
    expect(mockPaymentMutateAsync).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it.each([
    [
      "pending",
      { status: "PENDING" as const, transactionStatus: "PENDING" as const },
    ],
    [
      "expired",
      { status: "EXPIRED" as const, transactionStatus: "EXPIRE" as const },
    ],
    [
      "cancelled",
      { status: "CANCELLED" as const, transactionStatus: "CANCEL" as const },
    ],
    [
      "failed",
      { status: "FAILED" as const, transactionStatus: "FAILED" as const },
    ],
  ])("keeps a %s payment from navigating", async (_name, result) => {
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockResolvedValue({
      id: "payment-1",
      billingOrderId: "server-order-1",
      grossAmount: 1,
      ...result,
    });
    renderWithClient(<PaymentRegularScreen />);

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() =>
      expect(mockPaymentMutateAsync).toHaveBeenCalledTimes(1),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("does not navigate when the payment request fails", async () => {
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockRejectedValue(new Error("network failure"));
    renderWithClient(<PaymentRegularScreen />);

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() =>
      expect(mockPaymentMutateAsync).toHaveBeenCalledTimes(1),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("navigates only after a confirmed settlement", async () => {
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockResolvedValue(settledPayment);
    renderWithClient(<PaymentRegularScreen />);

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: ROUTES.PATIENT.CHAT_ROOM,
        params: { consultationId: "consultation-1" },
      }),
    );
  });

  it("disables payment replay after settlement", async () => {
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockResolvedValue(settledPayment);
    renderWithClient(<PaymentRegularScreen />);

    fireEvent.press(screen.getByText("Bayar sesuai server"));
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledTimes(1));

    const settledCta = screen.getByText("Settlement terkonfirmasi");
    fireEvent.press(settledCta);

    expect(mockPaymentMutateAsync).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it("rejects a fabricated screen context prop and renders no request", () => {
    mockGetCapability.mockReturnValue("live");
    renderWithClient(
      <PaymentRegularScreen
        {...({
          serverContext: {
            consultationId: "fabricated",
            billingOrderId: "fabricated",
          },
        } as any)}
      />,
    );

    expect(screen.getByText("Bayar belum tersedia")).toBeTruthy();
    fireEvent.press(screen.getByText("Bayar belum tersedia"));
    expect(mockPaymentMutateAsync).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("does not navigate for a malformed settlement-shaped result", async () => {
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockResolvedValue({
      transactionStatus: "SETTLEMENT",
    } as any);
    renderWithClient(<PaymentRegularScreen />);

    fireEvent.press(screen.getByText("Bayar sesuai server"));

    await waitFor(() =>
      expect(mockPaymentMutateAsync).toHaveBeenCalledTimes(1),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.queryByText("Settlement terkonfirmasi server")).toBeNull();
  });
  it("blocks duplicate regular payment submits while the first is pending", async () => {
    let resolvePayment: ((value: typeof settledPayment) => void) | undefined;
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockPaymentMutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePayment = resolve;
        }),
    );
    renderWithClient(<PaymentRegularScreen />);

    const cta = screen.getByText("Bayar sesuai server");
    fireEvent.press(cta);
    fireEvent.press(cta);

    await waitFor(() =>
      expect(mockPaymentMutateAsync).toHaveBeenCalledTimes(1),
    );
    resolvePayment?.(settledPayment);
  });

  it("keeps BPJS unavailable without capability, context, or a valid member number", () => {
    mockUsePatientProfile.mockReturnValue({
      data: { bpjsNumber: "   " },
      isLoading: false,
    });
    mockGetCapability.mockReturnValue("unavailable");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    renderWithClient(<PaymentBpjsScreen />);

    expect(screen.getByText("Konfirmasi BPJS belum tersedia")).toBeTruthy();
    fireEvent.press(screen.getByText("Verifikasi dan lanjut"));

    expect(mockBpjsMutate).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("keeps BPJS no-content accepted but unknown without automatic retries", () => {
    mockUsePatientProfile.mockReturnValue({
      data: { bpjsNumber: "member-1" },
      isLoading: false,
    });
    mockGetCapability.mockReturnValue("live");
    mockUseValidatedServerPaymentContext.mockReturnValue({
      context: serverContext,
    });
    mockUseCheckBpjsEligibility.mockReturnValue({
      isPending: false,
      isSuccess: true,
      isError: false,
      data: BPJS_ELIGIBILITY_ACCEPTED,
      mutate: mockBpjsMutate,
    });
    renderWithClient(<PaymentBpjsScreen />);

    expect(
      screen.getByText("Permintaan diterima; detail manfaat belum tersedia"),
    ).toBeTruthy();
    expect(mockBpjsMutate).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Coba lagi"));
    expect(mockBpjsMutate).toHaveBeenCalledTimes(1);
  });
});

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../utils/test-utils";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth, type AuthContextValue } from "@/hooks/useAuth";
import { authService } from "@/api/auth.service";
import { consultationService } from "@/api/consultation.service";
import { notesService } from "@/api/notes.service";
import { practitionerService } from "@/api/practitioner.service";
import { triageService } from "@/api/triage.service";
import {
  useLogin,
  useSubmitTriage,
  useCreateSoapNote,
  useRequestWithdrawal,
  useApprovePractitioner,
  useSendMessage,
} from "@/hooks/useApiQueries";

jest.mock("@/api/client", () => ({
  ...jest.requireActual("@/api/client"),
  getAuthToken: jest.fn().mockResolvedValue(null),
  invalidateAuthContext: jest.fn(),
  setAuthToken: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/api/auth.service", () => ({
  authService: { loginWithPassword: jest.fn(), logout: jest.fn() },
}));
jest.mock("@/api/notes.service", () => ({
  notesService: { createSoapNote: jest.fn() },
}));
jest.mock("@/api/practitioner.service", () => ({
  practitionerService: { approveProfile: jest.fn() },
}));
jest.mock("@/api/triage.service", () => ({
  triageService: { submitTriage: jest.fn() },
}));
jest.mock("@/utils/storage", () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockAuthService = jest.mocked(authService);
const mockConsultationService = jest.spyOn(consultationService, "sendMessage");
const mockNotesService = jest.mocked(notesService);
const mockPractitionerService = jest.mocked(practitionerService);
const mockTriageService = jest.mocked(triageService);

let currentAuth: AuthContextValue | undefined;

function AuthProbe() {
  currentAuth = useAuth();
  return null;
}

function wrapperFor(
  queryClient: ReturnType<typeof createTestQueryClient>,
  withAuth = false,
) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {withAuth ? (
        <AuthProvider>
          <AuthProbe />
          {children}
        </AuthProvider>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}

describe("TanStack React Query Mutations Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentAuth = undefined;
  });

  it("executes password login and accepts the server session", async () => {
    mockAuthService.loginWithPassword.mockResolvedValue({
      accessToken: "header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzaWQtdXNlci0xIiwiZW1haWwiOiJhY2NvdW50QGV4YW1wbGUudGVzdCIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImlhdCI6MTc5MDM4NTg3MCwiZXhwIjo0MTAyNDQ0ODAwfQ.signature",
      refreshToken: "refresh-token",
      user: {
        id: "user-1",
        username: "account",
        email: "account@example.test",
        role: "USER",
        isActive: true,
      },
    });
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLogin(), {
      wrapper: wrapperFor(queryClient, true),
    });
    await waitFor(() => expect(currentAuth?.status).toBe("unauthenticated"));

    act(() => {
      result.current.mutate({ username: "account", password: "test-password" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.user?.username).toBe("account");
  });

  it("submits a valid triage assessment", async () => {
    mockTriageService.submitTriage.mockResolvedValue({
      id: "triage-1",
      patientId: "patient-1",
      assessedBy: "patient-1",
      score: 12,
      hasRedFlags: false,
      level: "GREEN",
      disposition: "PENDING",
      answers: { q1: "often" },
      assessmentType: "SELF_ASSESSMENT",
      createdAt: "2026-09-25T00:00:00.000Z",
      updatedAt: "2026-09-25T00:00:00.000Z",
    });
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSubmitTriage(), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate({
        answers: { q1: "often", anxietyLevel: "MODERATE" },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.disposition).toBe("PENDING");
  });

  it("rejects raw consultation IDs for SOAP writes", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useCreateSoapNote(), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate({
        consultationId: "c_test_1",
        dto: {
          subjective: "s",
          objective: "o",
          assessment: "a",
          plan: "p",
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      error: "CONSULTATION_CONTEXT_UNAVAILABLE",
    });
    expect(mockNotesService.createSoapNote).not.toHaveBeenCalled();
  });

  it("keeps withdrawal unavailable without local success", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useRequestWithdrawal(), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate({ amount: 2500000, bank: "BCA" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("submits practitioner approval through the server mutation", async () => {
    mockPractitionerService.approveProfile.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useApprovePractitioner(), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate("practitioner-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("keeps chat writes unavailable without transport", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useSendMessage("room-1"), {
      wrapper: wrapperFor(queryClient),
    });

    act(() => {
      result.current.mutate({ content: "Halo dokter", senderRole: "PATIENT" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      error: "CHAT_WRITE_UNAVAILABLE",
    });
    expect(mockConsultationService).not.toHaveBeenCalled();
  });
});

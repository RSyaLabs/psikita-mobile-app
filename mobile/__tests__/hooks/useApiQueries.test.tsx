import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../utils/test-utils";
import { ApiError } from "@/api/client";
import { articleService } from "@/api/article.service";
import { consultationService } from "@/api/consultation.service";
import { ledgerService } from "@/api/ledger.service";
import { patientService } from "@/api/patient.service";
import { practitionerService } from "@/api/practitioner.service";
import { prescriptionService } from "@/api/prescription.service";
import {
  usePatientProfile,
  usePractitioners,
  useLedgerAccounts,
  useConsultations,
  usePrescriptions,
  useRoomMessages,
  useInfiniteArticles,
} from "@/hooks/useApiQueries";

jest.mock("@/api/article.service", () => ({
  articleService: { getArticles: jest.fn() },
}));
jest.mock("@/api/consultation.service", () => ({
  consultationService: {
    getConsultations: jest.fn(),
    getRoomMessages: jest.fn(),
  },
}));
jest.mock("@/api/ledger.service", () => ({
  ledgerService: { getAccounts: jest.fn(), getJournals: jest.fn() },
}));
jest.mock("@/api/patient.service", () => ({
  patientService: { getMyProfile: jest.fn() },
}));
jest.mock("@/api/practitioner.service", () => ({
  practitionerService: { getPractitioners: jest.fn() },
}));
jest.mock("@/api/prescription.service", () => ({
  prescriptionService: { getPrescriptions: jest.fn() },
}));

const mockArticleService = jest.mocked(articleService);
const mockConsultationService = jest.mocked(consultationService);
const mockLedgerService = jest.mocked(ledgerService);
const mockPatientService = jest.mocked(patientService);
const mockPractitionerService = jest.mocked(practitionerService);
const mockPrescriptionService = jest.mocked(prescriptionService);

function wrapperFor(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const meta = {
  itemCount: 1,
  totalItems: 1,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
};

describe("TanStack React Query Hooks Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPatientService.getMyProfile.mockResolvedValue({
      id: "patient-1",
      fullName: "Siti Rahayu",
      birthDate: "1990-01-01",
      gender: "FEMALE",
      phoneNumber: "081200000000",
      medicalRecordNumber: "RM-1",
      address: "Jakarta",
      status: "ACTIVE",
    });
    mockPractitionerService.getPractitioners.mockResolvedValue({
      data: [
        {
          id: "practitioner-1",
          userId: "user-1",
          type: "PSYCHOLOGIST",
          availabilityStatus: "AVAILABLE",
          verificationStatus: "VERIFIED",
          rating: 4.8,
          sippNumber: "SIPP-1",
          educations: [],
          experiences: [],
        },
      ],
      meta,
    });
    mockLedgerService.getAccounts.mockResolvedValue({
      data: [{ id: "account-1", name: "Cash", type: "ASSET", balance: 100 }],
      meta,
    });
    mockPrescriptionService.getPrescriptions.mockResolvedValue({
      data: [
        {
          id: "prescription-1",
          patientId: "patient-1",
          consultationId: "consultation-1",
          practitionerId: "practitioner-1",
          medications: [
            { name: "Medication", dosage: "10 mg", frequency: "Once daily" },
          ],
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        },
      ],
      meta,
    });
    mockConsultationService.getRoomMessages.mockResolvedValue({
      data: [
        {
          id: "message-1",
          roomId: "room-1",
          senderId: "patient-1",
          senderRole: "PATIENT",
          content: "encrypted",
          contentType: "TEXT",
          createdAt: "2026-09-24T00:00:00.000Z",
        },
      ],
      meta,
    });
    mockConsultationService.getConsultations.mockRejectedValue(
      new ApiError(
        "Daftar konsultasi belum tersedia",
        501,
        "CAPABILITY_UNAVAILABLE",
      ),
    );
    mockArticleService.getArticles.mockResolvedValue([
      {
        id: "article-1",
        title: "Article",
        category: "Anxiety",
        duration: "5 min",
        readsCount: "10",
        image: "https://example.test/article.jpg",
        summary: "Summary",
      },
    ]);
  });

  it("retrieves the active patient profile", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePatientProfile(), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.fullName).toContain("Siti");
  });

  it("retrieves the practitioner directory", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePractitioners(), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      data: [{ type: "PSYCHOLOGIST" }],
      total: 1,
      meta,
    });
    const data = result.current.data;
    const typedMeta: NonNullable<typeof data>["meta"] = data!.meta;
    expect(typedMeta).toEqual(meta);
  });

  it("keeps prescription data as an array while exposing metadata", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => usePrescriptions(), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.meta).toEqual(meta);
  });

  it("keeps room-message data as an array while exposing metadata", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useRoomMessages("room-1"), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.meta).toEqual(meta);
  });

  it("retrieves ledger accounts", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useLedgerAccounts(), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].name).toBe("Cash");
  });

  it("fails closed when consultation history has no documented list endpoint", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useConsultations(), {
      wrapper: wrapperFor(queryClient),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      error: "CAPABILITY_UNAVAILABLE",
    });
  });

  it("supports a select transform for practitioner results", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () =>
        usePractitioners(undefined, {
          select: (response) => response.data.map((item) => item.id),
        }),
      { wrapper: wrapperFor(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(["practitioner-1"]);
  });

  it("keeps the legacy article hook single-page", async () => {
    const queryClient = createTestQueryClient();
    const { result } = renderHook(() => useInfiniteArticles(), {
      wrapper: wrapperFor(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(result.current.data?.pages).toHaveLength(1);
    expect(mockArticleService.getArticles).toHaveBeenCalledTimes(1);
  });
});

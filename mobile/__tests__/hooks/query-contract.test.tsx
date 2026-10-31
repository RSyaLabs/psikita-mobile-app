import fs from "node:fs";
import path from "node:path";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import * as clientApi from "@/api/client";
import { consultationService } from "@/api/consultation.service";
import { matchingService } from "@/api/matching.service";
import { notesService } from "@/api/notes.service";
import { triageService } from "@/api/triage.service";
import * as capabilities from "@/config/capabilities";
import {
  useConsultations,
  useRoomMessages,
} from "@/hooks/useApiQueries";
import { queryKeys } from "@/hooks/useQueryKeys";
import { createTestQueryClient } from "../utils/test-utils";

jest.mock("@/api/consultation.service", () => ({
  consultationService: {
    getRoomMessages: jest.fn(),
    getConsultations: jest.fn(),
  },
}));

const mockConsultationService = jest.mocked(consultationService);
let capabilitySpy: jest.SpyInstance;

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function consultation(index: number) {
  return {
    id: `consultation-${index}`,
    patientId: "patient-1",
    practitionerId: "practitioner-1",
    durationMinutes: 60,
    status: "FINISHED" as const,
    participants: [],
    roomId: `room-${index}`,
    createdAt: "2026-09-24T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  };
}

describe("TanStack Query contract boundaries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capabilitySpy = jest
      .spyOn(capabilities, "getCapability")
      .mockReturnValue("demo");
  });

  afterEach(() => {
    capabilitySpy.mockRestore();
  });

  it("uses parameter-sensitive keys without PII-bearing query definitions", () => {
    const pageOne = queryKeys.patient.list({ page: 1, limit: 10 });
    const pageTwo = queryKeys.patient.list({ page: 2, limit: 10 });
    const consultationKey = queryKeys.consultations.list({
      status: "FINISHED",
      page: 2,
    });

    expect(pageOne).not.toEqual(pageTwo);
    expect(consultationKey).toEqual([
      "consultations",
      "list",
      { status: "FINISHED", page: 2 },
    ]);
    expect((queryKeys as Record<string, unknown>).bpjs).toBeUndefined();
    expect(JSON.stringify(queryKeys)).not.toMatch(/bpjsNumber|nik/i);
  });

  it("forwards cancellation signals through polling and clinical read services", async () => {
    const request = jest
      .spyOn(clientApi, "apiRequest")
      .mockResolvedValue({} as never);
    const signal = new AbortController().signal;

    await matchingService.getMyWaitingRoomStatus(signal);
    await triageService.getTriageQueue(signal);
    await triageService.getById("triage-1", signal);
    await notesService.getNotesByConsultation("consultation-1", signal);

    expect(request).toHaveBeenCalledWith(
      "/matching-requests/waiting-room/me",
      expect.objectContaining({ signal }),
    );
    expect(request).toHaveBeenCalledWith(
      "/triage/queue",
      expect.objectContaining({ signal }),
    );
    expect(request).toHaveBeenCalledWith(
      "/triage/triage-1",
      expect.objectContaining({ signal }),
    );
    expect(request).toHaveBeenCalledWith(
      "/consultation/consultation-1/notes",
      expect.objectContaining({ signal }),
    );
    request.mockRestore();
  });

  it("stops room-message polling for terminal consultation states", async () => {
    const queryClient = createTestQueryClient();
    mockConsultationService.getRoomMessages.mockResolvedValue({
      data: [],
      meta: {
        itemCount: 0,
        totalItems: 0,
        itemsPerPage: 20,
        totalPages: 0,
        currentPage: 1,
      },
    });

    const { result } = renderHook(() => useRoomMessages("room-1", "FINISHED"), {
      wrapper: wrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = queryClient
      .getQueryCache()
      .find({ queryKey: queryKeys.consultations.roomMessages("room-1") });
    const refetchInterval = (
      query?.options as
        { refetchInterval?: (query: unknown) => number | false } | undefined
    )?.refetchInterval;
    expect(typeof refetchInterval).toBe("function");
    expect(
      (refetchInterval as (query: unknown) => number | false)({
        state: { status: "success", data: result.current.data },
      }),
    ).toBe(false);
  });

  it("fails closed when consultation history has no documented list endpoint", async () => {
    const queryClient = createTestQueryClient();
    mockConsultationService.getConsultations.mockRejectedValue(
      new ApiError(
        "Daftar konsultasi belum tersedia",
        501,
        "CAPABILITY_UNAVAILABLE",
      ),
    );

    const { result } = renderHook(() => useConsultations(), {
      wrapper: wrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(mockConsultationService.getConsultations).toHaveBeenCalledWith(
      expect.any(AbortSignal),
    );
  });

  it("logs query hashes instead of complete query keys", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../src/providers/QueryProvider.tsx"),
      "utf8",
    );
    expect(source).toContain("query.queryHash");
    expect(source).not.toContain("JSON.stringify(query.queryKey)");
  });
});

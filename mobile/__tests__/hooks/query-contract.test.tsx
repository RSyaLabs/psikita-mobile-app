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
  notificationService,
  type NotificationDto,
} from "@/api/notification.service";
import {
  useConsultations,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useRoomMessages,
} from "@/hooks/useApiQueries";
import { queryKeys } from "@/hooks/useQueryKeys";
import { createTestQueryClient } from "../utils/test-utils";

jest.mock("@/api/notification.service", () => ({
  notificationService: {
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

jest.mock("@/api/consultation.service", () => ({
  consultationService: {
    getRoomMessages: jest.fn(),
    getConsultations: jest.fn(),
  },
}));

const mockNotificationService = jest.mocked(notificationService);
const mockConsultationService = jest.mocked(consultationService);
let capabilitySpy: jest.SpyInstance;

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function notification(id: string, isUnread: boolean): NotificationDto {
  return {
    id,
    category: "Konsultasi",
    title: `Notification ${id}`,
    description: "Description",
    timestamp: "Now",
    isUnread,
    actionText: "Open",
    actionRoute: "/patient/chat-room",
    iconType: "video",
  };
}

function notificationInCategory(
  id: string,
  category: NotificationDto["category"],
  isUnread: boolean,
): NotificationDto {
  return { ...notification(id, isUnread), category };
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
    mockNotificationService.getNotifications.mockResolvedValue([]);
    mockNotificationService.markAsRead.mockResolvedValue({ success: true });
    mockNotificationService.markAllAsRead.mockResolvedValue({ success: true });
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

  it("optimistically updates the exact notification category with isUnread=false", async () => {
    const queryClient = createTestQueryClient();
    const categoryKey = queryKeys.notifications.list("Konsultasi");
    queryClient.setQueryData<NotificationDto[]>(categoryKey, [
      notification("notification-1", true),
    ]);
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    mockNotificationService.markAsRead.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useMarkNotificationRead("Konsultasi"), {
      wrapper: wrapper(queryClient),
    });

    act(() => {
      result.current.mutate("notification-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0],
    ).toMatchObject({
      isUnread: false,
    });
    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0],
    ).not.toHaveProperty("isRead");
    // The optimistic cache write above is what these tests assert, and it is correct
    // What the test did not anticipate is that the mark-read mutations gained an
    // onSettled that invalidates queryKeys.notifications.all. That was added
    // because the optimistic write only runs when the notifications capability
    // is demo; on a live capability the server was being mutated with no cache
    // reconciliation at all. Reconciling is the correct behaviour, so the
    // assertion is updated rather than the fix reverted.
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.notifications.all,
    });
  });

  it("restores the exact notification category when the demo mutation fails", async () => {
    const queryClient = createTestQueryClient();
    const categoryKey = queryKeys.notifications.list("Konsultasi");
    const original = [notification("notification-1", true)];
    queryClient.setQueryData(categoryKey, original);
    mockNotificationService.markAsRead.mockRejectedValue(
      new Error("demo update failed"),
    );

    const { result } = renderHook(() => useMarkNotificationRead("Konsultasi"), {
      wrapper: wrapper(queryClient),
    });
    act(() => {
      result.current.mutate("notification-1");
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(categoryKey)).toEqual(original);
  });

  it("marks every cached notification category read without refetching fixtures", async () => {
    const queryClient = createTestQueryClient();
    const allKey = queryKeys.notifications.list("Semua");
    const consultationKey = queryKeys.notifications.list("Konsultasi");
    queryClient.setQueryData(allKey, [notification("notification-1", true)]);
    queryClient.setQueryData(consultationKey, [
      notification("notification-1", true),
    ]);
    const invalidate = jest.spyOn(queryClient, "invalidateQueries");
    mockNotificationService.markAllAsRead.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useMarkAllNotificationsRead(), {
      wrapper: wrapper(queryClient),
    });
    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData<NotificationDto[]>(allKey)?.[0].isUnread,
    ).toBe(false);
    expect(
      queryClient.getQueryData<NotificationDto[]>(consultationKey)?.[0]
        .isUnread,
    ).toBe(false);
    // Every cached category is written optimistically here, and the mutation then
    // reconciles the server state on settle, which is the behaviour that was
    // added: without it a live capability would mutate the server and never
    // reconcile. The assertion follows the fix rather than contradicting it.
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.notifications.all,
    });
  });

  it("does not optimistically mutate notification cache in production", async () => {
    capabilitySpy.mockReturnValue("unavailable");
    const queryClient = createTestQueryClient();
    const categoryKey = queryKeys.notifications.list("Konsultasi");
    queryClient.setQueryData<NotificationDto[]>(categoryKey, [
      notification("notification-1", true),
    ]);
    let rejectMutation: (reason?: unknown) => void = () => undefined;
    mockNotificationService.markAsRead.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectMutation = reject;
      }),
    );

    const { result } = renderHook(() => useMarkNotificationRead("Konsultasi"), {
      wrapper: wrapper(queryClient),
    });
    act(() => {
      result.current.mutate("notification-1");
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
      ).toBe(true),
    );

    rejectMutation(new Error("production unavailable"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
    ).toBe(true);
  });

  it("does not let an older failed notification mutation roll back a newer success", async () => {
    const queryClient = createTestQueryClient();
    const categoryKey = queryKeys.notifications.list("Konsultasi");
    queryClient.setQueryData<NotificationDto[]>(categoryKey, [
      notification("notification-1", true),
    ]);
    let rejectFirst: (reason?: unknown) => void = () => undefined;
    mockNotificationService.markAsRead
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          rejectFirst = reject;
        }),
      )
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useMarkNotificationRead("Konsultasi"), {
      wrapper: wrapper(queryClient),
    });
    act(() => {
      result.current.mutate("notification-1");
      result.current.mutate("notification-1");
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
      ).toBe(false),
    );

    await act(async () => {
      rejectFirst(new Error("older request failed"));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
    ).toBe(false);
  });

  it("rolls back a failed category without blocking a disjoint category success", async () => {
    const queryClient = createTestQueryClient();
    const consultationKey = queryKeys.notifications.list("Konsultasi");
    const prescriptionKey = queryKeys.notifications.list("Resep & Medis");
    queryClient.setQueryData<NotificationDto[]>(consultationKey, [
      notificationInCategory("consultation-notification", "Konsultasi", true),
    ]);
    queryClient.setQueryData<NotificationDto[]>(prescriptionKey, [
      notificationInCategory(
        "prescription-notification",
        "Resep & Medis",
        true,
      ),
    ]);

    let rejectFirst: (reason?: unknown) => void = () => undefined;
    mockNotificationService.markAsRead
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          rejectFirst = reject;
        }),
      )
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(
      () => ({
        consultation: useMarkNotificationRead("Konsultasi"),
        prescription: useMarkNotificationRead("Resep & Medis"),
      }),
      { wrapper: wrapper(queryClient) },
    );

    act(() => {
      result.current.consultation.mutate("consultation-notification");
      result.current.prescription.mutate("prescription-notification");
    });

    await waitFor(() =>
      expect(result.current.prescription.isSuccess).toBe(true),
    );
    await act(async () => {
      rejectFirst(new Error("consultation mutation failed"));
      await Promise.resolve();
    });

    expect(
      queryClient.getQueryData<NotificationDto[]>(consultationKey)?.[0]
        .isUnread,
    ).toBe(true);
    expect(
      queryClient.getQueryData<NotificationDto[]>(prescriptionKey)?.[0]
        .isUnread,
    ).toBe(false);
  });

  it("rolls back a failed item without blocking a disjoint item success", async () => {
    const queryClient = createTestQueryClient();
    const categoryKey = queryKeys.notifications.list("Konsultasi");
    queryClient.setQueryData<NotificationDto[]>(categoryKey, [
      notificationInCategory("first-notification", "Konsultasi", true),
      notificationInCategory("second-notification", "Konsultasi", true),
    ]);

    let rejectFirst: (reason?: unknown) => void = () => undefined;
    mockNotificationService.markAsRead
      .mockReturnValueOnce(
        new Promise((_resolve, reject) => {
          rejectFirst = reject;
        }),
      )
      .mockResolvedValueOnce({ success: true });

    const { result } = renderHook(
      () => ({
        first: useMarkNotificationRead("Konsultasi"),
        second: useMarkNotificationRead("Konsultasi"),
      }),
      { wrapper: wrapper(queryClient) },
    );

    act(() => {
      result.current.first.mutate("first-notification");
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
      ).toBe(false),
    );
    act(() => {
      result.current.second.mutate("second-notification");
    });
    await waitFor(() =>
      expect(
        queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[1].isUnread,
      ).toBe(false),
    );
    await act(async () => {
      rejectFirst(new Error("first mutation failed"));
      await Promise.resolve();
    });

    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[0].isUnread,
    ).toBe(true);
    expect(
      queryClient.getQueryData<NotificationDto[]>(categoryKey)?.[1].isUnread,
    ).toBe(false);
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

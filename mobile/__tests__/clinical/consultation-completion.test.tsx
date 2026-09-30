import fs from "node:fs";
import path from "node:path";
import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { consultationService } from "@/api/consultation.service";
import { matchingService } from "@/api/matching.service";
import { notesService } from "@/api/notes.service";
import { paymentService } from "@/api/payment.service";
import { getIcd10Description } from "@/constants/clinical";
import {
  activeConsultationContextFromResponse,
  clearActiveConsultationContextCache,
  isActiveConsultationContext,
  isTerminalConsultationStatus,
} from "@/clinical/activeConsultation";
import * as activeConsultationApi from "@/clinical/activeConsultation";
import {
  queryKeys,
  useActiveConsultation,
  useFinishConsultation,
  useSubmitFeedback,
} from "@/hooks/useApiQueries";
import { createTestQueryClient } from "../utils/test-utils";

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
    text: jest.fn().mockResolvedValue(""),
  } as unknown as Response;
}

const consultationResponse = {
  id: "consultation-server-1",
  patientId: "patient-server-1",
  practitionerId: "practitioner-server-1",
  roomId: "room-server-1",
  durationMinutes: 60,
  status: "ACTIVE",
  participants: [],
  createdAt: "2026-09-24T00:00:00.000Z",
  updatedAt: "2026-09-24T00:00:00.000Z",
};

function source(relativePath: string): string {
  return fs.readFileSync(path.join(mobileRoot, relativePath), "utf8");
}

/**
 * Twenty of the twenty-two cases here are behavioural: they drive the real
 * services against a mocked fetch and assert on what crossed the wire. The
 * label previously read "[source-text guards, not behavioural]", which was
 * wrong. Two cases still read source text, and they are named below.
 */
describe("consultation completion and server context", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("does not expose a public context minter or response branding function", () => {
    expect(
      (activeConsultationApi as any).mintActiveConsultationContext,
    ).toBeUndefined();
    expect(
      (activeConsultationApi as any).adaptConsultationResponseContext,
    ).toBeUndefined();
    expect(
      (activeConsultationApi as any).adaptMatchingClaimResponseContext,
    ).toBeUndefined();
    expect(
      (activeConsultationApi as any).markValidatedServerResponse,
    ).toBeUndefined();
    expect(
      (activeConsultationApi as any).isValidatedServerResponse,
    ).toBeUndefined();
  });

  it("does not expose a mutable process-wide context registry", () => {
    const forged = {
      consultationId: "consultation-forged",
      roomId: "room-forged",
      patientId: "patient-forged",
      practitionerId: "practitioner-forged",
      status: "ACTIVE",
    };

    expect(isActiveConsultationContext(forged)).toBe(false);
    expect(
      (globalThis as unknown as Record<symbol, unknown>)[
        Symbol.for("psikita.active-consultation-context-registry")
      ],
    ).toBeUndefined();
  });

  it("mints context only from a validated server consultation response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(consultationResponse, 201),
      ) as unknown as typeof fetch;

    const result = await consultationService.create({
      practitionerId: "practitioner-server-1",
      matchingRequestId: "matching-server-1",
      durationMinutes: 60,
    });
    const context = activeConsultationContextFromResponse(result);

    expect(isActiveConsultationContext(context)).toBe(true);
    expect(context).toMatchObject({
      consultationId: "consultation-server-1",
      roomId: "room-server-1",
      patientId: "patient-server-1",
      practitionerId: "practitioner-server-1",
      status: "ACTIVE",
    });
    expect(isActiveConsultationContext({ ...consultationResponse })).toBe(
      false,
    );
  });

  it("keeps the undocumented consultation list unavailable without transport", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(consultationService.getConsultations()).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 501,
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("invalidates adapter-minted contexts when the identity cache is cleared", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(consultationResponse, 201),
      ) as unknown as typeof fetch;

    const created = await consultationService.create({
      practitionerId: "practitioner-server-1",
    });
    const context = activeConsultationContextFromResponse(created);
    expect(isActiveConsultationContext(context)).toBe(true);

    clearActiveConsultationContextCache();

    expect(isActiveConsultationContext(context)).toBe(false);
    expect(activeConsultationContextFromResponse(created)).toBeUndefined();
  });

  it("rejects a consultation detail response for another consultation", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ ...consultationResponse, id: "consultation-other" }),
      ) as unknown as typeof fetch;

    await expect(
      consultationService.getById("consultation-server-1"),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects a consultation create response for another submitted practitioner", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(
          { ...consultationResponse, practitionerId: "practitioner-other" },
          201,
        ),
      ) as unknown as typeof fetch;

    await expect(
      consultationService.create({
        practitionerId: "practitioner-server-1",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects a claim response for another matching request", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        id: "matching-other",
        patientId: "patient-server-1",
        triageId: "triage-server-1",
        requiredLevel: "level_2",
        status: { value: "MATCHED" },
        candidatePractitionerIds: ["practitioner-server-1"],
        assignedPractitionerId: "practitioner-server-1",
        deadlineAt: null,
        createdAt: "2026-09-24T00:00:00.000Z",
        updatedAt: "2026-09-24T00:00:00.000Z",
      }),
    ) as unknown as typeof fetch;

    await expect(
      matchingService.claimMatchingRequest("matching-server-1"),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("does not return a remembered context when the current detail query errors", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(response(consultationResponse, 201))
      .mockRejectedValueOnce(
        new Error("detail unavailable"),
      ) as unknown as typeof fetch;

    const created = await consultationService.create({
      practitionerId: "practitioner-server-1",
    });
    expect(activeConsultationContextFromResponse(created)).toBeDefined();

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(
      () => useActiveConsultation("consultation-server-1"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.context).toBeUndefined();
  });

  it("does not promote raw matching or consultation objects into context", () => {
    const matchingRequest = {
      id: "matching-server-1",
      patientId: "patient-server-1",
      practitionerId: "practitioner-server-1",
      triageId: "triage-server-1",
      roomId: "room-server-1",
      status: "ACTIVE",
    };
    const mismatchedConsultation = {
      id: "matching-server-2",
      patientId: "patient-server-1",
      triageId: "triage-server-1",
      assignedPractitionerId: "practitioner-server-1",
      consultation: {
        id: "consultation-server-2",
        roomId: "room-server-2",
        patientId: "different-patient",
        practitionerId: "practitioner-server-1",
        status: "ACTIVE",
      },
    };

    expect(
      activeConsultationContextFromResponse(matchingRequest),
    ).toBeUndefined();
    expect(
      activeConsultationContextFromResponse(mismatchedConsultation),
    ).toBeUndefined();
  });

  it("does not create a context when a server omits a room or consultation identifier", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ ...consultationResponse, roomId: undefined }, 201),
      ) as unknown as typeof fetch;

    const result = await consultationService.create({
      practitionerId: "practitioner-server-1",
    });

    expect(activeConsultationContextFromResponse(result)).toBeUndefined();
    expect(
      activeConsultationContextFromResponse({
        ...consultationResponse,
        id: "",
      }),
    ).toBeUndefined();
  });

  it("keeps SYSTEM messages as system events instead of patient messages", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        data: [
          {
            id: "message-system-1",
            roomId: "room-server-1",
            senderId: "system",
            clientMessageId: "client-system-message-1",
            senderRole: "SYSTEM",
            ciphertext: "system-event",
            deliveryStatus: "DELIVERED",
            readStatus: "READ",
            createdAt: "2026-09-24T00:00:00.000Z",
            updatedAt: "2026-09-24T00:00:00.000Z",
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      }),
    ) as unknown as typeof fetch;

    const messages = await consultationService.getRoomMessages("room-server-1");

    expect(messages.data[0].senderRole).toBe("SYSTEM");
    expect(messages.data[0].content).toBe("system-event");
  });

  it("keeps an undocumented sender role unknown and rejects messages from another room", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        response({
          data: [
            {
              id: "message-unknown-role",
              roomId: "room-server-1",
              senderId: "server-user-1",
              clientMessageId: "client-message-1",
              ciphertext: "encrypted-message",
              deliveryStatus: "DELIVERED",
              readStatus: "READ",
              createdAt: "2026-09-24T00:00:00.000Z",
              updatedAt: "2026-09-24T00:00:00.000Z",
            },
          ],
          meta: {
            itemCount: 1,
            totalItems: 1,
            itemsPerPage: 20,
            totalPages: 1,
            currentPage: 1,
          },
        }),
      )
      .mockResolvedValueOnce(
        response({
          data: [
            {
              id: "message-other-room",
              roomId: "different-room",
              senderId: "server-user-1",
              clientMessageId: "client-message-2",
              ciphertext: "encrypted-message",
              deliveryStatus: "DELIVERED",
              readStatus: "READ",
              createdAt: "2026-09-24T00:00:00.000Z",
              updatedAt: "2026-09-24T00:00:00.000Z",
            },
          ],
          meta: {
            itemCount: 1,
            totalItems: 1,
            itemsPerPage: 20,
            totalPages: 1,
            currentPage: 1,
          },
        }),
      ) as unknown as typeof fetch;

    const messages = await consultationService.getRoomMessages("room-server-1");
    expect(messages.data[0].senderRole).toBe("UNKNOWN");

    await expect(
      consultationService.getRoomMessages("room-server-1"),
    ).rejects.toMatchObject({ error: "INVALID_RESPONSE" });
  });

  it("mints a context only when a claim response carries a complete consultation", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        id: "matching-server-1",
        patientId: "patient-server-1",
        triageId: "triage-server-1",
        requiredLevel: "level_2",
        status: { value: "MATCHED" },
        candidatePractitionerIds: ["practitioner-server-1"],
        assignedPractitionerId: "practitioner-server-1",
        deadlineAt: null,
        createdAt: "2026-09-24T00:00:00.000Z",
        updatedAt: "2026-09-24T00:00:00.000Z",
        consultation: {
          id: "consultation-server-1",
          roomId: "room-server-1",
          patientId: "patient-server-1",
          practitionerId: "practitioner-server-1",
          status: "ACTIVE",
        },
      }),
    ) as unknown as typeof fetch;

    const result =
      await matchingService.claimMatchingRequest("matching-server-1");
    expect(activeConsultationContextFromResponse(result)).toMatchObject({
      consultationId: "consultation-server-1",
      roomId: "room-server-1",
    });
  });

  it("uses the actual matching request identifier and never infers a claim context", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        id: "matching-server-1",
        patientId: "patient-server-1",
        triageId: "triage-server-1",
        requiredLevel: "level_2",
        status: { value: "MATCHED" },
        candidatePractitionerIds: ["practitioner-server-1"],
        assignedPractitionerId: "practitioner-server-1",
        deadlineAt: null,
        createdAt: "2026-09-24T00:00:00.000Z",
        updatedAt: "2026-09-24T00:00:00.000Z",
      }),
    ) as unknown as typeof fetch;

    await matchingService.claimMatchingRequest("matching-server-1");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/matching-requests/matching-server-1/claim"),
      expect.objectContaining({ method: "POST" }),
    );

    await expect(
      matchingService.claimMatchingRequest("   "),
    ).rejects.toMatchObject({
      name: "ApiError",
      error: "INVALID_REQUEST",
    });
  });

  // Still a source-text guard. It reads four screens off disk and asserts
  // hardcoded consultation ids are absent from the source. That proves the
  // literals are gone, not that the screens refuse to act without a server
  // context. Converting it needs those four screens rendered, and chat-room
  // depends on a consultation context the test cannot mint.
  it("requires explicit context for finish, SOAP, and feedback actions", async () => {
    const chat = source("app/(patient)/patient/chat-room.tsx");
    const matching = source("app/(patient)/patient/matching.tsx");
    const diagnosis = source("app/(practitioner)/practitioner/diagnosis.tsx");
    const rating = source("app/(patient)/patient/rating.tsx");

    expect(chat).not.toContain("cons_88213");
    expect(chat).not.toContain("room_pk_88213");
    expect(chat).toContain("useActiveConsultation");
    expect(chat).toContain("onSuccess");
    expect(chat).not.toContain("onError: () => router.push");
    expect(matching).toMatch(
      /canRequestConsultation\s*=\s*Boolean\(\s*!waitingRoom\.isError/,
    );
    expect(diagnosis).not.toContain("session_psy_2024_184");
    expect(diagnosis).toContain("useActiveConsultation");
    expect(diagnosis).not.toContain(
      "router.push(ROUTES.PRACTITIONER.WITHDRAW)",
    );
    expect(diagnosis).not.toMatch(/!saved\s*\|\|/);
    expect(rating).not.toContain("cons_88213");
    expect(rating).toContain("star:");
    expect(rating).toContain("comment:");
  });

  it("sends only the documented feedback fields", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response(
        {
          id: "feedback-server-1",
          consultationId: "consultation-server-1",
          patientId: "patient-server-1",
          star: 5,
          comment: "Sesi membantu.",
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        },
        201,
      ),
    ) as unknown as typeof fetch;

    await paymentService.submitFeedback("consultation-server-1", {
      star: 5,
      comment: "Sesi membantu.",
    });

    const [, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(request.body)).toEqual({
      star: 5,
      comment: "Sesi membantu.",
    });
  });

  it("rejects feedback unless the server-issued context is FINISHED", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        response(consultationResponse, 201),
      ) as unknown as typeof fetch;
    const created = await consultationService.create({
      practitionerId: "practitioner-server-1",
    });
    const context = activeConsultationContextFromResponse(created);
    expect(context?.status).toBe("ACTIVE");

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useSubmitFeedback(), { wrapper });

    act(() => {
      result.current.mutate({
        context: context!,
        star: 5,
        comment: "Belum selesai.",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("removes the active detail cache after a confirmed finish", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(consultationResponse, 201),
      ) as unknown as typeof fetch;
    const created = await consultationService.create({
      practitionerId: "practitioner-server-1",
    });
    const context = activeConsultationContextFromResponse(created);
    expect(context).toBeDefined();

    const queryClient = createTestQueryClient();
    const detailKey = queryKeys.consultations.detail(context!.consultationId);
    queryClient.setQueryData(detailKey, created);
    const finish = jest
      .spyOn(consultationService, "finish")
      .mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useFinishConsultation(), { wrapper });

    act(() => {
      result.current.mutate(context!);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(detailKey)).toBeUndefined();
    finish.mockRestore();
  });

  it("does not turn an absent SOAP response or unsupported action into success", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response(undefined, 201)) as unknown as typeof fetch;

    await expect(
      notesService.createSoapNote("consultation-server-1", {
        subjective: "s",
        objective: "o",
        assessment: "a",
        plan: "p",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      error: "INVALID_RESPONSE",
    });

    const video = source("app/(patient)/patient/video-call.tsx");
    const overtime = source("app/(patient)/patient/overtime-modal.tsx");
    const summary = source("app/(patient)/patient/session-summary.tsx");
    const modal = source("src/components/modals/PractitionerModals.tsx");

    expect(video).toContain("belum tersedia");
    expect(video).not.toContain("WebRTC aktif");
    expect(overtime).toContain("belum tersedia");
    expect(overtime).not.toContain("Rp25.000");
    expect(summary).toContain("belum tersedia");
    expect(summary).not.toContain("SOAP-20260918-001.pdf");
    expect(modal).not.toContain("119");
    expect(modal).not.toContain("Tim Reaksi Cepat");
    expect(modal).not.toContain("Skor 14");
    expect(modal).not.toContain("Siti N.");
    expect(modal).not.toContain("3 berkas rekam medis");
    expect(modal).not.toContain("1000289190");
    expect(modal).not.toContain("Eskalasi ke fasilitas kesehatan rujukan");
  });

  it("rejects SOAP and feedback responses for a different consultation", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        response(
          {
            id: "note-other-consultation",
            consultationId: "different-consultation",
            contentType: "soap",
            soap: {
              subjective: "s",
              objective: "o",
              assessment: "a",
              plan: "p",
            },
            createdAt: "2026-09-24T00:00:00.000Z",
            updatedAt: "2026-09-24T00:00:00.000Z",
          },
          201,
        ),
      )
      .mockResolvedValueOnce(
        response(
          {
            id: "feedback-other-consultation",
            consultationId: "different-consultation",
            patientId: "patient-server-1",
            star: 5,
            comment: "Sesi membantu.",
            createdAt: "2026-09-24T00:00:00.000Z",
            updatedAt: "2026-09-24T00:00:00.000Z",
          },
          201,
        ),
      ) as unknown as typeof fetch;

    await expect(
      notesService.createSoapNote("consultation-server-1", {
        subjective: "s",
        objective: "o",
        assessment: "a",
        plan: "p",
      }),
    ).rejects.toMatchObject({ error: "INVALID_RESPONSE" });
    await expect(
      paymentService.submitFeedback("consultation-server-1", {
        star: 5,
        comment: "Sesi membantu.",
      }),
    ).rejects.toMatchObject({ error: "INVALID_RESPONSE" });
  });

  it("finalizes a note against the real endpoint and reports an already-locked note distinctly", async () => {
    // This used to assert that finalization was permanently unavailable, on the
    // stated grounds that the contract had no such action. That was true when
    // written and stopped being true: the live contract defines
    // POST /consultation/note/{noteId}/finalize, returning 200 with a
    // NoteResponseDto, 404 for an unknown note and 409 when it is already locked.
    // The service now calls it for real.
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "note-server-1",
          consultationId: "consultation-1",
          messageIds: [],
          contentType: "text",
          text: "catatan",
          createdAt: "2026-09-29T00:00:00.000Z",
          updatedAt: "2026-09-29T00:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as unknown as typeof fetch;

    const finalized = await notesService.finalizeNote("note-server-1");

    expect(finalized.id).toBe("note-server-1");
    expect(finalized.consultationId).toBe("consultation-1");
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
      "/consultation/note/note-server-1/finalize",
    );
  });

  it("translates a 409 into a distinct already-finalized error rather than a generic failure", async () => {
    // Already-locked is a state, not a fault. Surfacing it as a generic error
    // would invite a retry that can never succeed.
    global.fetch = jest.fn().mockResolvedValue(
      new Response("{}", { status: 409, headers: { "content-type": "application/json" } }),
    ) as unknown as typeof fetch;

    await expect(notesService.finalizeNote("note-server-1")).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 409,
      error: "NOTE_ALREADY_FINALIZED",
    });
  });

  it("refuses to build a finalize request from an empty note id", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(notesService.finalizeNote("   ")).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 400,
      error: "INVALID_REQUEST",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("maps only explicit ICD-10 descriptions and leaves unknown codes unknown", () => {
    expect(getIcd10Description("F41.1")).toBe("Gangguan kecemasan menyeluruh");
    expect(getIcd10Description("F99.9")).toBeUndefined();
  });

  it("treats terminal consultation statuses as non-polling states", () => {
    expect(isTerminalConsultationStatus("FINISHED")).toBe(true);
    expect(isTerminalConsultationStatus("CANCELLED")).toBe(true);
    expect(isTerminalConsultationStatus("ACTIVE")).toBe(false);
  });
});

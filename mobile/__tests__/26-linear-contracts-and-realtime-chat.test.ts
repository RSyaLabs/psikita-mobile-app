import fs from "fs";
import path from "path";
import { consultationService } from "../src/api/consultation.service";
import { chatSocketClient } from "../src/services/chat-socket";
import * as clientModule from "../src/api/client";

describe("RLN Linear Backlog Fixes: Closeout Boundary, Realtime Chat, Care Plan Access & Notification Persistence", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("RLN-36: Consultation finish DTO parsing & patient authority boundary", () => {
    it("should parse 200 ConsultationResponseDto on finish and reject non-FINISHED states", async () => {
      const mockConsultation = {
        id: "cons-123",
        patientId: "pat-1",
        practitionerId: "prac-1",
        durationMinutes: 60,
        status: "FINISHED",
        participants: [
          { id: "p1", userId: "pat-1", role: "PATIENT" },
          { id: "p2", userId: "prac-1", role: "PRACTITIONER" },
        ],
        createdAt: "2026-11-28T00:00:00.000Z",
        updatedAt: "2026-11-28T01:00:00.000Z",
      };

      const fetchSpy = jest
        .spyOn(global, "fetch")
        .mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => mockConsultation,
        } as unknown as Response);

      jest.spyOn(clientModule, "getAuthToken").mockResolvedValue("token-123");

      const result = await consultationService.finish("cons-123");
      expect(result.id).toBe("cons-123");
      expect(result.status).toBe("FINISHED");
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      jest
        .spyOn(global, "fetch")
        .mockResolvedValue({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ ...mockConsultation, status: "ACTIVE" }),
        } as unknown as Response);

      await expect(consultationService.finish("cons-123")).rejects.toThrow(
        "INVALID_RESPONSE",
      );
    });

    it("should prevent patient chat-room from calling clinical finish mutation", () => {
      const chatRoom = fs.readFileSync(
        path.resolve(__dirname, "../app/(patient)/patient/chat-room.tsx"),
        "utf8",
      );
      expect(chatRoom).not.toContain("useFinishConsultation");
      expect(chatRoom).not.toContain("Akhiri sesi konsultasi");
      expect(chatRoom).toContain("Keluar dari ruang chat");
    });
  });

  describe("RLN-32: Realtime Socket.IO messaging transport", () => {
    it("should send room messages through chatSocketClient and validate MessageResponseDto", async () => {
      const socketSpy = jest
        .spyOn(chatSocketClient, "sendMessage")
        .mockResolvedValue({
          id: "msg-01",
          roomId: "room-abc",
          senderId: "user-1",
          clientMessageId: "mob_1",
          ciphertext: "Halo dokter",
          senderRole: "PATIENT",
          contentType: "TEXT",
          deliveryStatus: "DELIVERED",
          readStatus: "UNREAD",
          createdAt: "2026-11-28T01:00:00.000Z",
          updatedAt: "2026-11-28T01:00:00.000Z",
        });

      const res = await consultationService.sendMessage("room-abc", {
        content: "Halo dokter",
        senderRole: "PATIENT",
        clientMessageId: "mob_1",
      });

      expect(socketSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: "room-abc",
          clientMessageId: "mob_1",
          ciphertext: "Halo dokter",
        }),
      );
      expect(res.id).toBe("msg-01");
      expect(res.content).toBe("Halo dokter");
      expect(res.senderRole).toBe("PATIENT");
    });
  });

  describe("RLN-33 & RLN-34: Care-plan role boundary & persistent notification settings", () => {
    it("should disable clinician-only care-plan/notes calls on patient summary and follow-up screens", () => {
      const summary = fs.readFileSync(
        path.resolve(__dirname, "../app/(patient)/patient/session-summary.tsx"),
        "utf8",
      );
      const followUps = fs.readFileSync(
        path.resolve(__dirname, "../app/(patient)/patient/follow-ups.tsx"),
        "utf8",
      );
      expect(summary).toContain("useConsultationNotes(targetConsultationId, { enabled: false })");
      expect(summary).toContain("useCarePlan(targetConsultationId, { enabled: false })");
      expect(followUps).toContain("enabled: false");
    });

    it("should persist NotificationSettingsView preferences using secureStorage", () => {
      const notifView = fs.readFileSync(
        path.resolve(__dirname, "../src/components/patient/notifications/NotificationSettingsView.tsx"),
        "utf8",
      );
      expect(notifView).toContain("secureStorage");
      expect(notifView).toContain(".getItem(");
      expect(notifView).toContain("secureStorage.setItem");
    });
  });
});

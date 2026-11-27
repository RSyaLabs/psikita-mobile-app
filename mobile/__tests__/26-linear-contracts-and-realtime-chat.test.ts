import fs from "fs";
import path from "path";
import { consultationService } from "../src/api/consultation.service";
import { authService } from "../src/api/auth.service";
import { payoutService } from "../src/api/payout.service";
import { practitionerService } from "../src/api/practitioner.service";
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

  describe("API response adapters & contract completeness", () => {
    it("should provide explicit response adapters for every apiRequest call across src/api/", () => {
      const apiDir = path.resolve(__dirname, "../src/api");
      const files = fs
        .readdirSync(apiDir)
        .filter((f) => f.endsWith(".service.ts"));

      for (const file of files) {
        const content = fs.readFileSync(path.join(apiDir, file), "utf8");
        const matches = [...content.matchAll(/\bapiRequest(?:<[^>]*>)?\(/g)];
        for (const m of matches) {
          const start = m.index ?? 0;
          let depth = 0;
          let end = start + m[0].length - 1;
          while (end < content.length) {
            if (content[end] === "(") depth += 1;
            else if (content[end] === ")") {
              depth -= 1;
              if (depth === 0) break;
            }
            end += 1;
          }
          const callBody = content.slice(start, end + 1);
          expect(callBody).toContain("adapter");
        }
      }
    });

    it("should parse auth, payout tax/agreement, and practitioner schedule responses without MISSING_RESPONSE_ADAPTER", async () => {
      jest.spyOn(clientModule, "getAuthToken").mockResolvedValue("token-123");

      const mockJson = (payload: unknown) =>
        ({
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => payload,
        }) as unknown as Response;

      const fetchSpy = jest
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(
          mockJson({ userId: "u-1", sessions: ["s-1"], count: 1 }),
        )
        .mockResolvedValueOnce(
          mockJson({
            message: "Account deletion has been scheduled in 30 days",
            scheduledDeletionAt: "2026-12-28T00:00:00.000Z",
          }),
        )
        .mockResolvedValueOnce(mockJson({ status: "SUBMITTED" }))
        .mockResolvedValueOnce(mockJson({ accepted: true }))
        .mockResolvedValueOnce(
          mockJson({
            schedules: [
              {
                id: "sch-1",
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "17:00",
                timezone: "Asia/Jakarta",
                isActive: true,
                type: "WAR_ROOM_DUTY",
              },
            ],
            exceptions: [],
          }),
        )
        .mockResolvedValueOnce(
          mockJson([
            {
              id: "sch-1",
              dayOfWeek: 1,
              startTime: "09:00",
              endTime: "17:00",
              timezone: "Asia/Jakarta",
              isActive: true,
              type: "WAR_ROOM_DUTY",
            },
          ]),
        );

      const sessions = await authService.getMySessions();
      expect(sessions).toEqual({ userId: "u-1", sessions: ["s-1"], count: 1 });

      const del = await authService.deleteMyAccount();
      expect(del.message).toContain("30 days");

      await payoutService.submitTaxProfile({ npwp: "092542943407000" });
      const taxCall = fetchSpy.mock.calls.find(([url]) =>
        String(url).includes("/payout/tax-profile/me"),
      );
      expect(taxCall?.[1]?.body).toBe(
        JSON.stringify({ npwp: "0092542943407000" }),
      );

      await payoutService.acceptPayoutAgreement();

      const sch = await practitionerService.getMySchedules();
      expect(sch.schedules).toHaveLength(1);

      await practitionerService.replaceMyWeeklySchedules([
        {
          type: "WAR_ROOM_DUTY",
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
          timezone: "Asia/Jakarta",
          isActive: true,
        },
      ]);

      await expect(
        payoutService.submitTaxProfile({ npwp: "12345" }),
      ).rejects.toThrow("15 atau 16 digit");
    });
  });
});

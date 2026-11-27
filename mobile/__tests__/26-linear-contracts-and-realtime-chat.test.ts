import fs from "fs";
import path from "path";
import { consultationService } from "../src/api/consultation.service";
import { authService } from "../src/api/auth.service";
import { payoutService } from "../src/api/payout.service";
import { practitionerService } from "../src/api/practitioner.service";
import { matchingService } from "../src/api/matching.service";
import { paymentService, mintServerPaymentContext } from "../src/api/payment.service";
import { refundService } from "../src/api/refund.service";
import { avatarService } from "../src/api/avatar.service";
import { carePlanService } from "../src/api/careplan.service";
import { cdssService } from "../src/api/cdss.service";
import { followUpService } from "../src/api/followup.service";
import { prescriptionService } from "../src/api/prescription.service";
import { formatRupiah } from "../src/utils/format";
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

    it("should parse OpenAPI matching strings, patient consultation items, payment DTOs, refund DTOs, avatar url, and safe formatRupiah", async () => {
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
          mockJson({
            id: "mr-1",
            patientId: "pat-1",
            triageId: "trg-1",
            requiredLevel: "level_1",
            status: "CLAIMED",
            candidatePractitionerIds: ["prac-1"],
            assignedPractitionerId: "prac-1",
            deadlineAt: null,
            createdAt: "2026-11-28T00:00:00Z",
            updatedAt: "2026-11-28T00:01:00Z",
            consultationId: "cons-99",
          }),
        )
        .mockResolvedValueOnce(
          mockJson({
            items: [
              {
                id: "cons-10",
                practitionerId: "prac-1",
                practitionerName: "dr. Siti",
                practitionerType: "PSYCHIATRIST",
                status: "ACTIVE",
                durationMinutes: 60,
                createdAt: "2026-11-28T00:00:00Z",
                updatedAt: "2026-11-28T00:00:00Z",
              },
            ],
            meta: { total: 1, page: 1, limit: 20 },
          }),
        )
        .mockResolvedValueOnce(
          mockJson({
            schemaVersion: 1,
            currency: "IDR",
            baseAmount: { amount: 150000, currency: "IDR" },
            generatedAt: "2026-11-28T00:00:00Z",
            estimate: true,
            groups: [
              {
                methodType: "VIRTUAL_ACCOUNT",
                label: "Virtual Account",
                methods: [
                  {
                    key: "VA_BCA",
                    label: "BCA Virtual Account",
                    iconUrl: null,
                    available: true,
                    providerVerified: true,
                    fee: { amount: 4000, currency: "IDR" },
                    feeLabel: "Biaya layanan",
                    feeBearer: "INCLUDED",
                    totalPayable: { amount: 150000, currency: "IDR" },
                    disabledReason: null,
                  },
                ],
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          mockJson({
            id: "pay-1",
            patientId: "pat-1",
            status: "PENDING",
            amount: 150000,
            methodType: "VIRTUAL_ACCOUNT",
            createdAt: "2026-11-28T00:00:00Z",
            updatedAt: "2026-11-28T00:00:00Z",
            instruction: {
              methodType: "VIRTUAL_ACCOUNT",
              bankCode: "BCA",
              accountNumber: "8277001122",
            },
          }),
        )
        .mockResolvedValueOnce(
          mockJson({
            schemaVersion: 1,
            items: [
              {
                key: "BCA",
                kind: "BANK",
                label: "Bank Central Asia",
                maximum: { amount: 5000000, currency: "IDR" },
              },
            ],
          }),
        )
        .mockResolvedValueOnce(
          mockJson({
            schemaVersion: 1,
            id: "ref-1",
            paymentId: "01J7XYZPAYMENT000000000001",
            status: "REQUESTED",
            beneficiaryVerified: false,
            earningHold: false,
            transferAvailable: false,
            disabledReason: null,
            quote: null,
            createdAt: "2026-11-28T00:00:00Z",
            updatedAt: "2026-11-28T00:00:00Z",
          }),
        )
        .mockResolvedValueOnce(
          mockJson({ url: "https://cdn.seraphany.id/avatar/u1.jpg" }),
        );

      const claimed = await matchingService.claimMatchingRequest("mr-1");
      expect(claimed.status).toBe("CLAIMED");
      expect(claimed.consultationId).toBe("cons-99");

      const patientCons = await consultationService.getPatientConsultations();
      expect(patientCons).toHaveLength(1);
      expect(patientCons[0].practitionerName).toBe("dr. Siti");

      const methods = await paymentService.getPaymentMethods(150000);
      expect(methods.groups[0].groupName).toBe("Virtual Account");
      expect(methods.groups[0].methods[0].name).toBe("BCA Virtual Account");
      expect(methods.groups[0].methods[0].channelCode).toBe("VA_BCA");

      const ctx = mintServerPaymentContext({
        consultationId: "cons-10",
        billingOrderId: "order-10",
      });
      const payment = await paymentService.createPayment({
        context: ctx,
        methodType: "VIRTUAL_ACCOUNT",
        channelCode: "VA_BCA",
      });
      expect(payment.vaNumber).toBe("8277001122");
      const paymentCall = fetchSpy.mock.calls.find(([u]) =>
        String(u).endsWith("/payments"),
      );
      expect(JSON.parse(String(paymentCall?.[1]?.body)).channelCode).toBe("BCA");

      const dests = await refundService.getDestinations();
      expect(dests.items[0]).toEqual({
        type: "BANK",
        code: "BCA",
        name: "Bank Central Asia",
      });

      const refundCase = await refundService.requestRefund({
        paymentId: "01J7XYZPAYMENT000000000001",
        idempotencyKey: "refund-key-1",
      });
      expect(refundCase.quote.netRefund).toBe(0);

      const avatar = await avatarService.getMyAvatar();
      expect(avatar.avatarUrl).toBe("https://cdn.seraphany.id/avatar/u1.jpg");

      expect(formatRupiah(undefined)).toBe("Rp 0");
      expect(formatRupiah(NaN)).toBe("Rp 0");
    });

    it("should align care-plan, cdss, follow-up, referral letter, and identity adapters with OpenAPI shapes", async () => {
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
          mockJson({
            id: "cp-1",
            consultationId: "cons-1",
            homework: [{ description: "Latihan napas (1x/hari)" }],
            exercises: [{ name: "Latihan napas", instructions: "Tarik napas 4 detik" }],
            goals: [{ description: "Tidur nyenyak", dueDate: "2026-12-28T00:00:00.000Z" }],
          }),
        )
        .mockResolvedValueOnce(mockJson({ evaluationRunId: "run-1", alerts: [] }))
        .mockResolvedValueOnce(
          mockJson([
            {
              id: "fu-1",
              originConsultationId: "cons-1",
              patientId: "pat-1",
              practitionerId: "prac-1",
              status: "ISSUED",
              scheduledAt: "2026-12-01T10:00:00Z",
              validFrom: "2026-11-28T00:00:00Z",
            },
          ]),
        )
        .mockResolvedValueOnce(
          mockJson({
            referralId: "ref-1",
            letterUrl: "https://cdn.seraphany.id/letters/ref-1.pdf",
          }),
        )
        .mockResolvedValueOnce(
          mockJson([
            {
              provider: "GOOGLE",
              email: "pasien@seraphany.id",
              createdAt: "2026-11-01T00:00:00Z",
            },
          ]),
        );

      const cp = await carePlanService.createCarePlan("cons-1", {
        goals: ["Tidur nyenyak"],
        interventions: [{ title: "Latihan napas", description: "1x/hari" }],
      });
      const cpCall = fetchSpy.mock.calls.find(([url]) =>
        String(url).includes("/care-plan"),
      );
      const cpBody = JSON.parse(String(cpCall?.[1]?.body));
      expect(cpBody.homework[0].description).toContain("Latihan napas");
      expect(cpBody.exercises[0].name).toBe("Latihan napas");
      expect(cpBody.goals[0].description).toBe("Tidur nyenyak");
      expect(cp.goals).toEqual(["Tidur nyenyak"]);
      expect(cp.interventions.length).toBeGreaterThanOrEqual(1);

      await cdssService.evaluatePatientContext({
        patientId: "pat-1",
        consultationId: "cons-1",
        phqScore: 14,
        gadScore: 10,
      });
      const cdssCall = fetchSpy.mock.calls.find(([url]) =>
        String(url).includes("/cdss/evaluate"),
      );
      const cdssBody = JSON.parse(String(cdssCall?.[1]?.body));
      expect(cdssBody.metrics).toEqual({ phq9_score: 14, gad7_score: 10 });
      expect(cdssBody.subjectRef).toBe("pat-1");

      const fus = await followUpService.getMyFollowUps();
      expect(fus[0].status).toBe("PENDING");
      expect(fus[0].consultationId).toBe("cons-1");

      const letter = await prescriptionService.getReferralLetter("ref-1");
      expect(letter.pdfUrl).toBe("https://cdn.seraphany.id/letters/ref-1.pdf");

      const idRes = await authService.getIdentities();
      expect(idRes.identities[0].identifier).toBe("pasien@seraphany.id");
    });
  });
});

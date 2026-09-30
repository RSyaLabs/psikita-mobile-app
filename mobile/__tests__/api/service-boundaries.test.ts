import * as client from "@/api/client";
import * as capabilities from "@/config/capabilities";
import {
  articleService,
  consultationService,
  matchingService,
  notesService,
  notificationService,
  patientService,
  paymentService,
  practitionerService,
  prescriptionService,
  triageService,
} from "@/api";

const request = jest.spyOn(client, "apiRequest");
const capability = jest.spyOn(capabilities, "getCapability");

describe("service data-source boundaries", () => {
  beforeEach(() => {
    request.mockReset();
    capability.mockReset();
  });

  afterAll(() => {
    request.mockRestore();
    capability.mockRestore();
  });

  it("selects article fixtures explicitly in demo mode without making a request", async () => {
    capability.mockReturnValue("demo");
    request.mockRejectedValue(new Error("must not be called"));

    await expect(articleService.getArticles()).resolves.toHaveLength(4);
    expect(request).not.toHaveBeenCalled();
  });

  it("selects notification fixtures explicitly in demo mode without making a request", async () => {
    capability.mockReturnValue("demo");
    request.mockRejectedValue(new Error("must not be called"));

    await expect(notificationService.getNotifications()).resolves.toHaveLength(
      5,
    );
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    [
      "SOAP write",
      () =>
        notesService.createSoapNote("consultation_1", {
          subjective: "s",
          objective: "o",
          assessment: "a",
          plan: "p",
        }),
    ],
    [
      "matching claim",
      () => matchingService.claimMatchingRequest("matching_1"),
    ],
    [
      "patient PII write",
      () =>
        patientService.createProfile({
          fullName: "Patient",
          phoneNumber: "0812",
        }),
    ],
    [
      "feedback write",
      () =>
        paymentService.submitFeedback("consultation_1", {
          star: 5,
          comment: "helpful",
        }),
    ],
    [
      "practitioner approval",
      () => practitionerService.approveProfile("practitioner_1"),
    ],
    ["prescription read", () => prescriptionService.getPrescriptions()],
  ])(
    "propagates %s failures without fixture success",
    async (_name, operation) => {
      const failure = new Error("server rejected request");
      capability.mockReturnValue("live");
      request.mockRejectedValue(failure);

      await expect(operation()).rejects.toBe(failure);
      expect(request).toHaveBeenCalled();
    },
  );

  it("rejects incomplete triage data before any request", async () => {
    request.mockRejectedValue(new Error("must not be called"));

    await expect(
      triageService.submitTriage({ answers: {} }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 400,
      error: "INVALID_REQUEST",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps consultation history unavailable without calling an undocumented endpoint", async () => {
    request.mockRejectedValue(new Error("must not be called"));

    await expect(consultationService.getConsultations()).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 501,
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    [
      "matching waiting room",
      (signal: AbortSignal) => matchingService.getMyWaitingRoomStatus(signal),
    ],
    [
      "triage detail",
      (signal: AbortSignal) => triageService.getById("triage_1", signal),
    ],
    [
      "triage queue",
      (signal: AbortSignal) => triageService.getTriageQueue(signal),
    ],
    [
      "notes by consultation",
      (signal: AbortSignal) =>
        notesService.getNotesByConsultation("consultation_1", signal),
    ],
  ])("forwards the %s AbortSignal to apiRequest", async (_name, operation) => {
    const controller = new AbortController();
    request.mockResolvedValue(undefined);

    await operation(controller.signal);

    expect(request).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it("keeps chat writes unavailable without calling an undocumented endpoint", async () => {
    request.mockRejectedValue(new Error("must not be called"));

    await expect(
      consultationService.sendMessage("room_1", {
        content: "hello",
        senderRole: "PATIENT",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 501,
      error: "CHAT_WRITE_UNAVAILABLE",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("rejects an invalid feedback body before making a request", async () => {
    request.mockRejectedValue(new Error("must not be called"));

    await expect(
      paymentService.submitFeedback("consultation_1", { star: 0, comment: "" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 400,
      error: "INVALID_REQUEST",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps the undocumented consultation list unavailable without transport", async () => {
    request.mockRejectedValue(new Error("must not be called"));

    await expect(consultationService.getConsultations()).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 501,
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps notification writes demo-local without transport", async () => {
    capability.mockReturnValue("demo");
    request.mockRejectedValue(new Error("must not be called"));

    await expect(
      notificationService.markAsRead("notification_1"),
    ).resolves.toEqual({
      success: true,
    });
    await expect(notificationService.markAllAsRead()).resolves.toEqual({
      success: true,
    });
    expect(request).not.toHaveBeenCalled();
  });

  it("keeps notification writes unavailable in production without transport", async () => {
    capability.mockReturnValue("unavailable");
    request.mockRejectedValue(new Error("must not be called"));

    await expect(
      notificationService.markAsRead("notification_1"),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 501,
      error: "CAPABILITY_UNAVAILABLE",
    });
    expect(request).not.toHaveBeenCalled();
  });
});

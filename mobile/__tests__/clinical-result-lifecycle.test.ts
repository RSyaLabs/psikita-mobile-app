import { clinicalResultService } from "@/api/clinical-result.service";
import { consultationService } from "@/api/consultation.service";
import { notesService } from "@/api/notes.service";
import { setAuthTokens } from "@/api/client";
import { secureStorage } from "@/utils/storage";

describe("Clinician-owned consultation closeout", () => {
  const originalFetch = global.fetch;
  const fixedDate = "2026-11-16T12:00:00.000Z";

  const respond = (payload: unknown, status = 200) => ({
    ok: true,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => payload,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthTokens({accessToken: "stub-access-token", refreshToken: "stub-refresh-token"});
  });
  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthTokens(null);
    jest.restoreAllMocks();
  });

  it("writes a structured clinician diagnosis with explicit prescription/referral decisions", async () => {
    let request: Record<string, unknown> = {};
    global.fetch = jest.fn().mockImplementation((_url: string, init: {method?: string; body?: string}) => {
      request = {url: String(_url), method: init.method, body: JSON.parse(init.body ?? "{}")};
      return Promise.resolve(respond({
        id: "diagnosis-1", consultationId: "consultation-1",
        code: "F32.1", system: "ICD10", label: "Diagnosis klinis",
        isManual: false, needsPrescription: false, needsReferral: false, referralPriority: false,
        createdBy: "practitioner-1", createdAt: fixedDate, updatedAt: fixedDate,
      }, 201));
    });
    const diagnosis = await clinicalResultService.saveDiagnosis("consultation-1", {
      code: "F32.1", system: "ICD10", label: "Diagnosis klinis", isManual: false,
      needsPrescription: false, needsReferral: false, referralPriority: false,
    }, false);
    expect(diagnosis.id).toBe("diagnosis-1");
    expect(request.method).toBe("POST");
    expect(request.url).toContain("/consultations/consultation-1/diagnosis");
    expect(request.body).toMatchObject({needsPrescription: false, needsReferral: false, isManual: false});
  });

  it("keeps a SOAP draft separate from explicit finalization", async () => {
    let captured: { url: string; body: unknown } | undefined;
    global.fetch = jest.fn().mockImplementation((url: string, init: {body?: string}) => {
      captured = {url: String(url), body: JSON.parse(init.body ?? "{}")};
      return Promise.resolve(respond({
        id: "note-1", consultationId: "consultation-1", contentType: "soap",
        status: "COMPLETED", version: 2, createdAt: fixedDate, updatedAt: fixedDate,
        soap: {subjective: "Keluhan", objective: "Observasi", assessment: "Analisis", plan: "Rencana"},
      }));
    });
    const note = await notesService.finalizeNote("note-1", "consultation-1", 1);
    expect(note.status).toBe("COMPLETED");
    expect(captured?.url).toContain("/consultation/note/note-1/finalize");
    expect(captured?.body).toEqual({version: 1});
  });

  it("accepts Core API's JSON 200 FINISHED response instead of treating it as no-content", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(respond({
      id: "consultation-1", patientId: "patient-1", practitionerId: "practitioner-1",
      durationMinutes: 60, status: "FINISHED", participants: [],
      createdAt: fixedDate, updatedAt: fixedDate,
    }));
    const result = await consultationService.finish("consultation-1");
    expect(result.status).toBe("FINISHED");
    expect(result.id).toBe("consultation-1");
  });

  it("requires an explicit follow-up decision and verified result response", async () => {
    let requestBody: unknown;
    global.fetch = jest.fn().mockImplementation((_url: string, init: {body?: string}) => {
      requestBody = JSON.parse(init.body ?? "{}");
      return Promise.resolve(respond({
        id: "consultation-1", status: "FINISHED",
        resultStatus: "RESULT_SUBMITTED", patientFacingAdvice: "Anjuran untuk pasien",
      }));
    });
    await expect(clinicalResultService.submitResult("consultation-1", {
      patientFacingAdvice: "Anjuran untuk pasien",
      followUp: {required: false},
    })).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();

    const done = await clinicalResultService.submitResult("consultation-1", {
      patientFacingAdvice: "Anjuran untuk pasien",
      followUp: {required: false, reason: "Evaluasi klinis saat ini tidak membutuhkan jadwal lanjutan."},
    });
    expect(done.resultStatus).toBe("RESULT_SUBMITTED");
    expect(requestBody).toMatchObject({followUp: {required: false}});
  });
});

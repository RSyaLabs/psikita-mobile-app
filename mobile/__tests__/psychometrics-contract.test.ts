import { psychometricsService } from "../src/api/psychometrics.service";
import { triageService } from "../src/api/triage.service";

const apiResponse = (payload: unknown, status = 200) => ({
  ok: true,
  status,
  headers: { get: (header: string) => header === "content-type" ? "application/json" : null },
  json: async () => payload,
});

describe("Psychometrics-backed triage contracts", () => {
  const previousFetch = global.fetch;
  afterEach(() => {
    global.fetch = previousFetch;
    jest.clearAllMocks();
  });

  it("loads context-filtered instrument metadata from the API", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(apiResponse([
      {
        code: "PHQ9", name: "PHQ-9", version: 1,
        contexts: ["TRIAGE", "CONSULTATION"],
        supportedDimensions: ["depression"],
      },
      {
        code: "DASS21", name: "DASS-21", version: 2,
        contexts: ["TRIAGE", "CONSULTATION"],
        supportedDimensions: ["anxiety", "stress", "depression"],
      },
    ]));
    const result = await psychometricsService.getInstruments("TRIAGE");
    expect(result).toHaveLength(2);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/psychometrics/types?context=TRIAGE"),
      expect.anything(),
    );
  });

  it("loads a specific version with server-owned questions and response scale", async () => {
    const form = {
      typeCode: "PHQ9",
      version: 1,
      name: "PHQ-9",
      responseOptions: [{ value: 0, label: "Tidak sama sekali" }, { value: 1, label: "Beberapa hari" }],
      questions: [{ code: "q1", order: 1, text: "Pertanyaan klinis" }],
    };
    global.fetch = jest.fn().mockResolvedValueOnce(apiResponse(form));
    await expect(psychometricsService.getInstrumentForm("PHQ9", 1)).resolves.toMatchObject(form);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/psychometrics/types/PHQ9/form?version=1"),
      expect.anything(),
    );
  });

  it("rejects a form with inconsistent version or duplicated question codes", async () => {
    const duplicated = {
      typeCode: "PHQ9",
      version: 1,
      name: "PHQ-9",
      responseOptions: [{ value: 0, label: "Tidak pernah" }],
      questions: [
        { code: "q1", order: 1, text: "A" },
        { code: "q1", order: 2, text: "B" },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce(apiResponse(duplicated));
    await expect(psychometricsService.getInstrumentForm("PHQ9", 1)).rejects.toMatchObject({ error: "INVALID_RESPONSE" });
  });

  it("never transmits client-calculated severity or red flag flags", async () => {
    const triage = {
      id: "triage-1", patientId: "patient-1", assessedBy: "patient-1",
      questionnaireType: "PHQ_9", assessmentType: "SELF_ASSESSMENT",
      score: 8, hasRedFlags: false, level: "YELLOW", disposition: "PENDING",
      answers: { q1: 1 }, createdAt: "2026-11-16T00:00:00.000Z",
      updatedAt: "2026-11-16T00:00:00.000Z",
    };
    global.fetch = jest.fn().mockResolvedValueOnce(apiResponse(triage, 201));
    const result = await triageService.submitTriage({
      questionnaireType: "PHQ_9",
      assessmentType: "SELF_ASSESSMENT",
      answers: { q1: 1 },
    });
    expect(result.score).toBe(8);
    const fetchOptions = (global.fetch as jest.Mock).mock.calls[0][1];
    const sent = JSON.parse(fetchOptions.body);
    expect(sent).toMatchObject({ questionnaireType: "PHQ_9", answers: { q1: 1 } });
    expect(sent).not.toHaveProperty("score");
    expect(sent).not.toHaveProperty("hasRedFlags");
  });

  it("rejects non-numeric raw answers before making a network request", async () => {
    global.fetch = jest.fn();
    await expect(triageService.submitTriage({
      answers: { q1: "fake" } as unknown as Record<string, number>,
    })).rejects.toMatchObject({ error: "INVALID_REQUEST" });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

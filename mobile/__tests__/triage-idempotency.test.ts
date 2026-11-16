import { triageService } from "@/api/triage.service";
import { setAuthTokens } from "@/api/client";
import { createTriageSubmissionKey } from "@/clinical/triageIdempotency";
import { secureStorage } from "@/utils/storage";

describe("triage retry-safe client contract", () => {
  const originalFetch = global.fetch;
  const payload = {
    answers: { q1: 1, q2: 0 },
    assessmentType: "SELF_ASSESSMENT" as const,
    questionnaireType: "PHQ_9" as const,
  };
  const result = {
    id: "01JAZ000000000000000000001", patientId: "pat-1", assessedBy: "pat-1",
    assessmentType: "SELF_ASSESSMENT", questionnaireType: "PHQ_9",
    score: 1, hasRedFlags: false, level: "GREEN", disposition: "PENDING",
    answers: { q1: 1, q2: 0 },
    createdAt: "2026-11-16T12:00:00.000Z",
    updatedAt: "2026-11-16T12:00:00.000Z",
  };
  beforeEach(async () => {
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthTokens({ accessToken: "stub-access-token", refreshToken: "stub-refresh-token" });
  });
  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthTokens(null);
    jest.restoreAllMocks();
  });
  it("sends a stable Idempotency-Key in the HTTP header", async () => {
    const sent: string[] = [];
    global.fetch = jest.fn().mockImplementation((_url: string, init: { headers: Record<string, string> }) => {
      sent.push(init.headers["Idempotency-Key"]);
      return Promise.resolve({
        ok: true, status: 201,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => result,
      });
    });
    const key = createTriageSubmissionKey();
    const first = await triageService.submitTriage(payload, key);
    const retry = await triageService.submitTriage(payload, key);
    expect(first.id).toBe(result.id);
    expect(retry.id).toBe(result.id);
    expect(sent).toEqual([key, key]);
    expect(key.length).toBeGreaterThanOrEqual(16);
  });
  it("refuses a malformed key before sending patient answers", async () => {
    global.fetch = jest.fn();
    await expect(triageService.submitTriage(payload, "bad")).rejects.toThrow();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

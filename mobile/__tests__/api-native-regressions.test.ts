import { isTrustedDiditUrl } from "@/services/didit-kyc";
import { identityVerificationService } from "@/api/identity-verification.service";
import { patientService } from "@/api/patient.service";
import { authService } from "@/api/auth.service";

describe("Native build and API contract regressions", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it.each([
    ["https://verification.didit.me/v1/session/test", true],
    ["https://didit.me/session", true],
    ["http://verification.didit.me/session", false],
    ["https://verification.didit.me.evil.example/session", false],
    ["https://evil.example/session", false],
    ["javascript:alert(1)", false],
    ["https://user:pass@verification.didit.me/session", false],
  ])("validates Didit session URL %s", (url, trusted) => {
    expect(isTrustedDiditUrl(url)).toBe(trusted);
  });

  it("rejects malformed KYC status payloads instead of silently accepting them", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (key: string) => key === "content-type" ? "application/json" : null },
      json: async () => [],
    });
    await expect(identityVerificationService.getMyVerificationStatus()).rejects.toMatchObject({
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects malformed consultation result collections", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (key: string) => key === "content-type" ? "application/json" : null },
      json: async () => ({ data: "not-an-array" }),
    });
    await expect(patientService.getMyResults()).rejects.toMatchObject({
      error: "INVALID_RESPONSE",
    });
  });

  it("sends account deletion when a response adapter is configured", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (key: string) => key === "content-type" ? "application/json" : null },
      json: async () => ({ message: "Deletion scheduled" }),
    });
    await expect(authService.deleteAccount()).resolves.toEqual({
      message: "Deletion scheduled",
    });
    expect(global.fetch).toHaveBeenCalled();
  });
});

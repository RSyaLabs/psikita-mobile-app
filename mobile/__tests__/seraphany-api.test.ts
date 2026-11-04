import { z } from "zod";
import {
  API_BASE_URL,
  apiRequest,
  setAuthToken,
  setAuthTokens,
  getAuthToken,
  getRefreshToken,
  rotateAuthToken,
  checkBackendHealth,
  ApiError,
  noContentAdapter,
  zodAdapter,
} from "../src/api/client";
import { identityVerificationService } from "../src/api/identity-verification.service";
import { secureStorage } from "../src/utils/storage";

describe("SeraPhany API Client Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthToken(null);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthToken(null);
  });

  describe("Endpoint & Environment Configuration", () => {
    it("should default to the official SeraPhany staging Core API endpoint", () => {
      expect(API_BASE_URL).toBe("https://api.staging.seraphany.id/core");
    });
  });

  describe("Authentication Token Handling", () => {
    it("should set and retrieve auth token from secure storage", async () => {
      const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample";
      await setAuthToken(sampleToken);
      const retrieved = await getAuthToken();
      expect(retrieved).toBe(sampleToken);
    });

    it("should set and retrieve dual tokens (JWT access + ULID refresh token)", async () => {
      const sampleAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample";
      const sampleRefreshToken = "01HM34MQZ30KNDH4PAKMS9R3DH";
      await setAuthTokens({
        accessToken: sampleAccessToken,
        refreshToken: sampleRefreshToken,
      });
      const retrievedAccess = await getAuthToken();
      const retrievedRefresh = await getRefreshToken();
      expect(retrievedAccess).toBe(sampleAccessToken);
      expect(retrievedRefresh).toBe(sampleRefreshToken);
    });

    it("should clear both tokens when null is passed", async () => {
      await setAuthTokens(null);
      const retrievedAccess = await getAuthToken();
      const retrievedRefresh = await getRefreshToken();
      expect(retrievedAccess).toBeNull();
      expect(retrievedRefresh).toBeNull();
    });

    it("should return null if no token is stored", async () => {
      await setAuthToken(null);
      const retrieved = await getAuthToken();
      expect(retrieved).toBeNull();
    });
  });

  describe("Request Execution & Adapters", () => {
    it("should enforce a response adapter on apiRequest", async () => {
      await expect(
        apiRequest("/test-endpoint"),
      ).rejects.toThrow("INVALID_RESPONSE");
    });

    it("should send correct HTTP headers including Bearer token", async () => {
      const mockResponse = { data: "success", count: 1 };
      const schema = z.object({ data: z.string(), count: z.number() });

      await setAuthToken("valid-bearer-token");

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => (header === "content-type" ? "application/json" : "40"),
        },
        json: async () => mockResponse,
      });

      const result = await apiRequest("/sample", {
        adapter: zodAdapter(schema),
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/sample",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer valid-bearer-token",
          }),
        }),
      );
    });

    it("should handle 204 No Content with noContentAdapter", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
        text: async () => "",
      });

      const result = await apiRequest<void>("/action-complete", {
        skipAuth: true,
        adapter: noContentAdapter,
      });

      expect(result).toBeUndefined();
    });

    it("should throw structured ApiError when server returns error payload", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: {
          get: (name: string) => (name === "content-type" ? "application/json" : null),
        },
        json: async () => ({
          statusCode: 400,
          message: "Email atau password salah",
          error: "BAD_REQUEST",
        }),
      });

      await expect(
        apiRequest("/auth/login", {
          skipAuth: true,
          adapter: (val) => val,
        }),
      ).rejects.toThrow("Email atau password salah");
    });
  });

  describe("Backend Health Probing", () => {
    it("should return true when health check responds with 204 No Content", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => "0" },
        text: async () => "",
      });

      const healthy = await checkBackendHealth();
      expect(healthy).toBe(true);
    });

    it("should return false when health check throws a network error", async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error("ECONNREFUSED"));

      const healthy = await checkBackendHealth();
      expect(healthy).toBe(false);
    });
  });

  describe("Didit Identity Verification Service (KYC)", () => {
    it("should initiate user Didit verification session via POST /identity/verification/didit/session", async () => {
      const mockSession = {
        sessionId: "session_didit_001",
        sessionToken: "token_jwt_secret",
        url: "https://verification.didit.me/v1/session/session_didit_001",
        status: "Not Started",
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "150",
        },
        json: async () => mockSession,
      });

      const res = await identityVerificationService.startAccountVerification();
      expect(res.sessionId).toBe("session_didit_001");
      expect(res.url).toBe("https://verification.didit.me/v1/session/session_didit_001");
      expect(res.status).toBe("Not Started");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/identity/verification/didit/session",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    it("should fetch account verification status via GET /identity/verification/me", async () => {
      const mockStatus = {
        status: "APPROVED",
        verifiedAt: "2026-11-01T20:00:00.000Z",
        vendor: "DIDIT",
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "100",
        },
        json: async () => mockStatus,
      });

      const res = await identityVerificationService.getMyVerificationStatus();
      expect(res.status).toBe("APPROVED");
      expect(res.vendor).toBe("DIDIT");
    });

    it("should return default NOT_STARTED status when user has no verification record (404)", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: {
          get: (name: string) =>
            name === "content-type" ? "application/json" : null,
        },
        json: async () => ({
          statusCode: 404,
          message: "Verification record not found",
          error: "NOT_FOUND",
        }),
      });

      const res = await identityVerificationService.getMyVerificationStatus();
      expect(res).toEqual({ status: "NOT_STARTED" });
    });

    it("should initiate practitioner verification session via POST /practitioner/{id}/verify-identity", async () => {
      const mockSession = {
        sessionId: "session_prac_999",
        sessionToken: "token_practitioner",
        url: "https://verification.didit.me/v1/session/session_prac_999",
        status: "Not Started",
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "150",
        },
        json: async () => mockSession,
      });

      const res = await identityVerificationService.startPractitionerVerification(
        "prac-uuid-123",
      );
      expect(res.sessionId).toBe("session_prac_999");
      expect(res.url).toBe("https://verification.didit.me/v1/session/session_prac_999");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/practitioner/prac-uuid-123/verify-identity",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });
});

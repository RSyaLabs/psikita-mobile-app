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
import { patientService } from "../src/api/patient.service";
import { triageService } from "../src/api/triage.service";
import { secureStorage } from "../src/utils/storage";

describe("01. SeraPhany API Contracts & Network Engine Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "removeItem").mockResolvedValue(undefined);
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    await setAuthTokens(null);
  });

  afterEach(async () => {
    global.fetch = originalFetch;
    await setAuthTokens(null);
  });

  describe("API Base URL & Staging Environment", () => {
    it("should point to the official SeraPhany live staging Core API gateway", () => {
      expect(API_BASE_URL).toBe("https://api.staging.seraphany.id/core");
    });
  });

  describe("Dual Token Storage (JWT Access Token + ULID Refresh Token)", () => {
    it("should store and retrieve single access token", async () => {
      const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token1";
      await setAuthToken(sampleToken);
      expect(await getAuthToken()).toBe(sampleToken);
    });

    it("should store and retrieve dual tokens simultaneously", async () => {
      const sampleAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.jwt_access";
      const sampleRefreshToken = "01JBMW0XYZ9876543210ABCDEF"; // ULID format

      await setAuthTokens({
        accessToken: sampleAccessToken,
        refreshToken: sampleRefreshToken,
      });

      expect(await getAuthToken()).toBe(sampleAccessToken);
      expect(await getRefreshToken()).toBe(sampleRefreshToken);
    });

    it("should purge both tokens on session logout (setAuthTokens(null))", async () => {
      await setAuthTokens({
        accessToken: "sample_token",
        refreshToken: "01JBMW0XYZ9876543210ABCDEF",
      });
      await setAuthTokens(null);

      expect(await getAuthToken()).toBeNull();
      expect(await getRefreshToken()).toBeNull();
    });
  });

  describe("HTTP Request Execution & Response Adapters", () => {
    it("should reject requests that omit a response adapter", async () => {
      await expect(apiRequest("/test-endpoint")).rejects.toThrow("INVALID_RESPONSE");
    });

    it("should automatically attach Authorization Bearer header when token exists", async () => {
      const mockPayload = { id: "item-123", name: "SeraPhany Service" };
      const schema = z.object({ id: z.string(), name: z.string() });

      await setAuthToken("bearer-jwt-token-xyz");

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "50",
        },
        json: async () => mockPayload,
      });

      const response = await apiRequest("/service-item", {
        adapter: zodAdapter(schema),
      });

      expect(response).toEqual(mockPayload);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/service-item",
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer bearer-jwt-token-xyz",
          }),
        }),
      );
    });

    it("should handle 204 No Content using noContentAdapter", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => null },
        text: async () => "",
      });

      const result = await apiRequest<void>("/no-content-test", {
        skipAuth: true,
        adapter: noContentAdapter,
      });

      expect(result).toBeUndefined();
    });

    it("should parse NestJS error responses and throw strongly-typed ApiError", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: {
          get: (name: string) => (name === "content-type" ? "application/json" : null),
        },
        json: async () => ({
          statusCode: 403,
          message: "Akses ditolak: Akun belum terverifikasi Didit KYC",
          error: "FORBIDDEN",
        }),
      });

      await expect(
        apiRequest("/triage", {
          skipAuth: true,
          adapter: (val) => val,
        }),
      ).rejects.toThrow("Akses ditolak: Akun belum terverifikasi Didit KYC");
    });
  });

  describe("Backend Live Health Probe", () => {
    it("should return true when health check endpoint responds with 204 No Content", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: { get: () => "0" },
        text: async () => "",
      });

      expect(await checkBackendHealth()).toBe(true);
    });

    it("should return false when server connection fails (ECONNREFUSED)", async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error("ECONNREFUSED"));
      expect(await checkBackendHealth()).toBe(false);
    });
  });

  describe("Didit Identity Verification Service (KYC)", () => {
    it("should initiate Didit verification session via POST /identity/verification/didit/session", async () => {
      const mockSession = {
        sessionId: "session_01j7xyz_didit",
        sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.didit_token",
        url: "https://verification.didit.me/v1/session/session_01j7xyz_didit",
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

      const session = await identityVerificationService.startAccountVerification();
      expect(session.sessionId).toBe("session_01j7xyz_didit");
      expect(session.sessionToken).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.didit_token");
      expect(session.url).toBe("https://verification.didit.me/v1/session/session_01j7xyz_didit");
      expect(session.status).toBe("Not Started");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/identity/verification/didit/session",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("should retrieve verified identity data via GET /identity/verification/me", async () => {
      const mockKycStatus = {
        status: "VERIFIED",
        sessionId: "session_01j7xyz_didit",
        vendor: "DIDIT",
        identity: {
          nik: "3171012345678901",
          fullName: "Ahmad Dahlan",
          firstName: "Ahmad",
          lastName: "Dahlan",
          birthDate: "1995-08-17",
        },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "200",
        },
        json: async () => mockKycStatus,
      });

      const res = await identityVerificationService.getMyVerificationStatus();
      expect(res.status).toBe("VERIFIED");
      expect(res.identity?.nik).toBe("3171012345678901");
      expect(res.identity?.fullName).toBe("Ahmad Dahlan");
      expect(res.identity?.birthDate).toBe("1995-08-17");
    });

    it("should return default NOT_STARTED when identity record is 404 Not Found", async () => {
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
      expect(res.status).toBe("NOT_STARTED");
    });
  });

  describe("Patient Profile Creation (POST /patient)", () => {
    it("should submit validated patient profile with verified Didit identity", async () => {
      const mockPatient = {
        patientId: "pat_core_001",
        status: "ACTIVE",
        fullName: "Ahmad Dahlan",
        birthDate: "1995-08-17",
        gender: "MALE",
        phoneNumber: "081234567890",
        address: "Jl. Sudirman No. 10, Jakarta",
        medicalRecordNumber: "MRN-2026-0001",
        nik: "3171012345678901",
        bpjsNumber: "0001234567890",
        createdAt: "2026-11-05T00:00:00.000Z",
        updatedAt: "2026-11-05T00:00:00.000Z",
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "200",
        },
        json: async () => mockPatient,
      });

      const created = await patientService.createProfile({
        gender: "MALE",
        phoneNumber: "081234567890",
        address: "Jl. Sudirman No. 10, Jakarta",
        bpjsNumber: "0001234567890",
      });

      expect(created.patientId).toBe("pat_core_001");
      expect(created.fullName).toBe("Ahmad Dahlan");
      expect(created.medicalRecordNumber).toBe("MRN-2026-0001");
      expect(created.status).toBe("ACTIVE");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.staging.seraphany.id/core/patient",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            gender: "MALE",
            phoneNumber: "081234567890",
            address: "Jl. Sudirman No. 10, Jakarta",
            bpjsNumber: "0001234567890",
          }),
        }),
      );
    });
  });

  describe("Triage Assessment Service (POST /triage & GET /triage/queue)", () => {
    it("should submit patient triage assessment via POST /triage", async () => {
      const mockTriageResponse = {
        id: "trg_001",
        patientId: "pat_core_001",
        assessedBy: "usr_001",
        score: 3,
        hasRedFlags: true,
        level: "RED",
        disposition: "PENDING",
        assessmentType: "SELF_ASSESSMENT",
        answers: { question_1: "Hampir setiap hari" },
        createdAt: "2026-11-05T01:00:00Z",
        updatedAt: "2026-11-05T01:00:00Z",
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "200",
        },
        json: async () => mockTriageResponse,
      });

      const result = await triageService.submitTriage({
        score: 3,
        hasRedFlags: true,
        assessmentType: "SELF_ASSESSMENT",
        answers: { question_1: "Hampir setiap hari" },
      });

      expect(result.id).toBe("trg_001");
      expect(result.score).toBe(3);
      expect(result.hasRedFlags).toBe(true);
      expect(result.level).toBe("RED");
    });

    it("should retrieve triage queue for practitioners via GET /triage/queue", async () => {
      const mockQueue = [
        {
          id: "trg_001",
          patientId: "pat_core_001",
          assessedBy: "usr_001",
          score: 3,
          hasRedFlags: true,
          level: "RED",
          disposition: "PENDING",
          assessmentType: "SELF_ASSESSMENT",
          answers: {},
          createdAt: "2026-11-05T01:00:00Z",
          updatedAt: "2026-11-05T01:00:00Z",
        },
      ];

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) =>
            header === "content-type" ? "application/json" : "200",
        },
        json: async () => mockQueue,
      });

      const queue = await triageService.getTriageQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe("trg_001");
      expect(queue[0].level).toBe("RED");
    });
  });
});

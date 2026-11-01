import { z } from "zod";
import {
  API_BASE_URL,
  apiRequest,
  setAuthToken,
  getAuthToken,
  checkBackendHealth,
  ApiError,
  noContentAdapter,
  zodAdapter,
} from "../src/api/client";
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
});

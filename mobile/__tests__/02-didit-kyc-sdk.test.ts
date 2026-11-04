import { Linking } from "react-native";
import {
  launchDiditVerification,
  type DiditVerificationOutcome,
  type LaunchDiditOptions,
} from "@/services/didit-kyc";
import type { IdentityVerificationSessionDto } from "@/api/identity-verification.service";

// Mock Linking
jest.mock("react-native", () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
  },
}));

// Mock the Didit native SDK module
const mockStartVerification = jest.fn();
jest.mock("@didit-protocol/sdk-react-native", () => ({
  startVerification: (...args: any[]) => mockStartVerification(...args),
  VerificationStatus: {
    Approved: "Approved",
    Declined: "Declined",
    Pending: "Pending",
  },
}));

describe("02. Didit Native KYC SDK & URL Fallback Suite", () => {
  const validSession: IdentityVerificationSessionDto = {
    sessionId: "session_01j7xyz_core",
    sessionToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token",
    url: "https://verification.didit.me/v1/session/session_01j7xyz_core",
    status: "Not Started",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Method 1: Native SDK Execution (Session Token)", () => {
    it("should launch native verification and trigger onApproved when status is Approved", async () => {
      mockStartVerification.mockResolvedValueOnce({
        type: "completed",
        session: {
          sessionId: "session_01j7xyz_core",
          status: "Approved",
        },
      });

      const onApproved = jest.fn();
      const onCompleted = jest.fn();

      const outcome = await launchDiditVerification(validSession, {
        onApproved,
        onCompleted,
      });

      expect(mockStartVerification).toHaveBeenCalledWith(validSession.sessionToken);
      expect(onApproved).toHaveBeenCalledWith("session_01j7xyz_core");
      expect(onCompleted).not.toHaveBeenCalled();
      expect(Linking.openURL).not.toHaveBeenCalled();

      expect(outcome).toEqual({
        method: "native",
        status: "approved",
        sessionId: "session_01j7xyz_core",
      });
    });

    it("should handle native completion with Pending status", async () => {
      mockStartVerification.mockResolvedValueOnce({
        type: "completed",
        session: {
          sessionId: "session_01j7xyz_core",
          status: "Pending",
        },
      });

      const onCompleted = jest.fn();
      const outcome = await launchDiditVerification(validSession, { onCompleted });

      expect(onCompleted).toHaveBeenCalledWith("Pending", "session_01j7xyz_core");
      expect(outcome).toEqual({
        method: "native",
        status: "pending",
        sessionId: "session_01j7xyz_core",
      });
    });

    it("should handle native completion with Declined status", async () => {
      mockStartVerification.mockResolvedValueOnce({
        type: "completed",
        session: {
          sessionId: "session_01j7xyz_core",
          status: "Declined",
        },
      });

      const onCompleted = jest.fn();
      const outcome = await launchDiditVerification(validSession, { onCompleted });

      expect(onCompleted).toHaveBeenCalledWith("Declined", "session_01j7xyz_core");
      expect(outcome).toEqual({
        method: "native",
        status: "declined",
        sessionId: "session_01j7xyz_core",
      });
    });

    it("should handle user cancellation gracefully without opening URL", async () => {
      mockStartVerification.mockResolvedValueOnce({
        type: "cancelled",
      });

      const onCancelled = jest.fn();
      const outcome = await launchDiditVerification(validSession, { onCancelled });

      expect(onCancelled).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).not.toHaveBeenCalled();
      expect(outcome).toEqual({
        method: "native",
        status: "cancelled",
      });
    });
  });

  describe("Graceful Fallback to URL on SDK Failure or Exception", () => {
    it("should automatically fall back to session.url when native SDK returns failed status", async () => {
      mockStartVerification.mockResolvedValueOnce({
        type: "failed",
        error: {
          type: "CAMERA_PERMISSION_DENIED",
          message: "User denied camera access",
        },
      });

      const onFallbackUrlLaunched = jest.fn();
      const onError = jest.fn();

      const outcome = await launchDiditVerification(validSession, {
        onFallbackUrlLaunched,
        onError,
      });

      expect(Linking.openURL).toHaveBeenCalledWith(validSession.url);
      expect(onFallbackUrlLaunched).toHaveBeenCalledWith(validSession.url);
      expect(onError).not.toHaveBeenCalled();
      expect(outcome).toEqual({
        method: "fallback_url",
        status: "opened",
        url: validSession.url,
      });
    });

    it("should fall back to session.url when native SDK throws an unexpected exception", async () => {
      mockStartVerification.mockRejectedValueOnce(
        new Error("Native TurboModule crashed unexpectedly"),
      );

      const onFallbackUrlLaunched = jest.fn();

      const outcome = await launchDiditVerification(validSession, {
        onFallbackUrlLaunched,
      });

      expect(Linking.openURL).toHaveBeenCalledWith(validSession.url);
      expect(onFallbackUrlLaunched).toHaveBeenCalledWith(validSession.url);
      expect(outcome).toEqual({
        method: "fallback_url",
        status: "opened",
        url: validSession.url,
      });
    });

    it("should bypass native SDK and open URL directly when sessionToken is missing", async () => {
      const sessionWithoutToken: IdentityVerificationSessionDto = {
        sessionId: "session_no_token",
        sessionToken: "",
        url: "https://verification.didit.me/v1/session/fallback-only",
        status: "Not Started",
      };

      const onFallbackUrlLaunched = jest.fn();

      const outcome = await launchDiditVerification(sessionWithoutToken, {
        onFallbackUrlLaunched,
      });

      expect(mockStartVerification).not.toHaveBeenCalled();
      expect(Linking.openURL).toHaveBeenCalledWith(
        "https://verification.didit.me/v1/session/fallback-only",
      );
      expect(onFallbackUrlLaunched).toHaveBeenCalledWith(
        "https://verification.didit.me/v1/session/fallback-only",
      );
      expect(outcome).toEqual({
        method: "fallback_url",
        status: "opened",
        url: "https://verification.didit.me/v1/session/fallback-only",
      });
    });

    it("should fail gracefully when neither sessionToken nor url is provided", async () => {
      const emptySession = {
        sessionId: "session_empty",
        status: "Not Started",
      } as unknown as IdentityVerificationSessionDto;

      const onError = jest.fn();

      const outcome = await launchDiditVerification(emptySession, { onError });

      expect(mockStartVerification).not.toHaveBeenCalled();
      expect(Linking.openURL).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("sessionToken dan url tidak ditemukan"),
        }),
      );
      expect(outcome).toEqual({
        method: "failed",
        error: expect.stringContaining("sessionToken dan url tidak ditemukan"),
      });
    });
  });
});

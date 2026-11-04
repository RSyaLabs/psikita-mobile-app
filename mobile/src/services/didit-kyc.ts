import { Linking } from "react-native";
import type { IdentityVerificationSessionDto } from "@/api/identity-verification.service";

export type DiditVerificationOutcome =
  | {
      method: "native";
      status: "approved" | "pending" | "declined" | "completed";
      sessionId?: string;
    }
  | { method: "native"; status: "cancelled" }
  | { method: "fallback_url"; status: "opened"; url: string }
  | { method: "failed"; error: string };

export interface LaunchDiditOptions {
  /** Callback fired when identity is approved by Didit native SDK */
  onApproved?: (sessionId?: string) => void;
  /** Callback fired when verification is completed (may be pending or approved) */
  onCompleted?: (status: string, sessionId?: string) => void;
  /** Callback fired when user cancels native verification */
  onCancelled?: () => void;
  /** Callback fired when native verification fails and URL fallback is launched */
  onFallbackUrlLaunched?: (url: string) => void;
  /** Callback fired on irrecoverable error */
  onError?: (error: Error) => void;
}

/**
 * Safely obtain the Didit Native SDK without crashing when the TurboModule
 * is not yet compiled into the current binary (e.g. running on an older test APK).
 */
function getDiditNativeSdk(): {
  startVerification: (token: string, config?: any) => Promise<any>;
  VerificationStatus: Record<string, string>;
} | null {
  try {
    // Dynamic require so TurboModuleRegistry.getEnforcing is only evaluated on demand
    const didit = require("@didit-protocol/sdk-react-native");
    if (didit && typeof didit.startVerification === "function") {
      return didit;
    }
    return null;
  } catch (err) {
    console.warn(
      "[DiditKYC] Didit Native SDK TurboModule is not available in current binary. Fallback URL will be used.",
      err,
    );
    return null;
  }
}

/**
 * Launch Didit KYC Identity Verification.
 *
 * Implements Method 1 (Session Token) recommended for production using Didit Native React Native SDK.
 * Does NOT open external browser by default.
 * If the native SDK fails or encounters an unhandled exception or is not present in the binary,
 * it gracefully falls back to opening the session URL via Linking.openURL.
 *
 * @param session Sesi verifikasi dari backend (memiliki sessionId, sessionToken, url)
 * @param options Callback opsi untuk penanganan status
 */
export async function launchDiditVerification(
  session: IdentityVerificationSessionDto,
  options?: LaunchDiditOptions,
): Promise<DiditVerificationOutcome> {
  const token = session.sessionToken?.trim();
  const fallbackUrl = session.url?.trim();

  // 1. Coba Didit Native React Native SDK terlebih dahulu jika token tersedia
  if (token) {
    const diditSdk = getDiditNativeSdk();

    if (diditSdk) {
      try {
        const result = await diditSdk.startVerification(token);

        switch (result?.type) {
          case "completed": {
            const sessionStatus = result.session?.status;
            const sessionId = result.session?.sessionId || session.sessionId;

            if (
              sessionStatus === diditSdk.VerificationStatus?.Approved ||
              sessionStatus === "Approved"
            ) {
              options?.onApproved?.(sessionId);
              return {
                method: "native",
                status: "approved",
                sessionId,
              };
            }

            options?.onCompleted?.(sessionStatus || "completed", sessionId);
            return {
              method: "native",
              status:
                sessionStatus === diditSdk.VerificationStatus?.Declined ||
                sessionStatus === "Declined"
                  ? "declined"
                  : sessionStatus === diditSdk.VerificationStatus?.Pending ||
                      sessionStatus === "Pending"
                    ? "pending"
                    : "completed",
              sessionId,
            };
          }

          case "cancelled": {
            options?.onCancelled?.();
            return {
              method: "native",
              status: "cancelled",
            };
          }

          case "failed": {
            console.warn(
              "[DiditKYC] Native SDK verification failed:",
              result.error?.type,
              result.error?.message,
            );

            // Sesuai requirement: URL digunakan ketika terjadi masalah terhadap SDK
            if (fallbackUrl) {
              console.info(
                "[DiditKYC] Mengalihkan ke URL fallback Didit:",
                fallbackUrl,
              );
              await Linking.openURL(fallbackUrl);
              options?.onFallbackUrlLaunched?.(fallbackUrl);
              return {
                method: "fallback_url",
                status: "opened",
                url: fallbackUrl,
              };
            }

            const errMsg =
              result.error?.message || "Verifikasi identitas gagal dijalankan.";
            options?.onError?.(new Error(errMsg));
            return {
              method: "failed",
              error: errMsg,
            };
          }
        }
      } catch (sdkException: unknown) {
        console.warn(
          "[DiditKYC] Exception saat memanggil Native Didit SDK:",
          sdkException,
        );
        // Fallback ke URL jika SDK melempar exception
      }
    }
  }

  // 2. Fallback: jika SDK tidak tersedia, gagal, atau sessionToken kosong, gunakan URL
  if (fallbackUrl) {
    console.info(
      "[DiditKYC] Menggunakan URL fallback verifikasi Didit:",
      fallbackUrl,
    );
    try {
      await Linking.openURL(fallbackUrl);
      options?.onFallbackUrlLaunched?.(fallbackUrl);
      return {
        method: "fallback_url",
        status: "opened",
        url: fallbackUrl,
      };
    } catch (linkError) {
      console.error("[DiditKYC] Gagal membuka URL fallback:", linkError);
    }
  }

  const noTokenError = new Error(
    "Data sesi Didit tidak valid: sessionToken dan url tidak ditemukan.",
  );
  options?.onError?.(noTokenError);
  return {
    method: "failed",
    error: noTokenError.message,
  };
}

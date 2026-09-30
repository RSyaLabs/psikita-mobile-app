/**
 * Core fixture utilities, environment detection, and encoding helpers.
 */

export function devFixturesEnabled(
  flag: string | undefined = process.env.EXPO_PUBLIC_USE_MOCK_FALLBACK,
): boolean {
  return flag === "true";
}

export const DEV_FIXTURE_NOTICE =
  "DATA CONTOH (FIXTURE) - bukan data pasien sungguhan, hanya untuk pengembangan";

/**
 * Says plainly that the endpoint behind the screen does not exist.
 *
 * A reviewer auditing the contract cannot infer from a filled screen that the
 * endpoint behind it is absent, so the screen has to say so. This is the only
 * place that claim is made on screen; the interceptor marks the response, and
 * this marks what the person reads.
 */
export const DEV_FIXTURE_UNDOCUMENTED_NOTICE =
  "Konten di bawah ini tidak punya endpoint di kontrak backend (staging-openapi.json, 113 path). Data ini dibuat khusus untuk review dan tidak berasal dari server.";

export function fixture<T>(value: T, flag?: string): T {
  if (!devFixturesEnabled(flag)) {
    throw new Error(
      "dev fixtures requested while EXPO_PUBLIC_USE_MOCK_FALLBACK is not true",
    );
  }
  return value;
}

export function base64url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Unique per intake. A network retry reuses the key held by the triage screen;
 * a distinct complaint must generate a new key. This is not an auth secret.
 */
export function createTriageSubmissionKey(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return uuid;
  // React Native runtimes without randomUUID still need collision resistance
  // across requests; do not use this key for authentication.
  const random = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0x1_0000_0000).toString(16).padStart(8, "0"),
  ).join("");
  return `triage-${Date.now().toString(36)}-${random}`;
}

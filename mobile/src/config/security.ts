/**
 * SeraPhany Mobile - SSL/TLS Public-Key Pinning & Network Security Policy
 *
 * Implements SPKI SHA-256 Public Key Pinning for first-party Core API traffic.
 * Protects patient medical records, authentication tokens, and clinical data
 * from Man-in-the-Middle (MITM) attacks with compromised or untrusted CAs.
 */

export interface PinItem {
  digest: "SHA-256";
  spkiPin: string;
  description: string;
  type: "leaf" | "intermediate" | "root";
}

export interface DomainPinPolicy {
  hostname: string;
  environment: "staging" | "production";
  includeSubdomains: boolean;
  expiration: string;
  pins: PinItem[];
}

/**
 * First-Party Domain Pinning Catalog
 *
 * Each domain has:
 * - 1 Active Leaf Key Pin
 * - 1+ Backup Key Pins (Intermediate CA)
 * - 1 Disaster Recovery Root Pin (ISRG Root YR / ISRG Root X1)
 */
export const PINNED_DOMAINS: Record<string, DomainPinPolicy> = {
  "api.staging.seraphany.id": {
    hostname: "api.staging.seraphany.id",
    environment: "staging",
    includeSubdomains: false,
    expiration: "2027-01-01",
    pins: [
      {
        digest: "SHA-256",
        spkiPin: "P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=",
        description: "Active Leaf Key: api.staging.seraphany.id (Valid through Jan 2027)",
        type: "leaf",
      },
      {
        digest: "SHA-256",
        spkiPin: "LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=",
        description: "Backup Key 1: Let's Encrypt Intermediate YR1",
        type: "intermediate",
      },
      {
        digest: "SHA-256",
        spkiPin: "fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=",
        description: "Disaster Recovery Key: ISRG Root YR Cross-Sign",
        type: "root",
      },
      {
        digest: "SHA-256",
        spkiPin: "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
        description: "Global Root Anchor: ISRG Root X1 (Let's Encrypt)",
        type: "root",
      },
    ],
  },
  "api.seraphany.id": {
    hostname: "api.seraphany.id",
    environment: "production",
    includeSubdomains: false,
    expiration: "2027-01-01",
    pins: [
      {
        digest: "SHA-256",
        spkiPin: "1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=",
        description: "Active Leaf Key: api.seraphany.id (Valid through Jan 2027)",
        type: "leaf",
      },
      {
        digest: "SHA-256",
        spkiPin: "nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=",
        description: "Backup Key 1: Let's Encrypt Intermediate YR2",
        type: "intermediate",
      },
      {
        digest: "SHA-256",
        spkiPin: "fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=",
        description: "Disaster Recovery Key: ISRG Root YR Cross-Sign",
        type: "root",
      },
      {
        digest: "SHA-256",
        spkiPin: "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
        description: "Global Root Anchor: ISRG Root X1 (Let's Encrypt)",
        type: "root",
      },
    ],
  },
};

/**
 * Domains explicitly excluded from first-party SPKI pinning.
 * Third-party services control their own CA rotations out of our band.
 */
export const EXCLUDED_DOMAINS = [
  "verification.didit.me", // Didit KYC SDK / Flow
  "didit.me",
  "exp.host", // Expo Updates
  "expo.dev",
] as const;

/** Check if hostname is registered in first-party pinning policy */
export function isPinnedHostname(hostname: string): boolean {
  const norm = hostname.toLowerCase().trim();
  return Object.prototype.hasOwnProperty.call(PINNED_DOMAINS, norm);
}

/** Retrieve pinning policy for hostname */
export function getDomainPinPolicy(hostname: string): DomainPinPolicy | null {
  const norm = hostname.toLowerCase().trim();
  return PINNED_DOMAINS[norm] ?? null;
}

/** Check if domain is explicitly third-party excluded */
export function isExcludedDomain(hostname: string): boolean {
  const norm = hostname.toLowerCase().trim();
  return EXCLUDED_DOMAINS.some(
    (domain) => norm === domain || norm.endsWith(`.${domain}`),
  );
}

/** Sanitize network errors so no tokens, headers or sensitive URLs leak */
export function sanitizeNetworkError(error: unknown, targetUrl?: string): string {
  let hostname = "unknown-host";
  if (targetUrl) {
    try {
      hostname = new URL(targetUrl).hostname;
    } catch {
      // ignore
    }
  }

  const rawMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  // Check if error is related to certificate verification / SSL handshake failure
  const isSslFailure =
    /cert|certificate|ssl|tls|handshake|peerunverified|trustanchor|spki|pinning/i.test(
      rawMessage,
    );

  if (isSslFailure) {
    return `Koneksi aman ke ${hostname} gagal diverifikasi (SSL Pinning Failure). Permintaan dibatalkan demi keamanan data medis Anda.`;
  }

  return `Gagal menghubungi server (${hostname}). Periksa koneksi internet Anda.`;
}

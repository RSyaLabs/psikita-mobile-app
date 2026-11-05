import {
  PINNED_DOMAINS,
  EXCLUDED_DOMAINS,
  isPinnedHostname,
  isExcludedDomain,
  getDomainPinPolicy,
  sanitizeNetworkError,
} from "@/config/security";
import {
  setAndroidManifestNetworkSecurity,
  setInfoPlistPinnedDomains,
  NETWORK_SECURITY_CONFIG_XML,
  PINS,
} from "../plugins/withSslPinning";

describe("07. SSL/TLS SPKI Public-Key Pinning & Network Security Suite", () => {
  describe("Host Inventory & Scope Boundaries", () => {
    it("should enforce SPKI pinning on first-party staging and production hosts", () => {
      expect(isPinnedHostname("api.staging.seraphany.id")).toBe(true);
      expect(isPinnedHostname("api.seraphany.id")).toBe(true);
      expect(isPinnedHostname("API.STAGING.SERAPHANY.ID")).toBe(true);
    });

    it("should explicitly exclude third-party services from pinning to prevent outages", () => {
      expect(isPinnedHostname("verification.didit.me")).toBe(false);
      expect(isExcludedDomain("verification.didit.me")).toBe(true);
      expect(isExcludedDomain("didit.me")).toBe(true);
      expect(isExcludedDomain("exp.host")).toBe(true);
    });

    it("should provide complete domain policy for registered hosts", () => {
      const stagingPolicy = getDomainPinPolicy("api.staging.seraphany.id");
      expect(stagingPolicy).not.toBeNull();
      expect(stagingPolicy?.environment).toBe("staging");
      expect(stagingPolicy?.includeSubdomains).toBe(false);

      const prodPolicy = getDomainPinPolicy("api.seraphany.id");
      expect(prodPolicy).not.toBeNull();
      expect(prodPolicy?.environment).toBe("production");
    });
  });

  describe("Cryptographic SPKI Pin Policy & Backup Redundancy", () => {
    const base64Sha256Regex = /^[A-Za-z0-9+/]{43}=$/;

    it("should ensure every pinned domain has at least 3 multi-tier pins (Active + Backup + Root)", () => {
      for (const [hostname, policy] of Object.entries(PINNED_DOMAINS)) {
        expect(policy.pins.length).toBeGreaterThanOrEqual(3);

        const hasLeaf = policy.pins.some((p) => p.type === "leaf");
        const hasIntermediate = policy.pins.some((p) => p.type === "intermediate");
        const hasRoot = policy.pins.some((p) => p.type === "root");

        expect(hasLeaf).toBe(true);
        expect(hasIntermediate).toBe(true);
        expect(hasRoot).toBe(true);
      }
    });

    it("should validate that all SPKI pins match canonical 32-byte SHA-256 Base64 format", () => {
      for (const [hostname, policy] of Object.entries(PINNED_DOMAINS)) {
        for (const pin of policy.pins) {
          expect(pin.digest).toBe("SHA-256");
          expect(pin.spkiPin).toMatch(base64Sha256Regex);
          expect(pin.spkiPin.length).toBe(44);
        }
      }
    });

    it("should match active pins with verified live server certificates", () => {
      expect(PINS.stagingLeaf).toBe("P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=");
      expect(PINS.productionLeaf).toBe("1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=");
      expect(PINS.letsEncryptYR1).toBe("LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=");
      expect(PINS.letsEncryptYR2).toBe("nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=");
    });
  });

  describe("Native Android Network Security Configuration", () => {
    it("should generate compliant XML disabling cleartext traffic", () => {
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        '<domain-config cleartextTrafficPermitted="false">',
      );
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        '<base-config cleartextTrafficPermitted="false">',
      );
    });

    it("should declare pin-set with active and backup pins in Android XML", () => {
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        '<domain includeSubdomains="false">api.staging.seraphany.id</domain>',
      );
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        '<domain includeSubdomains="false">api.seraphany.id</domain>',
      );
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        `<pin digest="SHA-256">${PINS.stagingLeaf}</pin>`,
      );
      expect(NETWORK_SECURITY_CONFIG_XML).toContain(
        `<pin digest="SHA-256">${PINS.letsEncryptYR1}</pin>`,
      );
    });

    it("should inject networkSecurityConfig attribute into AndroidManifest", () => {
      const mockManifest = {
        manifest: {
          application: [
            {
              $: {
                "android:name": ".MainApplication",
              },
            },
          ],
        },
      };

      const result = setAndroidManifestNetworkSecurity(mockManifest);
      expect(
        result.manifest.application[0].$["android:networkSecurityConfig"],
      ).toBe("@xml/network_security_config");
    });
  });

  describe("Native iOS ATS NSPinnedDomains Configuration", () => {
    it("should configure NSPinnedDomains in Info.plist for Apple URLSession", () => {
      const mockInfoPlist: any = {};
      const result = setInfoPlistPinnedDomains(mockInfoPlist);

      const ats = result.NSAppTransportSecurity;
      expect(ats).toBeDefined();
      expect(ats.NSPinnedDomains).toBeDefined();

      const stagingConfig = ats.NSPinnedDomains["api.staging.seraphany.id"];
      expect(stagingConfig).toBeDefined();
      expect(stagingConfig.NSIncludesSubdomains).toBe(false);
      expect(stagingConfig.NSPinnedLeafIdentities).toEqual([
        { "SPKI-SHA256-BASE64": PINS.stagingLeaf },
      ]);
      expect(stagingConfig.NSPinnedCAIdentities).toContainEqual({
        "SPKI-SHA256-BASE64": PINS.letsEncryptYR1,
      });

      const prodConfig = ats.NSPinnedDomains["api.seraphany.id"];
      expect(prodConfig).toBeDefined();
      expect(prodConfig.NSPinnedLeafIdentities).toEqual([
        { "SPKI-SHA256-BASE64": PINS.productionLeaf },
      ]);
    });
  });

  describe("Fail-Closed Security & Information Leakage Prevention", () => {
    it("should sanitize SSL/TLS pinning errors and mask medical data or bearer tokens", () => {
      const sensitiveToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.super_secret";
      const sensitiveUrl = `https://api.staging.seraphany.id/core/patient?token=${sensitiveToken}`;
      const rawSslError = new Error(
        `javax.net.ssl.SSLPeerUnverifiedException: Certificate pinning failure! Peer cert does not match expected SPKI pin. Request: ${sensitiveUrl}`,
      );

      const sanitized = sanitizeNetworkError(rawSslError, sensitiveUrl);

      expect(sanitized).toContain("SSL Pinning Failure");
      expect(sanitized).toContain("api.staging.seraphany.id");
      expect(sanitized).not.toContain(sensitiveToken);
      expect(sanitized).not.toContain("super_secret");
      expect(sanitized).not.toContain("/core/patient");
    });

    it("should handle general network connection failure safely", () => {
      const connError = new Error("Failed to connect to host");
      const sanitized = sanitizeNetworkError(connError, "https://api.staging.seraphany.id/core");

      expect(sanitized).toContain("api.staging.seraphany.id");
      expect(sanitized).toContain("Gagal menghubungi server");
    });
  });
});

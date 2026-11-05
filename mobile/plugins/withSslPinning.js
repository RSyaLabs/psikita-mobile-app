/**
 * Expo Config Plugin: withSslPinning
 *
 * Configures native OS-level SSL/TLS SPKI Public Key Pinning:
 * 1. Android: Injects network_security_config.xml into res/xml and binds it to AndroidManifest.xml
 * 2. iOS: Configures NSPinnedDomains in Info.plist with SPKI-SHA256-BASE64 hashes
 *
 * Zero third-party native libraries required. 100% native OS enforcement.
 */

const {
  withAndroidManifest,
  withInfoPlist,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const STAGING_HOST = "api.staging.seraphany.id";
const PRODUCTION_HOST = "api.seraphany.id";

// SPKI Hashes
const PINS = {
  stagingLeaf: "P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=",
  productionLeaf: "1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=",
  letsEncryptYR1: "LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=",
  letsEncryptYR2: "nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=",
  isrgRootYR: "fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=",
  isrgRootX1: "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=",
};

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<!--
  SeraPhany Mobile - Native Android Network Security Configuration
  Enforces strict SPKI SHA-256 Public Key Pinning on first-party medical API traffic.
-->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="false">${STAGING_HOST}</domain>
        <domain includeSubdomains="false">${PRODUCTION_HOST}</domain>
        <pin-set expiration="2027-01-01">
            <!-- Active Key: ${STAGING_HOST} (Leaf) -->
            <pin digest="SHA-256">${PINS.stagingLeaf}</pin>
            <!-- Active Key: ${PRODUCTION_HOST} (Leaf) -->
            <pin digest="SHA-256">${PINS.productionLeaf}</pin>
            <!-- Backup Key 1: Let's Encrypt Intermediate YR1 -->
            <pin digest="SHA-256">${PINS.letsEncryptYR1}</pin>
            <!-- Backup Key 2: Let's Encrypt Intermediate YR2 -->
            <pin digest="SHA-256">${PINS.letsEncryptYR2}</pin>
            <!-- Disaster Recovery Key: ISRG Root YR -->
            <pin digest="SHA-256">${PINS.isrgRootYR}</pin>
            <!-- Global Root Anchor: ISRG Root X1 -->
            <pin digest="SHA-256">${PINS.isrgRootX1}</pin>
        </pin-set>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
`;

/**
 * Android Manifest Modifier
 */
function setAndroidManifestNetworkSecurity(androidManifest) {
  const application = androidManifest.manifest.application?.[0];
  if (application) {
    application.$["android:networkSecurityConfig"] =
      "@xml/network_security_config";
  }
  return androidManifest;
}

/**
 * iOS Info.plist Modifier
 */
function setInfoPlistPinnedDomains(infoPlist) {
  const ats = infoPlist.NSAppTransportSecurity || {};

  ats.NSPinnedDomains = {
    ...(ats.NSPinnedDomains || {}),
    [STAGING_HOST]: {
      NSIncludesSubdomains: false,
      NSPinnedLeafIdentities: [
        { "SPKI-SHA256-BASE64": PINS.stagingLeaf },
      ],
      NSPinnedCAIdentities: [
        { "SPKI-SHA256-BASE64": PINS.letsEncryptYR1 },
        { "SPKI-SHA256-BASE64": PINS.isrgRootYR },
        { "SPKI-SHA256-BASE64": PINS.isrgRootX1 },
      ],
    },
    [PRODUCTION_HOST]: {
      NSIncludesSubdomains: false,
      NSPinnedLeafIdentities: [
        { "SPKI-SHA256-BASE64": PINS.productionLeaf },
      ],
      NSPinnedCAIdentities: [
        { "SPKI-SHA256-BASE64": PINS.letsEncryptYR2 },
        { "SPKI-SHA256-BASE64": PINS.isrgRootYR },
        { "SPKI-SHA256-BASE64": PINS.isrgRootX1 },
      ],
    },
  };

  infoPlist.NSAppTransportSecurity = ats;
  return infoPlist;
}

function withSslPinning(config) {
  // 1. Android Manifest
  config = withAndroidManifest(config, (config) => {
    config.modResults = setAndroidManifestNetworkSecurity(config.modResults);
    return config;
  });

  // 2. Android Resource XML (network_security_config.xml)
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const resXmlDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      if (!fs.existsSync(resXmlDir)) {
        fs.mkdirSync(resXmlDir, { recursive: true });
      }
      const targetXmlPath = path.join(resXmlDir, "network_security_config.xml");
      fs.writeFileSync(targetXmlPath, NETWORK_SECURITY_CONFIG_XML, "utf-8");
      return config;
    },
  ]);

  // 3. iOS Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults = setInfoPlistPinnedDomains(config.modResults);
    return config;
  });

  return config;
}

module.exports = withSslPinning;
module.exports.setAndroidManifestNetworkSecurity =
  setAndroidManifestNetworkSecurity;
module.exports.setInfoPlistPinnedDomains = setInfoPlistPinnedDomains;
module.exports.NETWORK_SECURITY_CONFIG_XML = NETWORK_SECURITY_CONFIG_XML;
module.exports.PINS = PINS;

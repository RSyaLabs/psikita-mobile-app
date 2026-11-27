# SSL/TLS SPKI Pinning & Certificate Rotation Runbook — RLN-17

## 1. First-Party Scope
- **Pinned Hosts** (`includeSubdomains: false`):
  - `api.staging.seraphany.id`
  - `api.seraphany.id`
- **Excluded Third-Party Hosts**: `verification.didit.me`, `didit.me`, `exp.host`, `expo.dev` (managed out-of-band by external CAs).
- **Enforcement**:
  - Android: `mobile/plugins/withSslPinning.js` -> `network_security_config.xml` (`cleartextTrafficPermitted="false"`, `android:allowBackup="false"`, `pin-set expiration="2027-01-01"`).
  - iOS: `Info.plist` `NSAppTransportSecurity.NSPinnedDomains` (`NSPinnedLeafIdentities` + `NSPinnedCAIdentities`).

## 2. Active & Backup Pins (SHA-256 Base64 SPKI)
- `api.staging.seraphany.id` leaf: `P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=`
- `api.seraphany.id` leaf: `1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=`
- Backup Intermediate CA (LE YR1): `LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=`
- Backup Intermediate CA (LE YR2): `nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=`
- Disaster Recovery Root (ISRG Root YR): `fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=`
- Global Anchor Root (ISRG Root X1): `C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=`

## 3. Rotation & Emergency Recovery Procedure
1. **Verify Live SPKI Before Rotation**:
   ```bash
   echo | openssl s_client -servername api.seraphany.id -connect api.seraphany.id:443 2>/dev/null \
     | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
     | openssl dgst -sha256 -binary | openssl enc -base64
   ```
2. **Overlap Window**: Keep both the active Let's Encrypt intermediate/root anchors (`YR1`, `YR2`, `ISRG Root X1`) and the new leaf pin in `mobile/src/config/security.ts` and `mobile/plugins/withSslPinning.js` BEFORE expiring/replacing old leaf certs.
3. **Emergency Lockout Recovery**: Update `PINS` + extend `expiration` date in `withSslPinning.js` and `security.ts`, run `npx jest __tests__/07-ssl-spki-pinning.test.ts`, and issue an expedited native release build via EAS.

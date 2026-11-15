# Kebijakan Keamanan SSL/TLS SPKI Public-Key Pinning — SeraPhany Mobile

## 1. Ringkasan Eksekutif & Latar Belakang
Pada aplikasi medis dan telekonsultasi kesehatan mental seperti SeraPhany (PsiKita), perlindungan data rekam medis, asesmen triase psikologis, serta token autentikasi pasien dan praktisi merupakan prioritas tertinggi.

Koneksi HTTPS standar hanya memvalidasi bahwa sertifikat server diterbitkan oleh Certificate Authority (CA) yang dipercaya oleh sistem operasi perangkat. Namun, pendekatan ini memiliki kerentanan:
- **Rogue / Compromised CA**: Sertifikat palsu dapat diterbitkan oleh CA publik yang disusupi.
- **Corporate / Malicious MITM Proxy**: Sertifikat root lokal yang sengaja ditanamkan pada perangkat uji/pengguna (misal: Charles Proxy, Fiddler, Burp Suite) dapat mendekripsi dan membaca seluruh lalu lintas API sensitif.

Untuk meniadakan risiko tersebut, SeraPhany menerapkan **SPKI (Subject Public Key Info) SHA-256 Public-Key Pinning** pada lapisan sistem operasi (OS-level) Android dan iOS.

---

## 2. Inventaris Jaringan & Batasan Cakupan (Scope Boundaries)

### A. First-Party Host (Wajib SPKI Pinning)
Seluruh endpoint API milik SeraPhany yang mentransmisikan kredensial, token autentikasi, data identitas (NIK), rekam medis, dan catatan sesi konseling klinis wajib di-pin:

| Hostname | Lingkungan | Port | Protokol | Status Pinning |
| :--- | :--- | :--- | :--- | :--- |
| `api.staging.seraphany.id` | Staging / QA | 443 | TLS 1.3 / HTTPS | **ENFORCED (Fail-Closed)** |
| `api.seraphany.id` | Produksi | 443 | TLS 1.3 / HTTPS | **ENFORCED (Fail-Closed)** |

### B. Third-Party Services (Dikecualikan Secara Eksplisit)
Domain pihak ketiga tidak boleh di-pin secara sembarangan karena rotasi kunci/CA pihak ketiga berada di luar kendali SeraPhany. Kegagalan rotasi third-party akan menyebabkan *app outage*:

| Hostname / Service | Tujuan | Alasan Pengecualian |
| :--- | :--- | :--- |
| `verification.didit.me` | Didit KYC Identity SDK | Rotasi kunci dikelola langsung oleh infrastruktur Didit. |
| `didit.me` | Didit Platform | Rotasi edge CDN pihak ketiga. |
| `exp.host` / `expo.dev` | Expo Updates & EAS | Manajemen sertifikat internal Expo infrastructure. |

Kebijakan ini diisolasi dan diuji secara otomatis pada [`mobile/src/config/security.ts`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/src/config/security.ts).

---

## 3. Arsitektur Penegakan Native OS (Zero Bypass)

SeraPhany memilih penegakan berbasis **OS-Level Native Security Configuration** yang dikelola melalui Expo Config Plugin reproducible ([`mobile/plugins/withSslPinning.js`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/plugins/withSslPinning.js)):

```
       [ React Native JavaScript Layer (fetch / apiRequest) ]
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │             Native OS Network Engine                   │
      │   Android: OkHttpClient    │    iOS: NSURLSession      │
      └───────────────────────────┬────────────────────────────┘
                                  │
             ┌────────────────────┴────────────────────┐
             ▼                                         ▼
   [ Android Network Security ]              [ Apple App Transport ]
    res/xml/network_security_config.xml       Info.plist: NSPinnedDomains
             │                                         │
             ▼                                         ▼
   ┌───────────────────────────────────────────────────────────┐
   │         SPKI SHA-256 Public Key Pin Verification          │
   │  - Validasi kecocokan Leaf Key                            │
   │  - Fallback ke Intermediate CA (YR1 / YR2)                │
   │  - Fail-Closed: Tolak koneksi bila tidak cocok            │
   └───────────────────────────────────────────────────────────┘
```

### 1. Android (`network_security_config.xml`)
Dikonfigurasi pada [`mobile/android/app/src/main/res/xml/network_security_config.xml`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/android/app/src/main/res/xml/network_security_config.xml) dan dihubungkan ke `AndroidManifest.xml`:
```xml
<application android:networkSecurityConfig="@xml/network_security_config" ...>
```
* **Mencegah Bypass**: Karena diikat di tingkat `<application>`, seluruh koneksi dari `OkHttpClient` (yang mendasari `fetch` React Native), `HttpURLConnection`, maupun library native apa pun secara otomatis melewati verifikasi `pin-set`.
* **Cleartext Traffic**: Dinonaktifkan secara global (`cleartextTrafficPermitted="false"`).
* **Fail-Safe Expiration**: Diberikan atribut `expiration="2027-01-01"` sesuai standar Android Network Security Config untuk mencegah aplikasi versi sangat lama ter-brick permanen jika ada rotasi darurat.

### 2. iOS (`Info.plist: NSPinnedDomains`)
Dikonfigurasi melalui `NSAppTransportSecurity.NSPinnedDomains` pada [`mobile/app.json`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/app.json):
```json
"NSPinnedDomains": {
  "api.staging.seraphany.id": {
    "NSIncludesSubdomains": false,
    "NSPinnedLeafIdentities": [{ "SPKI-SHA256-BASE64": "P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=" }],
    "NSPinnedCAIdentities": [
      { "SPKI-SHA256-BASE64": "LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=" },
      { "SPKI-SHA256-BASE64": "fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=" },
      { "SPKI-SHA256-BASE64": "C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=" }
    ]
  }
}
```
* Terintegrasi langsung dengan `URLSession` bawaan iOS.

### 3. Batasan Platform Web & Expo Go
- **Platform Web**: Browser modern secara standar keamanan W3C melarang kontrol SPKI pinning manual via JavaScript client untuk mencegah *denial-of-service* lokal.
- **Expo Go**: Expo Go menggunakan runtime binary bersama milik Expo, sehingga pengujian pinning native hanya valid pada **Development Build (`npx expo run:android`)** atau **Production EAS Release Build**.

---

## 4. Hirarki Multi-Tier SPKI Hashes & Redundansi

Setiap host yang di-pin menerapkan redundansi 3 tingkat (*Active + Backup + Root*) sehingga rotasi sertifikat berkala tidak memutus akses pengguna:

### A. Host Staging (`api.staging.seraphany.id`)
1. **Tier 1 (Active Leaf Key)**:
   * Subject: `CN=api.staging.seraphany.id`
   * SHA-256 SPKI: `P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=`
   * Validitas: Hingga 25 Januari 2027 GMT
2. **Tier 2 (Backup Intermediate CA)**:
   * Subject: `C=US, O=Let's Encrypt, CN=YR1`
   * SHA-256 SPKI: `LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=`
3. **Tier 3 (Disaster Recovery Root & Anchor)**:
   * Intermediate Cross-Sign: `ISRG Root YR` (`fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=`)
   * Global Anchor: `ISRG Root X1` (`C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=`)

### B. Host Produksi (`api.seraphany.id`)
1. **Tier 1 (Active Leaf Key)**:
   * Subject: `CN=api.seraphany.id`
   * SHA-256 SPKI: `1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=`
   * Validitas: Hingga 25 Januari 2027 GMT
2. **Tier 2 (Backup Intermediate CA)**:
   * Subject: `C=US, O=Let's Encrypt, CN=YR2`
   * SHA-256 SPKI: `nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=`
3. **Tier 3 (Disaster Recovery Root & Anchor)**:
   * Intermediate Cross-Sign: `ISRG Root YR` (`fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=`)
   * Global Anchor: `ISRG Root X1` (`C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=`)

---

## 5. Kebijakan Fail-Closed & Pencegahan Kebocoran Informasi

Ketika verifikasi pin gagal (misal terdapat MITM proxy dengan sertifikat palsu):
1. **Fail-Closed**: Sinyal TLS langsung diputus di tingkat soket OS (`SSLPeerUnverifiedException`). Tidak ada fallback diam-diam ke HTTP biasa atau HTTPS tanpa pinning.
2. **Sanitasi Error**: Fungsi [`sanitizeNetworkError()`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/src/config/security.ts) membersihkan pesan kegagalan:
   - Menghapus URL query params, bearer token, atau data rekam medis yang mungkin terikut pada raw stack trace.
   - Menampilkan pesan aman kepada pengguna:
     > *"Koneksi aman ke [hostname] gagal diverifikasi (SSL Pinning Failure). Permintaan dibatalkan demi keamanan data medis Anda."*

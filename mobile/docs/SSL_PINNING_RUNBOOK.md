# 🔐 SeraPhany Mobile — SSL/TLS SPKI Public-Key Pinning Runbook

> **Standard Operating Procedure (SOP)**: Kebijakan, Arsitektur, dan Prosedur Rotasi/Pemulihan Darurat *Subject Public Key Info (SPKI)* Pinning untuk Lalu Lintas Jaringan Mobile SeraPhany.

---

## 1. Ringkasan Eksekutif & Model Ancaman (Threat Model)

Aplikasi mobile **SeraPhany** memproses data medis pasien, riwayat konsultasi psikiatri, hasil asesmen triase klinis, dan token autentikasi sensitif (JWT & ULID). 

### Ancaman yang Dimitigasi oleh SPKI Pinning:
- **Compromised CA (Certificate Authority)**: Pencegahan serangan Man-in-the-Middle (MITM) jika salah satu CA publik di root store sistem operasi disusupi atau mengeluarkan sertifikat palsu.
- **Rogue / Malicious User Root Certificates**: Pada perangkat Android/iOS yang terinfeksi malware, perangkat perusahaan dengan profile MDM yang memasang CA inspeksi, atau perangkat yang di-root/jailbreak, OS melarang koneksi API SeraPhany jika kunci publik SPKI tidak cocok dengan daftar pin resmi.
- **DNS Hijacking & ARP Spoofing**: Pengalihan trafik jaringan ke server palsu yang menggunakan sertifikat valid dari CA lain akan langsung ditolak pada tahap handshake TLS.

### Hal yang Tidak Dimitigasi oleh Pinning:
- Penyerang yang memiliki akses fisik root dan melakukan *runtime hook* (misal: Frida / Objection) pada memori biner aplikasi (mitigasi dilakukan terpisah melalui proteksi integritas aplikasi dan tamper detection).
- Kerentanan pada lapisan aplikasi di luar transport (misal: kebocoran token akibat logging lokal yang ceroboh).

---

## 2. Inventaris Domain & Sidik Jari Kunci Publik (SPKI Hashes)

### A. Host First-Party yang Dipin
Pinning diterapkan secara ketat pada endpoint first-party Core API:

| Hostname | Lingkungan | Tipe Kunci | SPKI SHA-256 (Base64) | Subjek / Penerbit |
| :--- | :--- | :--- | :--- | :--- |
| **`api.staging.seraphany.id`** | Staging | **Active Leaf** | `P9iVMQF9vLKRGFBRcT/77fQmruQ5q+zmQOKlXhzhK2E=` | `CN=api.staging.seraphany.id` (Let's Encrypt YR1) |
| | | **Backup 1 (Intermediate)** | `LoMHBotttiDko50Gi13uXW71eIy7LAttI+rYT8wXF4w=` | `CN=YR1, O=Let's Encrypt` |
| | | **Disaster Recovery (Root)** | `fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=` | `CN=Root YR, O=ISRG` |
| | | **Global Anchor (Root)** | `C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=` | `CN=ISRG Root X1` |
| **`api.seraphany.id`** | Produksi | **Active Leaf** | `1HoIDzRO5kbuc/rwwT7/7X1oO690J66kUARG1O4J1Ns=` | `CN=api.seraphany.id` (Let's Encrypt YR2) |
| | | **Backup 1 (Intermediate)** | `nWN7PSep5XDQdge5zK24CnCRXHr3KvzhKEGxsdqCX9E=` | `CN=YR2, O=Let's Encrypt` |
| | | **Disaster Recovery (Root)** | `fk6IOKit1ild5647BH06ujSIq5XbCgqlbYl6ANhhi88=` | `CN=Root YR, O=ISRG` |
| | | **Global Anchor (Root)** | `C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=` | `CN=ISRG Root X1` |

### B. Domain Pihak Ketiga yang Sengaja Dikecualikan
Sesuai prinsip kehati-hatian arsitektur, domain pihak ketiga **TIDAK DIPIN** karena siklus rotasi sertifikat berada di luar kendali SeraPhany:
- **`verification.didit.me` / `didit.me`**: SDK Didit KYC menangani enkripsi dan verifikasi identitas secara otonom.
- **Expo Update & Asset CDNs (`exp.host`, `expo.dev`)**: Mengandalkan WebPKI standar.

---

## 3. Arsitektur Native OS & Mekanisme Transport

SeraPhany mengimplementasikan pinning pada level native sistem operasi melalui **Expo Config Plugin (`plugins/withSslPinning.js`)**:

### Android (API 24+)
- **Mekanisme**: Android Network Security Configuration (`res/xml/network_security_config.xml`).
- **Enforcement**: Diaktifkan melalui atribut `android:networkSecurityConfig="@xml/network_security_config"` pada `AndroidManifest.xml`.
- **Cakupan**: Otomatis melindungi seluruh request `fetch()`, `OkHttpClient`, `HttpURLConnection`, dan WebView tanpa memerlukan jembatan JS.
- **Aturan Fail-Closed**: `cleartextTrafficPermitted="false"` diberlakukan secara global. Jika SPKI tidak cocok, OS Android memutus koneksi dengan melempar `SSLPeerUnverifiedException`.

### iOS (iOS 14+)
- **Mekanisme**: Apple App Transport Security (ATS) `NSPinnedDomains`.
- **Enforcement**: Dikonfigurasi deklaratif pada `Info.plist` melalui `expo.ios.infoPlist` dan modifier plugin.
- **Cakupan**: Otomatis ditegakkan oleh `NSURLSession` pada seluruh network networking React Native.

### Batasan Web Platform (React Native Web)
Pada browser web, standar keamanan W3C melarang kode JavaScript untuk menginspeksi atau mem-pin SPKI sertifikat TLS (mekanisme HPKP lama telah dihapus oleh Google & Mozilla demi mencegah *Self-DOS*). Web mengandalkan standar WebPKI modern, HSTS preloading, dan Certificate Transparency (CT).

---

## 4. Prosedur Operasional Rotasi Kunci (Standard Overlap Protocol)

Rotasi sertifikat TLS server tanpa koordinasi dapat mengakibatkan aplikasi mobile versi lama terkunci (*bricked/outage*). Tim DevOps dan Mobile **WAJIB** mengikuti protokol overlap 60 hari berikut:

```
[Tahap 1: T-60 Hari]                [Tahap 2: T-30 Hari]             [Tahap 3: Hari H]              [Tahap 4: T+30 Hari]
DevOps generate CSR & Key Baru  ───► Rilis Update Mobile App ───► Deploy Sertifikat Baru  ───► Hapus Pin Lama di
Ambil SPKI Hash Kunci Baru           Memuat Pin Lama + Pin Baru      ke Reverse Proxy/Traefik       Rilis Update App Berikutnya
```

### Langkah Teknis:
1. **Ekstraksi SPKI Kunci Baru**:
   Sebelum sertifikat baru diterbitkan atau dideploy, ekstrak hash SPKI SHA-256 dari file CSR atau Public Key:
   ```bash
   openssl req -in server.csr -noout -pubkey | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
   ```
2. **Pembaruan Konfigurasi Mobile**:
   Tambahkan hash baru ke dalam `mobile/plugins/withSslPinning.js`, `mobile/network_security_config.xml`, `mobile/app.json`, dan `mobile/src/config/security.ts`.
3. **Rilis Aplikasi ke Store**:
   Rilis versi aplikasi baru yang membawa **kedua pin** (Pin Kunci Lama + Pin Kunci Baru).
4. **Deploy Sertifikat ke Server**:
   Setelah persentase adopsi pengguna aktif pada versi baru mencapai target aman (minimal 3-4 pekan), deploy sertifikat baru ke reverse proxy (Traefik/Nginx).
5. **Retirement**:
   Pada siklus rilis berikutnya, hapus pin lama yang sudah tidak aktif.

---

## 5. Prosedur Pemulihan Darurat (Emergency Recovery Runbook)

### Skenario: Kunci Privat Server Bocor atau Sertifikat Berubah Tak Terduga
Jika sertifikat server terpaksa diganti mendadak tanpa sempat merilis update aplikasi:
1. **Perlindungan Multi-Tier Backup Pin**:
   Aplikasi SeraPhany tidak hanya mem-pin *leaf certificate*, melainkan juga mem-pin **Intermediate CA (Let's Encrypt YR1/YR2)** dan **ISRG Root YR / ISRG Root X1**.
   - Jika *leaf certificate* berganti kunci namun tetap diterbitkan oleh Let's Encrypt (YR1/YR2), **koneksi aplikasi tetap 100% aman dan berjalan lancar** karena rantai sertifikat cocok dengan backup pin intermediate!
2. **Jika Penerbit CA Terpaksa Berganti**:
   - Manfaatkan saluran darurat EAS Update / OTA untuk mengunduh bundle konfigurasi runtime terbaru.
   - Siapkan rilis darurat hotfix ke Google Play Console & Apple App Store dengan status *Critical Security Update*.
   - Pasang banner di web/aplikasi yang mengarahkan pengguna untuk segera memperbarui aplikasi ke versi terbaru.

---

## 6. Perintah Verifikasi & Audit Kunci Langsung

Untuk memverifikasi sidik jari SPKI dari server aktif kapan saja:

```bash
# 1. Verifikasi Staging Core API
echo | openssl s_client -servername api.staging.seraphany.id -connect api.staging.seraphany.id:443 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64

# 2. Verifikasi Production Core API
echo | openssl s_client -servername api.seraphany.id -connect api.seraphany.id:443 2>/dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

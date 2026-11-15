# Runbook Operasional: Rotasi Kunci SSL/TLS & Emergency Disaster Recovery

Dokumen ini memuat prosedur standar operasional (SOP) untuk tim **Mobile Engineering** dan **DevOps / Infrastructure Engineering** dalam mengelola siklus rotasi sertifikat TLS dan penanganan insiden darurat tanpa memicu *service disruption* atau penguncian pengguna (*app lockout*).

---

## 1. Alat Ekstraksi SPKI SHA-256 Pin

Sebelum sertifikat baru dipasang di server backend, hash SPKI (Subject Public Key Info) wajib diekstraksi.

### Cara 1: Ekstraksi dari File Sertifikat (`.crt` / `.pem`)
```bash
openssl x509 -in certificate.pem -noout -pubkey \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

### Cara 2: Ekstraksi dari Certificate Signing Request (`.csr`)
```bash
openssl req -in request.csr -noout -pubkey \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

### Cara 3: Ekstraksi Langsung dari Endpoint Aktif (Audit)
```bash
openssl s_client -connect api.seraphany.id:443 -servername api.seraphany.id -showcerts </dev/null 2>/dev/null \
  | openssl x509 -noout -pubkey \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

---

## 2. Prosedur Rotasi Terencana (Overlap Pinning Strategy)

Untuk mencegah pengguna lama terkunci saat sertifikat server diganti, **dilarang keras** mengganti sertifikat di server sebelum aplikasi mobile yang memuat pin baru dirilis.

### Jadwal & Timeline Rotasi (Siklus 4 Minggu)

```
[ Minggu -4 ] Infra generate CSR & Kunci Baru (Key-B)
      │
      ▼
[ Minggu -3 ] Mobile menambahkan Pin Key-B ke aplikasi (Key-A + Key-B aktif)
      │
      ▼
[ Minggu -2 ] Rilis Aplikasi Mobile ke Play Store / App Store
      │
      ▼
[ Minggu 0 ] Monitoring adopsi > 85%, Infra menukar sertifikat server ke Key-B
      │
      ▼
[ Minggu +4 ] Mobile menghapus Pin Key-A pada versi rilis berikutnya
```

### Langkah Kerja Detail:

1. **Persiapan Kunci Baru (DevOps/Infra)**:
   * Buat key pair dan CSR baru untuk domain terkait (`api.seraphany.id`).
   * Ekstraksi SPKI SHA-256 hash dari CSR tersebut (misal menghasilkan `PIN_BARU_BASE64`).
   * Serahkan hash tersebut ke tim Mobile minimal **4 minggu** sebelum tanggal kedaluwarsa sertifikat lama.

2. **Pembaruan Konfigurasi Mobile (Mobile Team)**:
   * Buka [`mobile/plugins/withSslPinning.js`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/plugins/withSslPinning.js) dan [`mobile/src/config/security.ts`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/src/config/security.ts).
   * Tambahkan `PIN_BARU_BASE64` ke dalam daftar pin (kedua pin lama dan baru ada bersamaan).
   * Perbarui [`mobile/android/app/src/main/res/xml/network_security_config.xml`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/android/app/src/main/res/xml/network_security_config.xml) dan [`mobile/app.json`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/app.json).
   * Jalankan `npm test` untuk memastikan semua uji validasi pinning lulus.

3. **Distribusi Rilis & Pemantauan**:
   * Rilis versi aplikasi baru ke Google Play Store dan Apple App Store.
   * Pantau persentase adopsi pengguna melalui analitik atau dashboard konsol aplikasi.
   * Setelah mayoritas pengguna (>85%) memperbarui aplikasi, beri lampu hijau kepada tim Infra.

4. **Aplikasi Sertifikat Baru di Server (DevOps/Infra)**:
   * Terapkan sertifikat baru pada Nginx / Ingress Controller / Reverse Proxy.
   * Uji koneksi dari aplikasi versi lama (masih kompatibel berkat Intermediate/Backup Pin) dan versi baru (langsung mencocokkan Leaf Pin baru).

---

## 3. Prosedur Emergency Recovery (Penanganan Insiden Darurat)

### Skenario 1: Private Key Leaf Server Terkompromi atau Rusak
* **Kondisi**: Server harus segera mengganti sertifikat leaf hari ini juga tanpa sempat merilis update aplikasi.
* **Solusi**: 
  Karena konfigurasi pinning SeraPhany menyertakan **Backup Pin Intermediate CA** (`Let's Encrypt YR1` / `YR2`), tim Infra cukup menerbitkan sertifikat baru di bawah Intermediate CA yang sama.
  Aplikasi mobile yang terpasang akan tetap memvalidasi koneksi dengan sukses (*zero downtime*).

### Skenario 2: Intermediate CA Mengalami Revocation
* **Kondisi**: Intermediate CA dicabut secara global.
* **Solusi**:
  Aplikasi memiliki pin darurat tingkat ketiga: **ISRG Root YR** dan **ISRG Root X1**.
  Terbitkan sertifikat dengan rantai validasi langsung ke root anchor tersebut.

### Skenario 3: Seluruh Pin Tidak Cocok (Worst-Case Lockout)
* **Kondisi**: Sertifikat baru dipasang dengan CA yang sama sekali berbeda dan tidak ada pin yang cocok.
* **Penanganan Android**:
  Konfigurasi [`network_security_config.xml`](file:///home/tarisrizki/Projects/serapany/psikita-mobile-app/mobile/android/app/src/main/res/xml/network_security_config.xml) memiliki pengaman batas waktu:
  `<pin-set expiration="2027-01-01">`
  Jika tanggal sistem melewati tanggal tersebut, Android secara otomatis melonggarkan verifikasi pinning dan kembali ke validasi trust anchor sistem reguler.
* **Hotfix Release**:
  * Segera deploy hotfix aplikasi melalui EAS Update / Play Store In-App Updates.
  * Tampilkan pesan ramah pengguna melalui sanitasi error: *"Pembaruan aplikasi diperlukan untuk melanjutkan koneksi aman."*

---

## 4. Checklist Koordinasi Tim

| Tahapan | Tim Bertanggung Jawab | Checklist |
| :--- | :--- | :--- |
| H-30 Hari | DevOps / Infra | - Buat CSR baru<br>- Ekstraksi SPKI hash<br>- Kirim tiket ke tim Mobile |
| H-20 Hari | Mobile | - Tambahkan pin baru ke `withSslPinning.js` & `security.ts`<br>- Verifikasi `npm test`<br>- Submit build ke Play Store & App Store |
| H-5 Hari | Bersama | - Evaluasi tingkat adopsi rilis baru<br>- Jadwalkan *maintenance window* pertukaran sertifikat |
| Hari H | DevOps / Infra | - Pasang sertifikat di Ingress/Proxy<br>- Uji koneksi live dengan `openssl s_client`<br>- Verifikasi tidak ada error TLS di log aplikasi |

# Audit Backend `core-api:v1.0.5-staging`

**Tanggal:** 26 September 2026
**Metode:** 138 operasi dari `staging-openapi.json` (method + body sesuai spec, token admin valid), plus uji keamanan langsung, plus inspeksi source di dalam container, plus log server.
**Server:** `40.83.76.31` / `rakazo-azure` / Ubuntu 24.04 / Docker 29.1.3

---

## Ringkasan

138 operasi diuji. **38 membalas HTTP 500.** Dari log server, semua bisa ditelusuri ke **5 root cause** yang spesifik. Di luar itu, 5 temuan keamanan dan konfigurasi.

**Tidak ada kebocoran data antar-pasien.** Model otorisasi bekerja benar.

---

## BAGIAN 1 — Bug yang terkonfirmasi

### 1.1 Provider tidak terdaftar di DI container (3 modul)

```
Nest could not find PrescriptionResourceLoader element (this provider does not exist in the current context)
Nest could not find NoteResourceLoader element         (this provider does not exist in the current context)
Nest could not find ReferralResourceLoader element     (this provider does not exist in the current context)
```

Stack: `InstanceLinksHost.get` → `GuardsConsumer.tryActivate` → `router-execution-context.js:146`

| Provider                     | Modul          |
| ---------------------------- | -------------- |
| `PrescriptionResourceLoader` | `prescription` |
| `NoteResourceLoader`         | `consultation` |
| `ReferralResourceLoader`     | `referral`     |

**Akar:** guard meng-`@Inject` provider yang tidak terdaftar di array `providers` modul.
**Dampak:** setiap request ke route dengan `:id` di 3 modul itu balas 500. Bukan hanya ID salah — selalu.
**Bukti pembeda:** `GET /prescriptions` (tanpa `:id`) → 200 normal.

### 1.2 Unhandled TypeError (3 endpoint)

| Endpoint                                     | Galat                                                          |
| -------------------------------------------- | -------------------------------------------------------------- |
| `POST /webhooks/payment`                     | `Cannot read properties of undefined (reading 'order_id')`     |
| webhook payout                               | `Cannot read properties of undefined (reading 'reference_no')` |
| `GET /ledger/accounts/{accountId}/statement` | `Cannot read properties of undefined (reading 'findAndCount')` |

**Akar:** properti dibaca tanpa null-check. Handler webhook juga gagal **sebelum** cek signature, jadi verifikasi signature tidak pernah tercapai.

### 1.3 CQRS handler tidak terdaftar (3 endpoint)

```
Error: No handler found for the command:
```

- `POST /iam/{userId}/activate`
- `POST /iam/{userId}/deactivate`
- `POST /cdss/rules`

**Akar:** controller mendaftarkan route, modul tidak mendaftarkan `CommandHandler`/`QueryHandler`.

### 1.4 Query ke properti yang tidak ada

```
Error: Trying to query by not existing property TransactionLineOrmEntity.postedAt
```

Kolom `postedAt` tidak ada di entitas. Query selalu gagal.

### 1.5 Integrasi eksternal belum dikonfigurasi

```
DELETE /avatar/me  -> 500  "Fail to delete file in GCS:"
```

`GCS_API_ENDPOINT` dan `GCS_VAULT_BUCKET` kosong di `.env`.

---

## BAGIAN 2 — Keamanan

### 2.1 Tidak ada rate limit di login — **TINGGI**

12 percobaan dengan password salah, username format valid:

```
401 401 401 401 401 401 401 401 401 401 401 401
```

Nol `429`. Brute force tidak dibatasi sama sekali.

### 2.2 CORS memantulkan origin sembarang + kredensial — **TINGGI**

```
Origin: https://evil.example     ->  Access-Control-Allow-Origin: https://evil.example
Origin: https://random-site.xyz  ->  Access-Control-Allow-Origin: https://random-site.xyz
Origin: null                     ->  Access-Control-Allow-Origin: null
```

Dikombinasikan dengan `Access-Control-Allow-Credentials: true` dan `Vary: Origin` (terlihat di log respons). Butuh allowlist explicit.

### 2.3 Body 300KB membalas 500, bukan 413 — **SEDANG**

```
POST /auth/password/login dengan payload 300KB  ->  500
```

Seharusnya ditolak di body parser dengan `413`. Sekarang bisa dipakai sebagai vektor DoS.

### 2.4 14 env var kosong

```
SATUSEHAT_CLIENT_ID, SATU_SEHAT_CLIENT_SECRET, SATU_SEHAT_ORGANIZATION_ID
BPJS_BRIDGE_API_KEY, BPJS_FACILITY_ID, BPJS_BRIDGE_SIGNING_SECRET
DUKCAPIL_BASE_URL
WEBRTC_TURN_URLS, WEBRTC_TURN_SECRET, WEBRTC_TURN_USERNAME, WEBRTC_TURN_CREDENTIAL
GOOGLE_CLIENT_ID
MAIL_USER, MAIL_PASSWORD
```

Fitur yang bergantung pada semuanya akan gagal. `/health/dependencies` melaporkan `satu_sehat: disabled` karena ini.

### 2.5 `SUPER_ADMIN_PASSWORD` masih placeholder

Nilai masih `change_this_password`, dan **dipakai bersama oleh 4 akun seed** (hash bcrypt identik di `iam.auth_methods`). Password ini juga tertulis di dokumen serah-terima QA.

---

## BAGIAN 3 — Yang sudah benar (tidak perlu dikomplain)

| Area                         | Bukti                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| **Tidak ada IDOR**           | Pasien A membaca profil pasien B → `404`. Profil sendiri → `200`. |
| **Otorisasi berbasis peran** | Token pasien ke `/prescriptions` dan `/payments` → `403`          |
| **JWT secret**               | ≥ 32 karakter                                                     |
| **JWT expiry**               | access `1h`, refresh `7d`                                         |
| **SQL injection**            | `'; DROP TABLE` → `404`, aman                                     |
| **Validasi payload**         | 422 `One or more fields failed validation` (72×)                  |
| **Pesan not-found**          | `X not found: <id>` — jelas dan benar                             |
| **Endpoint sensitif**        | `/posts`, `/avatar/me` tanpa token → `401`                        |
| **Health check**             | `/health/dependencies` → `503`, bukan 500                         |
| **Role di JWT**              | `{sub, sid, email, role, isActive, iat, exp}`                     |

### Catatan desain yang perlu dikonfirmasi

`TokenResponseDto` hanya punya `accessToken` dan `refreshToken`. Role sengaja ditaruh di dalam payload JWT — pola _stateless auth_ yang wajar. **Tidak ada endpoint `role` yang perlu ditambahkan.**

---

## BAGIAN 4 — Kondisi data

51 tabel, **11 baris** total.

```
matching_requests   4      consultations          0
triage_records      4      payments               0
practitioners       2      billing_orders         0
patients            1      ledger_accounts        0
                           journal_entries        0
                           prescriptions          0
                           referrals              0
                           satu_sehat_syncs       0
                           messages               0
```

**`ledger_accounts` = 0** berarti tidak ada sumber saldo untuk layar penarikan. Klceil tidak bisa diuji tanpa data.

Kondisi akun:

```
ADMIN_LOCAL      ADMIN         aktif
dr_andi_pratama  PSYCHIATRIST  practitioners: PENDING / INACTIVE
dr_rina_amelia   PSYCHOLOGIST  practitioners: PENDING / INACTIVE
siti_rahayu      USER          patients: PENDING_MANUAL_REVIEW
```

---

## BAGIAN 5 — Koreksi atas klaim sebelumnya

Catatan ini penting agar tidak ada laporan yang salah.

| Klaim saya                           | Kenyataan                                                        |
| ------------------------------------ | ---------------------------------------------------------------- |
| "Butuh endpoint `role` dari backend" | **Salah.** Role sudah ada di payload JWT.                        |
| "`/health/dependencies` balas 500"   | **Salah.** Itu `503`.                                            |
| "`/iam` dan `/webhooks` balas 500"   | **Artefak probe saya** — saya pakai HTTP method yang salah.      |
| "17 env var kosong"                  | **6 di antaranya false positive** alat ukur saya. Yang benar 14. |
| "Akun probe sudah saya bersihkan"    | **Salah** — `probe_ignore_me` masih ada. Sekarang sudah dihapus. |

---

## Yang perlu diputuskan

**Prioritas 1 (data sensitif):**

- Rate limit di login
- CORS allowlist
- Body size limit

**Prioritas 2 (fungsi rusak):**

- 3 `ResourceLoader` di `providers`
- 3 CQRS handler
- 3 unhandled TypeError
- `TransactionLineOrmEntity.postedAt`
- 14 env var kosong

**Prioritas 3 (bersih-bersih):**

- Ganti `SUPER_ADMIN_PASSWORD`
- Hapus kredensial dari dokumen QA

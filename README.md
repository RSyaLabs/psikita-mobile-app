# PsiKita

Mobile telehealth client for mental-health consultation, built with Expo Router,
NativeWind v4 and Gluestack UI v5. Runs on iOS, Android and the web from one codebase.

Three roles share the app: patients book and attend consultations, practitioners
run their practice, admins verify practitioners and reconcile the ledger.

---

## Screens

All 39 screens, captured from a running demo build. Everything below is fixture
data, not real patient records — every screen in the app carries a permanent
`DATA CONTOH (FIXTURE)` banner while demo mode is on.

### Entry

|                                                  |                                           |
| ------------------------------------------------ | ----------------------------------------- |
| ![Screen catalog](docs/screenshots/launcher.png) | ![Login](docs/screenshots/auth-login.png) |
| Screen catalog, 38 screens across all roles      | Login with username or Google             |

### Patient — 22 screens

|                                                  |                                                     |
| ------------------------------------------------ | --------------------------------------------------- |
| ![Dashboard](docs/screenshots/pat-dashboard.png) | ![Doctor catalog](docs/screenshots/pat-doctors.png) |
| Home, mood check-in, resume session              | Browse and filter practitioners                     |

|                                                           |                                                |
| --------------------------------------------------------- | ---------------------------------------------- |
| ![Doctor profile](docs/screenshots/pat-doctor-detail.png) | ![Checkout](docs/screenshots/pat-checkout.png) |
| Practitioner profile, schedule, fee                       | Order summary before payment                   |

|                                            |                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------- |
| ![Triage](docs/screenshots/pat-triage.png) | ![Assessment result](docs/screenshots/pat-assessment-result.png) |
| GAD-7 self-screening                       | Screening result                                                 |

|                                                      |                                                |
| ---------------------------------------------------- | ---------------------------------------------- |
| ![Payment](docs/screenshots/pat-payment-regular.png) | ![BPJS](docs/screenshots/pat-payment-bpjs.png) |
| QRIS and virtual account                             | BPJS entitlement check                         |

|                                             |                                                    |
| ------------------------------------------- | -------------------------------------------------- |
| ![Chat](docs/screenshots/pat-chat-room.png) | ![Video call](docs/screenshots/pat-video-call.png) |
| Consultation room                           | In-session video                                   |

|                                                      |                                            |
| ---------------------------------------------------- | ------------------------------------------ |
| ![Overtime](docs/screenshots/pat-overtime-modal.png) | ![Rating](docs/screenshots/pat-rating.png) |
| Extend the session                                   | Rate the session                           |

|                                              |                                                      |
| -------------------------------------------- | ---------------------------------------------------- |
| ![History](docs/screenshots/pat-history.png) | ![Summary](docs/screenshots/pat-session-summary.png) |
| Consultation history                         | SOAP session summary                                 |

|                                                        |                                                |
| ------------------------------------------------------ | ---------------------------------------------- |
| ![Prescription](docs/screenshots/pat-prescription.png) | ![Referral](docs/screenshots/pat-referral.png) |
| Digital prescription with QR                           | SATUSEHAT hospital referral                    |

|                                                |                                                            |
| ---------------------------------------------- | ---------------------------------------------------------- |
| ![Articles](docs/screenshots/pat-articles.png) | ![Article detail](docs/screenshots/pat-article-detail.png) |
| Mental-health education                        | Article detail                                             |

|                                              |                                                        |
| -------------------------------------------- | ------------------------------------------------------ |
| ![Profile](docs/screenshots/pat-profile.png) | ![Edit profile](docs/screenshots/pat-edit-profile.png) |
| Profile and medical record number            | Edit identity, NIK, birth date                         |

|                                                          |                                                |
| -------------------------------------------------------- | ---------------------------------------------- |
| ![Notifications](docs/screenshots/pat-notifications.png) | ![Matching](docs/screenshots/pat-matching.png) |
| Notification centre                                      | Triase matching radar                          |

### Practitioner — 9 screens

|                                                   |                                                 |
| ------------------------------------------------- | ----------------------------------------------- |
| ![Dashboard](docs/screenshots/prac-dashboard.png) | ![War room](docs/screenshots/prac-war-room.png) |
| Practice dashboard, online toggle                 | Claim incoming triage requests                  |

|                                         |                                                   |
| --------------------------------------- | ------------------------------------------------- |
| ![Chat](docs/screenshots/prac-chat.png) | ![Diagnosis](docs/screenshots/prac-diagnosis.png) |
| Consultation chat and quick SOAP        | ICD-10 finalisation, SATUSEHAT RME                |

|                                               |                                                 |
| --------------------------------------------- | ----------------------------------------------- |
| ![History](docs/screenshots/prac-history.png) | ![Withdraw](docs/screenshots/prac-withdraw.png) |
| Session history                               | Wallet and withdrawal                           |

|                                                         |                                               |
| ------------------------------------------------------- | --------------------------------------------- |
| ![Bank account](docs/screenshots/prac-bank-account.png) | ![Profile](docs/screenshots/prac-profile.png) |
| Payout bank details                                     | Profile, fees, practice hours                 |

|                                                 |     |
| ----------------------------------------------- | --- |
| ![Register](docs/screenshots/prac-register.png) |     |
| Practitioner registration, STR and SIPP         |     |

### Admin — 4 screens

|                                                    |                                                          |
| -------------------------------------------------- | -------------------------------------------------------- |
| ![Dashboard](docs/screenshots/admin-dashboard.png) | ![Verification](docs/screenshots/admin-verification.png) |
| Platform overview                                  | Verify STR, SIPP and diplomas                            |

|                                              |                                                  |
| -------------------------------------------- | ------------------------------------------------ |
| ![Ledger](docs/screenshots/admin-ledger.png) | ![Settings](docs/screenshots/admin-settings.png) |
| Transactions and claims                      | Platform settings and user management            |

### Auth

|                                                               |                                                  |
| ------------------------------------------------------------- | ------------------------------------------------ |
| ![Forgot password](docs/screenshots/auth-forgot-password.png) | ![Register](docs/screenshots/auth-register.jpeg) |
| Password reset by OTP                                         | Patient registration                             |

---

## Running it

```sh
cd mobile
npm install
npx expo start --web --port 8081
```

For native targets run `npx expo start` and press `i` or `a`.

### Demo mode

The app runs with no backend, which is how the UI is meant to be reviewed:

```sh
# mobile/.env
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_USE_MOCK_FALLBACK=true
```

Fixtures live in `mobile/src/config/fixtures/` and are served by an interceptor in
`mobile/src/api/client.ts`. Every invented response is logged with a greppable
`[DEV-FIXTURE]` marker. Both flags must be off in a production build; `eas.json`
pins `false` for both on the `production` profile.

Web sessions are kept in memory only and never written to browser storage, so a
reload signs you out.

---

## Architecture

```
mobile/app/          route screens, grouped by role (patient, practitioner, admin, auth)
mobile/src/api/      service layer, one module per domain, zod-validated responses
mobile/src/config/   demo gate, capability map, fixture router
mobile/src/hooks/    react-query hooks, one file per domain
mobile/src/components/ui/   Gluestack wrappers
staging-openapi.json the contract of record, 113 paths
```

**Capability map.** `src/config/capabilities.ts` declares which features have a
real server endpoint. `assertCapabilityLive` refuses a money write when the
capability is not live, so a screen cannot present a simulated success as a real
settlement.

**Strict response parsing.** Schemas reject a response that is missing a
contract-required field instead of inventing a value, so an absent `items` array
fails loudly rather than rendering as an empty prescription.

---

## Known blockers

1. **No usable HTTPS deployment.** Staging answers over plain HTTP on a public
   host, which the client refuses by design.
2. **CORS does not allow this app.** The server allows `localhost:3000`; the
   mobile dev server runs on 8081 and the backend template says 5173.
3. **The backend's ADMIN role cannot read clinical data.** `GET /patient` returns
   500 and `/patient/me`, `/practitioner` and `/prescriptions` return 403 for lack
   of a `read` permission.
4. **`checkBackendHealth()` cannot report a healthy backend.** The contract
   declares `/health/live` as returning no content, the server returns a 15-byte
   body, and `noContentAdapter` rejects it.

Because of 1 to 3, **no response schema has been verified against a live payload.**
Every schema in `src/api/` is statically consistent with the contract, which is a
weaker claim than verified.

---

## Known UI issues

- Disabled buttons are faded rather than labelled, so some unavailable actions
  read as broken, and on one screen the primary CTA looks tappable and is not.
- Backend and QA notices accumulate on top of real content; on four screens the
  entire screen is contract language.
- Empty states are top-aligned rather than centred, leaving most of the viewport
  blank.
- A missing `<h1>` on every page.

A fuller visual review is in `docs/VISUAL-REVIEW-2026-09-30.md`.

---

## Repository layout

| Path                   |                                              |
| ---------------------- | -------------------------------------------- |
| `mobile/`              | the Expo app                                 |
| `docs/`                | audits, review records and screenshots       |
| `staging-openapi.json` | the deployed contract, 113 paths             |
| `jsonapi/`             | an older dated contract, for the older audit |
| `ui/psikitaDesain.pen` | design source file                           |

`AGENTS.md` documents the provider-order rule, the verification gate and the
cross-platform text-prop convention.

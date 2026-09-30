# PsiKita Mobile

A mobile telehealth client for mental-health consultation, built with Expo Router,
NativeWind v4 and Gluestack UI v5, talking to the Psikita Core API.

---

## Status

The client is functionally complete across 39 screens and its contract compliance is
audited. It is **not yet integrated with a live backend** — see
[Known blockers](#known-blockers).

Verification state on the current commit:

| Gate                             | Result                                      |
| -------------------------------- | ------------------------------------------- |
| `npx tsc --noEmit --incremental` | 0 errors                                    |
| `npm run test:ci`                | 54 suites / 473 tests, exit 0               |
| `node scripts/endpoint-audit.js` | 32 of 32 endpoints match the contract       |
| `node scripts/token-contrast.js` | 0 WCAG AA failures across 11 token pairings |
| Browser render, 39 routes        | 0 crashes                                   |

---

## Running it

```sh
cd mobile
npm install
npx expo start --web --port 8081
```

Native targets work the same way: `npx expo start`, then press `i` / `a`.

### Demo mode

The app can run with no backend at all, which is how the UI is meant to be reviewed:

```sh
# mobile/.env
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_USE_MOCK_FALLBACK=true
```

A permanent banner reads `DATA CONTOH (FIXTURE)` on every screen while this is on. The
fixtures are served from `src/config/fixtures/` by an interceptor in
`src/api/client.ts`, and every invented response is logged with a greppable
`[DEV-FIXTURE]` marker. Paths absent from the contract are additionally logged as
`UNDOCUMENTED`.

**Both flags must be off in a production build.** `eas.json` pins `false` for both on the
`production` profile. Web tokens are deliberately kept in memory only and are never written
to browser storage — a reload therefore signs you out.

### Auditing the contract

```sh
node scripts/endpoint-audit.js      # path + method against staging-openapi.json
OPENAPI_PATH=../staging-openapi.json npx tsx scripts/contract-audit.ts
node scripts/token-contrast.js      # WCAG AA over the palette in global.css
```

---

## Architecture

```
app/                    39 route screens (expo-router groups: patient, practitioner, admin, auth)
src/api/                service layer — one module per domain, zod-validated responses
src/config/             demo gate, capability map, fixture router
src/hooks/queries/      react-query hooks, one file per domain
src/components/ui/      Gluestack wrappers
src/types/api.ts        DTO types
staging-openapi.json    the contract of record (113 paths)
```

**The capability map** (`src/config/capabilities.ts`) declares which features have a real
server endpoint. `assertCapabilityLive` refuses a money write when the capability is not
live, so a screen cannot quietly present a simulated success as a settlement.

**Response parsing is strict by default.** Schemas reject a response missing a
contract-required field rather than inventing a value for it — an absent `items` array
fails loudly instead of rendering as a prescription with zero medications.

---

## Known blockers

These are the things that are genuinely unfinished, stated plainly.

1. **No usable HTTPS deployment.** Staging answers over plain HTTP on a public host, which
   the client refuses by design. There is no HTTPS deployment at all.
2. **CORS does not allow this app.** The running server returns
   `Access-Control-Allow-Origin: http://localhost:3000`; the mobile dev server is on 8081
   and the backend env template says 5173. Nothing matches.
3. **The backend's ADMIN role cannot read clinical data.** `GET /patient` returns 500;
   `/patient/me`, `/practitioner` and `/prescriptions` all return 403 for lack of a `read`
   permission. A CASL fix recorded on 26 September reached a local Docker image, not the
   deployed staging.
4. **`checkBackendHealth()` cannot report a healthy backend.** The contract declares
   `/health/live` as returning no content; the server returns a 15-byte body; the client's
   `noContentAdapter` rejects any non-empty body and the error is swallowed. See
   `docs/CONTRACT-AUDIT-2026-09-30.md`.

Because of 1–3, **no response schema has been verified against a live payload.** Every
schema in `src/api/` has been compared against the contract and is statically consistent
with it, which is a weaker claim than verified.

---

## Repository layout

| Path                   |                                                          |
| ---------------------- | -------------------------------------------------------- |
| `mobile/`              | the Expo app                                             |
| `docs/`                | audits and review records                                |
| `staging-openapi.json` | the deployed contract, 113 paths                         |
| `jsonapi/`             | an older dated contract, kept for the older audit script |
| `ui/psikitaDesain.pen` | design source file                                       |

`docs/screenshots/` and `.uxaudit/` are generated and git-ignored: the screenshots render
fixture values that read as real medical identifiers, so they do not travel with the repo.

---

## Known UI issues

A full visual review is in `docs/VISUAL-REVIEW-2026-09-30.md`. The load-bearing ones:

- Disabled buttons are faded rather than labelled, so several unavailable actions read as
  broken, and on one screen the primary CTA looks tappable and is not.
- Backend/QA notices accumulate on top of real content; on four screens the entire screen
  is contract language.
- Empty states are top-aligned rather than centred, leaving 30–75% of the viewport blank.
- A missing `<h1>` on every page, per the accessibility audit.

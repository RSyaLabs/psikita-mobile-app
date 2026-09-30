# PsiKita Production Readiness: Verified State and Remaining Work

**Date:** 2026-09-29
**Branch:** `fix/mobile-production-demo`
**Scope:** frontend only. This document records what has been proven, what has not, and
what must happen before the app can go to production with little further revision.
**Status:** one open test failure and one backend request outstanding.

## 1. Verified baseline

Executed, not assumed. These are the numbers to reproduce:

| Check      | Command                                    | Result                      |
| ---------- | ------------------------------------------ | --------------------------- |
| Typecheck  | `npx tsc --noEmit --incremental`           | 0 errors                    |
| Tests      | `npx jest --ci --forceExit --maxWorkers=2` | 48 suites, 47 pass, 1 fail  |
| Test count | same                                       | 371 tests, 370 pass, 1 fail |

`--forceExit` is required because `payment-flow.test.tsx` does not terminate. That hang is
pre-existing and is not caused by any change recorded in this document.

The last fully green baseline before this work was 49 suites and 368 tests. The count
changed because one decorative suite was deleted and several behavioural tests were added,
not because coverage was traded away.

## 2. Contract of record

The checked-in `staging-openapi.json` is **structurally identical** to the running backend:
113 paths and 138 operations on both sides, with no additions or removals in either
direction. This was verified by extracting the OpenAPI document inlined in the Scalar page
served at `GET /reference` on the live host, then comparing every method-plus-path pair.

`/reference` is the contract of record for this deployment. It is not served at `/docs`,
`/openapi.json`, or any other conventional path, all of which return HTTP 404. The document
is embedded in a JavaScript `createApiReference` call rather than served as standalone JSON.

Backend image in use: `core-api:v1.0.5-staging`, pulled from Google Artifact Registry.

## 3. Defects found and fixed, with the check that proves each

Every item below was found by reading or by running, and every one is listed with what
proves it. None is a matter of opinion.

### 3.1 A token could be restored after sign-out

`getAuthToken` in `client.ts` had its `readEpoch` capture placed after the
`await secureStorage.getItem` call, which made the epoch comparison always true and silently
defeated the guard that detects a logout happening during an in-flight storage read.

Found only by running the suite. `client-race.test.ts` failed with `Expected null, Received
"old-session"`. Restored the capture before the read; that suite is now 4 of 4.

**This is the reason the strict-run instruction mattered.** No amount of reading or
typechecking would have caught it.

### 3.2 A testability seam moved without the tests moving

Consolidating the capability check into `assertCapabilityLive` moved the guard's internal
`getCapability` call from a cross-module property access to a local binding, so
`jest.spyOn(capabilities, "getCapability")` stopped reaching it. Three payment suites were
mocking capability state and silently stopped exercising the gate.

Resolved by moving the seam to `assertCapabilityLive`, the gate the payment module actually
calls, with a helper that throws the real `ApiError` so no part of the failure table is
duplicated between suites. The guard's own decision logic is covered in
`config/capabilities.test.ts`.

### 3.3 Fabricated data rendered on a live screen

`practitioner/history.tsx` held a module-level array of three invented practitioners with
real-looking clinical notes, ICD-10 codes and a GAD-7 score, rendered as if they were a real
record. The same file carried a hardcoded date strip of 4 to 8 September with a default
selection, and a subtitle claiming a 96 percent completion rate. All removed rather than
reworded, because the endpoint returns no day grouping and any strip would be another
invented calendar.

`admin/ledger.tsx` carried the literal heading `Jurnal Mutasi - 8 Sep 2026` and
`practitioner/withdraw.tsx` carried `September 2024 - Dicairkan tiap Jumat`, where neither
the month nor the Friday payout weekday was ever confirmed with the backend. Both now derive
their period from the rows the server actually returned.

The three card fields that cannot be filled truthfully are labelled `Belum tersedia`, because
`ConsultationResponseDto` exposes participants by id and role only and carries no display
name, no ICD code and no note.

### 3.4 A client refusal that blamed the backend incorrectly

`notes.service.ts` stated that the contract had no note-finalization action. It does:
`POST /consultation/note/{noteId}/finalize` returns 200 with a `NoteResponseDto`, 404 for an
unknown note and 409 when already locked. The method was implemented against it, with 409
mapped to a distinct `NOTE_ALREADY_FINALIZED` code so a caller can treat an already-locked
note as a state rather than a failure worth retrying.

It remains unwired on purpose. Finalizing is irreversible, so a caller must show the
practitioner what will be locked and ask for confirmation first, and no such screen exists.

### 3.5 The remaining accessibility and duplication work

Mood chips conveyed selection by colour alone and now expose `accessibilityState.selected`.
The triage CTA announced `Asesmen belum tersedia` while being fully enabled and routing to
matching; the override was removed so the visible label is the accessible name. Fifteen
redundant TanStack Query options were deleted, and `getErrorMetadata` no longer disagrees
with itself about whether `statusCode` is a string or a number. `getInitials` replaced five
inline slices. `accessibilityLevel` is now passed to headings, which the installed
`@expo/html-elements` omits on native. `ReducedMotionConfig` makes every Reanimated animation
honour the platform setting. SecureStore failures now throw instead of returning null, so a
transient Keystore error can no longer be read as a signed-out session.

## 4. The one open failure

`payment-flow.test.tsx` :: `does not automatically retry a rejected BPJS POST`

Established: `isServerPaymentContext` trusts only values carrying the brand applied by the
private `mintServerPaymentContext`. The shared `testServerContext` in that file is a plain
object cast with `as any`, so the service is never reached. The `waitFor` on `isError` never
becomes true, so the mutation does not settle into the error state and the call count cannot
be observed.

Not established: why the mutation does not settle once the predicate is bypassed.

Three attempts were made and all were reverted rather than left in place: branding the
shared fixture, which fixed this test and broke six others that rely on the unbranded object
to exercise the rejection path, and stubbing the predicate per test, which had no effect.

**The correct fix** is two fixtures: a branded one built through the same path production
uses, and a deliberately unbranded one, with every call site re-derived so each test states
which gate it exercises. That is a fixture redesign. Partially swapping the shared fixture is
what caused the six-test regression.

## 5. Backend requests, with the evidence for each

We are the frontend team. The following are not ours to decide or operate.

### 5.1 An https base URL, blocking

`mobile/.env` sets `EXPO_PUBLIC_API_BASE_URL=https://api.lambada.my.id`. That host returns
HTTP 000 after a 12 second timeout, verified with curl. The only live staging is
`http://staging.psikita.muammarzaki.tech:3000`, which returns HTTP 200, and port 443 on that
host returns HTTP 000.

The app cannot simply be pointed at the live staging. `assertApiUrl` in `client.ts:157`
throws `INSECURE_API_URL` for any non-https URL whose hostname is not loopback, and
`isLocalHostname` accepts only `localhost`, `*.localhost`, `127.0.0.1`, `::1` and `0.0.0.0`.
That guard is correct and must stay: a bearer token sent in cleartext to a public host is
exposed to any network observer, and this app carries mental-health intake data.

**Needed:** an https base URL for `EXPO_PUBLIC_API_BASE_URL`.

### 5.2 Do the missing patches exist in v1.0.5?

The Azure VM that carried `practitioner.dao.js`, `psychologist-profile.orm-entity.js`,
`practitioner.module.js` and the migrations directory is gone, and those files were
bind-mounted into the container from `/home/azureuser/`. The backend bug report documents the
first two as fixes for known defects.

**Needed:** confirmation that `core-api:v1.0.5-staging` already contains those fixes, or a
rebuild that does. The dated audit of v1.0.5 does not mention any of the three files, so it
neither confirms nor denies.

### 5.3 A consultation list with a patient display name

The contract has no `GET /practations/me/consultations`, and `/consultations` defines only
`post`. `GET /consultation` is a different resource, returning consultation notes. No schema
carries a patient display name.

**Needed:**

```
GET /practitioner/me/consultations
  -> { id, status, startedAt, finishedAt, durationMinutes, patientDisplayName }
```

Without `patientDisplayName` the practitioner history screen cannot show who was consulted.

### 5.4 An endpoint to send a message

`/rooms/{roomId}/messages` defines `get` only. There is no endpoint to post a message, so a
consultation room where neither party can type is not a usable product. This is the most
consequential gap.

**Needed:** `POST /rooms/{roomId}/messages`.

## 6. Ownership boundary

The live staging is not this repository's deployment. Its response headers include eight
that no file in this repository sets, and omit the `Content-Security-Policy` the root Caddyfile
does set, so it is not fronted by that Caddy. The three overlapping headers carry the values
`helmet.js` uses by default, consistent with a NestJS backend emitting its own hardening
middleware. The backend image is pulled from Google Artifact Registry, so leaving Azure does
not affect the image source.

The self-hosted path was removed as dead: `docker-compose.azure.yml`, the root `Caddyfile` and
`deploy/Caddyfile.lambada` all pointed at a machine that no team owned. All three existed in
HEAD and were deleted. The backend image pin in `docker-compose.yml` still reads
`v1.0.2-staging` and is three versions behind; that file belongs to the backend team and was
not modified.

## 7. Acceptance for production

1. The open test in section 4 is resolved by the two-fixture redesign and the suite is 48 of 48.
2. `npm run test:ci` runs without `--forceExit`, meaning the `payment-flow.test.tsx` hang is
   fixed rather than worked around.
3. An https base URL is supplied and the cleartext guard is still byte-identical.
4. The two backend endpoints in 5.3 and 5.4 exist, and the practitioner history screen
   renders real data with no `Belum tersedia` placeholder for the patient name.
5. The eleven capability claims in `config/capabilities.ts` are re-verified against the
   contract of the deployed version. One of them, `finalizeNote`, was already found stale and
   corrected, which is the reason this is an explicit gate rather than an assumption.

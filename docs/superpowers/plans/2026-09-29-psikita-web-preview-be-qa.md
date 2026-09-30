# Plan: Web Preview for BE and QA Review

**Date:** 2026-09-29
**Spec:** `docs/superpowers/specs/2026-09-29-psikita-web-preview-be-qa-design.md`
**Branch:** `fix/mobile-production-demo`
**Status:** BLOCKED on the backend CORS change (spec section 3.2)

**No verification gates run in this phase, by explicit user instruction.** The
tasks below that would normally end in `npx tsc --noEmit` and `npm run test:ci`
are marked accordingly. They are deferred, not skipped, and the phase is not
declared done until they run in a later phase.

## Blocked on the backend

The staging API returns `Access-Control-Allow-Origin: http://localhost:3000` for
every origin, including an unrelated one. A browser will refuse the response, so
no amount of mobile-side configuration makes the preview work. The backend team
must widen that allowlist first.

Confirming the fix is one read-only request: send an `OPTIONS` with the intended
`Origin` and check that the returned `Access-Control-Allow-Origin` matches it.
That check does not need the mobile gates and can be done immediately once the
backend responds.

## Task 0 — Decide the serving shape (no code)

Answer spec Q2 and Q3, and record them in the spec.

- Serving: local `expo start --web` behind a tunnel, or `expo export --platform
web` to static hosting.
- Demo mode: on or off for this review.

Output: the exact origin reviewers will load, and the exact
`EXPO_PUBLIC_DEMO_MODE` value. Both are inputs to task 1 and to the backend CORS
entry.

**Gate:** none. This is a decision, not a change.

## Task 1 — Point the local environment at staging (no commit)

In `mobile/.env`, which is gitignored, set:

```
EXPO_PUBLIC_API_BASE_URL=http://staging.psikita.muammarzaki.tech:3000
```

Set `EXPO_PUBLIC_DEMO_MODE` to the value decided in task 0. Keep the existing
integration credentials untouched and never move them into a committed file.

While in that file, remove the dead `EXPO_PUBLIC_USE_MOCK_FALLBACK` line. No code
reads it, and `docs/QA_HANDOVER.md:232` still prescribes it, which is how it
survived.

**Gate:** none in this phase. Confirm only that `git status` still shows no
staged change to `mobile/.env`.

## Task 2 — Write the reviewer note (no code)

A short note, in the repository or handed over directly, containing:

- the URL pattern reviewers will open
- that the backend API is plain http and why, stated plainly
- that the preview is internal and not production-ready
- that the app intentionally refuses cleartext for non-local hosts, so the
  staging host is reachable only because the preview is served from localhost
- what works and what is not yet implemented
- the date the preview is valid, so a stale URL is obvious

**Gate:** none.

## Task 3 — Start the preview and hand over (no code)

Run the command agreed in task 0 and confirm the page loads. The acceptance
signal is a successful API call from the browser, visible in the network tab as a
`200` on `/health/ready`, not merely a page that renders.

If the page renders but every request fails, the cause is the CORS blocker in
task "Blocked on the backend", not a defect in the app. Say so rather than
debugging the app.

**Gate:** none in this phase.

## Task 4 — Close the tunnel (operational, not code)

Once review is finished, shut the tunnel down. A live tunnel publishes a
reachable app carrying real staging credentials in request headers.

**Gate:** confirm the public URL no longer resolves.

## Deferred verification

These run in a later phase, when the user lifts the no-testing instruction. They
are not satisfied by anything in this plan.

```sh
npx tsc --noEmit --incremental
npm run test:ci
```

Known outstanding state at the time of writing, carried forward honestly:

- The full `test:ci` has not been run since the last test edit. The three
  modified test files pass individually and typecheck reports 0 errors, but the
  suite as a whole is unverified.
- `mobile/__tests__/payments/payment-flow.test.tsx` hangs without `--forceExit`.
  This was proven pre-existing by running the HEAD version of that file, not
  introduced by current work. Cause is still unidentified.

## Out of scope

- APK, IPA, or any native build
- Any change to `assertApiUrl` or the cleartext guard
- TLS provisioning on the staging host, which is a separate infra task and is
  still blocked because nothing listens on port 443
- Backend or CORS changes from this repository

## Stop conditions

- The backend has not widened the CORS allowlist: do not start task 3. Report
  the exact observed header and move nothing.
- A task would require touching `assertApiUrl` or the `production` build profile:
  stop. Both are invariants in the spec.
- Anyone asks for the preview to reach a non-staging host: stop and confirm in
  writing first.

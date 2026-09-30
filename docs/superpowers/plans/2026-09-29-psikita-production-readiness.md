# Plan: PsiKita Production Readiness

**Date:** 2026-09-29
**Spec:** `docs/superpowers/specs/2026-09-29-psikita-production-readiness-design.md`
**Scope:** frontend only. Tasks 1 to 3 are ours. Tasks 4 to 6 are backend requests and are
tracked, not performed.
**Baseline to preserve:** 48 suites, 47 passing, 1 failing; 371 tests, 370 passing, 1
failing; typecheck 0 errors.

## Task 0 — Record the baseline

**Why first:** every later task is judged against this, and the numbers must be reproducible
rather than remembered.

```sh
cd mobile
npx tsc --noEmit --incremental
npx jest --ci --forceExit --maxWorkers=2 --json --outputFile=$TMPDIR/baseline.json
```

Expected: typecheck 0 errors, 48 suites, 47 passing, 1 failing.

**Done when** the JSON summary matches the spec's section 1. It already does.

## Task 1 — Two fixtures for the payment suite

**Why:** this is the one open failure, and three attempts to patch it in place each made
things worse. The cause is a shared fixture serving two opposite purposes.

1. In `mobile/__tests__/payments/payment-flow.test.tsx`, replace the single `testServerContext`
   with two named fixtures:
   - `brandedPaymentContext` — built through the same path production uses, so
     `isServerPaymentContext` accepts it.
   - `unbrandedPaymentContext` — a plain object cast to the type, which the predicate
     rejects. Used only by tests that assert rejection.
2. Re-derive every call site explicitly. Each test must state in its name or a comment which
   gate it exercises: the brand gate, the capability gate, or the transport.
3. Leave the brand gate itself tested where it already is, in
   `payment-context-guards.test.tsx`, which has dedicated unbranded-rejection tests.
4. Fix the internal contradiction in the retry test: it configured `mutations: { retry: 3 }`
   while asserting exactly one service call. Keep `retry: 0`, which is what
   `QueryProvider.tsx:113` actually sets.

**Done when** `npx jest --ci --forceExit __tests__/payments/payment-flow.test.tsx` reports 32
of 32, and `payment-context-guards.test.tsx` is still 15 of 15.

**Do not** swap the shared fixture in place. That was tried and it broke six tests that
depend on the unbranded object to exercise the rejection path.

## Task 2 — Remove the `--forceExit` requirement

**Why:** a suite that does not terminate is masking open handles. Forcing exit is a
workaround, and the user's requirement is strict testing without bypasses.

1. Run `npx jest --ci --detectOpenHandles __tests__/payments/payment-flow.test.tsx` and
   record what is still open.
2. If it is a timer or interval started by a rendered component, ensure the test unmounts, or
   that the hook clears it on unmount.
3. If it is a TanStack Query cache with `gcTime: Infinity`, that is a deliberate test
   fixture; confirm it is the cause and give the suite its own client teardown.

**Done when** `npm run test:ci` exits cleanly with no `--forceExit` and no "Jest did not exit"
warning. This is a gate, not an optional cleanup: the current workaround is exactly the kind
of bypass that hides problems.

## Task 3 — Re-verify the capability table against the deployed contract

**Why:** the eleven claims in `src/config/capabilities.ts` are assertions about a specific
contract version. `finalizeNote` was already found stale and corrected, which proves the
class of defect is live in this file rather than hypothetical.

1. For each capability key, identify the endpoint the claim is about, and check it against
   the document extracted from `GET /reference` on the live host.
2. Where the endpoint exists, the claim is wrong and the refusal must be implemented or
   removed. Where it does not, the claim stands.
3. Record the result as a table in this plan, so the next version bump knows what to recheck.

Known result so far: notifications and withdrawal have no endpoint in the contract and their
claims are correct. `chatWrite` is correct, since `/rooms/{roomId}/messages` has no `post`.

**Done when** all eleven claims have a row with a path, a method list, and a verdict.

## Task 4 — Backend request: an https base URL

**Blocked on the backend team.** Not a frontend task.

`mobile/.env` points at `https://api.lambada.my.id`, which returns HTTP 000. The only live
staging is plain HTTP on a non-loopback host, which `assertApiUrl` correctly refuses.

**Done when** an https URL is supplied, the cleartext guard is still byte-identical, and
`EXPO_PUBLIC_API_BASE_URL` is set to it.

**Note:** the Caddy TLS terminator in the deleted `docker-compose.azure.yml` was already
designed for exactly this problem. Deployment and DNS are the missing parts, not design.

## Task 5 — Backend request: do the v1.0.5 patches exist

**Blocked on the backend team.** Not a frontend task.

The Azure VM that carried the three patch files is gone. If `core-api:v1.0.5-staging` does
not already contain them, the practitioner DAO and psychologist-profile fixes are silently
absent.

**Done when** the backend team confirms the image contains the fixes, or ships a rebuild that
does.

## Task 6 — Backend request: two missing endpoints

**Blocked on the backend team.** Not a frontend task.

```
GET  /practitioner/me/consultations
     -> { id, status, startedAt, finishedAt, durationMinutes, patientDisplayName }
POST /rooms/{roomId}/messages
```

**Done when** both exist, and the frontend has a follow-up task to wire them: remove the
`Belum tersedia` placeholders in the practitioner history screen, and re-check whether
`chatWrite` can move from `unavailable` to `live` in the capability table. The chat one
unblocks the largest product gap in the app, because neither party can currently type in a
consultation room.

## Task 7 — Independent review before production

**Why:** this session's changes span roughly 60 production files and most of them were never
reviewed by anyone other than the author. The suite being green does not substitute for that;
the one defect that mattered most this session, the dead epoch guard, was found by a test
rather than by review, which is an argument for having both.

Hand the full diff to the `reviewer` subagent per `AGENTS.md` section 5, with the baseline in
Task 0 as the comparison point.

**Done when** every correctness and regression finding is addressed, and the suite is still
47 of 48 or better.

## Ordering

Tasks 1 and 2 are ours and unblock Task 7. Task 3 is ours and is a gate on any future backend
deploy. Tasks 4 to 6 are requests; they can be sent at any time and do not block Task 7.

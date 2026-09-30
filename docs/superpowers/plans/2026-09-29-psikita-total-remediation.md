# Plan: PsiKita Codebase Total Remediation

**Date:** 2026-09-29
**Spec:** `docs/superpowers/specs/2026-09-29-psikita-total-remediation-design.md`
**Evidence:** `docs/CODEBASE_AUDIT_2026-09-29.md`
**Branch:** `fix/mobile-production-demo`
**Status:** ready to start, pending the decision in spec section 7

**No tests are run in this phase, by user instruction.** Every task below writes
its reproducing test alongside its fix and leaves it unrun. Nothing in this plan
claims a gate is green.

## Task 0 — Settle the working agreement (no code)

Confirm with the user the reading adopted in spec section 7: a reproducing test
is written with every fix, but not executed.

If the user instead wants literally zero test files written in this phase, stop
and say so explicitly before starting, because that lowers the quality of every
later task and leaves no way to demonstrate the work helped.

**Gate:** the agreement is recorded. No code change.

## Task 1 — Endpoint and button audit (no code, no test run)

Produce a verified inventory, not a guess.

1. Extract every endpoint literal from `mobile/src/api/*.ts`. 32 are known; this
   task confirms the count and re-checks each against the live contract with
   `{param}` normalisation. All 32 currently resolve.
2. For each of the 279 `onPress` handlers and 204 `<Button>` elements across 44
   route files and 76 component files, record the handler it invokes.
3. Flag any handler that is empty, navigates to a non-existent route, or calls a
   capability marked `unavailable` without the guard the demo spec requires.

Output is a written list. No edits in this task.

**Gate:** the inventory exists as a document. A finding without a file and line
does not enter the queue.

## Task 2 — Guarded tests to behavioural tests

Twelve source-text guards become behavioural tests, or are deleted where the same
file already has a behavioural equivalent. One file at a time.

- `__tests__/qa/deterministic-gates.test.ts` — four source greps. The network
  guard becomes a test that attempts a `fetch` and expects a throw; the
  `--forceExit` and OpenAPI-committed checks stay as source assertions because
  they genuinely are about file contents.
- `__tests__/accessibility/static-audit.test.ts` — reduced motion becomes a
  rendered assertion; heading level and form semantics become rendered
  accessibility assertions. The audit-script identifier checks stay as source.
- `__tests__/clinical/practitioner-claims.test.ts` — render
  `ForwardTriageModal`, press the forward control, assert `onConfirm` is never
  called and the unavailable copy is what the user sees.
- `__tests__/actions/unsupported-actions.test.tsx` — press the share and export
  controls, assert the error copy and the absence of success copy.
- `__tests__/clinical/consultation-completion.test.tsx` — press the rating submit
  with no context and assert the mutation is never called; assert the visible
  placeholder for an empty SOAP response.
- `__tests__/api/contract-fallbacks.test.ts` — delete if `test-services.ts`
  integration already covers it, otherwise convert.
- `__tests__/hooks/query-contract.test.tsx` — trigger a query error and assert
  the logged argument contains the hash and no PII.
- `__tests__/payments/payment-context-guards.test.tsx` — delete the source-text
  duplicate; keep the behavioural assertions already at lines 131-159.
- `__tests__/api/chat-write-boundary.test.tsx` — delete the demo-mode source
  test; `config/capabilities.test.ts` already evaluates the module.
- `__tests__/navigation/routes.test.ts` — keep. A deleted name being absent from
  a source file is a legitimate source assertion.
- `__tests__/screens/TriageScreen.test.tsx` — assert
  `accessibilityState.disabled` and that pressing fires no navigation.
- `__tests__/screens/PatientDashboard.test.tsx` — assert what the mood press
  actually changes.

**Gate per file:** the new test is written and is not run. Recorded as pending.

## Task 3 — Duplication with behavioural consequence

- Unify the capability guard. One helper in `src/config/capabilities.ts`, one
  error code, `isDemoMode()` honoured in every copy. Remove
  `assertLiveCapability` from `payment.service.ts`.
- Unify `asRecord`. One predicate and one throwing accessor in
  `api/response.ts`. The two `undefined`-returning copies become explicit at
  their call sites.
- Unify consultation status. One status-to-label-and-bucket map in
  `src/clinical/activeConsultation.ts`. `SessionHistoryCard` stops matching
  Indonesian literals and consumes the server enum.

**Gate per change:** the test that previously depended on the duplicated
behaviour is updated in the same commit, written and unrun.

## Task 4 — Duplication without behavioural consequence

Consolidate in this order, because each is mechanical once the previous landed:

- Practitioner type union, 12 declarations, into one exported const with the
  zod enum derived from it.
- Server role set, 5 declarations, derived from `TOKEN_ROLES` in `utils/jwt.ts`.
- Route-param normalisation, 11 screens, into one helper.
- Withdrawal bounds into `utils/money-input.ts`. The test asserting
  `5_000_000` against bounds the screens set to `100_000` and `50_000_000` is a
  finding: decide which is correct, do not keep all three.
- Name initials: replace the 5 inline `.slice(0, 2)` copies with the existing
  `getInitials`.
- Date formatting into `utils/format.ts` with one fallback parameter.
- Role-guard layout into one hook or wrapper, restoring the public-route escape
  the admin variant is missing, or recording that admin intentionally has none.
- Header blocks: extend `AppHeader` with a right-action slot, migrate the 9
  screens, or record why each divergence must stay.
- Single-flight mutation guard into one local helper.
- Remove the 8 redundant `retry: false` and the 6 redundant `staleTime`. Share
  one error-metadata helper between `getErrorMetadata` and the retry predicate.

**Gate per item:** typecheck is expected to be clean. It is not run in this
phase and is reported pending, so a type error introduced here stays invisible
until the suite runs. This is the main risk of the no-testing instruction and is
accepted knowingly, not overlooked.

## Task 5 — Dead code, paired with its text-dependent tests

Task 2 must have rewritten the tests that read `PractitionerModals.tsx` before
this runs. Then delete:

- `src/types/clinical.ts` and its barrel line
- `ScreenContainer.tsx`, `SectionHeader.tsx`, `ChatKeyboardWrapper.tsx` and their
  barrel lines
- the 8 unused modals
- the 4 unused hooks
- the 5 dead `export` modifiers
- the 14 `.cjs` probe scripts, per the staging spec

Keep `deep-gluestack-audit.ts`, `audit-quality.js`, and `route-audit.js`.

**Gate per item:** a whole-repo reference count re-run showing zero remaining
references. Not a test; a grep. This gate can be satisfied in this phase.

## Task 6 — Type escapes and documented intent

- `as any` by cluster, largest first. Each cluster gets the real type, which
  removes several occurrences at once.
- The 12 `@ts-expect-error` and 1 `eslint-disable`: either make the code
  type-correct or delete the suppression. A suppression with no explanation is
  removed, not documented.
- The 4 `TODO` and 1 `XXX`: resolve or convert to tracked issues.
- The 6 empty catches in `haptics.ts` get one comment explaining that a device
  without a haptic engine must not break the action. Behaviour unchanged.

**Gate:** the count for each pattern decreases. The grep can be run in this
phase and is a real signal.

## Task 7 — Reviewer pass

`AGENTS.md` section 5 requires the `reviewer` subagent for any change over two
files. This work touches far more. The reviewer gets the actual diff, with the
one instruction that matters: it must be told which changes are unverified
because their tests were written but not run, so it does not read a green
typecheck as proof.

## Deferred verification

Not satisfied by anything in this plan:

```sh
npx tsc --noEmit --incremental
npm run test:ci
```

Plus the pre-existing hang in
`__tests__/payments/payment-flow.test.tsx` without `--forceExit`, already proven
pre-existing and still unexplained. It is plausible that rewriting the screen
tests in tasks 2 and 3 changes that behaviour, which is one reason to run the
suite as soon as the instruction lifts.

## Out of scope

- Expo upgrade and the `tar` critical advisory
- Any change to the capability registry semantics
- Any new dependency
- Native builds
- The chat-send wiring gap, which the user recorded as a product decision, not
  dead code
- Any change to `assertApiUrl` or the cleartext guard

## Stop conditions

- A defect is found that cannot be pinned to a reproducing test: report it, do
  not edit it. This is `AGENTS.md` section 4 and it outranks volume.
- A consolidation would change observable behaviour: stop, write the
  behavioural test first, and get the change reviewed.
- A deletion turns out to be needed by something the reference count missed:
  restore it and record why the count was wrong.
- The diff in any single task grows beyond what one reviewer can hold: split it.

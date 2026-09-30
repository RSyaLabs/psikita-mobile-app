# PsiKita Codebase Total Remediation — Design

**Date:** 2026-09-29
**Branch:** `fix/mobile-production-demo`
**Scope:** `mobile/src` (136 files, 21,124 LOC), `mobile/app` (44 routes), `mobile/__tests__` (51 files)
**Input:** `docs/CODEBASE_AUDIT_2026-09-29.md`
**Status:** DRAFT — blocked on the verification decision in section 7

This document covers the whole-codebase effort the user asked for: every
endpoint, every button, dead code removal, duplication removal, and industry
standard alignment. It does not restate the audit; that document is the evidence
base and is referenced by section.

## 1. Goal

Bring the codebase to a defensible standard: no known defect left unfixed, no
dead code, no duplicated logic, no abandoned tests, and no behaviour that is
guarded by a test which cannot fail.

## 2. What the evidence base already established

From the audit, at the current HEAD:

- 49 test files examined, 33 sound, 16 weak, 12 of them source-text guards that
  read files off disk and assert on raw text.
- Two assertions are provably incapable of failing: `utils/jwt.test.ts` and
  `hooks/query-key-privacy.test.ts` both compare a pure call with itself. Both
  have been rewritten already.
- All 32 endpoints the app calls exist in the live staging contract, after
  `{param}` normalisation. Zero mismatches.
- 81 of the 113 live paths are never called by the app. That is coverage
  observation, not a defect: the app is a frontend for part of a larger API.
- Gluestack and NativeWind compliance is genuinely clean: 0 raw hex and 0
  unwrapped React Native primitives across 44 screens.
- The query key factory and `QueryProvider` are well built. One suspected bug
  was checked and is not a bug: the retry predicate reads `ApiError.statusCode`,
  which really is declared as `number`.
- 279 `onPress` handlers and 204 `<Button` elements across 44 route files and 76
  component files. `audit-quality.js` reports 0 buttons without handlers.

## 3. The single largest defect class

It is not style. It is **tests that pass while behaviour is broken**. A green
suite in this repository currently proves much less than it appears to, and it
does so in exactly the areas that carry money and health data:

- `__tests__/payments/payment-flow.test.tsx` greps three payment screens for
  absent literals. It cannot fail if a screen sends a wrong amount. Rewritten
  already into three behavioural tests.
- `__tests__/qa/deterministic-gates.test.ts` asserts four source strings.
- `__tests__/accessibility/static-audit.test.ts` asserts a CSS keyword and five
  source literals, and cannot tell whether any animation is actually disabled.
- `__tests__/clinical/practitioner-claims.test.ts` slices a component file
  between two string literals.
- `__tests__/actions/unsupported-actions.test.tsx` does seven `toContain` checks
  and renders nothing.
- `__tests__/api/contract-fallbacks.test.ts` greps a script for three field
  names.
- `__tests__/hooks/query-contract.test.tsx` asserts `queryHash` appears in source.
- `__tests__/payments/payment-context-guards.test.tsx` has a source-text version
  of a test the same file already performs behaviourally.
- `__tests__/api/chat-write-boundary.test.tsx` has a source-text test for demo
  mode that `config/capabilities.test.ts` already covers by evaluating the
  module.
- `__tests__/navigation/routes.test.ts` checks a deleted name is absent.

Rewriting these to behavioural form is the highest-value work in this document.
It is also the work most likely to expose real defects, which is the point.

## 4. Duplication that already causes wrong behaviour

Ordered by consequence, not by count.

1. **One gate, two error codes.** `useApiQueries.ts:918` throws
   `CHAT_WRITE_UNAVAILABLE` where `ChatWriteGuard.ts:31` throws
   `CAPABILITY_UNAVAILABLE` for the same capability. The same user-visible
   failure surfaces differently depending on which layer rejects first. Two
   other copies of the guard at `useApiQueries.ts:970-976` and `:990-996` drop
   the `isDemoMode()` half of the condition.
2. **`asRecord` in four incompatible forms.** `api/response.ts:54-59` throws,
   `clinical/activeConsultation.ts:42-47` and `api/matching.service.ts:62-67`
   return `undefined`, `hooks/useQueryKeys.ts:35-37` is a predicate, and two
   files inline it. The throwing copy is the trap.
3. **Consultation status as two vocabularies.** The server enum is written five
   times, while `components/practitioner/SessionHistoryCard.tsx:22,38` and
   `app/(practitioner)/practitioner/history.tsx:103-104` match Indonesian
   literals `"Selesai"` and `"Batal"` instead.
4. **Constants declared many times.** Practitioner type union 12 times, server
   role set 5 times, route-param normalisation 11 screens, withdrawal bounds
   twice while a test asserts a third value, name initials with a correct util
   and 5 inline `.slice(0, 2)` copies that throw on an empty string.
5. **Copy-pasted structures.** Single-flight mutation guard 3 times. Role-guard
   layout logic 3 times, character-for-character except the admin variant has no
   public-route escape. Header blocks in 9 screens alongside an existing
   `AppHeader` that only 7 screens use. Date formatting 3 variants with different
   fallback strings.
6. **Redundant TanStack configuration.** `QueryProvider.tsx:115` already sets
   `mutations: { retry: 0 }`, yet 8 hooks repeat `retry: false`, which is
   equivalent. 6 hooks repeat a `staleTime` that matches the global default.
   `getErrorMetadata` and the retry predicate independently re-implement reading
   `name`/`code`/`statusCode` off an unknown error.

## 5. Dead code

Safe to remove, confirmed by whole-repo reference counting:

- `src/types/clinical.ts`, entire file, 7 types, reachable only through
  `src/types/index.ts:2`
- `src/components/common/ScreenContainer.tsx`, `SectionHeader.tsx`,
  `ChatKeyboardWrapper.tsx`
- 8 modals in `src/components/modals/PractitionerModals.tsx` at lines 54, 152,
  255, 1161, 1258, 1353, 1534, 1786
- 4 hooks in `src/hooks/useApiQueries.ts` at lines 152, 423, 850, 1146
- 5 dead `export` modifiers at `useQueryKeys.ts:16`,
  `clinical/activeConsultation.ts:15`, `api/article.service.ts:18`,
  `api/consultation.service.ts:55`, `utils/alert.ts:3`
- 19 unwired scripts in `mobile/scripts/`, of which `deep-gluestack-audit.ts`,
  `audit-quality.js`, and `route-audit.js` must be kept because a test or a
  document asserts on them. The 14 `.cjs` probes are already slated for
  retirement in the staging spec.

**Paired deletion required.** `ForwardTriageModal` at
`PractitionerModals.tsx:378` is dead at runtime but
`__tests__/clinical/practitioner-claims.test.ts:20-34` slices its source text
between two literals, and `__tests__/actions/unsupported-actions.test.tsx:42-47`
and `__tests__/clinical/consultation-completion.test.tsx:596,604-610` read the
same file wholesale. Deleting the modals before rewriting those tests turns a
green suite red. The dead code and the tests that depend on its text are the
same cleanup task.

## 6. Type escapes and industry standard

- `as any` 75 occurrences, `: any` 19, `@ts-expect-error` 12, `eslint-disable` 1
- 4 `TODO`, 1 `XXX`, 1 `workaround`, 0 `FIXME`
- 6 empty `catch (_) {}` in `src/utils/haptics.ts` at lines 17, 28, 39, 50, 61, 72. Defensible for a device with no haptic engine, but undocumented, so the
  next reader cannot tell intent from oversight.
- No `@ts-nocheck` and no non-null assertions. That discipline is correct and is
  preserved.

`as any` is addressed by cluster, not file by file, because a single cluster
usually has one correct type that removes many occurrences at once.

## 7. The verification decision, stated plainly

The user has instructed: no tests run, and fix every bug found.

That instruction collides with this repository's own rule, `AGENTS.md` section 4:
_"Reproduce first. Write or run a test that fails for the exact reported bug. No
test, no fix."_ and _"If a bug cannot be reproduced in a test, stop and report
that. Do not fix it speculatively."_

This document does not silently override that rule, and it does not silently
obey an instruction that would produce speculative edits. The workable reading,
and the one this plan adopts:

- **Every fix carries a failing test written at the same time as the fix.** The
  test is written but not run. The code change is then provably correct by
  construction once the suite runs later, and nothing is left unverified-by-
  design.
- **No defect is "fixed" on suspicion alone.** A finding that cannot be pinned to
  a reproducing test is reported, not edited. This is the project's rule and it
  is the reason the rule exists.
- **No behavioural claim is made as verified** in this phase. Every gate in the
  project is reported as pending, not as passing.

If the user prefers literally no tests written, then this plan becomes a
lower-quality document: edits would be made against static reading alone, with
no way to show afterwards that any of them helped. That is stated here so the
choice is explicit rather than defaulted.

## 8. Non-goals

- No Expo upgrade, and therefore the `tar` critical advisory stays. Every path
  to it runs through `expo@57`, a five-major jump from the installed
  `expo@52.0.49`.
- No change to the capability registry semantics or the demo and live split.
- No new dependency. The 4 unused-but-required packages
  (`@expo/vector-icons`, `expo-constants`, `expo-font`, `expo-linking`) stay
  declared, because `expo` and `expo-router` need them.
- No native build.
- No change to `assertApiUrl` or the cleartext guard.

## 9. Sequencing principle

Deduplicate and delete only after the tests that read the text are rewritten,
otherwise the suite breaks for reasons unrelated to the change. And every batch
is one behaviour-preserving concern, so a later reviewer can review a diff that
does one thing.

Order: failing test and fix together, then guarded tests, then duplication, then
dead code, then type escapes, then script cleanup.

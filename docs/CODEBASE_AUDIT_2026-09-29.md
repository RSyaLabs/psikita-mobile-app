# PsiKita Mobile Codebase Audit — 2026-09-29

**Branch:** `fix/mobile-production-demo`
**Scope:** `mobile/src` (136 files, 21,124 LOC), `mobile/app` (44 routes), `mobile/__tests__` (51 files)
**Method:** static audit plus targeted source reading. No file was modified.
**Baseline at audit time:** `npx tsc --noEmit --incremental` 0 errors, `npm run test:ci` 49 suites / 368 tests passing.

## Headline

The suite is green and the Gluestack discipline is genuinely strong. The real
problem is not style. It is that **16 of 49 test files give false confidence**,
and several of them guard exactly the things this project cares most about:
money payloads, chat write boundaries, and unavailable capabilities.

A green run therefore means less than it appears to.

## What is already good, and should not be "fixed"

- **Gluestack / NativeWind compliance is real.** `deep-gluestack-audit.ts` reports
  0 raw hex and 0 unwrapped React Native primitives across 44 screens. The
  contract-level checks pass. This is above industry norm; leave it alone.
- **The query key factory is well designed.** `src/hooks/useQueryKeys.ts` salts
  ids with a per-process privacy salt and only exposes an allow-list of public
  fields, so keys do not leak PII. Keep this design.
- **`QueryProvider.tsx` is correctly configured.** AppState-based
  `focusManager`, `onlineManager` for web, a central `QueryCache`/`MutationCache`
  error logger that logs `query.queryHash` rather than the full key, and a retry
  predicate that does not retry 4xx or 501. The retry predicate reads
  `ApiError.statusCode`, which `src/api/response.ts` really does declare as
  `number`, so it is not silently broken.

## P0 — Findings that can hide a real defect

### 1. Two assertions that can never fail

- `__tests__/utils/jwt.test.ts:123`
  `expect(isTokenExpired(decodeAccessToken(token(PATIENT)), 0)).toBe(isTokenExpired(decodeAccessToken(token(PATIENT)), 0))`
  compares a pure call with itself.
- `__tests__/hooks/query-key-privacy.test.ts:101-106`
  `expect(queryKeys.consultations.detail("same-id")).toEqual(queryKeys.consultations.detail("same-id"))`
  the same shape. Lines 121-123 then assert `toContain("2")` / `toContain("10")`,
  which any digit anywhere in the key satisfies.

### 2. The money path is guarded by grepping for absent literals

`__tests__/payments/payment-flow.test.tsx:487` is named "production screens free
of fixed order, amount, and identity authority". It greps three screens for
absent literals (`:493-498`), requires an `isDisabled` token (`:499`), and orders
two source statements with `indexOf` (`:508-512`). All of it passes while the
screen sends a wrong or fabricated amount.

The correct pattern already exists in this repo:
`__tests__/practitioner/withdraw-payload.test.tsx:57` asserts the actual outgoing
payload. The payment test should use it.

### 3. Production chat send is not wired

`src/hooks/useApiQueries.ts:904 useSendMessage` and
`src/components/common/ChatWriteGuard.ts:16 useChatWriteGuard` /
`:26 useGuardedSendMessage` appear in no screen under `mobile/app`. Their only
consumers are tests. This is a product gap, not dead code, and it means the
chat-write boundary the demo spec promised is verified in tests but not
exercised in the app.

### 4. Twelve source-text guards, concentrated in seven files

These read files off disk with `readFileSync` and assert on raw text, so they
survive any refactor that keeps the identifier name.

| File                                                          | Claims                                                                                     | Actually checks                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `__tests__/qa/deterministic-gates.test.ts:15,20,26,31`        | network is blocked, no `--forceExit`, integration is opt-in, an OpenAPI audit is committed | four string greps                                                            |
| `__tests__/accessibility/static-audit.test.ts:17,24,30,35,41` | heading levels, form semantics, reduced motion, audit scripts, search field name           | source contains a type literal / a CSS keyword                               |
| `__tests__/clinical/practitioner-claims.test.ts:27`           | triage forwarding cannot fake a handoff                                                    | slices `PractitionerModals.tsx` between two literals                         |
| `__tests__/clinical/consultation-completion.test.tsx:466,598` | actions need explicit context; absent SOAP never becomes success                           | greps four screens for present/absent strings                                |
| `__tests__/actions/unsupported-actions.test.tsx:26`           | screens do not fake success                                                                | seven `toContain` checks, nothing rendered                                   |
| `__tests__/api/contract-fallbacks.test.ts:15,40`              | no undocumented response fields are read                                                   | greps `test-services.ts` for three field names                               |
| `__tests__/api/chat-write-boundary.test.tsx:23`               | demo mode reads the env var                                                                | three text patterns in `demoMode.ts`                                         |
| `__tests__/hooks/query-contract.test.tsx:468`                 | logs hashes, not full keys                                                                 | asserts `queryHash` appears in source                                        |
| `__tests__/payments/payment-context-guards.test.tsx:122`      | context stays private                                                                      | five `toContain` checks, behaviourally proven at `:131-159` in the same file |
| `__tests__/navigation/routes.test.ts:253`                     | a deleted route catalog is gone                                                            | `includes("login-form")`                                                     |

Suite health: 49 files examined, 33 sound, 16 weak, 12 of them source-text
guards. Nothing is skipped, `.only`-marked, or soft-passed.

## P1 — Duplication that already produces inconsistent behaviour

### 5. One gate, two error codes

`src/hooks/useApiQueries.ts:918` throws `CHAT_WRITE_UNAVAILABLE` for the same
capability the `src/components/common/ChatWriteGuard.ts:31` guard rejects with
`CAPABILITY_UNAVAILABLE`. The same user-visible failure therefore surfaces
differently depending on which layer rejects first. Separately,
`useApiQueries.ts:970-976` and `:990-996` copy the guard but silently drop the
`isDemoMode()` half of the condition.

Canonical helper to consolidate onto: `src/api/payment.service.ts:257-261`
`assertLiveCapability`, which should move to `src/config/capabilities.ts`.

### 6. `asRecord` exists in four incompatible forms

`src/api/response.ts:54-59` **throws**, `src/clinical/activeConsultation.ts:42-47`
and `src/api/matching.service.ts:62-67` return `undefined`,
`src/hooks/useQueryKeys.ts:35-37` is a type predicate, and
`src/api/client.ts:177-178` / `src/api/payment.service.ts:86-87` inline the check
with no helper. The throwing copy is the trap.

### 7. Consultation status exists as two vocabularies

The server enum set `FINISHED | WAITING | ACTIVE | CANCELLED` is written out five
times: `useApiQueries.ts:126-135`, `activeConsultation.ts:105-116`,
`history.tsx:36-41`, `history.tsx:62-68`, `chat-room.tsx:211-212`. Meanwhile
`src/components/practitioner/SessionHistoryCard.tsx:22,38` and
`practitioner/history.tsx:103-104` match on Indonesian literals `"Selesai"` and
`"Batal"` instead of the enum, so the two vocabularies coexist in one app.

### 8. Single-source constants declared many times

- Practitioner type union `"PSYCHOLOGIST" | "PSYCHIATRIST"`: 12 declarations
  across `src/types/api.ts:348,418,449`, `src/utils/validation.ts:7`,
  `src/api/practitioner.service.ts:35,129`, `src/api/payment.service.ts:136`,
  `src/hooks/useApiQueries.ts:74`, `register.tsx:40,60`,
  `RegisterStepRole.tsx:26-27`, `RegisterStepLegal.tsx:31`.
  Adding a third type means 12 edits.
- Server role set `ADMIN | USER | PSYCHIATRIST | PSYCHOLOGIST`: 5 declarations —
  `src/utils/jwt.ts:19-24` (canonical), `src/hooks/useAuth.ts:8,46-51`,
  `src/api/auth.service.ts:20`, `src/types/api.ts:57`.
- Route-param normalisation `Array.isArray(x) ? x[0] : x`: 11 screens,
  identical in 6, divergent in the checkout and payment screens.
- Withdrawal bounds `MIN 100_000 / MAX 50_000_000` at `bank-account.tsx:35-36`
  and `withdraw.tsx:43-44` — while `__tests__/utils/money-input.test.ts:66`
  asserts against `5_000_000`, a third value for the same rule.
- Name initials: `getInitials` exists in `src/utils/format.ts:30-38` and is
  bypassed by 5 inline `.slice(0, 2)` copies that skip title stripping and
  uppercase, and throw on an empty string.
- Role-guard layout logic in `app/(patient)/_layout.tsx:14-40`,
  `app/(practitioner)/_layout.tsx:9-31`, `app/(admin)/_layout.tsx:9-28` is
  character-for-character the same redirect, except the admin variant has no
  public-route escape.
- Hand-rolled header blocks in 9 screens alongside the existing
  `src/components/common/AppHeader.tsx`, which only 7 screens use. Divergent on
  icon size, colour, and whether a right-action slot exists.
- Date formatting: `format.ts:43-48` plus two screen copies
  (`history.tsx:28-34`, `assessment-result.tsx:35-40`) with different fallback
  strings and different null handling.
- The single-flight mutation guard is copy-pasted three times
  (`useApiQueries.ts:576-616`, `:645-690`, `:714-760`), differing only in the
  thrown message.

## P2 — Dead code and hygiene

### 9. Unused symbols, safe to remove

`src/types/clinical.ts` (whole file, 7 types, zero references outside itself and
`src/types/index.ts:2`); `src/components/common/ScreenContainer.tsx:10`;
`SectionHeader.tsx:11`; `ChatKeyboardWrapper.tsx:10`; and 8 modals in
`src/components/modals/PractitionerModals.tsx` at lines 54, 152, 255, 1161, 1258,
1353, 1534, 1786. Four unused hooks in `src/hooks/useApiQueries.ts` at lines 152,
423, 850, 1146. Five dead `export` modifiers at `useQueryKeys.ts:16`,
`activeConsultation.ts:15`, `article.service.ts:18`,
`consultation.service.ts:55`, `utils/alert.ts:3`.

Two of the "dead" modals are load-bearing for tests, so deletion must be paired:
`ForwardTriageModal` (`:378`) is sliced by
`__tests__/clinical/practitioner-claims.test.ts:20-34`, and
`__tests__/actions/unsupported-actions.test.tsx:42-47` plus
`__tests__/clinical/consultation-completion.test.tsx:596,604-610` read the same
file wholesale. Deleting the modals without rewriting those tests turns a green
suite red.

### 10. Orphaned tooling

19 files in `mobile/scripts/` have no `package.json` entry and no CI reference.
Three must be kept because something asserts on them:
`deep-gluestack-audit.ts` (`__tests__/accessibility/static-audit.test.ts:34`),
`audit-quality.js` and `route-audit.js` (`docs/QA_HANDOVER.md:22-33,142`).
The 14 `.cjs` probes are already slated for retirement in the staging spec.

`audit-quality.js` reports "ZERO ISSUES" across 180 files, which is true but
shallow: it does not detect any of the type escapes below. Treat its green as
necessary, not sufficient.

### 11. Type escapes and swallowed errors

- `as any`: 75 occurrences across `mobile/src` and `mobile/app`
- `: any`: 19
- `@ts-expect-error`: 12
- `eslint-disable`: 1
- `TODO`: 4, `XXX`: 1, `workaround`: 1, `FIXME`: 0
- Six empty `catch (_) {}` blocks in `src/utils/haptics.ts` (lines 17, 28, 39,
  50, 61, 72). Defensible for haptics, where a device without a haptic engine
  must not break the action. Worth one comment saying so.
- No `@ts-nocheck` and no non-null assertions, which is good discipline.

### 12. Redundant TanStack configuration

`src/providers/QueryProvider.tsx:115` already sets `mutations: { retry: 0 }`
globally, yet `src/hooks/useApiQueries.ts` repeats `retry: false` at lines 310,
519, 574, 643, 712, 817, 927, 951. `retry: 0` and `retry: false` are equivalent,
so those 8 lines are dead configuration. Similarly, `staleTime: 5 * 60 * 1000`
appears in 6 hooks and exactly matches the global default at
`QueryProvider.tsx:99`.

`getErrorMetadata` (`QueryProvider.tsx:51-72`) and the retry predicate
(`:101-110`) independently re-implement "read `name`/`code`/`statusCode` off an
unknown error". One helper should serve both.

One design note, not a bug: `refetchOnWindowFocus: false` (`:111`) is a
deliberate mobile choice to avoid request storms, but it means a user returning
to the app sees data up to `staleTime` old with no refetch trigger.

## Dependency and platform notes

- `@expo/vector-icons`, `expo-constants`, `expo-font`, `expo-linking` are never
  imported by app code but are required transitively by `expo` and as
  `expo-router` peer dependencies. Leave them declared.
- `src/utils/storage.native.ts` is platform-resolved and alive.
- Every one of the 44 files under `mobile/app` is a live Expo Router route.

## Remediation order

Ordered so that each step is independently verifiable and never leaves the suite
red.

1. Fix the two self-comparisons in `jwt.test.ts` and `query-key-privacy.test.ts`.
   Smallest change, removes false assurance immediately.
2. Rewrite the money-path assertion in `payment-flow.test.tsx` to assert the real
   payload, using the `withdraw-payload.test.tsx:57` pattern.
3. Unify the capability error code, then the `asRecord` family, then the status
   vocabulary, then the duplicated constants. Each step deletes the duplicates in
   the same commit.
4. Delete dead symbols, pairing the modal deletions with the test rewrites that
   currently read them.
5. Remove the 8 redundant `retry: false` and the 6 redundant `staleTime`.
6. Convert source-text guards to behavioural tests, or delete them where a
   behavioural test already exists elsewhere in the same file.
7. Address the 75 `as any` by cluster, not file by file.
8. Decide the chat-send wiring: either wire it or record it as deliberately
   unimplemented. It is currently neither.

## What this audit does not establish

- No runtime or device behaviour was exercised. Everything above is static.
- The staging contract is unreachable, so no finding was validated against the
  live API.
- "No bugs" cannot be asserted from a static audit, and this document does not
  assert it. Every item above is a finding, not a proven defect, except the two
  self-comparisons in item 1, which are provably incapable of failing.

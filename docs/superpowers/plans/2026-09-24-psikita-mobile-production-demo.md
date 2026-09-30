# PsiKita Mobile Production/Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing PsiKita mobile frontend safe for Android/iOS by separating production and explicit demo data sources, aligning the client to the checked-in OpenAPI/Docker contract, and eliminating false-success flows.

**Architecture:** Keep one Expo source tree with `EXPO_PUBLIC_DEMO_MODE` and a centralized capability registry. Production reads only documented endpoints and fails closed; demo may use isolated fixtures only for capabilities explicitly marked unsupported. TanStack Query owns request/cache state, while Gluestack renders shared loading, empty, error, unavailable, and demo-banner states.

**Tech Stack:** Expo SDK 52, React Native 0.76.x, Expo Router, Gluestack UI v5, TanStack Query v5, Zod, Jest, React Native Testing Library, Chrome DevTools MCP.

**Spec:** `docs/superpowers/specs/2026-09-24-psikita-mobile-production-demo-design.md`

## Global Constraints

- Scope is `mobile/`; do not modify NestJS backend source, Docker image, migrations, or VPS configuration.
- Do not build APK/IPA in this plan.
- Production has no automatic mock fallback.
- Demo fixtures are allowed only for capabilities explicitly absent from the committed OpenAPI contract.
- A network, timeout, HTTP, or malformed-response error never switches to demo data.
- Payment, BPJS, withdrawal, SOAP persistence, crisis escalation, PII writes, and chat writes require confirmed server success.
- Use Gluestack v5 and semantic NativeWind tokens; no raw screen hex colors or raw palette classes.
- Write a failing test before each behavioral fix; run focused tests before the full suite.
- Do not overwrite unrelated pre-existing worktree changes; review the diff after every slice.
- Update the Obsidian project note after each verified implementation slice.

---

### Task 1: Establish the production/demo capability boundary

**Files:**
- Create: `mobile/src/config/capabilities.ts`
- Create: `mobile/src/config/demoMode.ts`
- Create: `mobile/src/demo/emptyStates.ts`
- Modify: `mobile/.env.example`
- Modify: `mobile/src/api/client.ts:8-12`
- Test: `mobile/__tests__/config/capabilities.test.ts`

**Interfaces:**
- Produces `CapabilityKey`, `CapabilityState`, `getCapability(key)`, and `isDemoMode()`.
- `client.ts` must no longer expose `USE_MOCK_FALLBACK` as an implicit error switch.

- [ ] **Step 1: Write failing tests**

Test that:

```ts
process.env.EXPO_PUBLIC_DEMO_MODE = "false";
expect(getCapability("articles")).toEqual("unavailable");
expect(getCapability("patientProfile")).toEqual("live");
expect(isDemoMode()).toBe(false);

process.env.EXPO_PUBLIC_DEMO_MODE = "true";
expect(getCapability("articles")).toEqual("demo");
expect(isDemoMode()).toBe(true);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx jest __tests__/config/capabilities.test.ts --runInBand --no-cache
```

Expected: failure because the capability modules do not exist and the client still has implicit fallback behavior.

- [ ] **Step 3: Implement the minimal boundary**

Create a static capability map with only currently audited capabilities:

```ts
export type CapabilityState = "live" | "demo" | "unavailable";
export type CapabilityKey =
  | "patientProfile"
  | "triage"
  | "matching"
  | "payment"
  | "articles"
  | "notifications"
  | "chatWrite"
  | "withdrawal"
  | "prescriptions"
  | "crisisEscalation";
```

Use `EXPO_PUBLIC_DEMO_MODE === "true"` as the only demo switch. In production, unsupported capabilities are `unavailable`; in demo, only explicitly mapped capabilities are `demo`.

- [ ] **Step 4: Remove implicit fallback from the client boundary**

Keep `apiRequest()` free of fixture behavior. It must only throw typed `ApiError` values. Update callers in later tasks to choose demo data explicitly through the capability layer.

- [ ] **Step 5: Run the focused test and typecheck**

```bash
npx jest __tests__/config/capabilities.test.ts --runInBand --no-cache
npx tsc --noEmit
```

Expected: focused test passes and TypeScript exits 0.

- [ ] **Step 6: Commit the slice**

```bash
git add mobile/src/config mobile/src/demo mobile/src/api/client.ts mobile/.env.example mobile/__tests__/config
git commit -m "feat: separate production and demo data sources"
```

---

### Task 2: Make the API client contract-safe and cancellable

**Files:**
- Modify: `mobile/src/api/client.ts:38-137`
- Modify: `mobile/src/utils/storage.ts`
- Modify: `mobile/src/utils/storage.native.ts`
- Create: `mobile/src/api/response.ts`
- Test: `mobile/__tests__/api/client.test.ts`
- Test: `mobile/__tests__/api/response.test.ts`

**Interfaces:**
- Produces `ApiError`, `parseApiData<T>(value, adapter)`, and `apiRequest<T>(endpoint, options)`.
- Preserves `apiRequest` as the only raw fetch boundary.

- [ ] **Step 1: Write failing tests**

Cover:

- HTTP 401 produces `ApiError` with status 401.
- HTTP 422 preserves a safe validation message.
- `AbortError` from caller cancellation is not reported as a server timeout.
- A non-JSON successful response is rejected when JSON is required.
- HTTPS is required for non-local production API URLs.
- Query/mutation cancellation reaches `fetch` through the external signal.

- [ ] **Step 2: Run the focused tests and verify RED**

```bash
npx jest __tests__/api/client.test.ts __tests__/api/response.test.ts --runInBand --no-cache
```

- [ ] **Step 3: Implement minimal typed parsing and timeout/cancellation separation**

Use a small parser that accepts a typed adapter and throws `ApiError("INVALID_RESPONSE", 502)` for malformed success data. Keep error bodies out of logs. Distinguish caller aborts from timeout aborts.

- [ ] **Step 4: Make storage platform-safe**

Keep `expo-secure-store` on native through the existing native adapter. On production web, keep bearer tokens in memory by default and remove persistent `localStorage` token persistence. Demo mode may use an explicit in-memory/demo session only.

- [ ] **Step 5: Run focused tests, typecheck, and commit**

```bash
npx jest __tests__/api/client.test.ts __tests__/api/response.test.ts --runInBand --no-cache
npx tsc --noEmit
git add mobile/src/api/client.ts mobile/src/api/response.ts mobile/src/utils/storage.ts mobile/__tests__/api
git commit -m "fix: fail closed on invalid API responses"
```

---

### Task 3: Add session lifecycle and role guards

**Files:**
- Create: `mobile/src/providers/AuthProvider.tsx`
- Create: `mobile/src/hooks/useAuth.ts`
- Modify: `mobile/app/_layout.tsx`
- Modify: `mobile/app/(patient)/_layout.tsx`
- Modify: `mobile/app/(practitioner)/_layout.tsx`
- Modify: `mobile/app/(admin)/_layout.tsx`
- Modify: `mobile/src/api/auth.service.ts`
- Modify: `mobile/src/hooks/useApiQueries.ts:208-234`
- Modify: profile logout handlers in patient and practitioner profiles
- Test: `mobile/__tests__/auth/session.test.tsx`
- Test: `mobile/__tests__/auth/role-guard.test.tsx`

**Interfaces:**
- Produces `AuthProvider`, `useAuth()`, `signOut()`, `clearSession()`, and `hasRole(role)`.
- `useLogin` and `useGoogleLogin` use server response role only.

- [ ] **Step 1: Write failing tests**

Test:

- A clean session cannot render patient/practitioner/admin protected layouts.
- A valid server role can render only its matching group.
- A second login clears the previous user's query data before the new identity is accepted.
- Logout calls the service, clears the token, clears the query client, and navigates to login.
- Username text cannot elevate a user to admin.

- [ ] **Step 2: Run the focused tests and verify RED**

```bash
npx jest __tests__/auth --runInBand --no-cache
```

- [ ] **Step 3: Implement the minimal session provider and guards**

Hydrate the session before protected navigation renders. Use an explicit loading state rather than exposing protected layouts optimistically. On sign-in, call `queryClient.clear()` before storing the new identity. On sign-out, call `authService.logout()` and clear all client state.

- [ ] **Step 4: Run focused tests and commit**

```bash
npx jest __tests__/auth --runInBand --no-cache
npx tsc --noEmit
git add mobile/src/providers/AuthProvider.tsx mobile/src/hooks/useAuth.ts mobile/app/_layout.tsx "mobile/app/(patient)/_layout.tsx" "mobile/app/(practitioner)/_layout.tsx" "mobile/app/(admin)/_layout.tsx" "mobile/app/(patient)/profile.tsx" "mobile/app/(practitioner)/profile.tsx" mobile/src/api/auth.service.ts mobile/src/hooks/useApiQueries.ts mobile/__tests__/auth
# Review staged paths before committing; do not stage unrelated pre-existing worktree changes.
git diff --cached --name-only
git commit -m "feat: protect mobile routes by authenticated role"
```

---

### Task 4: Eliminate Expo Router leaf collisions

**Files:**
- Modify: `mobile/src/constants/routes.ts`
- Move/rename route files for patient, practitioner, and admin role groups
- Modify: `mobile/app/index.tsx`
- Modify: every route navigation caller found by `router.push`, `router.replace`, and `ROUTES`
- Modify: `mobile/scripts/e2e-audit.ts`
- Test: `mobile/__tests__/navigation/routes.test.ts`

**Interfaces:**
- Produces unique route constants such as `PATIENT_DASHBOARD="/patient/dashboard"` and `ADMIN_DASHBOARD="/admin/dashboard"`.
- No production route uses group syntax as a URL leaf.

- [ ] **Step 1: Write failing route tests**

Assert that route constants are unique, contain role prefixes, map to existing files, and that all navigation targets are in the route registry.

- [ ] **Step 2: Run the route test and verify RED**

```bash
npx jest __tests__/navigation/routes.test.ts --runInBand --no-cache
```

- [ ] **Step 3: Rename route leaves and update navigation**

Move screens to unique role-prefixed segments while preserving screen components and Gluestack UI. Update route constants, deep links, catalog links, and tests. Remove the deleted `login-form` E2E entry.

- [ ] **Step 4: Fix the registration redirect**

Replace the immediate `router.replace` effect in `app/(auth)/register.tsx` with a root-safe redirect or remove the standalone redirect route from production and use the login modal directly.

- [ ] **Step 5: Verify route behavior and commit**

```bash
npx jest __tests__/navigation/routes.test.ts --runInBand --no-cache
npx tsc --noEmit
npx ts-node scripts/e2e-audit.ts
git add mobile/src/constants/routes.ts mobile/app/index.tsx "mobile/app/(auth)/register.tsx" mobile/scripts/e2e-audit.ts mobile/__tests__/navigation
# Add each moved route file individually after reviewing its diff; do not stage unrelated existing changes.
git diff --cached --name-only
git commit -m "fix: give each mobile role a unique route namespace"
```

---

### Task 5: Make payment and BPJS fail closed

**Files:**
- Modify: `mobile/src/types/api.ts:277-302`
- Modify: `mobile/src/api/payment.service.ts`
- Modify: `mobile/src/hooks/useApiQueries.ts:303-321`
- Modify: `mobile/app/(patient)/checkout.tsx`
- Modify: `mobile/app/(patient)/payment-regular.tsx`
- Modify: `mobile/app/(patient)/payment-bpjs.tsx`
- Test: `mobile/__tests__/payments/payment-flow.test.tsx`

**Interfaces:**
- Produces a billing-order DTO matching the OpenAPI `CreateBillingOrderDto`.
- Produces a stable idempotency key for one payment intent.
- Consumes only server-issued order IDs and amounts.

- [ ] **Step 1: Write failing tests**

Cover pending, settlement, expiry, cancellation, HTTP error, BPJS unknown, BPJS invalid, duplicate submit, and navigation blocking.

- [ ] **Step 2: Run the focused tests and verify RED**

```bash
npx jest __tests__/payments/payment-flow.test.tsx --runInBand --no-cache
```

- [ ] **Step 3: Implement the contract-first payment flow**

Create the billing order first. Send `contextType`, `contextId`, `methodType`, and `channelCode` as documented. Do not send client fee or discount as authority. Navigate to chat only from a confirmed `SETTLEMENT` response.

- [ ] **Step 4: Make BPJS unknown by default**

Use `undefined` for eligibility while loading or after error. Disable the confirm CTA until the server returns a valid response. Never route onward from an error callback.

- [ ] **Step 5: Run tests, typecheck, and commit**

```bash
npx jest __tests__/payments/payment-flow.test.tsx --runInBand --no-cache
npx tsc --noEmit
git add mobile/src/types/api.ts mobile/src/api/payment.service.ts mobile/src/hooks/useApiQueries.ts mobile/app/'(patient)'/checkout.tsx mobile/app/'(patient)'/payment-regular.tsx mobile/app/'(patient)'/payment-bpjs.tsx mobile/__tests__/payments
git commit -m "fix: make payment and BPJS flows fail closed"
```

---

### Task 6: Remove false clinical and consultation success

**Files:**
- Modify: `mobile/app/(patient)/triage.tsx`
- Modify: `mobile/app/(patient)/assessment-result.tsx`
- Modify: `mobile/app/(patient)/chat-room.tsx`
- Modify: `mobile/app/(practitioner)/chat.tsx`
- Modify: `mobile/app/(practitioner)/diagnosis.tsx`
- Modify: `mobile/app/(practitioner)/war-room.tsx`
- Modify: `mobile/src/api/consultation.service.ts`
- Modify: `mobile/src/api/notes.service.ts`
- Create: `mobile/src/clinical/assessment.ts`
- Test: `mobile/__tests__/clinical/assessment-flow.test.tsx`
- Test: `mobile/__tests__/clinical/consultation-completion.test.tsx`

**Interfaces:**
- Produces a typed `ActiveConsultationContext` passed through downstream routes.
- Assessment results are either server-derived or explicitly unavailable; no fabricated score.
- Crisis activation is unavailable without a documented server action.

- [ ] **Step 1: Write failing tests**

Test that failed triage, SOAP, claim, finish, and crisis mutations never navigate to a success screen; that IDs are taken from active context; and that a system crisis event cannot be mislabeled as a practitioner message.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npx jest __tests__/clinical --runInBand --no-cache
```

- [ ] **Step 3: Implement the active consultation context**

Create a small typed context module and replace hard-coded room/consultation IDs. Use server response data after successful create/claim. Pass context through matching, checkout, chat, diagnosis, rating, and records.

- [ ] **Step 4: Make clinical actions fail closed**

Move navigation from `onError`/`onSettled` to confirmed `onSuccess`. Remove pre-filled clinical assertions. Map every ICD code explicitly. Disable crisis action until a documented escalation endpoint exists.

- [ ] **Step 5: Run tests, typecheck, and commit**

```bash
npx jest __tests__/clinical --runInBand --no-cache
npx tsc --noEmit
git add "mobile/app/(patient)/triage.tsx" "mobile/app/(patient)/assessment-result.tsx" "mobile/app/(patient)/chat-room.tsx" "mobile/app/(practitioner)/chat.tsx" "mobile/app/(practitioner)/diagnosis.tsx" "mobile/app/(practitioner)/war-room.tsx" mobile/src/api/consultation.service.ts mobile/src/api/notes.service.ts mobile/src/clinical mobile/__tests__/clinical
# Review staged paths before committing; do not stage unrelated pre-existing worktree changes.
git diff --cached --name-only
git commit -m "fix: bind clinical flows to confirmed server state"
```

---

### Task 7: Correct TanStack Query keys, pagination, and polling

**Files:**
- Modify: `mobile/src/hooks/useQueryKeys.ts`
- Modify: `mobile/src/hooks/useApiQueries.ts`
- Modify: `mobile/src/api/patient.service.ts`
- Modify: `mobile/src/api/practitioner.service.ts`
- Modify: `mobile/src/api/ledger.service.ts`
- Modify: `mobile/src/api/article.service.ts`
- Modify: `mobile/src/api/notification.service.ts`
- Test: `mobile/__tests__/hooks/query-contract.test.tsx`
- Test: `mobile/__tests__/hooks/pagination.test.tsx`

**Interfaces:**
- All list services accept explicit page/limit/status parameters.
- Query keys use the same category and object shape for reads and optimistic updates.
- Polling stops for terminal resource states.

- [ ] **Step 1: Write failing tests**

Test page 2 requests contain page 2, query keys differ by params, notification optimistic updates change `isUnread`, and chat polling stops on finished/cancelled sessions.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npx jest __tests__/hooks --runInBand --no-cache
```

- [ ] **Step 3: Implement parameter forwarding and metadata parsing**

Remove unused infinite hooks until the backend contract supports real pagination. For supported lists, parse OpenAPI `meta` and pass `page`, `limit`, and filters consistently.

- [ ] **Step 4: Fix optimistic reconciliation and cache isolation**

Use the server response to replace optimistic messages. Namespace user data by identity where needed. Clear user-scoped query data on logout.

- [ ] **Step 5: Run tests, typecheck, and commit**

```bash
npx jest __tests__/hooks --runInBand --no-cache
npx tsc --noEmit
git add mobile/src/hooks/useQueryKeys.ts mobile/src/hooks/useApiQueries.ts mobile/src/api/patient.service.ts mobile/src/api/practitioner.service.ts mobile/src/api/ledger.service.ts mobile/src/api/article.service.ts mobile/src/api/notification.service.ts mobile/__tests__/hooks/query-contract.test.tsx mobile/__tests__/hooks/pagination.test.tsx
# Review staged paths before committing; do not stage unrelated pre-existing worktree changes.
git diff --cached --name-only
git commit -m "fix: align TanStack Query state with API contracts"
```

---

### Task 8: Add shared Gluestack data and accessibility states

**Files:**
- Create: `mobile/src/components/common/DataSourceBanner.tsx`
- Create: `mobile/src/components/common/AsyncState.tsx`
- Modify: `mobile/src/components/ui/index.ts`
- Modify: auth, article, notification, payment, and loading screens
- Modify: `mobile/src/components/ui/form-control/index.tsx`
- Modify: `mobile/src/components/ui/heading/index.web.tsx`
- Modify: `mobile/global.css`
- Test: `mobile/__tests__/components/DataSourceBanner.test.tsx`
- Test: `mobile/__tests__/components/AsyncState.test.tsx`
- Test: `mobile/__tests__/accessibility/static-audit.test.ts`

**Interfaces:**
- Produces `DataSourceBanner`, `LoadingState`, `EmptyState`, `ErrorState`, and `UnavailableState` built from Gluestack primitives.
- Inputs expose labels, descriptions, errors, and invalid state programmatically.

- [ ] **Step 1: Write failing component/accessibility tests**

Test that demo data renders a visible warning, unavailable actions are disabled, errors expose retry, empty data does not show the demo banner, and input/heading semantics are present.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npx jest __tests__/components __tests__/accessibility --runInBand --no-cache
```

- [ ] **Step 3: Implement shared Gluestack states**

Use semantic tokens only. Keep the existing palette, but replace raw `emerald-*`, `blue-*`, and hard-coded screen colors with semantic token classes. Keep brand exceptions confined to an explicit SVG/brand allowlist.

- [ ] **Step 4: Fix semantics and motion**

Associate labels and errors, decouple heading level from visual size, add accessible names/states to custom controls, allow modal scrolling, and respect reduced motion.

- [ ] **Step 5: Run tests, static audit, and commit**

```bash
npx jest __tests__/components __tests__/accessibility --runInBand --no-cache
npx ts-node scripts/deep-gluestack-audit.ts
npx tsc --noEmit
git add mobile/src/components/common/DataSourceBanner.tsx mobile/src/components/common/AsyncState.tsx mobile/src/components/ui/index.ts mobile/src/components/ui/form-control/index.tsx mobile/src/components/ui/heading/index.web.tsx mobile/global.css mobile/__tests__/components/DataSourceBanner.test.tsx mobile/__tests__/components/AsyncState.test.tsx mobile/__tests__/accessibility/static-audit.test.ts
# Add each affected screen individually after reviewing its diff; do not stage unrelated existing changes.
git diff --cached --name-only
git commit -m "fix: standardize accessible Gluestack async states"
```

---

### Task 9: Remove false actions and dead complexity

**Files:**
- Modify: `mobile/app/(patient)/video-call.tsx`
- Modify: `mobile/app/(patient)/article-detail.tsx`
- Modify: `mobile/app/(patient)/session-summary.tsx`
- Modify: `mobile/app/(patient)/prescription.tsx`
- Modify: `mobile/app/(practitioner)/bank-account.tsx`
- Modify: `mobile/app/(practitioner)/withdraw.tsx`
- Modify: `mobile/src/components/modals/PractitionerModals.tsx`
- Modify or delete: `mobile/src/hooks/useAppMutation.ts`
- Modify or delete: `mobile/src/utils/validation.ts`
- Modify: `mobile/src/hooks/useApiQueries.ts`
- Test: `mobile/__tests__/actions/unsupported-actions.test.tsx`

**Interfaces:**
- Unsupported copy/share/download/upload actions become honest disabled/unavailable states.
- No local success mutation remains for withdrawal.
- Unused abstractions are removed only after reference search.

- [ ] **Step 1: Write failing tests**

Test that unsupported actions do not show success toasts, withdrawal never reports a local settlement, and demo high-risk actions are read-only.

- [ ] **Step 2: Run focused tests and verify RED**

```bash
npx jest __tests__/actions --runInBand --no-cache
```

- [ ] **Step 3: Implement honest unsupported states**

Use the shared unavailable/demo states. Implement native clipboard/share only if the existing platform stack supports it; otherwise mark the action unavailable instead of pretending.

- [ ] **Step 4: Remove only verified dead code**

Search references before deleting `useAppMutation`, `validation.ts`, stale query aliases, and unused infinite hooks. Keep any schema that is actually wired into forms.

- [ ] **Step 5: Run tests, typecheck, and commit**

```bash
npx jest __tests__/actions --runInBand --no-cache
npx tsc --noEmit
git add "mobile/app/(patient)/video-call.tsx" "mobile/app/(patient)/article-detail.tsx" "mobile/app/(patient)/session-summary.tsx" "mobile/app/(patient)/prescription.tsx" "mobile/app/(practitioner)/bank-account.tsx" "mobile/app/(practitioner)/withdraw.tsx" mobile/src/components/modals/PractitionerModals.tsx mobile/src/hooks/useAppMutation.ts mobile/src/utils/validation.ts mobile/src/hooks/useApiQueries.ts mobile/__tests__/actions
# Review staged paths before committing; do not stage unrelated pre-existing worktree changes.
git diff --cached --name-only
git commit -m "fix: remove simulated success actions"
```

---

### Task 10: Align Expo dependencies and prepare, but do not run, native builds

**Files:**
- Modify: `mobile/package.json`
- Modify: `mobile/package-lock.json` through the package manager only
- Modify: `mobile/.npmrc`
- Create: `mobile/eas.json`
- Modify: `mobile/app.json`
- Test: dependency/config validation scripts

**Interfaces:**
- Produces EAS `production` and `demo` profiles with distinct environment values and bundle IDs.
- Does not run `eas build` or generate APK/IPA.

- [ ] **Step 1: Capture the current dependency mismatch**

```bash
npx expo install --check
npx expo-doctor
npm audit --package-lock-only --ignore-scripts
```

- [ ] **Step 2: Align versions using Expo-supported commands**

Use `npx expo install` for required Expo/RN packages. Do not use `npm audit fix --force`. Review the lockfile diff.

- [ ] **Step 3: Add EAS profiles without building**

Create profiles for production and demo with explicit environment variables and distinct bundle identifiers. Do not invoke a native build.

- [ ] **Step 4: Verify configuration only**

```bash
npx expo install --check
npx expo-doctor
npx tsc --noEmit
```

- [ ] **Step 5: Commit the dependency/config slice**

```bash
git add mobile/package.json mobile/package-lock.json mobile/.npmrc mobile/eas.json mobile/app.json
git commit -m "chore: align Expo native build profiles"
```

---

### Task 11: Replace false-green QA with deterministic gates

**Files:**
- Modify: `mobile/package.json`
- Modify: `mobile/jest.config.js`
- Modify: `mobile/jest.setup.ts`
- Modify: `mobile/scripts/e2e-audit.ts`
- Modify: `mobile/scripts/test-services.ts`
- Create: `mobile/scripts/contract-audit.ts`
- Test: all `mobile/__tests__/**`

**Interfaces:**
- Normal Jest runs never call staging or mutate live data.
- `test:integration` is explicit opt-in and separate from CI.
- Route audit uses the route registry and fails on missing/dead routes.

- [ ] **Step 1: Add failing QA tests**

Test that no normal test imports an unmocked network service, that stale route entries fail, and that coverage thresholds are enforced.

- [ ] **Step 2: Run the current suite to establish RED**

```bash
npm test -- --runInBand --no-cache
```

Record the current force-exit/open-handle and false-green behavior.

- [ ] **Step 3: Implement deterministic test isolation**

Mock `fetch` at the test boundary, make demo mode explicit in scripts, remove global warning suppression, clean Toast timers, and remove `forceExit` from the normal CI command.

- [ ] **Step 4: Add contract and route gates**

Parse the committed OpenAPI document, compare service paths/methods, and fail on undocumented production calls. Generate route tests from the route registry.

- [ ] **Step 5: Run QA gates and commit**

```bash
npm test -- --runInBand --no-cache
npx tsc --noEmit
npx expo install --check
npx ts-node scripts/e2e-audit.ts
git add mobile/package.json mobile/jest.config.js mobile/jest.setup.ts mobile/scripts/e2e-audit.ts mobile/scripts/test-services.ts mobile/scripts/contract-audit.ts mobile/__tests__
# Review staged paths before committing; do not stage unrelated pre-existing worktree changes.
git diff --cached --name-only
git commit -m "test: replace false-green mobile quality gates"
```

---

### Task 12: Final verification and documentation checkpoint

**Files:**
- Modify: `C:\Users\Dragon\Documents\Obsidian Vault\_Projects\psikita-mobile.md`
- Modify: `docs/superpowers/plans/2026-09-24-psikita-mobile-production-demo.md`

- [ ] **Step 1: Run the full frontend verification set**

```bash
cd mobile
npx tsc --noEmit
npm test -- --runInBand --no-cache
npx expo install --check
npx expo-doctor
npx expo export --platform web
npx ts-node scripts/e2e-audit.ts
npx ts-node scripts/deep-gluestack-audit.ts
```

- [ ] **Step 2: Run browser verification on local web only**

Verify production-like mode with no demo fallback, demo mode with visible banners, login/logout, direct role routes, loading/error/empty states, 320px layout, and clean console. Do not inspect or copy browser credentials or storage.

- [ ] **Step 3: Confirm native builds remain deferred**

Verify `eas.json` profiles exist but do not run `eas build`, Gradle, Xcode, or APK/IPA commands.

- [ ] **Step 4: Update Obsidian with verified results**

Append the exact commands, results, remaining backend capabilities, and the fact that native builds were intentionally not run.

- [ ] **Step 5: Commit documentation only**

```bash
git add docs/superpowers/plans/2026-09-24-psikita-mobile-production-demo.md
git commit -m "docs: record mobile production demo verification"
```

## Execution Notes

- Do not claim all backend capabilities are fixed when the backend source is absent; mark them as contract blockers.
- Do not build native artifacts until the user explicitly requests them after reviewing verification results.
- If a task exposes a new architectural blocker, stop that slice, document the evidence, and update the plan before continuing.

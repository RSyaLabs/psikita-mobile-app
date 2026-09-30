# PsiKita Mobile Production/Demo Design

**Date:** 2026-09-24
**Scope:** `mobile/` only
**Backend:** unchanged; Docker/OpenAPI are the contract
**Native builds:** explicitly deferred until user requests them

## Goal

Make the PsiKita mobile frontend safe for Android/iOS release while preserving the existing UI through an explicit production/demo data-source model. The same source code produces a live production build and a clearly labelled demo build; unsupported backend capabilities never become fake success states.

## Non-goals

- Do not modify the NestJS backend, Docker image, migrations, or deployed VPS.
- Do not invent undocumented production endpoints.
- Do not build APK/IPA in this phase.
- Do not use mock data as an automatic error fallback.
- Do not remove the existing design screens merely because a backend endpoint is missing.

## Environments

### Production

- `EXPO_PUBLIC_DEMO_MODE=false`
- Uses only endpoints documented by the committed OpenAPI contract.
- Live data when the endpoint succeeds.
- Empty response renders an empty state.
- Network/timeout/5xx renders an error with retry.
- Missing capability renders `Fitur belum tersedia` and disables unsupported actions.
- No mock banner and no fixture data.

### Demo

- `EXPO_PUBLIC_DEMO_MODE=true`
- Uses live data when a documented endpoint succeeds.
- Uses fixtures only for capabilities explicitly marked unsupported by the OpenAPI contract.
- Displays a persistent Gluestack data-source banner on fixture-backed screens.
- High-risk actions are read-only or disabled: payment, BPJS, withdrawal, SOAP persistence, crisis escalation, profile PII writes, and chat message writes.
- A backend error never switches to fixture data.

The web deployments use separate URLs, for example `app.psikita.id` and `demo.psikita.id`. Android/iOS use separate build profiles and bundle IDs, while reading the same source tree. Native build commands are not run during implementation.

## Capability/Data Source Model

Create a single capability registry derived from the checked-in OpenAPI paths and the current mobile service inventory. Each capability has one of these states:

- `live`: supported by the current contract and usable.
- `demo`: intentionally backed by local fixtures because the backend capability is absent.
- `unavailable`: not supported in production and not backed by demo data.

The registry is the only place allowed to decide whether fixture data is permitted. Services do not inspect arbitrary errors and do not silently return fixtures.

Each query exposes its source as metadata:

```ts
type DataSource = "live" | "demo";
type CapabilityState = "live" | "demo" | "unavailable";
```

The UI renders one shared Gluestack `DataSourceBanner` for `demo` capabilities. The banner is never used for ordinary empty states or network errors.

## API Boundary

- Keep the universal fetch client as the single HTTP boundary.
- Require HTTPS for non-local production URLs; reject cleartext production configuration at startup.
- Parse successful responses through typed adapters based on the OpenAPI response shape.
- Throw typed API errors for HTTP, network, timeout, and malformed-response cases.
- Never cast unvalidated JSON directly into a DTO.
- Pass `AbortSignal` through services so React Query cancellation reaches `fetch`.
- Clear the query cache on logout and before accepting a different authenticated identity.
- Use native secure storage for tokens. Web production keeps tokens in memory by default and does not persist bearer tokens in `localStorage` unless a reviewed server-side session strategy is introduced.

## Authentication and Navigation

- Add a session provider that hydrates the authenticated user from the API/session layer.
- Add role-aware guards for patient, practitioner, and admin route groups.
- Derive navigation role from the authenticated server response, never from username substrings.
- Make logout call the logout service, clear the token, clear query data, and return to the auth screen.
- Use unique URL segments for role routes (`/patient/*`, `/practitioner/*`, `/admin/*`) to eliminate Expo Router leaf collisions.
- Keep the screen catalog development/demo-only; production entry must not expose a public role launcher.
- Fix the auth registration redirect so a direct deep link waits for the root navigator before replacing the route.

## Payment and Financial Flows

- Create a server-side billing order through the documented billing-order endpoint.
- Submit only the server-issued billing order context and an idempotency key to payment.
- Never trust route parameters, client fee, or client discount as the amount authority.
- Treat only a confirmed settlement status as paid.
- Show pending status and poll/status-refresh; block consultation entry for error, expiry, or cancellation.
- Treat BPJS eligibility as unknown until a successful server response.
- Remove withdrawal success UI until a documented withdrawal endpoint exists; the demo build may show a read-only explanation with a demo banner, never a success receipt.
- Add regression tests for payment error, pending payment, settled payment, BPJS invalid, and duplicate submission.

## Clinical and Consultation Flows

- Carry a typed active consultation context through matching, checkout, chat, video, diagnosis, rating, prescriptions, and referrals.
- Do not use hard-coded room, consultation, or patient IDs in production flows.
- Do not navigate to a completion screen from `onError` or `onSettled`; navigate only after confirmed success.
- Remove pre-filled clinical assertions that a clinician has not entered.
- Map each ICD-10 code to its own description and severity behavior.
- Replace the current single-question triage prototype with a clinician-approved assessment state flow before claiming clinical readiness; until then, production must show assessment unavailable rather than a fabricated score.
- Crisis actions require a real server escalation endpoint and audit record. A local banner/message is not an escalation.
- Chat writes, attachments, and voice notes must use documented upload/message contracts. If absent, the production action is disabled.

## TanStack Query

- Centralize query keys in the existing query-key factory and namespace them by authenticated identity where user data is involved.
- Pass pagination parameters through services and use the OpenAPI page metadata.
- Keep the current jittered polling only for active resources; stop polling on terminal consultation states.
- Reconcile optimistic mutations with the server response instead of invalidating into a fixed fixture list.
- Fix notification optimistic updates to use the actual `isUnread` field and the same category key used by the screen.
- Use query metadata/capability state to drive banners and empty states.

## Gluestack and UI

- Keep all screen UI on Gluestack v5 components and semantic tokens.
- Remove hard-coded screen colors and raw Tailwind palette classes except an explicit brand asset allowlist.
- Use a shared `DataSourceBanner`, `LoadingState`, `EmptyState`, `ErrorState`, and `UnavailableState` where the pattern recurs.
- Associate every input with a programmatic label, error, and invalid state.
- Use semantic heading levels independent from visual size.
- Add accessible names, roles, and selected/checked/expanded states to custom controls.
- Fix contrast tokens and test at 320px width, 390px width, text scaling, reduced motion, and screen-reader semantics.
- Keep modal focus management, but allow long forms to scroll on small screens and respect reduced motion.

## Tests and Verification

- Replace test-local clinical/payout algorithms with production utility modules and import those modules in tests.
- Mock `fetch` and all external services in unit/integration tests; never call staging or mutate live data from Jest.
- Make environment mode explicit in the test command so fallback-enabled tests cannot mask failures.
- Add contract tests for each service request path, method, body, status handling, and response adapter.
- Add failure-path tests for auth, payment, triage, clinical completion, crisis, and permissions.
- Add route tests generated from the Expo Router manifest, including all role-prefixed deep links.
- Remove stale `login-form` route expectations.
- Add coverage thresholds appropriate to critical services and shared UI.
- Remove `--forceExit` from the default CI path and clean up Toast timers in tests.
- Keep a separate live integration command that requires an explicit opt-in and test account; it is not part of normal CI.

## Dependency and Native Readiness

- Align all Expo/RN packages to the versions required by Expo 52.
- Do not add new dependencies unless the existing stack cannot solve the requirement.
- Add EAS build profiles for production/demo configuration, but do not run APK/IPA builds in this phase.
- Keep web-only APIs behind platform adapters; native screens must not import browser storage or DOM APIs.
- Verify `expo install --check`, `expo-doctor`, TypeScript, Jest, web export, and route audit before requesting a native build.

## Security Containment

Before merging any implementation:

- Remove credential values from tracked configuration and rotate/revoke them externally.
- Do not print secret values in logs, tests, diffs, or reports.
- Add ignore rules for environment variants and service-account files.
- Keep the Docker/OpenAPI contract unchanged and document any backend capability that must be added separately.

## Acceptance Criteria

1. Production build has no automatic mock fallback.
2. Demo build is explicit, visibly labelled, and cannot be mistaken for live data.
3. Every screen clearly distinguishes live, empty, error, demo, and unavailable states.
4. No payment, clinical, crisis, chat-write, or withdrawal action reports success without a confirmed server response.
5. Role routes are unique and protected.
6. API requests match the committed OpenAPI contract.
7. Jest does not call external services and exits cleanly.
8. Expo/RN dependency checks and typecheck pass.
9. APK/IPA are not built until explicitly requested.
10. Obsidian project memory is updated after each verified implementation slice.

# Handoff: the fixture sign-in reaches success but never navigates

**Date:** 2026-09-30
**State at hand-off:** 48 suites, 1 failing (`payment-flow.test.tsx :: does not automatically
retry a rejected BPJS POST`, long standing). Typecheck 0 errors. Working tree clean.
**What is committed and working:** the dev fixture layer itself, 11 endpoints, the notice
banner, the split files, the relay. All verified by test, and the banner verified in a browser.

## The exact boundary where it stops

Four probes were placed temporarily in the running browser and every one fired, in order:

```
[probe] onPress dipanggil
[probe] username= "dev@contoh.test" pwLen= 1
[probe] mutationFn mulai
[probe] login() selesai
[probe] acceptSession dipanggil, attempt = {"id":1,"epoch":1}
[probe] acceptSession OK
```

Everything up to and including `acceptSession` succeeds. The screen then does nothing: the
URL stays `/login` and no error appears.

The two probes that never fired:

```
[probe] modal onSuccess dipanggil
[probe] wrapper onSuccess dipanggil   (inside mapAuthMutationOptions)
```

## What that rules out

- **The fixture works.** `apiRequest` returned the fixture, `login()` resolved, the sign-in
  completed. It is not a routing or flag problem in the browser.
- **The token is correct.** `decodeAccessToken` on `DEV_FIXTURE_TOKEN` returns
  `{ sub, email, role: "USER", isActive: true, exp }` and `isTokenExpired` is false. Three
  earlier defects were each found and fixed by measuring: the response had to be
  `TokenResponseDto` (`accessToken` + `refreshToken` only), the token had to be three
  base64url segments rather than a plain string or `btoa` output, and the role had to be
  `USER` because `SERVER_ROLES` has no `PATIENT`.
- **The form is fine.** `fill()` silently does nothing on a React Native Web controlled
  input, which cost several attempts. `press_sequentially` fills it correctly, and the value
  reaches the component.

## What was tried and reverted

Two changes were made, measured, and reverted because neither produced navigation:

1. `queryClient.clear()` in `acceptSession` was deferred with `setTimeout(..., 0)`. The
   reasoning was sound, since a cache clear destroys every mutation in the cache and the
   sign-in mutation is one of them. It changed nothing observable.
2. The sign-in modal was switched from `mutate` with callbacks to `mutateAsync` with
   `then`/`catch`, so the result does not depend on an observer being attached. Also changed
   nothing observable.

Both are plausible on their own merits and both are still worth considering, but neither is
established as the cause, so neither was kept.

## Where to look next

The callback never fires, but the mutation did run to completion. That points at the layer
between `acceptSession` returning and React Query delivering the result. The specific things
not yet checked:

- Whether `setState({ status: "authenticated" })` inside `acceptSession` causes a re-render
  that unmounts the modal, dropping the pending callback. The URL staying at `/login` is
  consistent with the guard in the `(patient)` group not running because navigation is
  decided inside a callback that never fires.
- Whether `explicitMutationRef` or `sessionVersionRef` interacts with the observer.
- Whether `useAuthLoginMutation` returning `{ ...mutation, mutate, mutateAsync }` is
  re-creating the callback identity each render, so the per-call options are dropped.

A test that asserts the end state rather than probing logs will settle it faster than the
browser did: render the modal, turn fixtures on, call the handler, and assert
`auth.homeRoute` is not null. That is deterministic and does not depend on Metro.

## Rules that held throughout and should keep holding

- No bypass. The auth guard, `useAuth` and `AuthProvider` were never disabled. The guard
  passes because sign-in genuinely succeeds.
- Isolation holds. One interception point in `apiRequest`, gated on
  `EXPO_PUBLIC_USE_MOCK_FALLBACK`, the notice in `app/_layout.tsx` above the navigator.
- Nothing unverified was left committed. Every probe and every speculative fix was reverted.

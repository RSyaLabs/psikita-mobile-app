# PsiKita Web Preview for BE and QA Review

**Date:** 2026-09-29
**Branch:** `fix/mobile-production-demo`
**Scope:** preview delivery only. No native build, no production change, no relaxation of the cleartext guard.
**Status:** DRAFT — one hard backend blocker in section 3.2

The host migration design that previously owned the base URL was removed with the
Azure deployment path, which is decommissioned. The live staging is operated by
the backend team at http://staging.psikita.muammarzaki.tech:3000 and serves plain
HTTP, which is the blocker described in section 3.2. This document owns only how
the app is shown to reviewers.

## 1. Goal

Give the backend and QA teams a URL they can open and exercise the real app
against the live staging API, without waiting for TLS, without building an APK,
and without weakening the transport-security invariant in the app.

## 2. Why web and not APK

An APK was evaluated and ruled out for now, on evidence:

- `mobile/android/` and `mobile/ios/` do not exist, so this is a managed workflow.
- `app.json` `expo.android` has only `adaptiveIcon` and `package`. There is no
  `usesCleartextTraffic` and no `networkSecurityConfig`, and a search of
  `app.json`, `eas.json`, and `package.json` finds no cleartext setting.
- A release APK therefore blocks cleartext HTTP to a non-local host at the
  operating-system layer, before any JavaScript guard runs. No change to
  `assertApiUrl` can override that.
- Giving the APK permission would mean adding a `networkSecurityConfig` that
  permits cleartext for one domain, and that config ships inside the APK and
  would have to be removed before any public release.

A browser has no equivalent rule. It only cares whether the certificate is
valid, and for a `localhost` page origin http is already accepted by the app's
own guard. So the web path needs no code change at all.

## 3. Facts established by observation

### 3.1 The staging API is live

`http://staging.psikita.muammarzaki.tech:3000`

- `/health/ready` returns `status: ok`, with `database: up` and `redis: up`.
- The live contract is OpenAPI 3.0.0, `Psikita Core API` 1.0.0, 113 paths and
  138 operations, security scheme `access-token`.
- `servers` is empty and the first path is `/health/live` at the root, so the
  base URL is the bare origin with no `/core` prefix.
- `staging-openapi.json` in this repository has the identical 113 paths. It is
  the contract of record.
- `https://api.staging.psikita.muammarzaki.tech` resolves to `34.50.121.210`
  but nothing listens on port 80 or 443 there. It cannot be used.

### 3.2 BLOCKER: the backend rejects every web origin except one

`Access-Control-Allow-Origin: http://localhost:3000`

The staging API returns that same value regardless of the `Origin` header sent.
Four different origins were tried, including one deliberately unrelated, and all
four received `http://localhost:3000`. The value is therefore a fixed
configuration, not an echo of the request.

Consequence: a browser will refuse the response, because the allow-origin value
does not match the page origin. The Expo web dev server serves on
`http://localhost:8081` by default, and any tunnel hostname will differ too. The
preview cannot work until the backend widens its CORS allowlist.

This is a backend change and is the single blocking dependency for this whole
document. It is not something the mobile repository can fix.

### 3.3 An existing build profile already points at the right thing

`eas.json` has a `demo` profile with
`EXPO_PUBLIC_API_BASE_URL=http://localhost:3000` and
`EXPO_PUBLIC_DEMO_MODE=true`. That is the app talking to a locally running
backend, which is not the staging host. The profile exists and is correct in
shape; only its value is wrong for this purpose.

`mobile/.env` currently holds `EXPO_PUBLIC_API_BASE_URL=https://api.lambada.my.id`
and is gitignored, so changing it affects this machine only.

### 3.4 What the app will refuse to do

`assertApiUrl` in `mobile/src/api/client.ts:134-141` rejects any non-HTTPS URL
whose host is not local, throwing `INSECURE_API_URL`. The local exemption list in
`isLocalHostname` is `localhost`, `*.localhost`, `127.0.0.1`, `::1`, and
`0.0.0.0`.

This guard is kept intact by this design. No allowlist is added and no exception
is introduced for the staging host.

## 4. Non-goals

- Do not build an APK, IPA, or any native artifact.
- Do not modify `assertApiUrl`, `isLocalHostname`, or the `INSECURE_API_URL`
  behaviour.
- Do not add a cleartext exception, an `__DEV__` escape hatch, or an
  `usesCleartextTraffic` setting.
- Do not change any production-facing value in `eas.json`'s `production` profile.
- Do not edit the backend or its CORS configuration from this repository.
- Do not run the mobile verification gates in this phase, by explicit user
  instruction.

## 5. Invariants that must hold

1. `assertApiUrl` is byte-identical before and after.
2. `eas.json`'s `production` profile is byte-identical before and after.
3. No credential from `mobile/.env` appears in any committed file, document, or
   vault note.
4. The preview reaches only the staging host, never a production host.
5. Reviewers are told in writing that the preview is http and internal-only.

## 6. Shape of the delivery

- A single documented command that starts the web build against the staging host.
- A short reviewer note stating the URL pattern, what works, what does not, and
  the transport caveat.
- The staging host's CORS allowlist widened to cover the preview origin, done by
  the backend team.

## 7. Risks

- **CORS is a hard blocker today.** See 3.2. Until it is fixed, a browser page
  will load and every API call will fail, which reads as "the app is broken"
  rather than "the preview is misconfigured".
- **`http://localhost:3000` collides with the backend port.** If the preview is
  ever served from port 3000 on the same machine it will collide with a local
  backend. The preview port must stay on 8081.
- **A tunnel exposes a public URL.** Sharing a preview through a tunnel makes the
  app reachable from the internet, carrying real staging credentials in the
  request headers. The tunnel must be closed once review ends.
- **Transport is cleartext.** Anything a reviewer types is visible on the path.
  This is acceptable for internal staging review and is not acceptable for
  production. It must be stated, not implied.

## 8. Open questions

**Q1 — Who widens the CORS allowlist, and to which origin?** The preview needs
the backend to allow the exact page origin reviewers will load. If the preview
is served from a tunnel, the allowlist entry must be that hostname, which changes
every time the tunnel restarts. A fixed hostname is strongly preferred over a
random tunnel subdomain.

**Q2 — How is the preview served?** A local `expo start --web` behind a tunnel, or
`expo export --platform web` uploaded to static hosting. The second is more
stable for reviewers, the first is faster to iterate. This choice determines the
origin that Q1 must allow.

**Q3 — Is demo mode on or off for the preview?** The `demo` profile sets
`EXPO_PUBLIC_DEMO_MODE=true`, which enables fixture fallbacks for capabilities
the backend does not support. Reviewers validating real backend behaviour need it
off. This has not been decided.

# Plan: PsiKita Web Preview via Cloudflare

**Date:** 2026-09-29
**Spec:** `docs/superpowers/specs/2026-09-29-psikita-cloudflare-preview-design.md`
**Zone:** `lambada.my.id` / `1896953c4ec6cb65ad38b7b90e295962`
**Status:** ready to start, pending Q1 in the spec

**No mobile verification gates run in this phase, by user instruction.** The two
gates that normally end each task are listed once in "Deferred verification" and
are not silently dropped.

## Task 0 — Confirm the names (no infra)

Take the app hostname and the API hostname from the user, defaulting to
`preview.lambada.my.id` and `api-staging.lambada.my.id`. Write the chosen pair
into the spec.

Everything downstream hardcodes these two strings, so a later change means
editing the DNS record, the Worker, and the Pages environment variable together.

**Gate:** names recorded in the spec. No account change yet.

## Task 1 — Create the Pages project (infra)

Create a Pages project for the PsiKita web build with:

- production environment variable `EXPO_PUBLIC_API_BASE_URL` set to
  `https://<api-hostname>`
- `EXPO_PUBLIC_DEMO_MODE` set per the review's purpose, decided before this task
- no build command, because the static bundle is uploaded directly

**Gate:** the project exists and the environment variable reads back correctly
through the API. Do not deploy in this task.

## Task 2 — Create the Worker (infra)

One Worker, no route. Behaviour:

- forward every request to `http://staging.psikita.muammarzaki.tech:3000`,
  preserving method, path, query, and request headers including `Authorization`
- answer `OPTIONS` preflight locally: status 204, allow-origin set to the single
  configured app origin, methods
  `GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD`, allowed headers `content-type,authorization`,
  and `Access-Control-Allow-Credentials: true`
- on real responses, replace the backend's `Access-Control-Allow-Origin` with the
  configured app origin
- forward status and body untouched
- **never** echo an arbitrary `Origin`

**Gate:** before any DNS exists, confirm the Worker does not echo an unrelated
origin. Send a preflight with a deliberately unrelated `Origin` and confirm the
response carries no allow-origin header. This is the check that keeps the
Worker from becoming an open credential proxy.

## Task 3 — DNS (infra)

- `CNAME <api-hostname>` to the Worker route, proxied
- `CNAME <app-hostname>` to the Pages project's `pages.dev` subdomain, proxied

**Gate:** both names resolve through Cloudflare. Confirm the existing
`api.lambada.my.id` record, the `cfargotunnel.com` records, and the other Pages
CNAMEs are untouched by comparing the record list against the 16 records
observed in the spec.

## Task 4 — Build and deploy the web bundle (no test run)

Export the web build and upload it to the Pages project.

```sh
cd mobile
npx expo export --platform web
```

The static output is `web-build` unless `expo export` is configured otherwise.
If deep links 404 on refresh, add a SPA fallback to the Pages project rather
than changing app routing.

**Gate:** the preview URL loads and shows the login screen. If the page renders
but every request fails, read the failure before touching the app: an absent
allow-origin means the Worker origin and the Pages hostname disagree, which is a
naming problem from task 0, not an app defect.

## Task 5 — Hand over (no code)

Give the backend and QA team, in writing:

- the preview URL
- that the API is reached through a proxy that terminates TLS in front of a
  plain-HTTP origin, and that the backend itself is unchanged and unaware
- that this is internal staging with test accounts, not production
- that the link is removed when the review ends
- what is implemented and what is not, from the audit documents

## Task 6 — Remove the link (operational)

Delete the DNS records created in task 3 once review is finished. The
`pages.dev` origin stays reachable unless the project is also deleted, so
either delete the Pages project or record that its `pages.dev` URL is still
live.

**Gate:** the chosen hostname no longer resolves. Confirm explicitly, and record
which of the two removals was performed.

## Deferred verification

These are not satisfied by anything in this plan and are deliberately not run
now:

```sh
npx tsc --noEmit --incremental
npm run test:ci
```

Carried forward honestly from earlier today:

- The full `test:ci` has not run since the last test edit. Three test files pass
  individually and typecheck reported 0 errors, but the suite is unverified.
- `mobile/__tests__/payments/payment-flow.test.tsx` hangs without `--forceExit`.
  Proven pre-existing by running the HEAD version of the file. Cause unknown.

## Out of scope

- APK, IPA, or any native build
- Any change to `assertApiUrl` or the cleartext guard
- Any backend change or backend request
- Reusing `api.lambada.my.id`
- Changes to the existing tunnel or the other four Pages projects

## Stop conditions

- The user wants to keep the old `api.lambada.my.id` hostname: stop. It is
  currently unproxied and pointing at a different host.
- The Worker cannot be made to refuse an unrelated origin: stop and report. Do
  not ship an origin-echoing Worker in front of a credentialed API.
- Reviewers report the preview is intermittently failing: check whether the
  Worker is up before suspecting the backend.
- Anyone asks to keep the link permanently: that is a different decision about
  exposure, and it needs a fresh spec.

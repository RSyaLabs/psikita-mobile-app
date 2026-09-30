# PsiKita Web Preview via Cloudflare — Design

**Date:** 2026-09-29
**Branch:** `fix/mobile-production-demo`
**Zone:** `lambada.my.id` (Cloudflare zone id `1896953c4ec6cb65ad38b7b90e295962`)
**Status:** DRAFT — needs one name decision in section 8

Supersedes the serving approach in
`docs/superpowers/specs/2026-09-29-psikita-web-preview-be-qa-design.md`. That
document's finding about the CORS allowlist still holds and is reused here; its
local-proxy and tunnel options are dropped because neither produces a shareable
link.

## 1. Goal

Produce one HTTPS URL that the backend and QA teams can open and exercise the
real app against the live staging API, with **no change to the backend and no
communication with the backend team**.

## 2. The constraint that shapes everything

The staging API runs on `http://staging.psikita.muammarzaki.tech:3000` and its
CORS header is a fixed `Access-Control-Allow-Origin: http://localhost:3000`,
verified against four unrelated origins. Two browser rules follow:

1. A page served over HTTPS may not call an HTTP URL. Exempt: `localhost`.
2. A cross-origin response is discarded unless its allow-origin matches the page
   origin exactly.

The backend can satisfy neither, and it must not be asked to change.

## 3. Why a proxy in the middle removes both problems

Cloudflare terminates TLS and re-emits the response on the way out. Anything
Cloudflare puts in front of the backend can therefore:

- present a valid HTTPS certificate
- forward to the plain-HTTP backend unchanged
- overwrite the allow-origin header with the exact page origin

The backend never sees the rewritten header and requires no knowledge of the
preview. This is why no backend communication is needed.

```
reviewer browser
  -> https://preview.lambada.my.id        (Cloudflare Pages, the web build)
  -> https://api-staging.lambada.my.id   (Cloudflare Worker)
  -> http://staging.psikita.muammarzaki.tech:3000   (unchanged)
```

Both browser-facing hops are HTTPS, so rule 1 does not apply. The Worker sets
`Access-Control-Allow-Origin: https://preview.lambada.my.id`, so rule 2 does not
apply.

## 4. What already exists

Verified in the account, read-only:

- Zone `lambada.my.id` is `active`, nameservers `destiny.ns.cloudflare.com` and
  `jonah.ns.cloudflare.com`.
- Four Cloudflare Pages projects are already deployed, all using the same shape
  this design needs: a `pages.dev` origin plus a proxied CNAME, with the API
  address supplied through a build environment variable. `umkm-frontend` is the
  closest precedent, carrying `PUBLIC_API_URL=https://api.beres.lambada.my.id`.
- `api-staging.lambada.my.id` and `preview.lambada.my.id` are both unused. The
  zone has 16 records and neither name appears among them.
- `api.lambada.my.id` is an existing `A` record to `40.83.76.31` with
  `proxied: false`. It is the old PsiKita API host and is **not** reused here.
- A `cfargotunnel.com` tunnel is already attached to the zone for other
  services. This design does not need it and does not touch it.

## 5. Components

### 5.1 Web build on Cloudflare Pages

A new Pages project for the Expo web output. `app.json` already sets
`expo.web.output` to `static` and `bundler` to `metro`, so `npx expo export
--platform web` produces a static bundle that Pages can serve directly. The
project's production environment variable is
`EXPO_PUBLIC_API_BASE_URL=https://api-staging.lambada.my.id`.

A custom domain CNAME `preview.lambada.my.id` to the project's `pages.dev`
subdomain, proxied, matching the pattern of `beres` and `bot`.

### 5.2 API proxy as a Cloudflare Worker

One Worker, no route, handling every path. It forwards to
`http://staging.psikita.muammarzaki.tech:3000` and rewrites the response:

- replace `Access-Control-Allow-Origin` with the exact allowed origin
- replace `Access-Control-Allow-Credentials` only if the backend omits it; the
  backend already sends `true`
- answer `OPTIONS` preflight locally with the allowed methods and headers, so
  preflight never reaches the backend
- leave every other header, status code, and body byte untouched

The backend already sends correct values for methods
(`GET,POST,PUT,DELETE,PATCH,OPTIONS,HEAD`) and headers
(`content-type,authorization`), so the Worker does not need to restate them
except on the preflight it answers itself.

A DNS record `api-staging.lambada.my.id` pointing at the Worker route, proxied,
so Cloudflare issues the certificate.

### 5.3 Allowed origin is exactly one

The Worker must not echo arbitrary origins. It is configured with a single
literal, `https://preview.lambada.my.id`, and any request whose `Origin` is not
that value gets no allow-origin header. This is deliberate: an open echo plus
`Access-Control-Allow-Credentials: true` is a credential-theft primitive, and
the whole point of the fixed-origin design is to avoid recreating that.

## 6. Why the app needs no change

`assertApiUrl` in `mobile/src/api/client.ts:134-141` rejects any non-HTTPS URL
whose host is not local. With `EXPO_PUBLIC_API_BASE_URL` set to
`https://api-staging.lambada.my.id` the URL is HTTPS, so the guard passes
untouched. No allowlist, no `__DEV__` escape hatch, no `usesCleartextTraffic`, no
`networkSecurityConfig`.

## 7. Non-goals

- Do not change anything in the backend or its CORS configuration.
- Do not contact the backend team about this preview.
- Do not build an APK or IPA, or add native folders.
- Do not modify `assertApiUrl`, `isLocalHostname`, or `INSECURE_API_URL`.
- Do not change the `production` profile in `eas.json`.
- Do not reuse or repoint `api.lambada.my.id`.
- Do not touch the existing `cfargotunnel.com` tunnel or the other four Pages
  projects.
- Do not run the mobile verification gates in this phase, by user instruction.

## 8. Invariants

1. `assertApiUrl` is byte-identical before and after.
2. `eas.json`'s `production` profile is byte-identical before and after.
3. The Worker allows exactly one origin and never echoes an arbitrary one.
4. The Worker forwards to the staging host and to no other.
5. No staging or production credential appears in any committed file, Pages
   environment variable, or vault note.
6. Existing Pages projects, DNS records, and the tunnel are unmodified.
7. Reviewers are told in writing that this is internal staging over a link that
   terminates TLS in front of a plain-HTTP origin.

## 9. Risks

- **The link is public while it exists.** Anyone with the URL can reach staging.
  Staging holds test accounts, not production patients, but the URL is
  unguessable only by obscurity. Delete the DNS record when review ends.
- **The Worker is a new trusted component in front of the API.** It can rewrite
  responses. It must forward status codes and bodies verbatim; anything it
  "improves" would hide real backend behaviour from the reviewers, which is the
  opposite of the point.
- **The Worker adds latency and a failure mode** between reviewer and backend.
  If it is down, the preview is down. It must not be mistaken for a backend
  outage.
- **Header rewriting can mask a real CORS bug.** Once the Worker is in front, a
  genuine backend CORS misconfiguration stops being visible. That is acceptable
  for a preview and must be stated, because it is exactly the class of problem
  that would otherwise reach production.
- **Static export routing.** `expo.web.output` is `static`, so client-side
  routes need a SPA fallback. If deep links 404 on refresh, that is the Pages
  `_redirects` or `_headers` file, not an app bug.

## 10. Open question

**Q1 — Are the proposed names acceptable?** `preview.lambada.my.id` for the app
and `api-staging.lambada.my.id` for the API. Both are currently free. If
different names are wanted, they must be decided before the DNS records are
created, because the allowed origin in the Worker and the build environment
variable both hardcode the app's hostname.

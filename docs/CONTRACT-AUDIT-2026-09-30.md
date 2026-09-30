# Contract Audit — Psikita Mobile vs Live Staging

**Date:** 30 September 2026
**Auditor:** frontend team
**For:** backend / QA team
**Live target:** `http://staging.psikita.muammarzaki.tech:3000` — reachable on the day of this audit, 113 paths, OpenAPI 3.0.0, title `Psikita Core API` v1.0.0
**Method:** static comparison of the client against the live document, plus runtime probes of every endpoint the mobile app calls that can be reached without credentials

---

## Read this first: what is and is not proven

This audit is **mostly static**. Every authenticated `GET` the app calls returns `401` without a token, and 21 of the 32 endpoints are writes that were deliberately not issued against a shared server. So:

| Proven                                                      | How                                                |
| ----------------------------------------------------------- | -------------------------------------------------- |
| Every endpoint path and method the client uses exists       | Compared against the live document; 32 of 32 match |
| Every endpoint the client calls is reachable and auth-gated | Probed at runtime                                  |
| The error envelope shape                                    | Probed at runtime                                  |
| `/health/*` response shapes                                 | Probed at runtime                                  |
| **Every documented 2xx response body**                      | **NOT proven. Statically compared only.**          |

That last row is the one that matters for planning. Nothing in this document should be read as "the response contract is correct at runtime" — it is "the response contract is correct in the document, and the client's parser agrees with the document".

---

## Live findings, 30 September — the ADMIN role cannot read clinical data

This section was missing from the first draft and should be read before anything else.
The document comparison below says the client's schemas agree with the contract. It does
**not** say the client can read anything, because it cannot.

A valid ADMIN session was obtained and then used against the live staging. Sign-in itself
works: `POST /auth/password/login` returns HTTP 200 with exactly `accessToken` and
`refreshToken` and nothing else, matching `TokenResponseDto` as documented. Token lifetime
is one hour.

After that, every clinical read fails:

| Request                | Result                                                    |
| ---------------------- | --------------------------------------------------------- |
| `GET /patient`         | **500 Internal Server Error**, three attempts, consistent |
| `GET /patient/me`      | 403 — lacking `read` permission on `PatientProfile`       |
| `GET /practitioner`    | 403 — lacking `read` permission on `Practitioner`         |
| `GET /practitioner/me` | 403 — lacking `read` permission on `PractitionerProfile`  |
| `GET /prescriptions`   | 403 — lacking `read` permission on `Prescription`         |
| `GET /patient/1`       | **404 `Patient not found: 1`** — not a permission error   |

Three findings in that table, in order of how much they block the frontend:

1. **The ADMIN role has no `read` permission on any clinical resource.** This is the CASL
   issue recorded as fixed on 26 September; the fix reached a local Docker image and a Redis
   flush, not this deployment. The permission matrix on staging still lacks the entries.
2. **`GET /patient` returns 500.** Not an authorization result and not an empty page — an
   unhandled server error, reproducible every time.
3. **Authorization is inconsistent between sibling routes.** The same token yields 403 on
   `/patient/me`, 404 on `/patient/{id}`, and 500 on `/patient`. Three different outcomes
   from one resource family means the guards are ordered differently per route, which will
   not be debuggable from the client side.

Reads that do succeed, all returning empty collections rather than data:
`/triage/queue` returns 200 `array(0)`; `/ledger/accounts`, `/ledger/journals` and
`/payments` return 200 `paginated(0)`. The database is reachable and the session is valid;
the failure is specifically the permission layer plus one crashing handler.

The live contract is **byte-identical** to the checked-in `staging-openapi.json`: 113 paths,
zero difference in either direction. Nothing found here is contract drift.

---

## Latent risk, not P0 — the client reads a room id from a field the contract never defines

`mobile/src/api/matching.service.ts`

`matchingResponseSchema` accepts `consultation`, `consultationId`, `roomId` and `practitionerId` (lines 55–58). `MatchingResponseDto` in the live document has ten properties and **none of these are among them**.

`mintMatchingClaimResponseContext` (line 98) is the only source of the `ActiveConsultationContext` that `isTrustedMatchingConsultationContext` treats as authorization-bearing, and its `roomId` comes from exactly that undocumented field:

```
const room   = asRecordOrUndefined(nested.room);            // line 158
const roomId = asNonEmptyString(nested.roomId)             // line 159
              ?? asNonEmptyString(room?.id);
```

The surrounding function does real work: it rejects a response whose `id` is not the matching request that was asked for, rejects conflicting consultation identifiers, and returns `undefined` when the patient or practitioner identifiers disagree. What it does **not** do is cross-check `roomId` against anything, because there is nothing in the contract to check it against. It only has to be a non-empty string.

**Corrected priority: this was written as a P0 and that was wrong.** claimMatchingRequest
has exactly one caller in the application, practitioner/war-room.tsx, and that screen's
claim button is isDisabled={!demoMode}. There is no path from a real backend to this code
today. The finding is correct as a description of the code and unreachable in practice, so
it belongs below the two P0s that are actually blocking. It is recorded here rather than
deleted because the code defect is real: the moment any screen claims a matching request
outside demo mode, the client will trust an undocumented field for room placement. That is
worth fixing before the screen exists, not after.

**Asks for the backend team:**

1. Either add `consultation` to `MatchingResponseDto` with a documented shape, including `roomId`, or
2. Confirm that `/matching-requests/{id}/claim` is not supposed to return consultation context at all, in which case the client should stop reading it.

Until one of those is settled, the client should not be treated as having a verified path from a claim response into a consultation room.

---

## P0 — the health check reports a healthy backend as down, every time

`mobile/src/api/client.ts:449` and `mobile/src/api/response.ts:48`

Verified by execution against the live host, not by reading:

```
GET http://staging.psikita.muammarzaki.tech:3000/health/live
  -> 200, Content-Length: 15, body {"status":"ok"}
```

The client calls that endpoint with `adapter: noContentAdapter` (client.ts:454). `noContentAdapter` throws whenever the value is not `undefined` (response.ts:49). Because the body is 15 bytes and not empty, `isEmptyResponse` is false, the body is parsed, and the adapter throws — which `checkBackendHealth` catches in its bare `catch` (client.ts:457) and returns `false`.

The function whose entire purpose is to report whether the backend is serving this client correctly **cannot return `true` against a backend that is up**.

**Root cause is a contract disagreement, not a client bug.** The document declares `200` on `/health/live` with **no content**. The server returns a JSON body. One of the two has to change; the client's comment at client.ts:458–461 says a 200 that returned an HTML error page used to be reported as healthy, which is why the adapter is strict. So this needs a decision, not a patch.

**Asks:** either the server returns an empty body on `/health/live`, or the document declares the body and the client parses it. Returning `{"status":"ok"}` is useful and the client should accept it.

---

## P0 — the client cannot reach this staging at all from a browser

Three independent blockers, all confirmed against the live host:

**1. Cleartext is refused for a non-local host.** The client allows `http:` only for loopback (`client.ts:165`, `assertApiUrl`). This staging is plain HTTP on a public host, so every request throws `INSECURE_API_URL` before anything leaves the device. The guard is correct and should stay.

**2. CORS allows one origin and it is not the mobile app's.** The live server returns `Access-Control-Allow-Origin: http://localhost:3000` on every probe. The mobile dev server is on `8081`. The backend `env.example` in this repo says `FRONTEND_URL=http://localhost:5173`. Three different values, none of which is where this app runs.

**3. There is no HTTPS deployment.** `https://api.staging.psikita.muammarzaki.tech/core/health/live` does not respond; the host resolves but no port is open. The `/core` path prefix in that URL also appears nowhere in the contract or the client.

**Asks:** an HTTPS deployment on the host the client is configured to use, and `FRONTEND_URL` corrected to the origin the app is actually served from. Until then, browser testing cannot exercise a real backend at all — which is why the fixture layer exists.

---

## P1 — response schemas the client accepts that the contract does not define

Each of these means a screen can display a value the server never sent. All verified by grepping the live document for the property name: zero occurrences.

| File                      | Fields read                                                                                                                                                                               | Contract property count                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `consultation.service.ts` | `roomId`, `room`, `billingOrderId`, `fee`, `practitionerName`, `practitionerTitle`, `practitionerSpecialization`, `practitionerAvatar`, `patientName`, `patientAvatar`, `icdCode`, `note` | `ConsultationResponseDto` has 11; none of these are among them         |
| `practitioner.service.ts` | `fullName`, `title`, `specialization`, `avatar`, `consultationFee`, `totalSessions`, `experienceYears`, `supportsBpjs`, plus `fieldOfStudy`, `startYear`, `endYear`, `workplace`          | `PractitionerResponseDto` has 15; none of these are among them         |
| `prescription.service.ts` | `prescriptionNumber`, `doctorName`, `doctorSip`, `notes`, `qrCodeUrl`, `validUntil`                                                                                                       | `PrescriptionResponseDto` has 7; none of these exist                   |
| `patient.service.ts`      | `nik`, `bpjsNumber`, `faskes1`                                                                                                                                                            | `PatientResponseDto` has none; `nik` exists only on `CreatePatientDto` |
| `matching.service.ts`     | `consultationId`, `roomId`, `practitionerId`, `consultation`, `assignedDoctor`                                                                                                            | see latent risk above                                                           |
| `consultation.service.ts` | `senderRole`, `contentType` (defaulted to `"UNKNOWN"`)                                                                                                                                    | absent from `MessageResponseDto`                                       |

The frontend types these as display fields in `mobile/src/types/api.ts`, so they look like a supported contract to anyone reading the code. They are not.

**Asks:** confirm whether these fields are intended. If they are, they need to be in the contract. If they are not, the client should stop reading them — they are the reason a screen can show a fabricated-looking value that the client believes the server sent.

---

## P1 — required fields the client treats as optional

The client accepts a response the contract would call invalid. A response missing these fields passes validation silently.

| File                         | Field                                      | Client                    | Contract |
| ---------------------------- | ------------------------------------------ | ------------------------- | -------- |
| `prescription.service.ts:23` | `patientId`                                | `.optional()`             | required |
| `prescription.service.ts:25` | `practitionerId`                           | `.optional()`             | required |
| `prescription.service.ts:34` | `updatedAt`                                | `.optional()`             | required |
| `prescription.service.ts:32` | `items`                                    | `.optional().default([])` | required |
| `ledger.service.ts:42`       | `currency` on `LedgerAccountDto`           | `.optional()`             | required |
| `practitioner.service.ts:33` | `major` on `EducationResponseDto`          | `?? ""`                   | required |
| `practitioner.service.ts:34` | `graduationYear` on `EducationResponseDto` | `?? 2020`                 | required |
| `practitioner.service.ts:48` | `facilityName` on `ExperienceResponseDto`  | `?? ""`                   | required |

Two of these invent data rather than merely accepting less:

- `items: .default([])` renders a prescription with no items as a valid prescription with **zero medications**. A patient reads that as "I have been prescribed nothing", not as "the server sent something malformed".
- `graduationYear: ?? 2020` displays the invented year **2020** on a practitioner's credentials.

**Note on ownership:** `prescription.service.ts` and `practitioner.service.ts` drift are frontend defects, not contract defects. The frontend team is fixing them. This section is listed so the report is complete, not as a backend action.

---

## P1 — practitioner type enum: if the server sends what the document shows, every read fails

`practitioner.service.ts:57` validates `type` against `PRACTITIONER_TYPES = ["PSYCHOLOGIST", "PSYCHIATRIST"]`.

The live `PractitionerResponseDto.type` is `{"type": "string", "example": "psychologist"}` — **no enum at all**, and the documented example is lowercase. The uppercase enum exists only on the request side, where `CreatePractitionerDto.type` and `CreateBillingOrderDto.practitionerType` both do declare it.

If the server emits the documented `"psychologist"`, the client's `z.enum` rejects it and `/practitioner/*` returns 502 for every caller. This is fail-closed, so it is not a data-integrity risk — but it is a total outage of the practitioner directory, and it is the single most likely thing to break first on integration.

`availabilityStatus` has the same shape at a narrower blast radius: the client restricts it to four values, the document declares a plain string with `"AVAILABLE"` as the example.

**Asks:** confirm the casing actually returned by `GET /practitioner` and `GET /practitioner/{id}`, and either declare the enum in the response schema or drop the client's restriction. The frontend team can relax to `z.string()` plus a runtime check at the use site if the response is genuinely unconstrained.

---

## P2 — defects in the OpenAPI document itself

These are the backend team's to fix, and they are why parts of this audit had to be done by hand.

- **97 of 138 operations reference an undefined security scheme.** `components.securitySchemes` defines exactly one, `access-token`. Ninety-seven operations declare `security: [{"bearer": []}]`, and `bearer` is not defined anywhere. A further 41 declare no `security` and there is no top-level `security`.
- **No error schema anywhere.** Every non-2xx response in the document has a `description` and no `content`. The server in fact returns a consistent envelope that the document never describes: `{"success":false,"statusCode":N,"error":"...","message":"..."}`. This envelope is what the client parses, so it is load-bearing and currently undocumented.
- **`servers` is an empty array.** No base URL is recorded in the document.
- **`POST /payments` 200 response is `{"type":"object"}`** with no properties, while the client parses it strictly for `id, status, amount, contextType, contextId, instruction`. There is no `PaymentResponseDto` for the create path; the typed one (`PaymentDto`) is attached to `GET /payments` and requires only three fields. The client's parser is stricter than anything the document offers for the path it is actually used on.
- **`MatchingResponseDto.status`, `.assignedPractitionerId` and `.deadlineAt` are declared `type: object`**, the latter two `nullable`, while carrying identifier and timestamp names. The contract contradicts itself. The client accepts string-or-record and reads defensively, so it survives either, but the document should say which is right.
- **`GET /health/live` declares no content** but returns a 15-byte body. See P0.
- **A method mismatch returns 404, not 405.** `GET` against sixteen documented POST-only paths returns `404 "Cannot GET <path>"`. This is indistinguishable from a typo in the path and will cost someone an hour.
- **`OPTIONS` carries no route information.** It returns 204 with no `Allow` header for every path, including a path that does not exist.
- **`GET /payments` declares no query parameters** while returning a paginated response.

---

## What is clean

Stated so the report is not read as uniformly negative.

- **32 of 32 client endpoints match the live contract on both path and method.** Verified by `mobile/scripts/endpoint-audit.js`, and that script is itself verified: mutating one call from `POST` to `PUT` makes it report the mismatch and exit non-zero.
- `referralSchema` matches exactly.
- `assessmentResultSchema` matches exactly — all eleven required fields and all three enums.
- `feedbackSchema` and `feedbackRequestSchema` match, including the `.strict()` field set.
- `matching.service.ts` `requiredLevel` and `notes.service.ts` `contentType` enums match exactly, lowercase on both sides.
- `PaginationMeta` in the document has exactly the five fields the client requires.
- Every query parameter the client sends exists in the document under the same name.
- No 500s on any probed path. No HTML or non-JSON bodies.
- `GET /health/ready` and `GET /health/dependencies` match their documented shapes.

---

## Recommended order for the backend team

Reordered on 30 September after the live probes. The permission defect was absent from the
first draft of this list despite blocking more of the frontend than anything else here.

1. **Add `read` on the clinical resources to the ADMIN role's permission matrix, and fix the
   500 on `GET /patient`.** Until this lands no authenticated client can read any clinical
   data, so every other item is untestable. This is the CASL issue recorded as fixed on
   26 September; the fix did not reach this deployment.
2. **Make the authorization guards consistent across sibling routes.** One resource family
   currently produces 403, 404 and 500 from the same token.
3. Bring up an HTTPS deployment on the host the client is configured for. Nothing else can
   be tested in a browser until this exists.
4. Correct `FRONTEND_URL` to the origin the app is served from. The value in `env.example`
   (5173) does not match the running server (3000) and neither matches the app (8081).
5. Settle `/health/live`: return an empty body, or declare the body and let the client parse
   it. The client currently cannot report a healthy backend.
6. Publish the error envelope as a schema, and fix or remove the dangling `bearer` security
   scheme.
7. Confirm the casing of `PractitionerResponseDto.type` and `availabilityStatus`.
8. Decide whether `MatchingResponseDto.consultation` is intended — see the latent risk above,
   which is real in code but unreachable today.
---

## What the frontend team is doing in parallel

- Restricting `prescriptionSchema` and `practitioner.service.ts` to the documented field set and restoring the required fields, including removing the `items: []` default and the invented graduation year.
- Re-examining whether `matching.consultation` should be read at all pending the answer in P0.
- Adding a regression test for the fabricated-value class of defect, which the current suite did not catch on eleven screens.

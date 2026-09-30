# Visual review — PsiKita mobile web

Date: 30 September 2026. Viewport 390x844 @ DPR 1, fixture mode on, Chrome.
Method: 8 screens inspected directly, 27 more inspected by two delegated reviewers
who returned text findings only so the images never entered the controlling session.

## Coverage

All **39 of 39 routes** rendered without an error boundary. Every screen was inspected
visually. Contrast was additionally measured on all 39 with ancestor-opacity compositing.

## The headline

**Developer scaffolding is the primary content on a large share of screens.** On triage,
history, rating and matching the entire screen is backend-contract language. On
notifications, articles, article-detail and video-call a diagnostic panel is the loudest
element. It renders raw HTTP paths (`POST /triage/submit`,
`GET /CONSULTATIONS/{ID}/RTC-SESSION`, `/matching/requests/:id/claim`), file names and path
counts (`staging-openapi.json, 113 path`), and internal system names (`Dukacapi`).

This is a direct consequence of the honest-unavailability work. Each individual message was
honest and each was correct on its own terms. They were never consolidated, so they
accumulated into the dominant visual element on the screens that needed them least.

## Dead space is one structural defect, not thirty

Between 30 and 75 percent of the viewport is empty on: assessment-result, history, rating,
matching, chat-room, war-room, practitioner/chat, admin/verification, admin/settings, and
~150px on the patient dashboard. The pattern is consistent — empty states are top-aligned
rather than vertically centred, so a short card floating at the top of a tall screen looks
like a loading failure rather than an empty state.

## Both reported collisions were false positives

- `overtime-modal`, 83 percent overlap — **no collision is visible**; the sheet renders
  cleanly.
- `practitioner/withdraw`, 56 percent between "Maks" and an svg — **no svg is anywhere
  near that row**; the row contains only an amount and a right-aligned "Maks".

The detector was reading fixture content that is not visually present. Neither should be
reported as a real collision. This is the second time today that an automated check of mine
produced a confident wrong answer.

## Other defects, grouped

**Disabled controls look enabled.** The most severe recurring issue. Gluestack's `isDisabled`
fades the whole control to 0.4, which drags its label toward the page behind it, so an
unavailable action reads as a rendering fault. Confirmed visually and measured:

| Screen                    | Text                              | Ratio       |
| ------------------------- | --------------------------------- | ----------- |
| prescription              | Simpan resep belum tersedia       | 1.36        |
| practitioner/bank-account | Konfirmasi & Tarik Dana           | 1.44        |
| practitioner/withdraw     | Tarik Rp3.240.000 sekara…         | 1.44        |
| payment-regular           | Kanal dan saldo ditentukan server | 1.72        |
| checkout                  | Lihat semua                       | 1.75        |
| payment-regular, checkout | E-WALLET / Status manfaat BPJS    | 2.26        |
| overtime-modal            | two strings                       | 2.06 / 2.22 |

On withdraw the primary CTA is a large filled dark-green button that looks tappable and is
not. Ten further strings sit between 3.93 and 4.20 against 4.5.

**Raw technical values as product copy.** `ACTIVE`, `FINISHED`, `YELLOW • COUNSELING`,
`SELF_ASSESSMENT`, `PSYCHOLOGIST`, `STR-DEV-0003`, `SIPP-DEV-0001`, `PAY-2026-001`,
`dev-ref-0001`, `RM-2026-0001`, `dev-patient-0001`, raw ISO `1995-01-01` in a date field.

**Fixture identifiers and zero-filled placeholders read as real values.**
`000000000000001` as a NIK placeholder, `+6280000000000`, "dr. Rina Amelia, M.Psi (Dokter
Contoh Satu)" as a display name, `#1231` as a patient identity on a refund row.

**Data contradicts itself across screens.** Practitioner profile shows 142 sessions while
its own history screen reports none available. Admin ledger shows zero expenditure and net
profit equal to revenue, while the practitioner withdrawal history shows money leaving.
Admin dashboard shows 1 user where verification shows 6 practitioners.

**Fixed bars clip content.** article-detail slices a sentence mid-line behind the CTA bar;
edit-profile hides a form field; bank-account hides the last card; withdraw's tab bar
overlaps content. No consistent bottom inset anywhere.

**Broken chart.** `admin/ledger` "Sumber Pendapatan" legend lists three slices at 80/12/8
but the ring renders a single arc — the split is not represented at all. `admin/dashboard`
bars carry no axis, no values, no gridlines, and two highlighted days with no legend.

**Language drift.** `Anxiety` / `Self-Love` / `ANXIETY` chips in an Indonesian UI, "sleep
hygiene", "(here and now)", "Rs Subscription".

**Inconsistent chrome and copy.** `/patient/matching` has no header at all. `rating`'s only
button is grey where siblings use dark-green primaries. `withdraw` reads
"Januari 2026 - Januari 2026". `bank-account` has a typo, "Riwajat Pencairan Terakhir".
`profile` has "6 th", and "Total sesi142" run together. `notifications` mixes
`15 mnt yang lalu` / `Kemarin, 14:20` / `4 hari yang lalu` in one list, and tags a GAD-7
result as `RESEP & MEDIS`. `edit-profile` renders the same segmented control at two heights.
`profile`'s card rhythm is tighter than its siblings. Amounts wrap to two lines wherever a
right column is involved.

**Numbers that mislead.** Admin ledger renders "Pengeluaran Rp 0" in red, so the best
possible value reads as an error. The `UJI COBA` trial pill is styled identically to
`TERHUBUNG` and `PRODUKSI`.

**Small grey micro-copy is systemic and separate from the disabled-button issue** — overlines
such as `RINGKASAN SESI`, helper lines, and CTA sub-labels are the lowest-contrast text in
the app and are not part of that treatment.

## Corrections made to delegated and earlier findings

- A reviewer reported `/admin/settings` defaults to the "Pasien (1)" tab, calling it a
  routing bug. **Verified false.** The active tab is "Pengaturan" — white text on the dark
  green pill — and the rendered content is the tariff settings, which matches.
- Commit `bbf100e`'s subject claims the visual inconsistency was the palette. It fixed the
  palette and six screens. Sixteen screens still fail contrast and the aesthetic problems
  above were never addressed by it.

## What is not covered

No screen was tested in dark mode — the app is light-only. No screen was tested below 390px
or above 430px, so the desktop framing at >480px is unexamined since the layout crash was
fixed. Long-press, scroll behaviour and gesture states were not exercised.

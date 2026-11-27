# Branch Logic Port Audit (`fix/android-staging-native-and-api-contracts` -> `tarisrizki`) — RLN-35

| Area / File | Decision | Reason & Active Backend Contract |
|---|---|---|
| `mobile/src/api/consultation.service.ts` (`finish`) | **Ported** | `POST /consultations/:id/finish` returns `200 ConsultationResponseDto` rather than `204`; now validated via `consultationAdapter`. |
| `mobile/app/(patient)/patient/chat-room.tsx` (finish guard) | **Ported (Clean UI)** | Removed patient `useFinishConsultation` clinical closeout action per RLN-36 while keeping approved Gluestack/Wireframe UI intact. |
| `.github/workflows/mobile-quality.yml` & `android-staging.yml` | **Ported** | Separated code-quality gate (`tsc`, Jest, `knip`, contract audit) from Java 17 + Android SDK local EAS APK build with SHA256 artifact checksums (RLN-37). |
| `mobile/eas.json` (`production.env`) | **Fixed** | Added missing `/core` prefix to `https://api.seraphany.id/core`. |
| `mobile/src/api/clinical-result.service.ts` / `consultation-assessment.service.ts` / `patient-assessment.service.ts` | **Deferred** | Depends on unmerged Core API PR `#23` assessment/co-assessment contracts; kept dormant until Core release gates pass. |
| Rejected UI screen redesigns (`login.tsx`, `triage.tsx`, `payment-regular.tsx`, `diagnosis.tsx`) | **Rejected** | Superseded by full 103-screen approved SeraPhany wireframe implementation on `tarisrizki`. |

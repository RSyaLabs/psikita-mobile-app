# Maestro E2E Testing Suite for PsiKita Mobile

Arsitektur otomasi pengujian end-to-end (E2E) deklaratif mengadopsi standar industri dari `react-native-template-obytes`.

## Prerequisites
1. Install Maestro CLI:
   ```bash
   # Windows (PowerShell)
   curl -fsSL "https://get.maestro.mobile.dev" | powershell -Command -
   ```
2. Jalankan aplikasi di emulator Android atau iOS Simulator:
   ```bash
   npm run android
   # atau
   npm run ios
   ```

## Menjalankan E2E Flows
```bash
# Menjalankan alur pasien (Login -> Dashboard -> Triase Asesmen)
maestro test .maestro/flows/patient-onboarding-triage.yaml

# Menjalankan alur praktisi (Login -> Dashboard Praktisi -> War Room)
maestro test .maestro/flows/practitioner-consultation.yaml
```

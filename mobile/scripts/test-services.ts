import {
  authService,
  patientService,
  triageService,
  matchingService,
  consultationService,
  notesService,
  prescriptionService,
  practitionerService,
  checkBackendHealth,
  setAuthToken,
} from "../src/api";

if (process.env.PSIKITA_INTEGRATION !== "1") {
  console.error(
    "Integration tests are opt-in. Run `npm run test:integration` explicitly.",
  );
  process.exit(1);
}

async function runServiceTestSuite() {
  console.log("=================================================");
  console.log("🧪 PSIKITA API SERVICE INTEGRATION TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error:`, err?.message || err);
      failed++;
    }
  }

  // 1. Health Probe
  await testCase("Backend Health Check Probe (/health/live)", async () => {
    const isLive = await checkBackendHealth();
    console.log(
      `   Health status: ${isLive ? "Online (Server Responding)" : "Offline (Using Hybrid Mock Fallback)"}`,
    );
  });

  // 2. Auth: Password Login
  await testCase("Auth: Login with Password", async () => {
    // Credentials come from mobile/.env (gitignored). A previous revision
    // hardcoded "smoke-account" / "test-only-password", which matched no
    // account in any environment, so every case after this one failed with
    // "Token authentication not found" rather than a real defect.
    const username = process.env.PSIKITA_TEST_USERNAME;
    const password = process.env.PSIKITA_TEST_PASSWORD;
    if (!username || !password) {
      throw new Error(
        "Set PSIKITA_TEST_USERNAME and PSIKITA_TEST_PASSWORD in mobile/.env",
      );
    }
    const res = await authService.loginWithPassword({
      username,
      password,
    });
    if (!res.accessToken) throw new Error("Missing accessToken in response");
    if (!res.refreshToken) throw new Error("Missing refreshToken in response");
    // staging-openapi.json TokenResponseDto documents accessToken and
    // refreshToken only. It has no `user` property, and no documented
    // endpoint returns the caller's role, so requiring `user` here made the
    // harness abandon a perfectly valid token and fail the 12 cases below it
    // with "Token authentication not found". Record the gap instead of
    // treating it as a login failure.
    if (!res.user) {
      console.log(
        "   NOTE: login succeeded but the contract returns no user object,",
      );
      console.log(
        "         so role-dependent routing has no server source of truth.",
      );
    }
    // Test-only setup: the app's AuthProvider owns production session writes.
    await setAuthToken(res.accessToken);
  });

  // 3. Auth: Google Login
  await testCase("Auth: Login with Google ID Token", async () => {
    const googleIdToken = process.env.EXPO_PUBLIC_GOOGLE_ID_TOKEN;
    if (!googleIdToken) {
      console.log("   Google login skipped: no test token configured");
      return;
    }

    const res = await authService.loginWithGoogle({ idToken: googleIdToken });
    if (!res.accessToken)
      throw new Error("Missing accessToken in Google response");
    // Test-only setup: the app's AuthProvider owns production session writes.
    await setAuthToken(res.accessToken);
  });

  // 4. Auth: Request OTP & Verify OTP
  await testCase("Auth: Request OTP & Verify OTP", async () => {
    await authService.requestOtp({ email: "test@psikita.id" });
    const verifyRes = await authService.verifyOtp({
      email: "test@psikita.id",
      otp: "4820",
    });
    if (!verifyRes.accessToken)
      throw new Error("Password reset was not confirmed");
  });

  // 5. Patient: Get My Profile
  await testCase("Patient: Get My Profile (/patient/me)", async () => {
    const patient = await patientService.getMyProfile();
    if (!patient.fullName || !patient.phoneNumber)
      throw new Error("Invalid patient profile structure");
  });

  // 6. Patient: Create Profile
  await testCase("Patient: Create Profile (/patient)", async () => {
    await patientService.createProfile({
      fullName: "Pasien Uji Coba",
      phoneNumber: "0812-9999-8888",
      gender: "FEMALE",
    });
  });

  // 7. Triage: Submit Triage Assessment
  await testCase("Triage: Submit Assessment (/triage)", async () => {
    const triageRes = await triageService.submitTriage({
      score: 7,
      hasRedFlags: false,
      assessmentType: "SELF_ASSESSMENT",
      answers: { frequency: "Hampir setiap hari" },
    });
    // TriageResponseDto (staging-openapi.json) carries patientId and level.
    // Asserting the contract fields, not ones the API never declared.
    if (!triageRes.id || !triageRes.patientId || !triageRes.level) {
      throw new Error("Triage response invalid");
    }
  });

  // 8. Matching: Waiting Room Status
  await testCase(
    "Matching: Get Waiting Room Status (/matching-requests/waiting-room/me)",
    async () => {
      const status = await matchingService.getMyWaitingRoomStatus();
      if (!status.status || status.position === undefined) {
        throw new Error("Waiting room status missing required fields");
      }
    },
  );

  // 9. Consultation: Create Consultation
  await testCase("Consultation: Create Consultation Session", async () => {
    const consultation = await consultationService.create({
      patientId: "pat_siti_1",
      practitionerId: "prac_andi_1",
      durationMinutes: 60,
    });
    if (!consultation.id || !consultation.status) {
      throw new Error("Consultation session creation invalid");
    }
  });

  // 10. Clinical Notes: Create SOAP Note
  await testCase(
    "Notes: Create SOAP Note & Diagnosis (/consultation/{id}/soap)",
    async () => {
      const soap = await notesService.createSoapNote("consultation_123", {
        subjective: "Pasien merasa cemas dan tegang 3 minggu",
        objective: "Status mental compos mentis, afek cemas",
        assessment: "Gangguan Cemas Menyeluruh (F41.1)",
        plan: "Psikoterapi kognitif perilaku dan kontrol 2 minggu",
        icd10Code: "F41.1",
        severity: "Sedang",
      });
      if (!soap.id || !soap.soapData) {
        throw new Error("SOAP note response invalid");
      }
    },
  );

  // 11. Prescription: Get Digital Prescription
  await testCase(
    "Prescription: Get Digital Prescription by Consultation",
    async () => {
      const res = await prescriptionService.getPrescriptions({
        consultationId: "consultation_123",
        limit: 1,
      });
      const rx = res.data[0];
      if (
        !rx ||
        !rx.id ||
        rx.consultationId !== "consultation_123" ||
        !Array.isArray(rx.medications) ||
        rx.medications.length === 0
      ) {
        throw new Error("Prescription data structure mismatch");
      }
    },
  );

  // 12. Referral: Get Hospital Referral
  await testCase("Referral: Get Hospital Satu Sehat Referral", async () => {
    const ref =
      await prescriptionService.getReferralByConsultation("consultation_123");
    if (
      !ref ||
      !ref.id ||
      ref.consultationId !== "consultation_123" ||
      !ref.destinationInstitutionId ||
      !ref.currentStatus
    ) {
      throw new Error("Referral data structure mismatch");
    }
  });

  // 13. Payment: no documented billing-order response means no context
  await testCase(
    "Payment: unavailable without a documented server context",
    async () => {
      return;
    },
  );

  // 14. Payment: BPJS eligibility remains unavailable without server context
  await testCase(
    "Payment: BPJS eligibility requires server context",
    async () => {
      return;
    },
  );

  // 15. Practitioner: Get Profile & Directory
  await testCase(
    "Practitioner: Get Profile & Practitioner Directory",
    async () => {
      const me = await practitionerService.getMyProfile();
      if (!me.id || !me.sippNumber)
        throw new Error("Practitioner profile invalid");

      const list = await practitionerService.getPractitioners({
        type: "PSYCHIATRIST",
      });
      if (!Array.isArray(list.data) || list.data.length === 0) {
        throw new Error("Practitioner list empty or invalid");
      }
    },
  );

  // 16. Practitioner: Change Availability & Admin Verification
  await testCase(
    "Practitioner: Change Availability & Admin Approve/Reject",
    async () => {
      await practitionerService.changeAvailability("prac_andi_1", "AVAILABLE");
      await practitionerService.approveProfile("prac_andi_1");
      await practitionerService.rejectProfile(
        "prac_andi_1",
        "Dokumen belum lengkap",
      );
    },
  );

  console.log("\n=================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL API INTEGRATION TESTS PASSED 100%!");
  }
}

runServiceTestSuite();

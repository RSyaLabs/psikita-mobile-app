import {
  getCapability,
  assertCapabilityLive,
  type CapabilityKey,
} from "@/config/capabilities";
import {
  consultationStatusLabel,
  consultationStatusBucket,
  isTerminalConsultationStatus,
  matchesHistoryTab,
  HISTORY_TABS,
} from "@/clinical/activeConsultation";
import {
  validateAssessmentResult,
  isAssessmentResult,
  assessmentResultSchema,
} from "@/clinical/assessment";
import { ApiError } from "@/api/response";

describe("04. SeraPhany Clinical Domain & Capability Engine Suite", () => {
  describe("Capability Gates & Live/Fail-Closed Boundaries", () => {
    const liveCapabilities: CapabilityKey[] = [
      "patientProfile",
      "triage",
      "matching",
      "payment",
      "bpjsEligibility",
      "prescriptions",
    ];

    const unavailableCapabilities: CapabilityKey[] = [
      "chatWrite",
      "crisisEscalation",
    ];

    it.each(liveCapabilities)(
      "should report capability '%s' as 'live' and allow execution",
      (key) => {
        expect(getCapability(key)).toBe("live");
        expect(() => assertCapabilityLive(key)).not.toThrow();
      },
    );

    it.each(unavailableCapabilities)(
      "should report capability '%s' as 'unavailable' and throw 501 ApiError",
      (key) => {
        expect(getCapability(key)).toBe("unavailable");
        expect(() => assertCapabilityLive(key)).toThrow(ApiError);
        try {
          assertCapabilityLive(key);
        } catch (err) {
          expect(err).toBeInstanceOf(ApiError);
          const apiErr = err as ApiError;
          expect(apiErr.statusCode).toBe(501);
          expect(
            apiErr.error === "CHAT_WRITE_UNAVAILABLE" ||
              apiErr.error === "CAPABILITY_UNAVAILABLE",
          ).toBe(true);
        }
      },
    );
  });

  describe("Active Consultation Statuses, Labels & History Filtering", () => {
    it("should translate consultation statuses to standard Indonesian labels", () => {
      expect(consultationStatusLabel("WAITING")).toBe("Berjalan");
      expect(consultationStatusLabel("ACTIVE")).toBe("Berjalan");
      expect(consultationStatusLabel("FINISHED")).toBe("Selesai");
      expect(consultationStatusLabel("CANCELLED")).toBe("Batal");
      expect(consultationStatusLabel("UNKNOWN_STATUS")).toBe("Status lainnya");
    });

    it("should classify terminal statuses correctly", () => {
      expect(isTerminalConsultationStatus("FINISHED")).toBe(true);
      expect(isTerminalConsultationStatus("CANCELLED")).toBe(true);
      expect(isTerminalConsultationStatus("ACTIVE")).toBe(false);
      expect(isTerminalConsultationStatus("WAITING")).toBe(false);
      expect(isTerminalConsultationStatus(null)).toBe(false);
      expect(isTerminalConsultationStatus(undefined)).toBe(false);
    });

    it("should group consultation statuses into correct history tabs", () => {
      expect(consultationStatusBucket("WAITING")).toBe("Berjalan");
      expect(consultationStatusBucket("ACTIVE")).toBe("Berjalan");
      expect(consultationStatusBucket("FINISHED")).toBe("Selesai");
      expect(consultationStatusBucket("CANCELLED")).toBe("Batal");
      expect(consultationStatusBucket("UNKNOWN")).toBe("Semua");
    });

    it("should accurately match history tab queries across variations", () => {
      expect(HISTORY_TABS).toEqual(["Semua", "Berjalan/Aktif", "Selesai", "Batal"]);

      // Tab: Semua
      expect(matchesHistoryTab("WAITING", "Semua")).toBe(true);
      expect(matchesHistoryTab("FINISHED", "all")).toBe(true);

      // Tab: Berjalan/Aktif
      expect(matchesHistoryTab("WAITING", "Berjalan/Aktif")).toBe(true);
      expect(matchesHistoryTab("ACTIVE", "Berjalan")).toBe(true);
      expect(matchesHistoryTab("ACTIVE", "aktif")).toBe(true);
      expect(matchesHistoryTab("FINISHED", "Berjalan/Aktif")).toBe(false);
      expect(matchesHistoryTab("CANCELLED", "Berjalan/Aktif")).toBe(false);

      // Tab: Selesai
      expect(matchesHistoryTab("FINISHED", "Selesai")).toBe(true);
      expect(matchesHistoryTab("FINISHED", "finished")).toBe(true);
      expect(matchesHistoryTab("ACTIVE", "Selesai")).toBe(false);

      // Tab: Batal
      expect(matchesHistoryTab("CANCELLED", "Batal")).toBe(true);
      expect(matchesHistoryTab("CANCELLED", "cancelled")).toBe(true);
      expect(matchesHistoryTab("FINISHED", "Batal")).toBe(false);
    });
  });

  describe("Clinical Assessment Result Validation", () => {
    const validAssessment = {
      id: "asmt_2026_001",
      patientId: "pat_001",
      assessedBy: "usr_001",
      assessmentType: "SELF_ASSESSMENT",
      score: 14,
      hasRedFlags: false,
      level: "YELLOW",
      disposition: "COUNSELING",
      answers: {
        phq9_1: 2,
        phq9_2: 2,
        phq9_3: 3,
      },
      notes: "Pasien memerlukan konseling berkala",
      createdAt: "2026-11-05T01:00:00Z",
      updatedAt: "2026-11-05T01:00:00Z",
    };

    it("should validate and parse a legitimate clinical assessment result", () => {
      const parsed = validateAssessmentResult(validAssessment);
      expect(parsed.id).toBe("asmt_2026_001");
      expect(parsed.score).toBe(14);
      expect(parsed.level).toBe("YELLOW");
      expect(parsed.disposition).toBe("COUNSELING");
      expect(isAssessmentResult(validAssessment)).toBe(true);
    });

    it("should reject assessment with invalid level or disposition", () => {
      const invalidLevel = {
        ...validAssessment,
        level: "BLUE", // Not in ["GREEN", "YELLOW", "RED"]
      };

      expect(isAssessmentResult(invalidLevel)).toBe(false);
      expect(() => validateAssessmentResult(invalidLevel)).toThrow();
    });

    it("should reject assessment with non-finite or missing score", () => {
      const invalidScore = {
        ...validAssessment,
        score: NaN,
      };

      expect(isAssessmentResult(invalidScore)).toBe(false);
      expect(() => validateAssessmentResult(invalidScore)).toThrow();
    });

    it("should reject assessment with empty string identifiers", () => {
      const emptyId = {
        ...validAssessment,
        id: "   ",
      };

      expect(isAssessmentResult(emptyId)).toBe(false);
      expect(() => validateAssessmentResult(emptyId)).toThrow();
    });
  });
});

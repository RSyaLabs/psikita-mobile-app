import {
  getCapability,
  assertCapabilityLive,
} from "../src/config/capabilities";
import {
  consultationStatusLabel,
  consultationStatusBucket,
  HISTORY_TABS,
  matchesHistoryTab,
} from "../src/clinical/activeConsultation";
import {
  validateAssessmentResult,
  isAssessmentResult,
  ASSESSMENT_UNAVAILABLE_MESSAGE,
} from "../src/clinical/assessment";
import { ApiError } from "../src/api/response";

describe("SeraPhany Clinical Engine & Decision Support Suite", () => {
  describe("Feature Capability Gates", () => {
    it("should allow active clinical capabilities", () => {
      expect(getCapability("patientProfile")).toBe("live");
      expect(getCapability("triage")).toBe("live");
      expect(getCapability("matching")).toBe("live");
      expect(getCapability("payment")).toBe("live");
      expect(getCapability("bpjsEligibility")).toBe("live");
      expect(getCapability("prescriptions")).toBe("live");
    });

    it("should gate unavailable features fail-closed", () => {
      expect(getCapability("chatWrite")).toBe("unavailable");
      expect(getCapability("crisisEscalation")).toBe("unavailable");
    });

    it("should throw ApiError with 501 status on unavailable capability execution", () => {
      expect(() => assertCapabilityLive("chatWrite")).toThrow(ApiError);
      try {
        assertCapabilityLive("chatWrite");
      } catch (err: unknown) {
        const error = err as ApiError;
        expect(error.statusCode).toBe(501);
        expect(error.error).toBe("CHAT_WRITE_UNAVAILABLE");
      }
    });
  });

  describe("Consultation Status Categorization", () => {
    it("should provide localized status labels", () => {
      expect(consultationStatusLabel("WAITING")).toBe("Berjalan");
      expect(consultationStatusLabel("ACTIVE")).toBe("Berjalan");
      expect(consultationStatusLabel("FINISHED")).toBe("Selesai");
      expect(consultationStatusLabel("CANCELLED")).toBe("Batal");
      expect(consultationStatusLabel("UNKNOWN")).toBe("Status lainnya");
    });

    it("should map status to filter tab buckets", () => {
      expect(consultationStatusBucket("WAITING")).toBe("Berjalan");
      expect(consultationStatusBucket("ACTIVE")).toBe("Berjalan");
      expect(consultationStatusBucket("FINISHED")).toBe("Selesai");
      expect(consultationStatusBucket("CANCELLED")).toBe("Batal");
    });

    it("should filter consultations based on active history tab", () => {
      expect(matchesHistoryTab("FINISHED", "Semua")).toBe(true);
      expect(matchesHistoryTab("ACTIVE", "Berjalan/Aktif")).toBe(true);
      expect(matchesHistoryTab("WAITING", "Berjalan/Aktif")).toBe(true);
      expect(matchesHistoryTab("FINISHED", "Berjalan/Aktif")).toBe(false);
      expect(matchesHistoryTab("FINISHED", "Selesai")).toBe(true);
      expect(matchesHistoryTab("CANCELLED", "Batal")).toBe(true);
    });

    it("should contain standard 4 history tabs", () => {
      expect(HISTORY_TABS).toEqual(["Semua", "Berjalan/Aktif", "Selesai", "Batal"]);
    });
  });

  describe("Triage Assessment Validation", () => {
    const validAssessmentPayload = {
      id: "asmt-core-001",
      patientId: "usr-pat-01",
      assessedBy: "doc-psy-01",
      assessmentType: "SELF_ASSESSMENT",
      score: 14,
      hasRedFlags: false,
      level: "GREEN",
      disposition: "COUNSELING",
      answers: { q1: 1, q2: 2, q3: 1 },
      notes: "Tingkat stres ringan.",
      createdAt: "2026-11-01T08:00:00Z",
      updatedAt: "2026-11-01T08:05:00Z",
    };

    it("should validate healthy assessment payload successfully", () => {
      expect(isAssessmentResult(validAssessmentPayload)).toBe(true);
      const parsed = validateAssessmentResult(validAssessmentPayload);
      expect(parsed.score).toBe(14);
      expect(parsed.level).toBe("GREEN");
    });

    it("should reject corrupted or invalid assessment payloads", () => {
      const corrupted = { ...validAssessmentPayload, score: "not-a-number" };
      expect(isAssessmentResult(corrupted)).toBe(false);
      expect(() => validateAssessmentResult(corrupted)).toThrow();
    });

    it("should provide standardized unavailable message copy", () => {
      expect(ASSESSMENT_UNAVAILABLE_MESSAGE).toContain("Asesmen tidak tersedia");
    });
  });
});

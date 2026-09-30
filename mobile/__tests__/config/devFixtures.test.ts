import {
  devFixturesEnabled,
  DEV_FIXTURE_NOTICE,
  devPatientProfile,
  devPractitionerDirectory,
  devTriageSummary,
} from "@/config/devFixtures";

/**
 * The fixtures exist so screens can be laid out against populated data while
 * no backend is reachable. These tests cover the two properties that make that
 * safe: they are off unless explicitly enabled, and they are visibly labelled
 * rather than presented as real records.
 */
describe("local development fixtures", () => {
  const original = process.env.EXPO_PUBLIC_USE_MOCK_FALLBACK;

  afterEach(() => {
    Reflect.set(process.env, "EXPO_PUBLIC_USE_MOCK_FALLBACK", original);
    jest.restoreAllMocks();
  });

  describe("gating", () => {
    it("is disabled when the flag is absent", () => {
      expect(devFixturesEnabled(undefined)).toBe(false);
    });

    it("is disabled for any value other than the exact string true", () => {
      for (const value of ["false", "1", "TRUE", "yes", ""]) {
        expect(devFixturesEnabled(value)).toBe(false);
      }
    });

    it("is enabled only for the exact string true", () => {
      expect(devFixturesEnabled("true")).toBe(true);
    });

    it("refuses to return data while disabled instead of returning empty shapes", () => {
      // A silent empty object would let a screen look finished while showing
      // nothing, which is how unlabelled placeholder data hides.
      expect(() => devPatientProfile("false")).toThrow(
        "EXPO_PUBLIC_USE_MOCK_FALLBACK is not true",
      );
      expect(() => devPractitionerDirectory("false")).toThrow();
      expect(() => devTriageSummary("false")).toThrow();
    });


  });

  describe("labelling", () => {
    it("ships a notice a screen can render", () => {
      expect(DEV_FIXTURE_NOTICE).toMatch(/CONTOH/i);
      expect(DEV_FIXTURE_NOTICE).toMatch(/bukan data/i);
    });

    it("never mimes a real person's identifiers", () => {
      Reflect.set(process.env, "EXPO_PUBLIC_USE_MOCK_FALLBACK", "true");
      const profile = devPatientProfile("true");
      // .invalid is reserved by RFC 2606 and can never resolve.
      expect(profile.email.endsWith("@dev.invalid")).toBe(true);
      expect(profile.avatarUrl).toBeNull();
      // An all-zero NIK cannot be a real identity number.
      expect(profile.nik).toMatch(/^0+1$/);
    });

    it("carries the marker in every name it supplies", () => {
      Reflect.set(process.env, "EXPO_PUBLIC_USE_MOCK_FALLBACK", "true");
      expect(devPatientProfile("true").fullName).toMatch(/Contoh/i);
      for (const practitioner of devPractitionerDirectory("true")) {
        expect(practitioner.fullName).toMatch(/Contoh/i);
      }
    });

    it("models no clinical measurement", () => {
      Reflect.set(process.env, "EXPO_PUBLIC_USE_MOCK_FALLBACK", "true");
      // A GAD-7 or similar score in a fixture becomes a clinical record the
      // moment anyone screenshots it, which is the earlier defect repeating.
      const summary = devTriageSummary("true");
      expect(Object.keys(summary)).not.toContain("score");
      expect(Object.keys(summary)).not.toContain("gad7");
      expect(Object.keys(summary)).not.toContain("diagnosis");
    });
  });

  describe("shape", () => {
    it("returns a fresh object each call so one screen cannot mutate another", () => {
      Reflect.set(process.env, "EXPO_PUBLIC_USE_MOCK_FALLBACK", "true");
      const first = devPatientProfile("true");
      first.fullName = "diubah";
      expect(devPatientProfile("true").fullName).not.toBe("diubah");
    });
  });
});

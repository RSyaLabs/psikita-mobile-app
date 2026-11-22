import fs from "fs";
import path from "path";

describe("15. Post-Consultation Follow-up & Care Plan (Screens 48-51)", () => {
  const followUpsDir = path.resolve(
    __dirname,
    "../src/components/patient/follow-ups",
  );
  const routeFile = path.resolve(
    __dirname,
    "../app/(patient)/patient/follow-ups.tsx",
  );

  describe("Screen 48: CarePlanDetailView (HS3 · Rencana perawatan)", () => {
    const carePlanFile = path.join(followUpsDir, "CarePlanDetailView.tsx");

    it("should exist and define CarePlanDetailView component", () => {
      expect(fs.existsSync(carePlanFile)).toBe(true);
      const content = fs.readFileSync(carePlanFile, "utf-8");
      expect(content).toContain("export function CarePlanDetailView");
      expect(content).toContain("Rencana perawatan");
      expect(content).toContain("TUGAS MINGGU INI");
      expect(content).toContain("PENGINGAT");
    });

    it("should provide interactive checkbox toggle and reminder switch", () => {
      const content = fs.readFileSync(carePlanFile, "utf-8");
      expect(content).toContain("toggleTask");
      expect(content).toContain("accessibilityRole=\"checkbox\"");
      expect(content).toContain("Switch");
    });

    it("should include emergency boundary disclaimer and crisis help link", () => {
      const content = fs.readFileSync(carePlanFile, "utf-8");
      expect(content).toContain("Rencana ini panduan dari psikolog, bukan pengganti sesi.");
      expect(content).toContain("Lihat bantuan segera");
      expect(content).toContain("onOpenCrisisHelp");
    });
  });

  describe("Screen 49: FollowUpSchedulePickerView (HS4 · Pilih jadwal lanjutan)", () => {
    const pickerFile = path.join(
      followUpsDir,
      "FollowUpSchedulePickerView.tsx",
    );

    it("should exist and define FollowUpSchedulePickerView component", () => {
      expect(fs.existsSync(pickerFile)).toBe(true);
      const content = fs.readFileSync(pickerFile, "utf-8");
      expect(content).toContain("export function FollowUpSchedulePickerView");
      expect(content).toContain("Pilih jadwal lanjutan");
      expect(content).toContain("PILIH TANGGAL");
      expect(content).toContain("PILIH JAM (WIB)");
    });

    it("should provide horizontal date options and 3-column time slot grid", () => {
      const content = fs.readFileSync(pickerFile, "utf-8");
      expect(content).toContain("dateOptions");
      expect(content).toContain("timeSlots");
      expect(content).toContain("handleSelectDate");
      expect(content).toContain("handleSelectTime");
    });

    it("should enforce 30-minute hold reservation notice and checkout CTA", () => {
      const content = fs.readFileSync(pickerFile, "utf-8");
      expect(content).toContain("Jadwal ditahan 30 menit setelah kamu memesan.");
      expect(content).toContain("Pesan & Lanjut Bayar");
      expect(content).toContain("onProceedToCheckout");
    });
  });

  describe("Screen 50: FollowUpConfirmedView (HS5 · Jadwal lanjutan terkonfirmasi)", () => {
    const confirmedFile = path.join(followUpsDir, "FollowUpConfirmedView.tsx");

    it("should exist and define FollowUpConfirmedView component", () => {
      expect(fs.existsSync(confirmedFile)).toBe(true);
      const content = fs.readFileSync(confirmedFile, "utf-8");
      expect(content).toContain("export function FollowUpConfirmedView");
      expect(content).toContain("Jadwal lanjutan terkonfirmasi");
      expect(content).toContain("Pembayaran berhasil.");
    });

    it("should display order summary DL card with practitioner, time, format, and fee", () => {
      const content = fs.readFileSync(confirmedFile, "utf-8");
      expect(content).toContain("Psikolog");
      expect(content).toContain("Tanggal");
      expect(content).toContain("Format");
      expect(content).toContain("Total dibayar");
    });

    it("should provide add to calendar button and reschedule notice", () => {
      const content = fs.readFileSync(confirmedFile, "utf-8");
      expect(content).toContain("Tambahkan ke Kalender");
      expect(content).toContain("Kamu bisa mengubah jadwal sampai");
      expect(content).toContain("Lihat Jadwalku");
      expect(content).toContain("Ke Beranda");
    });
  });

  describe("Screen 51: FollowUpRecommendationView (HS6 · Detail rekomendasi sesi lanjutan)", () => {
    const recFile = path.join(followUpsDir, "FollowUpRecommendationView.tsx");

    it("should exist and define FollowUpRecommendationView component", () => {
      expect(fs.existsSync(recFile)).toBe(true);
      const content = fs.readFileSync(recFile, "utf-8");
      expect(content).toContain("export function FollowUpRecommendationView");
      expect(content).toContain("REKOMENDASI PSIKOLOG");
      expect(content).toContain("Satu sesi lanjutan");
      expect(content).toContain("ALASAN");
    });

    it("should render doctor clinical rationale and specifications list", () => {
      const content = fs.readFileSync(recFile, "utf-8");
      expect(content).toContain("clinicalReason");
      expect(content).toContain("Durasi");
      expect(content).toContain("Format");
      expect(content).toContain("Berlaku sampai");
      expect(content).toContain("Biaya");
      expect(content).toContain("Pilih Jadwal");
    });
  });

  describe("Route Orchestration & Parity: follow-ups.tsx", () => {
    it("should correctly orchestrate all 4 screens based on step query parameter", () => {
      expect(fs.existsSync(routeFile)).toBe(true);
      const content = fs.readFileSync(routeFile, "utf-8");
      expect(content).toContain("CarePlanDetailView");
      expect(content).toContain("FollowUpSchedulePickerView");
      expect(content).toContain("FollowUpConfirmedView");
      expect(content).toContain("FollowUpRecommendationView");
      expect(content).toContain("CrisisHelpModal");
    });

    it("should include follow-ups in public guest route of patient layout", () => {
      const layoutFile = path.resolve(__dirname, "../app/(patient)/_layout.tsx");
      const content = fs.readFileSync(layoutFile, "utf-8");
      expect(content).toContain('leafSegment === "follow-ups"');
    });

    it("should strictly respect the Rule of 14px (zero text-xs and zero size='xs')", () => {
      const filesToCheck = [
        routeFile,
        path.join(followUpsDir, "CarePlanDetailView.tsx"),
        path.join(followUpsDir, "FollowUpSchedulePickerView.tsx"),
        path.join(followUpsDir, "FollowUpConfirmedView.tsx"),
        path.join(followUpsDir, "FollowUpRecommendationView.tsx"),
      ];

      for (const file of filesToCheck) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          expect({
            file: path.basename(file),
            line: idx + 1,
            hasTextXs: /\btext-xs\b/.test(line),
          }).toEqual({
            file: path.basename(file),
            line: idx + 1,
            hasTextXs: false,
          });

          expect({
            file: path.basename(file),
            line: idx + 1,
            hasSizeXs: /size=["']xs["']/.test(line),
          }).toEqual({
            file: path.basename(file),
            line: idx + 1,
            hasSizeXs: false,
          });
        });
      }
    });
  });
});

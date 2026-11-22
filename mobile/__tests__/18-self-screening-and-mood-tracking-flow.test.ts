import fs from "fs";
import path from "path";
import { psychometricsService } from "../src/api/psychometrics.service";

describe("Tahap 11: Skrining Mandiri & Pelacak Suasana Hati (Screens 64–66)", () => {
  const componentsDir = path.resolve(
    __dirname,
    "../src/components/patient/screening",
  );
  const routePath = path.resolve(
    __dirname,
    "../app/(patient)/patient/self-screening.tsx",
  );

  const componentFiles = [
    "ScreeningCatalogView.tsx",
    "ScreeningQuestionView.tsx",
    "ScreeningResultView.tsx",
  ];

  describe("1. Universal Rule of 14px & Typography Compliance", () => {
    it("should ensure zero sub-14px typography (no text-xs or size='xs') in all screening components", () => {
      componentFiles.forEach((file) => {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        expect(content).not.toMatch(/text-xs/);
        expect(content).not.toMatch(/size=["']xs["']/);
      });
    });

    it("should ensure zero sub-14px typography in self-screening route orchestrator", () => {
      const content = fs.readFileSync(routePath, "utf8");

      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size=["']xs["']/);
    });
  });

  describe("2. Screen 64 (TR1 · Tes mandiri: daftar instrumen) Content & Elements", () => {
    const catalogContent = fs.readFileSync(
      path.join(componentsDir, "ScreeningCatalogView.tsx"),
      "utf8",
    );

    it("should display main heading and clinical disclaimer subtitle", () => {
      expect(catalogContent).toContain("Tes mandiri");
      expect(catalogContent).toContain(
        "Cek singkat untuk mengenali dirimu. Hasilnya bukan diagnosis.",
      );
    });

    it("should list clinical instruments with question count and estimated duration", () => {
      expect(catalogContent).toContain("DASS-21");
      expect(catalogContent).toContain("PHQ-9");
      expect(catalogContent).toContain("GAD-7");
      expect(catalogContent).toContain("pertanyaan");
      expect(catalogContent).toContain("menit");
    });

    it("should include 'Mulai' CTA buttons for each test", () => {
      expect(catalogContent).toContain("Mulai");
      expect(catalogContent).toContain("onSelectInstrument");
    });

    it("should display RIWAYAT section with past test records and 'Lihat ›' link", () => {
      expect(catalogContent).toContain("RIWAYAT");
      expect(catalogContent).toContain("Lihat ›");
      expect(catalogContent).toContain("onViewHistoryItem");
    });

    it("should render emergency assistance link 'Butuh bantuan segera?'", () => {
      expect(catalogContent).toContain("Butuh bantuan segera?");
      expect(catalogContent).toContain("onOpenCrisisHelp");
    });
  });

  describe("3. Screen 65 (TR2 · Tes mandiri: pertanyaan & skala Likert) Content & Elements", () => {
    const questionContent = fs.readFileSync(
      path.join(componentsDir, "ScreeningQuestionView.tsx"),
      "utf8",
    );

    it("should render segmented progress bar and question counter", () => {
      expect(questionContent).toContain("PERTANYAAN");
      expect(questionContent).toContain("DARI");
    });

    it("should present 4-point Likert scale options with distinct values", () => {
      expect(questionContent).toContain("Tidak pernah");
      expect(questionContent).toContain("Kadang-kadang");
      expect(questionContent).toContain("Sering");
      expect(questionContent).toContain("Hampir selalu");
    });

    it("should state technical disclaimer regarding local saving and server instrument", () => {
      expect(questionContent).toContain(
        "Jawaban tersimpan otomatis di perangkat. Instrumen dari server.",
      );
    });

    it("should provide 'Kembali' and 'Lanjut' / 'Selesai' navigation CTAs", () => {
      expect(questionContent).toContain("Kembali");
      expect(questionContent).toContain("Lanjut");
      expect(questionContent).toContain("Selesai");
    });
  });

  describe("4. Screen 66 (TR3 · Hasil tes mandiri & rekomendasi klinis) Content & Elements", () => {
    const resultContent = fs.readFileSync(
      path.join(componentsDir, "ScreeningResultView.tsx"),
      "utf8",
    );

    it("should render 'Hasil tes' title and summary score card", () => {
      expect(resultContent).toContain("Hasil tes");
      expect(resultContent).toContain("Skor");
      expect(resultContent).toContain("dari");
    });

    it("should display server disclaimer that result is not a formal diagnosis", () => {
      expect(resultContent).toContain("Teks hasil dari server. Bukan diagnosis.");
    });

    it("should render LANGKAH BERIKUTNYA section with feed discussion and doctor consultation", () => {
      expect(resultContent).toContain("LANGKAH BERIKUTNYA");
      expect(resultContent).toContain("Lihat diskusi terkait di Feed");
      expect(resultContent).toContain("Bicara dengan psikolog");
    });

    it("should provide emergency safety link and return to catalog CTA", () => {
      expect(resultContent).toContain("Merasa tidak aman? Lihat bantuan segera");
      expect(resultContent).toContain("Kembali ke daftar tes");
    });
  });

  describe("5. Psychometrics API Service Contract Compliance", () => {
    it("should define psychometricsService methods matching backend specifications", () => {
      expect(typeof psychometricsService.getInstruments).toBe("function");
      expect(typeof psychometricsService.getInstrumentForm).toBe("function");
      expect(typeof psychometricsService.dryRunScore).toBe("function");
    });
  });
});

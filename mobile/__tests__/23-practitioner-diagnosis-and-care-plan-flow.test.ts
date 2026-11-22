import fs from "fs";
import path from "path";

describe("Tahap 14.3: Diagnosis Klinis, Editor Rencana Perawatan & Tindak Lanjut (Screens 89–92)", () => {
  const diagnosisDir = path.join(
    __dirname,
    "../src/components/practitioner/diagnosis",
  );
  const diagnosisRouteFile = path.join(
    __dirname,
    "../app/(practitioner)/practitioner/diagnosis.tsx",
  );

  const viewFiles = [
    "CompleteSessionResultView.tsx",
    "ClinicalDecisionView.tsx",
    "CarePlanEditorView.tsx",
    "FollowUpRecommendationsView.tsx",
    "index.ts",
  ];

  it("should have all 4 modular diagnosis views and index in src/components/practitioner/diagnosis/", () => {
    viewFiles.forEach((file) => {
      const fullPath = path.join(diagnosisDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe("Screen 89: A1 · Selesaikan Hasil Sesi", () => {
    it("should verify CompleteSessionResultView contains banner, checklist, advice, follow up options, and submit", () => {
      const content = fs.readFileSync(
        path.join(diagnosisDir, "CompleteSessionResultView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Selesaikan hasil sesi");
      expect(content).toContain("Sesi sudah selesai. Pasien belum menerima hasil sampai kamu mengirimnya.");
      expect(content).toContain("Catatan klinis final");
      expect(content).toContain("Diagnosis / asesmen profesional");
      expect(content).toContain("Resep / rujukan: tidak diperlukan");
      expect(content).toContain("Saran untuk pasien");
      expect(content).toContain("Perlu sesi lanjutan?");
      expect(content).toContain("Durasi sesi");
      expect(content).toContain("Berlaku sampai");
      expect(content).toContain("Rencana perawatan");
      expect(content).toContain("Kirim Hasil");
      expect(content).toContain("Simpan & lanjutkan nanti");
    });
  });

  describe("Screen 90: A2 · Diagnosis & Keputusan Klinis", () => {
    it("should verify ClinicalDecisionView contains professional assessment, prescription options, and ICD presets", () => {
      const content = fs.readFileSync(
        path.join(diagnosisDir, "ClinicalDecisionView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Keputusan klinis");
      expect(content).toContain("Isi sesuai kewenangan profesimu. Bagian ini tidak otomatis terlihat oleh pasien.");
      expect(content).toContain("Diagnosis / asesmen profesional");
      expect(content).toContain("Resep / rujukan");
      expect(content).toContain("Tidak diperlukan");
      expect(content).toContain("Rujukan ke profesional lain");
      expect(content).toContain("Resep dari dokter terkait");
      expect(content).toContain("Opsi dan kode diagnosis dari server. Belum ditetapkan.");
      expect(content).toContain("Simpan");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 91: A3 · Editor Rencana Perawatan", () => {
    it("should verify CarePlanEditorView contains task list, add task action, validity date, and save action", () => {
      const content = fs.readFileSync(
        path.join(diagnosisDir, "CarePlanEditorView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Rencana perawatan");
      expect(content).toContain("Opsional. Pasien melihatnya sebagai daftar tugas.");
      expect(content).toContain("TUGAS");
      expect(content).toContain("+ Tambah Tugas");
      expect(content).toContain("Berlaku sampai");
      expect(content).toContain("Simpan Rencana");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 92: A4 · Rekomendasi Tindak Lanjut", () => {
    it("should verify FollowUpRecommendationsView contains follow-up list, badges, and return action", () => {
      const content = fs.readFileSync(
        path.join(diagnosisDir, "FollowUpRecommendationsView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Tindak lanjut");
      expect(content).toContain("Sesi lanjutan yang kamu rekomendasikan. Pasien memesan sendiri; tidak ada pencocokan ulang.");
      expect(content).toContain("Dipesan");
      expect(content).toContain("Menunggu");
      expect(content).toContain("Habis");
      expect(content).toContain("Status tindak lanjut dari server.");
      expect(content).toContain("Kembali ke Kasus");
    });
  });

  describe("Universal Rule of 14px", () => {
    it("should strictly enforce zero text-xs or size=\"xs\" across all practitioner diagnosis views", () => {
      viewFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(diagnosisDir, file), "utf-8");
        expect(content).not.toContain("text-xs");
        expect(content).not.toContain('size="xs"');
      });
      const routeContent = fs.readFileSync(diagnosisRouteFile, "utf-8");
      expect(routeContent).not.toContain("text-xs");
      expect(routeContent).not.toContain('size="xs"');
    });
  });

  describe("Diagnosis Screen View State Controller", () => {
    it("should verify diagnosis.tsx cleanly handles all 4 views and mutation flows", () => {
      const content = fs.readFileSync(diagnosisRouteFile, "utf-8");
      expect(content).toContain("activeView === \"complete-result\"");
      expect(content).toContain("activeView === \"clinical-decision\"");
      expect(content).toContain("activeView === \"care-plan\"");
      expect(content).toContain("activeView === \"follow-up\"");
      expect(content).toContain("ROUTES.PRACTITIONER.HISTORY");
    });
  });
});

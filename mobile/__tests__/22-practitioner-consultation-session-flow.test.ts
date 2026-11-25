import fs from "fs";
import path from "path";

describe("Tahap 14.2: Ruang Sesi Praktisi, Asesmen & Catatan Sesi (Screens 81–88)", () => {
  const sessionDir = path.join(
    __dirname,
    "../src/components/practitioner/session",
  );
  const chatRouteFile = path.join(
    __dirname,
    "../app/(practitioner)/practitioner/chat.tsx",
  );

  const viewFiles = [
    "PractitionerSessionLobbyView.tsx",
    "PractitionerLiveRoomView.tsx",
    "PatientContextView.tsx",
    "RequestAssessmentView.tsx",
    "AssessmentAnswersView.tsx",
    "SessionNotesView.tsx",
    "SessionDisconnectedView.tsx",
    "EndSessionConfirmView.tsx",
    "index.ts",
  ];

  it("should have all 8 modular session views and index in src/components/practitioner/session/", () => {
    viewFiles.forEach((file) => {
      const fullPath = path.join(sessionDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe("Screen 81: D8 · Lobi Persiapan Sesi & Jadwal", () => {
    it("should verify PractitionerSessionLobbyView contains tabs, perlu tindakan, and jadwal", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "PractitionerSessionLobbyView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Sesi");
      expect(content).toContain("Hari ini");
      expect(content).toContain("Mendatang");
      expect(content).toContain("Selesai");
      expect(content).toContain("PERLU TINDAKAN");
      expect(content).toContain("Hasil belum dikirim");
      expect(content).toContain("Selesaikan Hasil");
      expect(content).toContain("JADWAL");
      expect(content).toContain("Masuk ›");
      expect(content).toContain("Sesi berpindah ke Selesai setelah hasil terkirim.");
    });
  });

  describe("Screen 82: D9 · Ruang Konsultasi Chat Live Praktisi", () => {
    it("should verify PractitionerLiveRoomView contains header with timer, video button, quick chips, and end session", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "PractitionerLiveRoomView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Sesi berlangsung · sisa");
      expect(content).toContain("Konteks pasien");
      expect(content).toContain("Minta asesmen");
      expect(content).toContain("Catatan");
      expect(content).toContain("Sesi dimulai. Percakapan ini privat.");
      expect(content).toContain("Asesmen dikirim ke pasien · lihat jawaban ›");
      expect(content).toContain("Tulis pesan...");
      expect(content).toContain("Akhiri Sesi");
    });
  });

  describe("Screen 83: D10 · Drawer Konteks Pasien & Rekam Medis", () => {
    it("should verify PatientContextView contains privacy notice, triage summary, triage Q&A, and session history", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "PatientContextView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Konteks pasien");
      expect(content).toContain("Hanya kamu sebagai praktisi penanggung jawab");
      expect(content).toContain("RINGKASAN TRIASE");
      expect(content).toContain("Keluhan utama");
      expect(content).toContain("Dampak fungsional");
      expect(content).toContain("Tingkat urgensi");
      expect(content).toContain("JAWABAN TRIASE");
      expect(content).toContain("RIWAYAT SESI");
      expect(content).toContain("Kembali ke Sesi");
    });
  });

  describe("Screen 84: D11 · Minta Asesmen", () => {
    it("should verify RequestAssessmentView contains instrument radio options, server disclaimer, and send button", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "RequestAssessmentView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Minta asesmen");
      expect(content).toContain("Pilih instrumen yang dikirim ke pasien lewat chat");
      expect(content).toContain("PILIH INSTRUMEN");
      expect(content).toContain("GAD-7 (Kecemasan)");
      expect(content).toContain("PHQ-9 (Depresi)");
      expect(content).toContain("DASS-21 (Depresi, Cemas, Stres)");
      expect(content).toContain(
        "Instrumen klinis terstandar dikirimkan ke pasien dan hasilnya tersimpan pada rekam konsultasi.",
      );
      expect(content).not.toContain("Belum ditetapkan");
      expect(content).toContain("Kirim ke Pasien");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 85: D12 · Jawaban Asesmen Pasien", () => {
    it("should verify AssessmentAnswersView contains completion badge, score, interpretation, and note transfer", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "AssessmentAnswersView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Jawaban asesmen");
      expect(content).toContain("Selesai diisi");
      expect(content).toContain("JAWABAN");
      expect(content).toContain("Skor total");
      expect(content).toContain("Interpretasi");
      expect(content).toContain("Skor adalah alat bantu. Penilaian klinis tetap milikmu.");
      expect(content).toContain("Masukkan ke Catatan");
      expect(content).toContain("Kembali ke Sesi");
    });
  });

  describe("Screen 86: D13 · Catatan Sesi / SOAP Notes", () => {
    it("should verify SessionNotesView contains privacy notice, textarea, autosave indicator, and selesai button", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "SessionNotesView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Catatan sesi");
      expect(content).toContain("Catatan ini privat. Pasien tidak bisa melihatnya.");
      expect(content).toContain("Tulis catatan klinis...");
      expect(content).toContain("Tersimpan otomatis");
      expect(content).toContain("Selesai");
    });
  });

  describe("Screen 87: D14 · Koneksi Sesi Terputus", () => {
    it("should verify SessionDisconnectedView contains alert, disabled inputs, retry reconnect, and help", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "SessionDisconnectedView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Koneksi terputus");
      expect(content).toContain("Kami menyambungkan ulang otomatis. Pesan yang sudah terkirim tidak hilang.");
      expect(content).toContain("Coba Sambungkan Sekarang");
      expect(content).toContain("Butuh bantuan?");
    });
  });

  describe("Screen 88: D15 · Akhiri Sesi", () => {
    it("should verify EndSessionConfirmView contains confirmation prompt, duration stats, and action buttons", () => {
      const content = fs.readFileSync(
        path.join(sessionDir, "EndSessionConfirmView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Akhiri sesi dengan");
      expect(content).toContain("Setelah sesi diakhiri, kamu perlu mengirim hasil");
      expect(content).toContain("Durasi berjalan");
      expect(content).toContain("Sisa waktu");
      expect(content).toContain("Pasien belum menerima hasil sampai kamu mengirimnya.");
      expect(content).toContain("Akhiri & Isi Hasil");
      expect(content).toContain("Lanjutkan Sesi");
    });
  });

  describe("Universal Rule of 14px", () => {
    it("should strictly enforce zero text-xs or size=\"xs\" across all practitioner session views", () => {
      viewFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(sessionDir, file), "utf-8");
        expect(content).not.toContain("text-xs");
        expect(content).not.toContain('size="xs"');
      });
      const chatContent = fs.readFileSync(chatRouteFile, "utf-8");
      expect(chatContent).not.toContain("text-xs");
      expect(chatContent).not.toContain('size="xs"');
    });
  });

  describe("Practitioner Chat Route Integration", () => {
    it("should verify chat.tsx cleanly handles all 8 view states and integrates with PractitionerTabBar", () => {
      const content = fs.readFileSync(chatRouteFile, "utf-8");
      expect(content).toContain("activeView === \"lobby\"");
      expect(content).toContain("activeView === \"room\"");
      expect(content).toContain("activeView === \"context\"");
      expect(content).toContain("activeView === \"request-assessment\"");
      expect(content).toContain("activeView === \"assessment-answers\"");
      expect(content).toContain("activeView === \"notes\"");
      expect(content).toContain("activeView === \"disconnected\"");
      expect(content).toContain("activeView === \"end-session\"");
      expect(content).toContain("<PractitionerTabBar activeTab=\"sesi\" />");
    });
  });
});

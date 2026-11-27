import fs from "fs";
import path from "path";

describe("Tahap 7: Ruang Konsultasi Chat & Asesmen dalam Sesi (Screens 43-47)", () => {
  const chatComponentsDir = path.join(
    __dirname,
    "../src/components/patient/chat",
  );
  const chatRoomScreenFile = path.join(
    __dirname,
    "../app/(patient)/patient/chat-room.tsx",
  );
  const overtimeModalFile = path.join(
    __dirname,
    "../app/(patient)/patient/overtime-modal.tsx",
  );
  const sessionSummaryFile = path.join(
    __dirname,
    "../app/(patient)/patient/session-summary.tsx",
  );

  const subcomponentFiles = [
    "ChatHeaderBar.tsx",
    "ChatMessageBubble.tsx",
    "ChatAssessmentPromptCard.tsx",
    "ChatInputBar.tsx",
    "InSessionAssessmentModal.tsx",
    "SessionOvertimeSheet.tsx",
    "SessionCompletedView.tsx",
    "ConsultationResultView.tsx",
  ];

  it("should have all 8 modular subcomponents in src/components/patient/chat/", () => {
    subcomponentFiles.forEach((file) => {
      const fullPath = path.join(chatComponentsDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe("Screen 43: Ruang Konsultasi", () => {
    it("should verify ChatHeaderBar has doctor title, remaining time pill, and voice/video actions", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "ChatHeaderBar.tsx"),
        "utf-8",
      );
      expect(content).toContain("Sesi berlangsung · sisa");
      expect(content).toContain("Kembali ke Beranda");
      expect(content).toContain("Panggilan suara");
      expect(content).toContain("Panggilan video");
      expect(content).toContain("border-dashed");
    });

    it("should verify ChatMessageBubble supports doctor, patient, and system privacy notes", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "ChatMessageBubble.tsx"),
        "utf-8",
      );
      expect(content).toContain("PRACTITIONER");
      expect(content).toContain("PATIENT");
      expect(content).toContain("SYSTEM");
      expect(content).toContain("Terkirim");
    });

    it("should verify ChatAssessmentPromptCard has the in-session doctor assessment CTA", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "ChatAssessmentPromptCard.tsx"),
        "utf-8",
      );
      expect(content).toContain("Psikolog meminta asesmen singkat");
      expect(content).toContain(
        "Sekitar 2 menit. Jawabanmu hanya untuk sesi ini.",
      );
      expect(content).toContain("Isi Sekarang");
    });

    it("should verify ChatInputBar has message input placeholder and send button", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "ChatInputBar.tsx"),
        "utf-8",
      );
      expect(content).toContain("Tulis pesan...");
      expect(content).toContain("Kirim pesan");
      expect(content).toContain("TextInput");
    });

    it("should verify chat-room.tsx connects the components, safe leave dialog, and enforces practitioner-only finish", () => {
      const content = fs.readFileSync(chatRoomScreenFile, "utf-8");
      expect(content).toContain("Belum ada riwayat pesan pada sesi konsultasi ini.");
      expect(content).toContain("ChatHeaderBar");
      expect(content).toContain("ChatMessageBubble");
      expect(content).toContain("ChatAssessmentPromptCard");
      expect(content).toContain("ChatInputBar");
      expect(content).toContain("InSessionAssessmentModal");
      expect(content).toContain("SessionOvertimeSheet");
      expect(content).toContain("Keluar dari Ruang Chat?");
      expect(content).toContain("Sesi hanya dapat diakhiri oleh praktisi yang ditugaskan");
      expect(content).not.toContain("useFinishConsultation");
    });
  });

  describe("Screen 44: Asesmen dalam Sesi", () => {
    it("should verify InSessionAssessmentModal has 3 sequential questions, 4 Likert options, and disclaimer", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "InSessionAssessmentModal.tsx"),
        "utf-8",
      );
      expect(content).toContain("Asesmen singkat");
      expect(content).toContain("Diminta oleh");
      expect(content).toContain("PERTANYAAN");
      expect(content).toContain("Tidak sama sekali");
      expect(content).toContain("Beberapa hari");
      expect(content).toContain("Lebih dari separuh hari");
      expect(content).toContain("Hampir setiap hari");
      expect(content).toContain(
        "Jawaban dan skor akan langsung dikirim ke praktisi secara aman selama sesi berlangsung.",
      );
      expect(content).not.toContain("Belum ditetapkan");
      expect(content).toContain("Lanjut");
      expect(content).toContain("Kembali ke chat");
    });
  });

  describe("Screen 45: Perpanjang Sesi", () => {
    it("should verify SessionOvertimeSheet has countdown, +15/+30 mins, and canonical CTAs", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "SessionOvertimeSheet.tsx"),
        "utf-8",
      );
      expect(content).toContain("Waktu sesi");
      expect(content).toContain("SISA WAKTU");
      expect(content).toContain("05:00");
      expect(content).toContain("Mau lanjut bicara dengan");
      expect(content).toContain("TAMBAH WAKTU");
      expect(content).toContain("Tambah 15 menit");
      expect(content).toContain("Tambah 30 menit");
      expect(content).toContain(
        "Tersedia jika psikolog menyetujui. Harga dari server.",
      );
      expect(content).toContain("Lanjut ke Pembayaran");
      expect(content).toContain("Akhiri Sesi Tepat Waktu");
      expect(content).toContain("Kembali ke chat");
    });

    it("should verify overtime-modal.tsx renders SessionOvertimeSheet", () => {
      const content = fs.readFileSync(overtimeModalFile, "utf-8");
      expect(content).toContain("SessionOvertimeSheet");
      expect(content).toContain("handleProceedToPayment");
      expect(content).toContain("handleEndSessionOnTime");
    });
  });

  describe("Screen 46: Sesi Selesai", () => {
    it("should verify SessionCompletedView has checkmark, 3-step vertical progress timeline, and info banner", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "SessionCompletedView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Sesi selesai");
      expect(content).toContain(
        "Psikolog sedang menyusun hasil dan sarannya untukmu.",
      );
      expect(content).toContain("Hasil sedang disusun");
      expect(content).toContain("Hasil siap dibaca");
      expect(content).toContain("Kami kabari saat hasil siap");
      expect(content).toContain("Kembali ke Beranda");
    });
  });

  describe("Screen 47: Hasil Konsultasi", () => {
    it("should verify ConsultationResultView has summary, saran, rencana perawatan, and follow-up recommendation", () => {
      const content = fs.readFileSync(
        path.join(chatComponentsDir, "ConsultationResultView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Hasil konsultasi");
      expect(content).toContain("Ringkasan sesimu");
      expect(content).toContain("SARAN DARI PSIKOLOG");
      expect(content).toContain("RENCANA PERAWATAN");
      expect(content).toContain("Lihat rencana lengkap");
      expect(content).toContain("Psikolog menyarankan sesi lanjutan");
      expect(content).toContain("Pilih Jadwal Lanjutan");
      expect(content).toContain("Merasa memburuk? Lihat bantuan segera");
      expect(content).toContain("Hasil ini bukan pengganti penanganan darurat.");
    });

    it("should verify session-summary.tsx manages both Sesi Selesai (Screen 46) and Hasil Konsultasi (Screen 47)", () => {
      const content = fs.readFileSync(sessionSummaryFile, "utf-8");
      expect(content).toContain("SessionCompletedView");
      expect(content).toContain("ConsultationResultView");
      expect(content).toContain("CrisisHelpModal");
      expect(content).toContain("useConsultationNotes");
      expect(content).toContain("useCarePlan");
      expect(content).toContain("usePatientResultDetail");
    });
  });

  describe("Rule of 14px Compliance", () => {
    it("should strictly ensure zero sub-14px (text-xs / size='xs') typography in all Tahap 7 components", () => {
      subcomponentFiles.forEach((file) => {
        const content = fs.readFileSync(
          path.join(chatComponentsDir, file),
          "utf-8",
        );
        expect(content).not.toMatch(/className="[^"]*text-xs[^"]*"/);
        expect(content).not.toMatch(/size="xs"/);
      });

      const screenFiles = [chatRoomScreenFile, overtimeModalFile, sessionSummaryFile];
      screenFiles.forEach((file) => {
        const content = fs.readFileSync(file, "utf-8");
        expect(content).not.toMatch(/className="[^"]*text-xs[^"]*"/);
        expect(content).not.toMatch(/size="xs"/);
      });
    });
  });
});

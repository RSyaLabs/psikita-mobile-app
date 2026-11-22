import fs from "fs";
import path from "path";

describe("Tahap 9: Riwayat Konsultasi, Ubah Jadwal & Pengembalian Dana (Screens 52-56)", () => {
  const root = path.resolve(__dirname, "..");
  const historyDir = path.join(root, "src/components/patient/history");
  const historyRoute = path.join(root, "app/(patient)/patient/history.tsx");
  const refundsRoute = path.join(root, "app/(patient)/patient/refunds.tsx");

  describe("A. Screen 52: Sesi: daftar (RW1)", () => {
    const file = path.join(historyDir, "SessionListView.tsx");
    const content = fs.readFileSync(file, "utf8");

    it("should render Sesi header and subtitle per Wireframe RW1", () => {
      expect(content).toContain("Sesi");
      expect(content).toContain("Semua konsultasimu di satu tempat.");
    });

    it("should provide Berlangsung and Selesai pill filter tabs", () => {
      expect(content).toContain("testID=\"tab-berlangsung\"");
      expect(content).toContain("testID=\"tab-selesai\"");
      expect(content).toContain("accessibilityRole=\"tab\"");
    });

    it("should render BERLANGSUNG section with active consultation card and action button", () => {
      expect(content).toContain("BERLANGSUNG");
      expect(content).toContain("testID=\"active-consultation-card\"");
      expect(content).toContain("testID=\"btn-lihat-status\"");
      expect(content).toContain("Lihat Status");
    });

    it("should render TERAKHIR SELESAI section with completed session items and Lihat arrow", () => {
      expect(content).toContain("TERAKHIR SELESAI");
      expect(content).toContain("session-item-");
      expect(content).toContain("Hasil tersedia");
      expect(content).toContain("Lihat");
    });

    it("should include dashed card link for upcoming schedule", () => {
      expect(content).toContain("testID=\"btn-jadwal-mendatang\"");
      expect(content).toContain("Lihat jadwal mendatang ›");
    });
  });

  describe("B. Screen 53: Detail sesi (RW2)", () => {
    const file = path.join(historyDir, "SessionDetailView.tsx");
    const content = fs.readFileSync(file, "utf8");

    it("should render header with back button and Detail sesi title", () => {
      expect(content).toContain("testID=\"btn-back-detail\"");
      expect(content).toContain("Detail sesi");
    });

    it("should render practitioner info card with avatar and Hasil tersedia badge", () => {
      expect(content).toContain("testID=\"practitioner-info-card\"");
      expect(content).toContain("Hasil tersedia");
    });

    it("should display session DL card with date, duration, format, and total paid", () => {
      expect(content).toContain("Tanggal");
      expect(content).toContain("Durasi");
      expect(content).toContain("Format");
      expect(content).toContain("Total dibayar");
    });

    it("should provide action buttons: view results, schedule follow-up, and problem link", () => {
      expect(content).toContain("testID=\"btn-lihat-hasil\"");
      expect(content).toContain("Lihat Hasil & Rencana Perawatan");
      expect(content).toContain("testID=\"btn-jadwalkan-lanjutan\"");
      expect(content).toContain("Jadwalkan Sesi Lanjutan");
      expect(content).toContain("testID=\"btn-ajukan-refund\"");
      expect(content).toContain("Ada masalah dengan sesi ini?");
    });

    it("should display healthcare continuity notice about same psychologist", () => {
      expect(content).toContain(
        "Tidak ada tombol cari ulang: sesi lanjutan memakai psikolog yang sama.",
      );
    });
  });

  describe("C. Screen 54: Jadwal mendatang & ubah jadwal (RW3)", () => {
    const file = path.join(historyDir, "UpcomingScheduleView.tsx");
    const content = fs.readFileSync(file, "utf8");

    it("should render header with back button and Jadwal mendatang title", () => {
      expect(content).toContain("testID=\"btn-back-upcoming\"");
      expect(content).toContain("Jadwal mendatang");
    });

    it("should display confirmed schedule card with Terkonfirmasi badge and actions", () => {
      expect(content).toContain("testID=\"confirmed-schedule-card\"");
      expect(content).toContain("Terkonfirmasi");
      expect(content).toContain("testID=\"btn-masuk-sesi\"");
      expect(content).toContain("Masuk Sesi");
      expect(content).toContain("testID=\"btn-ubah-jadwal\"");
      expect(content).toContain("Ubah Jadwal");
    });

    it("should display reschedule policy card (2 hours notice policy)", () => {
      expect(content).toContain("MENGUBAH JADWAL");
      expect(content).toContain(
        "Bisa diubah sampai 2 jam sebelum sesi, maksimal 2 kali. Setelah itu hubungi support.",
      );
    });

    it("should display pending payment next session card with Bayar action", () => {
      expect(content).toContain("SESI BERIKUTNYA");
      expect(content).toContain("testID=\"btn-bayar-pending\"");
      expect(content).toContain("Menunggu pembayaran");
      expect(content).toContain("Bayar ›");
    });

    it("should provide schedule help link at footer", () => {
      expect(content).toContain("testID=\"btn-bantuan-jadwal\"");
      expect(content).toContain("Butuh bantuan soal jadwal?");
    });
  });

  describe("D. Screen 55: Ajukan pengembalian dana (RW4)", () => {
    const file = path.join(historyDir, "RefundRequestView.tsx");
    const content = fs.readFileSync(file, "utf8");

    it("should render header with back button and Pengembalian dana title", () => {
      expect(content).toContain("testID=\"btn-back-refund\"");
      expect(content).toContain("Pengembalian dana");
    });

    it("should display review disclaimer notice per Wireframe RW4", () => {
      expect(content).toContain(
        "Pengajuan ditinjau tim SeraPhany. Hasilnya belum tentu disetujui, tergantung kebijakan.",
      );
    });

    it("should provide 4 distinct radio reason options with proper accessibility", () => {
      expect(content).toContain("ALASAN");
      expect(content).toContain("Sesi tidak berlangsung");
      expect(content).toContain("Masalah teknis saat sesi");
      expect(content).toContain("Psikolog tidak hadir");
      expect(content).toContain("Lainnya");
      expect(content).toContain("accessibilityRole=\"radio\"");
    });

    it("should provide textarea for short description", () => {
      expect(content).toContain("Ceritakan singkat");
      expect(content).toContain("testID=\"input-refund-details\"");
      expect(content).toContain("[Jelaskan apa yang terjadi]");
    });

    it("should display server price disclaimer notice", () => {
      expect(content).toContain(
        "Nominal dan kelayakan ditentukan server. Tidak ada nominal di layar ini.",
      );
    });

    it("should provide submit and cancel buttons", () => {
      expect(content).toContain("testID=\"btn-kirim-pengajuan\"");
      expect(content).toContain("Kirim Pengajuan");
      expect(content).toContain("testID=\"btn-batal-refund\"");
      expect(content).toContain("Batal");
    });
  });

  describe("E. Screen 56: Status pengembalian dana (RW5)", () => {
    const file = path.join(historyDir, "RefundStatusView.tsx");
    const content = fs.readFileSync(file, "utf8");

    it("should render header with back button and Status pengajuan title", () => {
      expect(content).toContain("testID=\"btn-back-status\"");
      expect(content).toContain("Status pengajuan");
    });

    it("should display status summary card with Sedang ditinjau badge and reference", () => {
      expect(content).toContain("testID=\"refund-summary-card\"");
      expect(content).toContain("Sedang ditinjau");
      expect(content).toContain("Diajukan");
      expect(content).toContain("Nomor");
    });

    it("should render 4 vertical timeline steps with accurate states", () => {
      expect(content).toContain("Pengajuan diterima");
      expect(content).toContain("Sedang ditinjau");
      expect(content).toContain("Biasanya 1x24 jam kerja");
      expect(content).toContain("Keputusan");
      expect(content).toContain("Kami kabari lewat notifikasi");
      expect(content).toContain("Dana dikembalikan");
      expect(content).toContain("Jika disetujui");
    });

    it("should display requested amount DL card", () => {
      expect(content).toContain("Nilai yang diajukan");
    });

    it("should display server estimation disclaimer notice", () => {
      expect(content).toContain(
        "Estimasi dan nilai dari server, bukan tebakan klien.",
      );
    });

    it("should provide support contact and return to sessions buttons", () => {
      expect(content).toContain("testID=\"btn-hubungi-support\"");
      expect(content).toContain("Hubungi Support");
      expect(content).toContain("testID=\"btn-kembali-ke-sesi\"");
      expect(content).toContain("Kembali ke Sesi");
    });
  });

  describe("F. Universal Rule of 14px Compliance", () => {
    const filesToCheck = [
      path.join(historyDir, "SessionListView.tsx"),
      path.join(historyDir, "SessionDetailView.tsx"),
      path.join(historyDir, "UpcomingScheduleView.tsx"),
      path.join(historyDir, "RefundRequestView.tsx"),
      path.join(historyDir, "RefundStatusView.tsx"),
      historyRoute,
      refundsRoute,
    ];

    it("must have ZERO text-xs or size=xs typography across all Tahap 9 components", () => {
      for (const f of filesToCheck) {
        const raw = fs.readFileSync(f, "utf8");
        const hasTextXs = /text-xs/.test(raw);
        const hasSizeXs = /size=["']xs["']/.test(raw);
        expect(hasTextXs).toBe(false);
        expect(hasSizeXs).toBe(false);
      }
    });
  });
});

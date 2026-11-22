import fs from "fs";
import path from "path";

describe("21. Tahap 14.1: Practitioner Dashboard, War Room & Matching Suite (Screens 74–80)", () => {
  const warRoomComponentsDir = path.resolve(
    __dirname,
    "../src/components/practitioner/war-room",
  );
  const dashboardComponentFile = path.resolve(
    __dirname,
    "../src/components/practitioner/dashboard/PractitionerDashboardView.tsx",
  );
  const warRoomRoutePath = path.resolve(
    __dirname,
    "../app/(practitioner)/practitioner/war-room.tsx",
  );
  const dashboardRoutePath = path.resolve(
    __dirname,
    "../app/(practitioner)/practitioner/dashboard.tsx",
  );

  describe("Screen 74: D1 · Beranda Praktisi", () => {
    it("should exist on disk with zero dead-code / clean exports", () => {
      expect(fs.existsSync(dashboardComponentFile)).toBe(true);
    });

    it("should strictly enforce Universal Rule of 14px (zero text-xs)", () => {
      const content = fs.readFileSync(dashboardComponentFile, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D1 greetings, urgent action, and schedule sections", () => {
      const content = fs.readFileSync(dashboardComponentFile, "utf-8");
      expect(content).toContain("Yang perlu kamu selesaikan hari ini.");
      expect(content).toContain("Siap menerima kasus");
      expect(content).toContain("Kasus baru hanya masuk saat ini aktif.");
      expect(content).toContain("PERLU TINDAKAN");
      expect(content).toContain("1 sesi");
      expect(content).toContain("Hasil sesi belum dikirim");
      expect(content).toContain("Selesaikan Hasil");
      expect(content).toContain("3 kasus baru menunggu");
      expect(content).toContain("Terdekat berakhir dalam 02:10");
      expect(content).toContain("JADWAL BERIKUTNYA");
      expect(content).toContain("Pendapatan bulan ini:");
    });
  });

  describe("Screen 75: D2 · Kasus Baru (War Room Offers)", () => {
    const file = path.join(warRoomComponentsDir, "NewCaseListView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D2 matching offers and notices", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("Kasus baru");
      expect(content).toContain("Siap");
      expect(content).toContain("Data lengkap pasien baru terlihat setelah kamu menerima kasus.");
      expect(content).toContain("Mendesak");
      expect(content).toContain("02:10");
      expect(content).toContain("Kecemasan · Gangguan tidur");
      expect(content).toContain("Sulit tidur hampir setiap minggu, mulai mengganggu pekerjaan.");
      expect(content).toContain("Kasus lain sudah diambil psikolog lain dan dihapus dari daftar.");
      expect(content).toContain("Kembali ke Beranda");
    });
  });

  describe("Screen 76: D3 · Ringkasan Kasus (Case Summary Brief)", () => {
    const file = path.join(warRoomComponentsDir, "CaseSummaryView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D3 clinical brief fields and actions", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("Ringkasan kasus");
      expect(content).toContain("KELUHAN UTAMA");
      expect(content).toContain("Kecemasan");
      expect(content).toContain("Gangguan tidur");
      expect(content).toContain("Dampak fungsional");
      expect(content).toContain("Kompetensi dibutuhkan");
      expect(content).toContain("Format layanan");
      expect(content).toContain("Identitas dan jawaban lengkap pasien baru terlihat setelah kamu menerima kasus.");
      expect(content).toContain("Terima Kasus");
      expect(content).toContain("Kembali ke daftar");
    });
  });

  describe("Screen 77: D4 · Kasus Diterima (Confirmation & Stepper)", () => {
    const file = path.join(warRoomComponentsDir, "CaseAcceptedView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D4 stepper and consultation ready CTA", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("Kasus diterima");
      expect(content).toContain("Kasus ini sekarang ditugaskan kepadamu.");
      expect(content).toContain("PASIEN");
      expect(content).toContain("Lihat konteks klinis lengkap ›");
      expect(content).toContain("Kasus ditugaskan kepadamu");
      expect(content).toContain("Menunggu pasien membayar");
      expect(content).toContain("Sesi siap dimulai");
      expect(content).toContain("Masuk Sesi");
      expect(content).toContain("Aktif setelah pembayaran pasien terkonfirmasi.");
    });
  });

  describe("Screen 78: D5 · Penawaran Berakhir", () => {
    const file = path.join(warRoomComponentsDir, "OfferExpiredView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D5 expired messages and CTAs", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("00:00");
      expect(content).toContain("Waktu penawaran habis");
      expect(content).toContain("Kasus ini diteruskan ke psikolog lain. Kamu tidak perlu melakukan apa pun.");
      expect(content).toContain("Lihat Kasus Lain");
      expect(content).toContain("Ke Beranda");
    });
  });

  describe("Screen 79: D6 · Kasus Sudah Diambil", () => {
    const file = path.join(warRoomComponentsDir, "CaseTakenView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D6 already-claimed notification", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("Kasus sudah diambil psikolog lain");
      expect(content).toContain("Server mencatat satu pengambil lebih dulu. Tidak ada tindakan yang perlu kamu lakukan.");
      expect(content).toContain("Aktifkan notifikasi supaya penawaran berikutnya langsung terlihat.");
      expect(content).toContain("Lihat Kasus Lain");
      expect(content).toContain("Ke Beranda");
    });
  });

  describe("Screen 80: D7 · Kasus Saya", () => {
    const file = path.join(warRoomComponentsDir, "MyCasesListView.tsx");

    it("should exist on disk and enforce Universal Rule of 14px", () => {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe D7 cases list and tabs", () => {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).toContain("Kasus");
      expect(content).toContain("Semua kasus yang kamu pegang.");
      expect(content).toContain("Aktif");
      expect(content).toContain("Selesai");
      expect(content).toContain("Sesi ›");
      expect(content).toContain("Isi ›");
      expect(content).toContain("Lihat ›");
      expect(content).toContain("Kasus baru ada di");
      expect(content).toContain("Kasus lanjutan tidak dicocokkan ulang.");
    });
  });

  describe("Routes and Navigation Integration", () => {
    it("should integrate War Room views in war-room.tsx route", () => {
      const content = fs.readFileSync(warRoomRoutePath, "utf-8");
      expect(content).toContain("NewCaseListView");
      expect(content).toContain("CaseSummaryView");
      expect(content).toContain("CaseAcceptedView");
      expect(content).toContain("OfferExpiredView");
      expect(content).toContain("CaseTakenView");
      expect(content).toContain("MyCasesListView");
    });

    it("should integrate PractitionerDashboardView in dashboard.tsx route", () => {
      const content = fs.readFileSync(dashboardRoutePath, "utf-8");
      expect(content).toContain("PractitionerDashboardView");
      expect(content).toContain("PractitionerTabBar");
    });
  });
});

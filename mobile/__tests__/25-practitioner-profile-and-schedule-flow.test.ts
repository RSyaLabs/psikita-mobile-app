import fs from "fs";
import path from "path";

describe("Tahap 14.5: Ketersediaan, Jam Praktik, Akun & Profil Profesional (Screens 98–103)", () => {
  const profileDir = path.join(
    __dirname,
    "../src/components/practitioner/profile",
  );
  const profileRouteFile = path.join(
    __dirname,
    "../app/(practitioner)/practitioner/profile.tsx",
  );

  const viewFiles = [
    "DailyAvailabilityView.tsx",
    "WeeklyScheduleView.tsx",
    "EditScheduleHoursView.tsx",
    "PractitionerAccountHubView.tsx",
    "ProfessionalProfileView.tsx",
    "PractitionerSettingsView.tsx",
    "index.ts",
  ];

  it("should have all 6 modular profile views and index in src/components/practitioner/profile/", () => {
    viewFiles.forEach((file) => {
      const fullPath = path.join(profileDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe("Screen 98: PR1 · Ketersediaan", () => {
    it("should verify DailyAvailabilityView contains readiness toggle, daily schedule list, service formats, and warning", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "DailyAvailabilityView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Ketersediaan");
      expect(content).toContain("Siap menerima kasus");
      expect(content).toContain("Kasus baru masuk saat aktif");
      expect(content).toContain("JAM PRAKTIK");
      expect(content).toContain("Senin");
      expect(content).toContain("Selasa");
      expect(content).toContain("Rabu");
      expect(content).toContain("Kamis");
      expect(content).toContain("Jumat");
      expect(content).toContain("Ubah");
      expect(content).toContain("FORMAT LAYANAN");
      expect(content).toContain("Chat");
      expect(content).toContain("Video");
      expect(content).toContain(
        "Mengubah jam tidak membatalkan sesi yang sudah dijadwalkan.",
      );
      expect(content).toContain("Simpan");
    });
  });

  describe("Screen 99: PR2 · Jadwal Praktisi", () => {
    it("should verify WeeklyScheduleView contains period filter, session cards, empty slots, and availability shortcut", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "WeeklyScheduleView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Jadwal");
      expect(content).toContain("Minggu ini");
      expect(content).toContain("Bulan ini");
      expect(content).toContain("SENIN 23 NOV");
      expect(content).toContain("09.00 · Rina Kusuma");
      expect(content).toContain("Sesi lanjutan · Chat");
      expect(content).toContain("Masuk");
      expect(content).toContain("SELASA 24 NOV");
      expect(content).toContain("13.00 · Budi Santoso");
      expect(content).toContain("Menunggu pembayaran");
      expect(content).toContain("Lihat");
      expect(content).toContain("Slot kosong");
      expect(content).toContain(
        "Perubahan jadwal oleh pasien muncul sebagai notifikasi.",
      );
      expect(content).toContain("Atur Ketersediaan");
    });
  });

  describe("Screen 100: PR3 · Ubah Jam Praktik", () => {
    it("should verify EditScheduleHoursView contains practice toggle, start/end time inputs, and apply to all days checkbox", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "EditScheduleHoursView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Jam praktik:");
      expect(content).toContain("Praktik di hari ini");
      expect(content).toContain("Matikan untuk libur");
      expect(content).toContain("Mulai");
      expect(content).toContain("Selesai");
      expect(content).toContain("Terapkan ke hari kerja lain");
      expect(content).toContain(
        "Mengubah jam tidak membatalkan sesi yang sudah dijadwalkan.",
      );
      expect(content).toContain("Simpan Jam");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 101: PR4 · Pusat Akun Praktisi", () => {
    it("should verify PractitionerAccountHubView contains avatar, partner status, practice links, account links, and logout", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "PractitionerAccountHubView.tsx"),
        "utf-8",
      );
      expect(content).toContain("STATUS MITRA");
      expect(content).toContain("Pengajuan mitra");
      expect(content).toContain("Disetujui");
      expect(content).toContain("Profil profesional, STR & SIP");
      expect(content).toContain("PRAKTIK");
      expect(content).toContain("Ketersediaan");
      expect(content).toContain("Rekening bank");
      expect(content).toContain("Riwayat pencairan");
      expect(content).toContain("AKUN");
      expect(content).toContain("Beralih ke tampilan pasien");
      expect(content).toContain("Satu akun, dua peran");
      expect(content).toContain("Notifikasi & preferensi");
      expect(content).toContain("Bantuan");
      expect(content).toContain("Keluar Akun");
    });
  });

  describe("Screen 102: PR5 · Profil Profesional", () => {
    it("should verify ProfessionalProfileView contains photo change, display name, bio, specialties chips, and locked STR/SIP credentials", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "ProfessionalProfileView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Profil profesional");
      expect(content).toContain("Ganti foto");
      expect(content).toContain("Nama tampilan");
      expect(content).toContain("Bio singkat");
      expect(content).toContain("KEAHLIAN");
      expect(content).toContain("Kecemasan");
      expect(content).toContain("Tidur");
      expect(content).toContain("Tambah");
      expect(content).toContain("KREDENSIAL");
      expect(content).toContain("STR");
      expect(content).toContain("SIP");
      expect(content).toContain("Terkunci");
      expect(content).toContain(
        "Mengubah kredensial perlu ditinjau ulang oleh tim SeraPhany.",
      );
      expect(content).toContain("Simpan");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 103: PR6 · Pengaturan Keamanan & Notifikasi", () => {
    it("should verify PractitionerSettingsView contains case & session notifications, payout notifications, and preferences", () => {
      const content = fs.readFileSync(
        path.join(profileDir, "PractitionerSettingsView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Notifikasi & preferensi");
      expect(content).toContain("KASUS & SESI");
      expect(content).toContain("Kasus baru masuk");
      expect(content).toContain("Hasil belum dikirim");
      expect(content).toContain("Pembayaran pasien terkonfirmasi");
      expect(content).toContain("PENDAPATAN");
      expect(content).toContain("Status pencairan");
      expect(content).toContain("Rekening perlu diperbarui");
      expect(content).toContain("PREFERENSI");
      expect(content).toContain("Bahasa");
      expect(content).toContain("Indonesia");
      expect(content).toContain("Suara notifikasi kasus");
      expect(content).toContain(
        "Kategori wajib vs opsional ditentukan produk.",
      );
    });
  });

  describe("Canonical Route Controller: profile.tsx", () => {
    it("should verify profile.tsx cleanly routes through all 6 profile views and integrates with PractitionerTabBar", () => {
      const content = fs.readFileSync(profileRouteFile, "utf-8");
      expect(content).toContain("DailyAvailabilityView");
      expect(content).toContain("WeeklyScheduleView");
      expect(content).toContain("EditScheduleHoursView");
      expect(content).toContain("PractitionerAccountHubView");
      expect(content).toContain("ProfessionalProfileView");
      expect(content).toContain("PractitionerSettingsView");
      expect(content).toContain(
        '<PractitionerTabBar activeTab="akun" />',
      );
      expect(content).toContain("usePractitionerProfile");
      expect(content).toContain("useMyAvatar");
      expect(content).toContain("useStartPractitionerVerification");
      expect(content).toContain("useAuth");
    });
  });

  describe("Universal Rule of 14px Compliance", () => {
    it("should verify zero occurrences of text-xs or size='xs' across all profile components and route", () => {
      const filesToCheck = [
        ...viewFiles.map((f) => path.join(profileDir, f)),
        profileRouteFile,
      ];

      filesToCheck.forEach((filePath) => {
        const content = fs.readFileSync(filePath, "utf-8");
        const hasTextXs = /\btext-xs\b/.test(content);
        const hasSizeXs = /size=["']xs["']/.test(content);
        expect(hasTextXs).toBe(false);
        expect(hasSizeXs).toBe(false);
      });
    });
  });
});

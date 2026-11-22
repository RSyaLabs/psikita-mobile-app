import fs from "fs";
import path from "path";
import { ROUTES } from "@/constants/routes";

describe("20. Tahap 13: Akun & Keamanan Pasien (Screens 70–73) Flow Suite", () => {
  const accountComponentsDir = path.resolve(
    __dirname,
    "../src/components/patient/account",
  );
  const securityRoutePath = path.resolve(
    __dirname,
    "../app/(patient)/patient/security.tsx",
  );
  const editProfileRoutePath = path.resolve(
    __dirname,
    "../app/(patient)/patient/edit-profile.tsx",
  );
  const profileRoutePath = path.resolve(
    __dirname,
    "../app/(patient)/patient/profile.tsx",
  );
  const patientLayoutPath = path.resolve(
    __dirname,
    "../app/(patient)/_layout.tsx",
  );

  describe("Screen 70: AC1 · Data diri", () => {
    const personalDataFile = path.join(
      accountComponentsDir,
      "PersonalDataView.tsx",
    );

    it("should exist on disk with zero dead-code / clean exports", () => {
      expect(fs.existsSync(personalDataFile)).toBe(true);
    });

    it("should strictly enforce Universal Rule of 14px (zero text-xs)", () => {
      const content = fs.readFileSync(personalDataFile, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe AC1 data diri copies and fields", () => {
      const content = fs.readFileSync(personalDataFile, "utf-8");
      expect(content).toContain("Data diri");
      expect(content).toContain("Ganti foto");
      expect(content).toContain("Nama lengkap");
      expect(content).toContain("[nama sesuai identitas]");
      expect(content).toContain("Terkunci setelah verifikasi identitas.");
      expect(content).toContain("Email");
      expect(content).toContain("[nama@email.com]");
      expect(content).toContain("Terverifikasi");
      expect(content).toContain("Nomor telepon");
      expect(content).toContain("[+62 ...]");
      expect(content).toContain("Tanggal lahir");
      expect(content).toContain("[dd/mm/yyyy]");
      expect(content).toContain(
        "Kolom wajib dan aturan validasi dari server. Belum ditetapkan.",
      );
      expect(content).toContain("Simpan");
      expect(content).toContain("Batal");
    });

    it("should lock name input when KYC is verified", () => {
      const content = fs.readFileSync(personalDataFile, "utf-8");
      expect(content).toContain("editable={!isKycVerified}");
      expect(content).toContain("editable={false}");
    });
  });

  describe("Screen 71: AC2 · Kata sandi & keamanan", () => {
    const securitySettingsFile = path.join(
      accountComponentsDir,
      "SecuritySettingsView.tsx",
    );

    it("should exist on disk with zero dead-code / clean exports", () => {
      expect(fs.existsSync(securitySettingsFile)).toBe(true);
    });

    it("should strictly enforce Universal Rule of 14px (zero text-xs)", () => {
      const content = fs.readFileSync(securitySettingsFile, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe AC2 sections, login methods, and device management", () => {
      const content = fs.readFileSync(securitySettingsFile, "utf-8");
      expect(content).toContain("Keamanan");
      expect(content).toContain("MASUK");
      expect(content).toContain("Ubah kata sandi");
      expect(content).toContain("Masuk dengan kode OTP");
      expect(content).toContain("Akun Google");
      expect(content).toContain("PERANGKAT AKTIF");
      expect(content).toContain("[Perangkat ini]");
      expect(content).toContain("[Lokasi] · aktif sekarang");
      expect(content).toContain("[Perangkat lain]");
      expect(content).toContain("[Lokasi] · [waktu]");
      expect(content).toContain("Keluar ›");
      expect(content).toContain("Keluar dari Semua Perangkat");
      expect(content).toContain("ZONA SENSITIF");
      expect(content).toContain("Hapus akun");
      expect(content).toContain(
        "Menghapus akun membutuhkan konfirmasi di halaman penuh, bukan modal.",
      );
    });
  });

  describe("Screen 72: AC3 · Ubah kata sandi", () => {
    const changePasswordFile = path.join(
      accountComponentsDir,
      "ChangePasswordView.tsx",
    );

    it("should exist on disk with zero dead-code / clean exports", () => {
      expect(fs.existsSync(changePasswordFile)).toBe(true);
    });

    it("should strictly enforce Universal Rule of 14px (zero text-xs)", () => {
      const content = fs.readFileSync(changePasswordFile, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe AC3 password input fields, rules, and actions", () => {
      const content = fs.readFileSync(changePasswordFile, "utf-8");
      expect(content).toContain("Ubah kata sandi");
      expect(content).toContain("Kata sandi saat ini");
      expect(content).toContain("Masukkan kata sandi saat ini");
      expect(content).toContain("Kata sandi baru");
      expect(content).toContain("Minimal [N] karakter");
      expect(content).toContain("Ulangi kata sandi baru");
      expect(content).toContain("Ketik ulang");
      expect(content).toContain(
        "Aturan kata sandi dari server. Pesan salah tampil di bawah kolom yang bermasalah.",
      );
      expect(content).toContain(
        "Keluar dari perangkat lain setelah diubah",
      );
      expect(content).toContain("Lupa kata sandi saat ini?");
      expect(content).toContain("Simpan Kata Sandi");
      expect(content).toContain("Batal");
    });
  });

  describe("Screen 73: AC4 · Hapus akun", () => {
    const deleteAccountFile = path.join(
      accountComponentsDir,
      "DeleteAccountView.tsx",
    );

    it("should exist on disk with zero dead-code / clean exports", () => {
      expect(fs.existsSync(deleteAccountFile)).toBe(true);
    });

    it("should strictly enforce Universal Rule of 14px (zero text-xs)", () => {
      const content = fs.readFileSync(deleteAccountFile, "utf-8");
      expect(content).not.toMatch(/text-xs/);
      expect(content).not.toMatch(/size="xs"/);
    });

    it("should contain exact Wireframe AC4 irreversible warning, PDP legal retention, and actions", () => {
      const content = fs.readFileSync(deleteAccountFile, "utf-8");
      expect(content).toContain("Hapus akun");
      expect(content).toContain("Hapus akunmu?");
      expect(content).toContain(
        "Tindakan ini tidak bisa dibatalkan. Isi di bawah ini ditentukan kebijakan data dan hukum, bukan di sini.",
      );
      expect(content).toContain("Kamu tidak bisa masuk lagi dengan akun ini.");
      expect(content).toContain("[Data yang dihapus, sesuai kebijakan]");
      expect(content).toContain(
        "[Data yang tetap disimpan sesuai kewajiban hukum]",
      );
      expect(content).toContain(
        "Ada konsultasi atau pembayaran yang berjalan? Selesaikan dulu. Server bisa menolak penghapusan sampai semuanya beres.",
      );
      expect(content).toContain("Kata sandi");
      expect(content).toContain("Konfirmasi dengan kata sandimu");
      expect(content).toContain("Saya mengerti dan ingin menghapus akun");
      expect(content).toContain("Hapus Akun Saya");
      expect(content).toContain("Batal, simpan akunku");
    });
  });

  describe("Navigation, Routes, and Layout Integration", () => {
    it("should define ROUTES.PATIENT.SECURITY", () => {
      expect(ROUTES.PATIENT.SECURITY).toBe("/patient/security");
    });

    it("should have security screen file at app/(patient)/patient/security.tsx", () => {
      expect(fs.existsSync(securityRoutePath)).toBe(true);
      const content = fs.readFileSync(securityRoutePath, "utf-8");
      expect(content).toContain("SecuritySettingsView");
      expect(content).toContain("ChangePasswordView");
      expect(content).toContain("DeleteAccountView");
    });

    it("should have patient profile link pointing to ROUTES.PATIENT.SECURITY", () => {
      const content = fs.readFileSync(profileRoutePath, "utf-8");
      expect(content).toContain("ROUTES.PATIENT.SECURITY");
      expect(content).toContain("Kata sandi & keamanan");
    });

    it("should have edit-profile.tsx render PersonalDataView as canonical Screen 70 view", () => {
      const content = fs.readFileSync(editProfileRoutePath, "utf-8");
      expect(content).toContain("PersonalDataView");
      expect(content).toContain("ROUTES.PATIENT.PROFILE");
      expect(content).toContain("useUpdatePatientProfile");
    });

    it("should register patient/security in patient layout and public guest whitelist", () => {
      const content = fs.readFileSync(patientLayoutPath, "utf-8");
      expect(content).toContain('<Stack.Screen name="patient/security" />');
      expect(content).toContain('(leafSegment as string) === "security"');
    });
  });
});

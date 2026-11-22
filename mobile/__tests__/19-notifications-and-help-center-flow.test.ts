import React from "react";
import fs from "fs";
import path from "path";
import {
  NotificationListView,
  NotificationSettingsView,
  HelpCenterView,
} from "@/components/patient/notifications";

describe("19. Notifications & Patient Help Center Flow (Wireframe Screens 67-69)", () => {
  const notifDir = path.resolve(
    __dirname,
    "../src/components/patient/notifications"
  );

  describe("A. Wireframe Screen 67 (NT1 · Notifikasi: daftar)", () => {
    it("should export NotificationListView component cleanly", () => {
      expect(typeof NotificationListView).toBe("function");
    });

    it("should contain all verbatim copy from Wireframe NT1", () => {
      const filePath = path.join(notifDir, "NotificationListView.tsx");
      const content = fs.readFileSync(filePath, "utf8");

      expect(content).toContain("Notifikasi");
      expect(content).toContain("BARU");
      expect(content).toContain("Psikolog ditemukan");
      expect(content).toContain("Lanjut ke pembayaran · 2 mnt lalu");
      expect(content).toContain("Hasil konsultasi tersedia");
      expect(content).toContain("Baca saran dan rencana perawatan");
      expect(content).toContain("SEBELUMNYA");
      expect(content).toContain("Pembayaran berhasil");
      expect(content).toContain("Verifikasi identitas disetujui");
      expect(content).toContain(
        "Isi notifikasi tidak menampilkan detail medis di layar kunci."
      );
      expect(content).toContain("Atur preferensi notifikasi");
    });
  });

  describe("B. Wireframe Screen 68 (NT2 · Pengaturan notifikasi)", () => {
    it("should export NotificationSettingsView component cleanly", () => {
      expect(typeof NotificationSettingsView).toBe("function");
    });

    it("should contain all verbatim copy and switches from Wireframe NT2", () => {
      const filePath = path.join(notifDir, "NotificationSettingsView.tsx");
      const content = fs.readFileSync(filePath, "utf8");

      expect(content).toContain("PENTING");
      expect(content).toContain("Status pembayaran & sesi");
      expect(content).toContain("Wajib untuk layanan");
      expect(content).toContain("Hasil konsultasi tersedia");
      expect(content).toContain("Rekomendasi tetap aktif");

      expect(content).toContain("PENGINGAT");
      expect(content).toContain("Pengingat jadwal sesi");
      expect(content).toContain("[1 jam sebelumnya]");
      expect(content).toContain("Pengingat rencana perawatan");
      expect(content).toContain("[hari · jam]");

      expect(content).toContain("LAINNYA");
      expect(content).toContain("Edukasi & tips");
      expect(content).toContain("Maks. [N] per minggu");

      expect(content).toContain(
        'Layar kunci hanya menampilkan "Ada pembaruan", tanpa detail medis.'
      );
      expect(content).toContain(
        "Kategori wajib vs opsional ditentukan produk."
      );
    });

    it("should enforce locked status for payment & session switch", () => {
      const filePath = path.join(notifDir, "NotificationSettingsView.tsx");
      const content = fs.readFileSync(filePath, "utf8");

      // Verify that paymentAndSession cannot be toggled off
      expect(content).toContain('if (key === "paymentAndSession") return;');
      expect(content).toContain("locked: true");
    });
  });

  describe("C. Wireframe Screen 69 (CS1 · Bantuan & FAQ)", () => {
    it("should export HelpCenterView component cleanly", () => {
      expect(typeof HelpCenterView).toBe("function");
    });

    it("should contain all verbatim copy from Wireframe CS1", () => {
      const filePath = path.join(notifDir, "HelpCenterView.tsx");
      const content = fs.readFileSync(filePath, "utf8");

      expect(content).toContain("Pusat bantuan");
      expect(content).toContain("Cari pertanyaan");
      expect(content).toContain("PERTANYAAN UMUM");
      expect(content).toContain("Bagaimana cara kerja pencocokan psikolog?");
      expect(content).toContain("Pembayaranku belum terkonfirmasi");
      expect(content).toContain("Kenapa verifikasi identitasku ditolak?");
      expect(content).toContain("Bagaimana datamu dijaga?");
      expect(content).toContain("MASIH BUTUH BANTUAN?");
      expect(content).toContain("Hubungi Tim Support");
      expect(content).toContain("Balasan di dalam aplikasi");
      expect(content).toContain("Kirim email");
      expect(content).toContain(
        "Butuh bantuan segera? Lihat kontak darurat"
      );
    });
  });

  describe("D. Universal Rule of 14px Verification", () => {
    const files = [
      "NotificationListView.tsx",
      "NotificationSettingsView.tsx",
      "HelpCenterView.tsx",
    ];

    it.each(files)(
      "should strictly have zero sub-14px typography in %s",
      (fileName) => {
        const filePath = path.join(notifDir, fileName);
        const content = fs.readFileSync(filePath, "utf8");

        // Disallow text-xs, text-[10px], text-[11px], text-[12px], text-[13px]
        expect(content).not.toMatch(/\btext-xs\b/);
        expect(content).not.toMatch(/text-\[([0-9]|1[0-3])px\]/);
        expect(content).not.toMatch(/size="xs"/);
      }
    );
  });

  describe("E. Screen Route Files Parity", () => {
    const appDir = path.resolve(__dirname, "../app/(patient)/patient");

    it("should have physical route file notifications.tsx", () => {
      const exists = fs.existsSync(path.join(appDir, "notifications.tsx"));
      expect(exists).toBe(true);
    });

    it("should have physical route file help.tsx", () => {
      const exists = fs.existsSync(path.join(appDir, "help.tsx"));
      expect(exists).toBe(true);
    });
  });
});

import fs from "fs";
import path from "path";

describe("Tahap 14.4: Pendapatan, Rekening Bank & Pajak Praktisi (Screens 93–97)", () => {
  const payoutDir = path.join(
    __dirname,
    "../src/components/practitioner/payout",
  );
  const historyRouteFile = path.join(
    __dirname,
    "../app/(practitioner)/practitioner/history.tsx",
  );

  const viewFiles = [
    "PractitionerEarningsView.tsx",
    "PayoutHistoryListView.tsx",
    "PayoutDetailView.tsx",
    "TaxProfileAgreementView.tsx",
    "BankAccountFormView.tsx",
    "index.ts",
  ];

  it("should have all 5 modular payout views and index in src/components/practitioner/payout/", () => {
    viewFiles.forEach((file) => {
      const fullPath = path.join(payoutDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe("Screen 93: P1 · Pendapatan Praktisi", () => {
    it("should verify PractitionerEarningsView contains balance, money flow breakdown, requirements, and policy", () => {
      const content = fs.readFileSync(
        path.join(payoutDir, "PractitionerEarningsView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Pendapatan");
      expect(content).toContain("Pantau dari sesi sampai uang masuk.");
      expect(content).toContain("SUDAH DITRANSFER");
      expect(content).toContain("Tanda — berarti belum diketahui, bukan Rp0.");
      expect(content).toContain("DARI MANA UANGNYA SEKARANG");
      expect(content).toContain("Tercatat");
      expect(content).toContain("Ditahan");
      expect(content).toContain("Memenuhi syarat");
      expect(content).toContain("Sudah dibayar");
      expect(content).toContain("SYARAT PENCAIRAN");
      expect(content).toContain("Rekening bank");
      expect(content).toContain("Profil pajak");
      expect(content).toContain("Persetujuan pencairan");
      expect(content).toContain("Riwayat pencairan");
      expect(content).toContain("Pencairan diproses otomatis oleh sistem keuangan SeraPhany");
    });
  });

  describe("Screen 94: P2 · Riwayat Penarikan Insentif", () => {
    it("should verify PayoutHistoryListView contains payout items, policy reminders, and support link", () => {
      const content = fs.readFileSync(
        path.join(payoutDir, "PayoutHistoryListView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Riwayat pencairan");
      expect(content).toContain("Pencairan berjalan otomatis sesuai jadwal");
      expect(content).toContain("rekening bank");
      expect(content).toContain("Status dan jadwal pencairan dari sistem keuangan. Tidak ada tombol cairkan.");
      expect(content).toContain("Pertanyaan soal pencairan?");
    });
  });

  describe("Screen 95: P3 · Detail Potongan & Transfer Bank", () => {
    it("should verify PayoutDetailView contains amount card, breakdown details, timeline, and support button", () => {
      const content = fs.readFileSync(
        path.join(payoutDir, "PayoutDetailView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Detail pencairan");
      expect(content).toContain("Sesi termasuk");
      expect(content).toContain("Potongan");
      expect(content).toContain("Rekening");
      expect(content).toContain("Dihitung");
      expect(content).toContain("Diproses");
      expect(content).toContain("Diterima");
      expect(content).toContain("Nominal tidak sesuai? Hubungi Support");
      expect(content).toContain("Kembali");
    });
  });

  describe("Screen 96: P4 · Profil Pajak & Persetujuan", () => {
    it("should verify TaxProfileAgreementView contains NPWP, tax status, agreement checkbox, and actions", () => {
      const content = fs.readFileSync(
        path.join(payoutDir, "TaxProfileAgreementView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Pajak &amp; persetujuan");
      expect(content).toContain("Dibutuhkan sebelum pencairan.");
      expect(content).toContain("NPWP");
      expect(content).toContain("Status pajak");
      expect(content).toContain("Saya menyetujui perjanjian pencairan");
      expect(content).toContain("Kolom pajak dan teks perjanjian dari kebijakan. Belum ditetapkan.");
      expect(content).toContain("Simpan");
      expect(content).toContain("Nanti saja");
    });
  });

  describe("Screen 97: P5 · Form & Verifikasi Rekening Bank", () => {
    it("should verify BankAccountFormView contains bank selector, account number, name, and policy note", () => {
      const content = fs.readFileSync(
        path.join(payoutDir, "BankAccountFormView.tsx"),
        "utf-8",
      );
      expect(content).toContain("Rekening bank");
      expect(content).toContain("Nama pemilik harus sesuai identitasmu.");
      expect(content).toContain("Bank");
      expect(content).toContain("Nomor rekening");
      expect(content).toContain("Nama pemilik rekening");
      expect(content).toContain("Tidak bisa diedit setelah diverifikasi.");
      expect(content).toContain("Daftar bank dan aturan validasi dari server. Belum ditetapkan.");
      expect(content).toContain("Simpan Rekening");
      expect(content).toContain("Batal");
    });
  });

  describe("Universal Rule of 14px", () => {
    it("should strictly enforce zero text-xs or size=\"xs\" across all practitioner payout views", () => {
      viewFiles.forEach((file) => {
        const content = fs.readFileSync(path.join(payoutDir, file), "utf-8");
        expect(content).not.toContain("text-xs");
        expect(content).not.toContain('size="xs"');
      });
      const routeContent = fs.readFileSync(historyRouteFile, "utf-8");
      expect(routeContent).not.toContain("text-xs");
      expect(routeContent).not.toContain('size="xs"');
    });
  });

  describe("Practitioner History Route Integration", () => {
    it("should verify history.tsx cleanly routes through payout views and integrates with PractitionerTabBar", () => {
      const content = fs.readFileSync(historyRouteFile, "utf-8");
      expect(content).toContain("activeView === \"earnings\"");
      expect(content).toContain("activeView === \"payout-history\"");
      expect(content).toContain("activeView === \"payout-detail\"");
      expect(content).toContain("activeView === \"tax-profile\"");
      expect(content).toContain("activeView === \"bank-account\"");
      expect(content).toContain("<PractitionerTabBar activeTab=\"pendapatan\" />");
    });
  });
});

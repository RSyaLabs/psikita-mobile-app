import fs from "fs";
import path from "path";

describe("13. Tahap 6: Alur Pembayaran & Invoice (Wireframe Screens 33-42)", () => {
  const paymentDir = path.resolve(__dirname, "../src/components/patient/payment");
  const checkoutScreenPath = path.resolve(
    __dirname,
    "../app/(patient)/patient/checkout.tsx",
  );
  const paymentRegularScreenPath = path.resolve(
    __dirname,
    "../app/(patient)/patient/payment-regular.tsx",
  );

  describe("Screen 33: Pembayaran & Ringkasan Checkout", () => {
    it("should verify checkout screen contains order summary, promo code, and payment method selector", () => {
      const checkoutContent = fs.readFileSync(checkoutScreenPath, "utf-8");
      expect(checkoutContent).toContain("PaymentOrderSummaryCard");
      expect(checkoutContent).toContain("PaymentPromoCodeInput");
      expect(checkoutContent).toContain("PaymentMethodSelector");
      expect(checkoutContent).toContain("Total bayar");
      expect(checkoutContent).toContain("Bayar");
    });

    it("should verify PaymentOrderSummaryCard has wireframe pricing breakdown and disclaimer", () => {
      const summaryFile = path.join(paymentDir, "PaymentOrderSummaryCard.tsx");
      const summaryContent = fs.readFileSync(summaryFile, "utf-8");
      expect(summaryContent).toContain("Biaya layanan");
      expect(summaryContent).toContain("Diskon");
      expect(summaryContent).toContain("Biaya pembayaran");
      expect(summaryContent).toContain("Total");
      expect(summaryContent).toContain(
        "Semua nilai dihitung server dan bisa diperbarui sebelum kamu membayar.",
      );
    });

    it("should verify PaymentPromoCodeInput provides promo entry and removal actions", () => {
      const promoFile = path.join(paymentDir, "PaymentPromoCodeInput.tsx");
      const promoContent = fs.readFileSync(promoFile, "utf-8");
      expect(promoContent).toContain("Punya kode promo?");
      expect(promoContent).toContain("Pakai");
      expect(promoContent).toContain("Hapus");
    });
  });

  describe("Screen 34: Instruksi Pembayaran Virtual Account", () => {
    it("should verify VA screen includes VA number, copy buttons, ATM/m-Banking accordions, and wireframe buttons", () => {
      const vaFile = path.join(paymentDir, "PaymentInstructionVA.tsx");
      const vaContent = fs.readFileSync(vaFile, "utf-8");
      expect(vaContent).toContain("Selesaikan pembayaran");
      expect(vaContent).toContain("VIRTUAL ACCOUNT");
      expect(vaContent).toContain("Jumlah yang dibayar");
      expect(vaContent).toContain("CARA MEMBAYAR");
      expect(vaContent).toContain("Lewat ATM");
      expect(vaContent).toContain("Lewat m-Banking");
      expect(vaContent).toContain(
        "Jangan membayar dua kali. Jika sudah membayar, tekan tombol di bawah.",
      );
      expect(vaContent).toContain("Saya Sudah Bayar");
      expect(vaContent).toContain("Ganti metode pembayaran");
    });
  });

  describe("Screen 35: Bayar dengan QRIS", () => {
    it("should verify QRIS screen includes QR code box, save & zoom actions, and 4-step payment guide", () => {
      const qrisFile = path.join(paymentDir, "PaymentInstructionQRIS.tsx");
      const qrisContent = fs.readFileSync(qrisFile, "utf-8");
      expect(qrisContent).toContain("Bayar dengan QRIS");
      expect(qrisContent).toContain("Dibuat khusus untuk pesanan ini");
      expect(qrisContent).toContain("Simpan gambar QR");
      expect(qrisContent).toContain("Perbesar");
      expect(qrisContent).toContain("CARA MEMBAYAR");
      expect(qrisContent).toContain(
        "Buka aplikasi bank atau e-wallet apa pun yang mendukung QRIS.",
      );
      expect(qrisContent).toContain(
        "Satu kode QR hanya untuk satu pembayaran. Jangan membayar dua kali.",
      );
      expect(qrisContent).toContain("Saya Sudah Bayar");
      expect(qrisContent).toContain("Ganti metode pembayaran");
    });
  });

  describe("Screens 36-38: E-Wallet Flow (Selection, ShopeePay & DANA)", () => {
    it("should verify E-wallet selection screen includes ShopeePay, DANA, and fallback to QRIS", () => {
      const ewalletSelectFile = path.join(
        paymentDir,
        "PaymentInstructionEwalletSelect.tsx",
      );
      const content = fs.readFileSync(ewalletSelectFile, "utf-8");
      expect(content).toContain("Pilih e-wallet");
      expect(content).toContain("ShopeePay");
      expect(content).toContain("DANA");
      expect(content).toContain("Tidak punya aplikasinya di ponsel ini?");
      expect(content).toContain("Pilih QRIS");
      expect(content).toContain("Lanjut dengan");
    });

    it("should verify E-wallet instruction screen displays 3-step timeline and deep-link CTAs", () => {
      const ewalletFile = path.join(paymentDir, "PaymentInstructionEwallet.tsx");
      const content = fs.readFileSync(ewalletFile, "utf-8");
      expect(content).toContain("Pembayaran dibuat");
      expect(content).toContain("Menunggu konfirmasi");
      expect(content).toContain("Kembali dari");
      expect(content).toContain("belum berarti pembayaran berhasil");
      expect(content).toContain("Buka ");
      expect(content).toContain("Ganti e-wallet");
    });
  });

  describe("Screens 39-42: Status Polling, Invoice, Gagal & Kedaluwarsa", () => {
    it("should verify Screen 39 status checking screen renders polling radar and action buttons", () => {
      const checkingFile = path.join(paymentDir, "PaymentStatusChecking.tsx");
      const content = fs.readFileSync(checkingFile, "utf-8");
      expect(content).toContain("Sedang memeriksa pembayaranmu");
      expect(content).toContain("Menunggu konfirmasi bank");
      expect(content).toContain("Sesi siap dimulai");
      expect(content).toContain("Cek Status Sekarang");
      expect(content).toContain("Lihat Invoice");
    });

    it("should verify Screen 40 Invoice screen renders official invoice details and server confirmation note", () => {
      const invoiceFile = path.join(paymentDir, "PaymentInvoiceView.tsx");
      const content = fs.readFileSync(invoiceFile, "utf-8");
      expect(content).toContain("INVOICE");
      expect(content).toContain("Tanggal");
      expect(content).toContain("Layanan");
      expect(content).toContain("Metode");
      expect(content).toContain("Status");
      expect(content).toContain("Salin Nomor Invoice");
      expect(content).toContain(
        "Invoice tampil dari data server. Status Lunas hanya muncul setelah pembayaran terkonfirmasi",
      );
    });

    it("should verify Screen 41 Failed and Screen 42 Expired views render semantic alerts", () => {
      const failedFile = path.join(paymentDir, "PaymentFailedView.tsx");
      const failedContent = fs.readFileSync(failedFile, "utf-8");
      expect(failedContent).toContain("Pembayaran tidak berhasil");
      expect(failedContent).toContain("Pilih Metode Lain");
      expect(failedContent).toContain("Cek Status Sekarang");

      const expiredFile = path.join(paymentDir, "PaymentExpiredView.tsx");
      const expiredContent = fs.readFileSync(expiredFile, "utf-8");
      expect(expiredContent).toContain("Waktu pembayaran habis");
      expect(expiredContent).toContain("Kembali ke Pembayaran");
      expect(expiredContent).toContain("Cek Status Sekarang");
    });
  });

  describe("Rule of 14px: Zero Sub-14px Typography in Payment Screens", () => {
    it("should ensure zero text-xs or size=\"xs\" in all Tahap 6 payment files", () => {
      const paymentFiles = fs.readdirSync(paymentDir);
      for (const file of paymentFiles) {
        if (!file.endsWith(".tsx")) continue;
        const filePath = path.join(paymentDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        expect(fileContent).not.toMatch(/\btext-xs\b/);
        expect(fileContent).not.toMatch(/size=["']xs["']/);
      }

      const checkoutContent = fs.readFileSync(checkoutScreenPath, "utf-8");
      expect(checkoutContent).not.toMatch(/\btext-xs\b/);
      expect(checkoutContent).not.toMatch(/size=["']xs["']/);

      const paymentRegularContent = fs.readFileSync(
        paymentRegularScreenPath,
        "utf-8",
      );
      expect(paymentRegularContent).not.toMatch(/\btext-xs\b/);
      expect(paymentRegularContent).not.toMatch(/size=["']xs["']/);
    });
  });
});

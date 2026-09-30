import {
  formatRupiah,
  formatCompactCurrency,
  getInitials,
  formatMessageTime,
} from "@/utils/format";

describe("format utilities", () => {
  describe("formatRupiah", () => {
    it("formats numbers and numeric strings to Indonesian Rupiah", () => {
      expect(formatRupiah(150000)).toBe("Rp 150.000");
      expect(formatRupiah("250000")).toBe("Rp 250.000");
      expect(formatRupiah(0)).toBe("Rp 0");
    });

    it("keeps the sign on a negative amount", () => {
      // Math.abs used to swallow it, so a negative ledger balance rendered as
      // a positive one on the admin revenue tile.
      expect(formatRupiah(-750000)).toBe("Rp -750.000");
      expect(formatRupiah("-750000")).toBe("Rp -750.000");
    });
  });

  describe("formatCompactCurrency", () => {
    it("formats billions with M suffix", () => {
      expect(formatCompactCurrency(1_000_000_000)).toBe("Rp 1,0M");
      expect(formatCompactCurrency(7_200_000_000)).toBe("Rp 7,2M");
    });

    it("formats millions with Jt suffix", () => {
      expect(formatCompactCurrency(1_000_000)).toBe("Rp 1,0Jt");
      expect(formatCompactCurrency(5_500_000)).toBe("Rp 5,5Jt");
    });

    it("delegates to formatRupiah for amounts under a million", () => {
      expect(formatCompactCurrency(500_000)).toBe("Rp 500.000");
      expect(formatCompactCurrency(0)).toBe("Rp 0");
    });

    it("keeps the sign on a negative amount", () => {
      expect(formatCompactCurrency(-500_000)).toBe("Rp -500.000");
      expect(formatCompactCurrency(-1_500_000)).toBe("Rp -1,5Jt");
      expect(formatCompactCurrency(-2_000_000_000)).toBe("Rp -2,0M");
    });
  });

  describe("getInitials", () => {
    it("extracts 2-letter uppercase initials stripping titles", () => {
      expect(getInitials("dr. Andi Pratama, Sp.KJ")).toBe("AP");
      expect(getInitials("prof. Siti Rahayu")).toBe("SR");
      expect(getInitials("Budi Santoso")).toBe("BS");
    });

    it("handles single name and empty fallback", () => {
      expect(getInitials("Siti")).toBe("SI");
      expect(getInitials("")).toBe("PK");
    });
  });

  describe("formatMessageTime", () => {
    it("formats valid ISO timestamp to locale time string", () => {
      const formatted = formatMessageTime("2026-09-26T14:30:00.000Z");
      expect(formatted).not.toBe("Waktu belum tersedia");
      expect(typeof formatted).toBe("string");
    });

    it("returns fallback for invalid date strings", () => {
      expect(formatMessageTime("invalid-date")).toBe("Waktu belum tersedia");
      expect(formatMessageTime("")).toBe("Waktu belum tersedia");
    });
  });
});

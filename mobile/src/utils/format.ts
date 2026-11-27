/**
 * Format angka atau string ke mata uang Rupiah standar Indonesia
 * Contoh: formatRupiah(150000) => "Rp 150.000"
 */
export function formatRupiah(amount?: number | string | null): string {
  if (amount === undefined || amount === null) return "Rp 0";
  const parsed = typeof amount === "string" ? parseFloat(amount) : amount;
  const num = typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
  // Kept the sign. Math.abs here made a negative ledger balance render as a
  // positive one, which is the worst possible direction for money to be wrong.
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Format angka singkat (Miliar / Juta / Ribu)
 */
export function formatCompactCurrency(val?: number | null): string {
  const safe = typeof val === "number" && Number.isFinite(val) ? val : 0;
  const abs = Math.abs(safe);
  if (abs >= 1_000_000_000) {
    return `Rp ${(safe / 1_000_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(safe / 1_000_000).toFixed(1).replace(".", ",")}Jt`;
  }
  return formatRupiah(safe);
}

/**
 * Ambil inisial nama 2 karakter (membersihkan gelar dr./drg./dsb)
 * Contoh: getInitials("dr. Andi Pratama, Sp.KJ") => "AP"
 *
 * The name is optional on several DTOs, so an absent name is a real
 * input rather than a programming error. Falls back to "SP" (SeraPhany).
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "SP";
  const clean = name.replace(/^(dr\.|drg\.|prof\.|ns\.)\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Format string waktu pesan (contoh: "14.30") atau fallback jika invalid
 */
export function formatMessageTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Waktu belum tersedia"
    : date.toLocaleTimeString("id-ID");
}

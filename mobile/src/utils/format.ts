/**
 * Format angka atau string ke mata uang Rupiah standar Indonesia
 * Contoh: formatRupiah(150000) => "Rp 150.000"
 */
export function formatRupiah(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  // Kept the sign. Math.abs here made a negative ledger balance render as a
  // positive one, which is the worst possible direction for money to be wrong.
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Format angka singkat (Miliar / Juta / Ribu)
 */
export function formatCompactCurrency(val: number): string {
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    return `Rp ${(val / 1_000_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(val / 1_000_000).toFixed(1).replace(".", ",")}Jt`;
  }
  return formatRupiah(val);
}

/**
 * Ambil inisial nama 2 karakter (membersihkan gelar dr./drg./dsb)
 * Contoh: getInitials("dr. Andi Pratama, Sp.KJ") => "AP"
 *
 * The name is optional on several DTOs, so an absent name is a real
 * input rather than a programming error. Falls back to "PK".
 */
export function getInitials(name: string | undefined): string {
  if (!name) return "PK";
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

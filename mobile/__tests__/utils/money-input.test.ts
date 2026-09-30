import { parseRupiahInput, isAmountWithinBounds } from "@/utils/money-input";

/**
 * These cases are the ones that were wrong in production.
 *
 * bank-account.tsx used parseInt(withdrawAmount || "0", 10), so a user typing
 * "1e9" had parseInt stop at the "e" and the request carried amount 1. One
 * rupiah, from a billion that was typed.
 *
 * withdraw.tsx used Number(raw.replace(/\D/g, "")), so the same "1e9" became
 * "19" and the request carried 19. Two screens, two different wrong answers
 * for the same keystrokes.
 *
 * Neither rejected letters, and neither refused zero, so an empty or
 * malformed field produced a request rather than a visible error.
 */
describe("parseRupiahInput", () => {
  it("accepts a plain integer", () => {
    expect(parseRupiahInput("1200000")).toBe(1200000);
  });

  it("accepts Indonesian thousand separators", () => {
    expect(parseRupiahInput("1.200.000")).toBe(1200000);
    expect(parseRupiahInput("1 200 000")).toBe(1200000);
    expect(parseRupiahInput("1,200,000")).toBe(1200000);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseRupiahInput("  1200000  ")).toBe(1200000);
    expect(parseRupiahInput(" 1.200.000 ")).toBe(1200000);
  });

  it("rejects scientific notation instead of silently truncating it", () => {
    // parseInt("1e9", 10) === 1. The user typed a billion.
    expect(parseRupiahInput("1e9")).toBeNull();
    expect(parseRupiahInput("1E9")).toBeNull();
    expect(parseRupiahInput("2.5e6")).toBeNull();
  });

  it("rejects letters rather than parsing the leading digits", () => {
    // parseInt("12abc", 10) === 12, which is not what the user typed.
    expect(parseRupiahInput("12abc")).toBeNull();
    expect(parseRupiahInput("abc")).toBeNull();
    expect(parseRupiahInput("Rp1.200.000")).toBeNull();
  });

  it("rejects an empty or separator-only field", () => {
    expect(parseRupiahInput("")).toBeNull();
    expect(parseRupiahInput("   ")).toBeNull();
    expect(parseRupiahInput(".")).toBeNull();
  });

  it("rejects zero and negatives", () => {
    expect(parseRupiahInput("0")).toBeNull();
    expect(parseRupiahInput("-500")).toBeNull();
  });

  it("rejects a value beyond what an integer can hold exactly", () => {
    // Number("9".repeat(400)) loses precision. Refuse rather than send it.
    expect(parseRupiahInput("9".repeat(400))).toBeNull();
  });
});

describe("isAmountWithinBounds", () => {
  it("accepts a value inside the range", () => {
    expect(isAmountWithinBounds(500_000, 100_000, 5_000_000)).toBe(true);
  });

  it("accepts the exact bounds", () => {
    expect(isAmountWithinBounds(100_000, 100_000, 5_000_000)).toBe(true);
    expect(isAmountWithinBounds(5_000_000, 100_000, 5_000_000)).toBe(true);
  });

  it("rejects below the minimum and above the maximum", () => {
    expect(isAmountWithinBounds(99_999, 100_000, 5_000_000)).toBe(false);
    expect(isAmountWithinBounds(5_000_001, 100_000, 5_000_000)).toBe(false);
  });

  it("rejects a null amount", () => {
    expect(isAmountWithinBounds(null, 100_000, 5_000_000)).toBe(false);
  });
});

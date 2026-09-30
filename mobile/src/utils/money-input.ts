/**
 * One parser for money typed into a form, shared by every withdrawal screen.
 *
 * Both screens previously rolled their own and disagreed. bank-account.tsx
 * called parseInt(raw || "0", 10), which stops at the first non-digit, so
 * "1e9" parsed as 1 and the request asked the server for one rupiah.
 * withdraw.tsx called Number(raw.replace(/\D/g, "")), which deleted the "e"
 * and turned the same "1e9" into 19. Neither rejected letters, and neither
 * refused zero, so an empty field still produced a request.
 *
 * The rule here is deliberately strict: digits and grouping separators only.
 * Anything the user typed that is not a plain number is a mistake worth
 * showing them, not something to guess at.
 */

const GROUPING = /[.\s,_]/g;
const DIGITS_ONLY = /^\d+$/;

/** Above this, JavaScript integers stop being exact. */
const MAX_SAFE = Number.MAX_SAFE_INTEGER;

export function parseRupiahInput(raw: string): number | null {
  if (typeof raw !== "string") return null;

  const stripped = raw.trim().replace(GROUPING, "");
  if (!stripped || !DIGITS_ONLY.test(stripped)) return null;

  const value = Number(stripped);
  if (!Number.isSafeInteger(value) || value <= 0) return null;

  return value;
}

export function isAmountWithinBounds(
  amount: number | null,
  min: number,
  max: number,
): amount is number {
  return (
    amount !== null &&
    Number.isSafeInteger(amount) &&
    amount >= min &&
    amount <= max
  );
}

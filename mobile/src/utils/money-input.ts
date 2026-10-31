/**
 * One parser for money typed into a form.
 *
 * The rule here is deliberately strict: digits and grouping separators only.
 * Anything the user typed that is not a plain number is rejected safely.
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

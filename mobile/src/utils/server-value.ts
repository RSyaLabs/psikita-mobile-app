/**
 * Decide what to render for a value that may not have arrived yet.
 *
 * The rule that broke production data: using truthiness to mean "the server
 * has no answer". Zero, false and the empty string are all real answers.
 * Only null and undefined mean "not here yet", and an all-whitespace string
 * carries no information either.
 *
 * There is no fabricated-fallback parameter on purpose. When the server has
 * not answered, the caller gets an honest placeholder rather than an invented
 * number that looks like real revenue.
 */
export function resolveServerValue<T>(
  value: T | null | undefined,
  format: (value: T) => string,
  notAvailable = "-",
): string {
  if (value === null || value === undefined) return notAvailable;
  if (typeof value === "string" && value.trim() === "") return notAvailable;
  return format(value);
}

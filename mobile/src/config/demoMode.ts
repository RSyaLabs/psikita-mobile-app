/**
 * One gate for the whole demo and fixture layer.
 *
 * `isDemoMode` is a BLOCKING condition: `assertCapabilityLive` refuses a
 * financial write whenever it is true. That makes a broader definition the
 * safe one, so it is true when EITHER flag is set. Narrowing it to a single
 * flag would be the dangerous direction, because the unguarded flag would then
 * stop blocking writes while still switching the interceptor on.
 *
 * eas.json pins both to false in the production profile, so a release is
 * unaffected. A local .env that sets only one of the two still gets every
 * write blocked, which is the point: one stray flag must not open half of it.
 */
export function isDemoModeValue(value: string | undefined): boolean {
  return value === "true";
}

export function isDemoMode(): boolean {
  return (
    isDemoModeValue(process.env.EXPO_PUBLIC_DEMO_MODE) ||
    process.env.EXPO_PUBLIC_USE_MOCK_FALLBACK === "true"
  );
}

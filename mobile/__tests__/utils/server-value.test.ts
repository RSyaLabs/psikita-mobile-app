import { resolveServerValue } from "@/utils/server-value";

/**
 * The admin dashboard used truthiness to choose between server data and a
 * hardcoded number:
 *
 *   accountsData?.data?.[0]?.balance ? format(...) : "Rp 7,2M"
 *
 * balance 0 is a valid server answer and is falsy, so a real zero rendered the
 * invented "Rp 7,2M". The same shape hid 0 practitioners behind "89" and 0
 * patients behind "1,247". The fabricated figure appeared precisely when the
 * server was being truthful.
 *
 * There is deliberately no fabricated fallback parameter. When the server has
 * not answered, the screen says so.
 */
describe("resolveServerValue", () => {
  it("formats a value the server returned", () => {
    expect(
      resolveServerValue(750_000, (v) => `Rp ${v.toLocaleString("id-ID")}`),
    ).toBe("Rp 750.000");
  });

  it("keeps a legitimate zero instead of hiding it", () => {
    expect(resolveServerValue(0, (v) => String(v))).toBe("0");
  });

  it("shows a placeholder when the server has not answered", () => {
    expect(resolveServerValue(null, String)).toBe("-");
    expect(resolveServerValue(undefined, String)).toBe("-");
  });

  it("treats an empty string as not answered", () => {
    expect(resolveServerValue("", String)).toBe("-");
    expect(resolveServerValue("   ", String)).toBe("-");
  });

  it("keeps a negative value visible rather than losing its sign", () => {
    expect(
      resolveServerValue(-750_000, (v) => `Rp ${v.toLocaleString("id-ID")}`),
    ).toBe("Rp -750.000");
  });

  it("keeps a legitimate false and a legitimate empty-free string", () => {
    expect(resolveServerValue(false, (v) => String(v))).toBe("false");
  });
});

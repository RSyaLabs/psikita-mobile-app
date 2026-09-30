import fs from "node:fs";
import path from "node:path";

const mobileRoot = path.resolve(__dirname, "../..");

function source(relativePath: string): string {
  return fs.readFileSync(path.join(mobileRoot, relativePath), "utf8");
}

/** Reads every source file in a directory, concatenated. Used where a guard
 * used to check one file that has since been split into several. */
function sourceAll(relativeDir: string): string {
  const dir = path.join(mobileRoot, relativeDir);
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".tsx") || name.endsWith(".ts"))
    .map((name) => fs.readFileSync(path.join(dir, name), "utf8"))
    .join("\n");
}

/**
 * Source-text guards, not behavioural tests.
 *
 * These read the file and assert a string is absent. They catch a developer
 * pasting fake success copy, and nothing more. They cannot tell whether a
 * button is disabled, whether a mutation fires, or whether the payload is
 * correct, and they must not be counted as behavioural coverage.
 *
 * The former "keeps withdrawal screens gated" case lived here as a
 * toContain("getCapability") check. It passed while withdraw.tsx was sending
 * a hardcoded amount: 3240000, so it was a false signal. The real
 * behavioural coverage is __tests__/practitioner/withdraw-payload.test.tsx,
 * which renders the screen, types an amount and asserts the mutate payload.
 */
describe("unsupported action copy guards (source text, not behaviour)", () => {
  it("does not claim prescription or referral files were saved", () => {
    expect(source("app/(patient)/patient/prescription.tsx")).not.toContain(
      "Resep Digital Tersimpan",
    );
    expect(source("app/(patient)/patient/referral.tsx")).not.toContain(
      "Surat Rujukan Tersimpan",
    );
  });

  it("does not claim article sharing succeeded", () => {
    const content = source("app/(patient)/patient/article-detail.tsx");
    expect(content).not.toContain("Tautan Berhasil Disalin");
    expect(content).not.toContain("Membuka WhatsApp");
    expect(content).toContain("Share artikel belum tersedia");
  });

  it("does not simulate share, export, or upload success in practitioner modals", () => {
    const content = sourceAll("src/components/modals/practitioner");
    expect(content).not.toContain("Tautan Tersalin!");
    expect(content).not.toContain("Ekspor CSV Berhasil");
    expect(content).not.toContain('onSelectPhoto("foto_resmi');
    expect(content).not.toContain('onSelectDocs("STR_');
    expect(content).toContain("belum tersedia");
  });
});
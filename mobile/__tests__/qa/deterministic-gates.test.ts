import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");

function source(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("deterministic QA gates", () => {
  it("does not force-exit normal Jest commands", () => {
    const pkg = JSON.parse(source("package.json")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.test).not.toContain("forceExit");
    expect(pkg.scripts["test:ci"]).not.toContain("forceExit");
  });

  it("blocks accidental network access in unit tests", async () => {
    // jest.setup.ts installs the block by replacing global.fetch with a mock
    // that rejects, so the gate is asserted by exercising the real call path
    // instead of grepping the setup file for its message string.
    await expect(fetch("https://example.test/api/articles")).rejects.toThrow(
      "Network access is disabled in unit tests",
    );
  });

  it("makes live service tests explicitly opt-in", () => {
    expect(source("scripts/test-services.ts")).toContain("PSIKITA_INTEGRATION");
    expect(source("package.json")).toContain("test:integration");
  });

  it("uses the route registry and a committed OpenAPI contract audit", () => {
    expect(source("scripts/e2e-audit.ts")).toContain("import { ROUTES }");
    expect(source("scripts/contract-audit.ts")).toContain(
      "openapi-21-09-2026.json",
    );
  });
});

import fs from "fs";
import path from "path";
import { colors } from "@/theme/colors";

describe("05. SeraPhany Brand Identity, Metadata & Rule of 14px Suite", () => {
  describe("Brand Color Tokens & Visual Harmony", () => {
    it("should match official SeraPhany palette tokens exactly", () => {
      expect(colors.sera.purple.toUpperCase()).toBe("#4A3B6B");
      expect(colors.sera.cream.toUpperCase()).toBe("#F8F7EE");
      expect(colors.sera.ink.toUpperCase()).toBe("#262130");
      expect(colors.sera.muted.toUpperCase()).toBe("#4B4656");
      expect(colors.sera.line.toUpperCase()).toBe("#CFC8D8");
      expect(colors.sera.sage.toUpperCase()).toBe("#5E8159");
      expect(colors.sera.lavender.toUpperCase()).toBe("#D8C9F0");
    });

    it("should alias emerald and forest to primary purple to prevent clashing CTA buttons", () => {
      expect(colors.emerald.DEFAULT).toBe("#4A3B6B");
      expect(colors.forest.DEFAULT).toBe("#4A3B6B");
    });

    it("should provide compliant crisis and danger tokens", () => {
      expect(colors.status.danger).toBe("#CF2424");
      expect(colors.card.crisis).toBe("#FEF2F2");
    });
  });

  describe("Application Manifest & Identity (app.json)", () => {
    const appJsonPath = path.resolve(__dirname, "../app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    it("should define official app name as 'SeraPhany'", () => {
      expect(appJson.expo.name).toBe("SeraPhany");
    });

    it("should register Android package id as 'id.seraphany.app'", () => {
      expect(appJson.expo.android?.package).toBe("id.seraphany.app");
    });

    it("should set universal scheme as 'seraphany'", () => {
      expect(appJson.expo.scheme).toBe("seraphany");
    });

    it("should register @didit-protocol/sdk-react-native in config plugins", () => {
      expect(appJson.expo.plugins).toContain("@didit-protocol/sdk-react-native");
    });
  });

  describe("Rule of 14px Accessibility Enforcement (Zero text-xs in app/)", () => {
    const appDir = path.resolve(__dirname, "../app");

    function findFiles(dir: string, extensions: string[]): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findFiles(fullPath, extensions));
        } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
          results.push(fullPath);
        }
      }
      return results;
    }

    it("should enforce that no screen in mobile/app uses text-xs class", () => {
      const screenFiles = findFiles(appDir, [".tsx", ".ts"]);
      expect(screenFiles.length).toBeGreaterThan(0);

      const violations: { file: string; line: number; text: string }[] = [];

      for (const filePath of screenFiles) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");

        lines.forEach((lineText, index) => {
          // Check for text-xs as a standalone Tailwind class or within className/tw
          if (/\btext-xs\b/.test(lineText)) {
            violations.push({
              file: path.relative(appDir, filePath),
              line: index + 1,
              text: lineText.trim(),
            });
          }
        });
      }

      if (violations.length > 0) {
        const formatted = violations
          .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
          .join("\n");
        throw new Error(
          `Found ${violations.length} occurrence(s) of 'text-xs' in app screens (Rule of 14px violation):\n${formatted}`,
        );
      }

      expect(violations).toHaveLength(0);
    });
  });
});

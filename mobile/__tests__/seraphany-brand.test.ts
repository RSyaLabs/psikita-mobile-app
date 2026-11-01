import { colors } from "../src/theme/colors";
import appConfig from "../app.json";

describe("SeraPhany Brand Tokens & Visual Identity", () => {
  describe("Brand Color System", () => {
    it("should define authentic SeraPhany primary color palette", () => {
      expect(colors.sera.purple).toBe("#4A3B6B");
      expect(colors.sera.cream).toBe("#F8F7EE");
      expect(colors.sera.ink).toBe("#262130");
      expect(colors.sera.muted).toBe("#4B4656");
      expect(colors.sera.line).toBe("#CFC8D8");
    });

    it("should map legacy color aliases to SeraPhany brand purple to prevent color clashes", () => {
      expect(colors.forest.DEFAULT).toBe("#4A3B6B");
      expect(colors.forest.dark).toBe("#262130");
      expect(colors.emerald.DEFAULT).toBe("#4A3B6B");
      expect(colors.sage.DEFAULT).toBe("#F8F7EE");
    });

    it("should define standard status colors with high contrast", () => {
      expect(colors.status.danger).toBe("#CF2424");
      expect(colors.status.warning).toBe("#D97706");
      expect(colors.status.success).toBe("#4A3B6B");
    });
  });

  describe("Application Identity & Android Metadata", () => {
    it("should configure official SeraPhany app name and bundle identifiers", () => {
      const expo = appConfig.expo;
      expect(expo.name).toBe("SeraPhany");
      expect(expo.slug).toBe("seraphany-mobile");
      expect(expo.scheme).toBe("seraphany");
      expect(expo.android.package).toBe("id.seraphany.app");
    });

    it("should reference official brand icon and splash assets", () => {
      const expo = appConfig.expo;
      expect(expo.icon).toBe("./assets/icon.png");
      expect(expo.splash.image).toBe("./assets/splash.png");
      expect(expo.splash.backgroundColor.toLowerCase()).toBe("#f8f7ee");
    });
  });
});

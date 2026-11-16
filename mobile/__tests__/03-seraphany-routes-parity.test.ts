import fs from "fs";
import path from "path";
import { ROUTES } from "@/constants/routes";

describe("03. SeraPhany Route Parity & File Existence Suite", () => {
  const appRoot = path.resolve(__dirname, "../app");

  /** Helper to flatten nested ROUTES object into path list */
  function extractRoutes(routeObj: Record<string, any>): string[] {
    const list: string[] = [];
    for (const key of Object.keys(routeObj)) {
      const val = routeObj[key];
      if (typeof val === "string") {
        list.push(val);
      } else if (typeof val === "object" && val !== null) {
        list.push(...extractRoutes(val));
      }
    }
    return list;
  }

  const allRoutes = extractRoutes(ROUTES);

  it("should define nonempty canonical navigation routes", () => {
    expect(allRoutes.length).toBeGreaterThan(0);
  });

  it("should have zero duplicate routes in the contract", () => {
    const set = new Set(allRoutes);
    expect(set.size).toBe(allRoutes.length);
  });

  it("should have every route starting with /", () => {
    for (const r of allRoutes) {
      expect(r.startsWith("/")).toBe(true);
    }
  });

  it("should map every single route 1:1 to a physical screen file in app/", () => {
    const routeToFileMap: Record<string, string> = {
      [ROUTES.INDEX]: "index.tsx",
      [ROUTES.TUTORIAL]: "tutorial.tsx",
      [ROUTES.AUTH.LOGIN]: "(auth)/login.tsx",
      [ROUTES.AUTH.SIGN_IN]: "(auth)/sign-in.tsx",
      [ROUTES.AUTH.OTP]: "(auth)/otp.tsx",
      [ROUTES.AUTH.RESET_PASSWORD]: "(auth)/reset-password.tsx",
      [ROUTES.AUTH.FORGOT_PASSWORD]: "(auth)/forgot-password.tsx",
      [ROUTES.AUTH.REGISTER]: "(auth)/register.tsx",
    };

    // Patient routes map to (patient)/patient/{screen}.tsx
    for (const [key, val] of Object.entries(ROUTES.PATIENT)) {
      const screenName = val.replace("/patient/", "");
      routeToFileMap[val] = `(patient)/patient/${screenName}.tsx`;
    }

    // Practitioner routes map to (practitioner)/practitioner/{screen}.tsx
    for (const [key, val] of Object.entries(ROUTES.PRACTITIONER)) {
      const screenName = val.replace("/practitioner/", "");
      routeToFileMap[val] = `(practitioner)/practitioner/${screenName}.tsx`;
    }

    // Every declared route must resolve to a physical screen, without a fixed count.
    expect(Object.keys(routeToFileMap).sort()).toEqual([...allRoutes].sort());

    for (const [routePath, relativeFilePath] of Object.entries(routeToFileMap)) {
      const fullPath = path.join(appRoot, relativeFilePath);
      const exists = fs.existsSync(fullPath);
      if (!exists) {
        throw new Error(
          `Missing route screen file for route "${routePath}": expected at ${fullPath}`,
        );
      }
      expect(exists).toBe(true);
    }
  });

  it("should ensure all layout files exist for navigation stacks", () => {
    const layouts = [
      path.join(appRoot, "_layout.tsx"),
      path.join(appRoot, "(auth)/_layout.tsx"),
      path.join(appRoot, "(patient)/_layout.tsx"),
      path.join(appRoot, "(practitioner)/_layout.tsx"),
    ];

    for (const layoutPath of layouts) {
      expect(fs.existsSync(layoutPath)).toBe(true);
    }
  });
});

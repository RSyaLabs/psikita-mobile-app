import fs from "fs";
import path from "path";
import { ROUTES } from "../src/constants/routes";

describe("SeraPhany Navigation Routes & Screen Parity", () => {
  const appDirectory = path.resolve(__dirname, "../app");

  it("should define root index route linking to app/index.tsx", () => {
    expect(ROUTES.INDEX).toBe("/");
    expect(fs.existsSync(path.join(appDirectory, "index.tsx"))).toBe(true);
  });

  describe("Authentication Screens", () => {
    Object.entries(ROUTES.AUTH).forEach(([key, route]) => {
      it(`should verify AUTH.${key} (${route}) maps to an existing file in app/(auth)`, () => {
        expect(route.startsWith("/")).toBe(true);
        const fileName = route.slice(1) + ".tsx";
        const targetPath = path.join(appDirectory, "(auth)", fileName);
        expect(fs.existsSync(targetPath)).toBe(true);
      });
    });
  });

  describe("Patient Screens", () => {
    Object.entries(ROUTES.PATIENT).forEach(([key, route]) => {
      it(`should verify PATIENT.${key} (${route}) maps to an existing file in app/(patient)`, () => {
        expect(route.startsWith("/patient/")).toBe(true);
        const relativePath = route.slice(1) + ".tsx";
        const targetPath = path.join(appDirectory, "(patient)", relativePath);
        expect(fs.existsSync(targetPath)).toBe(true);
      });
    });
  });

  describe("Practitioner Screens", () => {
    Object.entries(ROUTES.PRACTITIONER).forEach(([key, route]) => {
      it(`should verify PRACTITIONER.${key} (${route}) maps to an existing file in app/(practitioner)`, () => {
        expect(route.startsWith("/practitioner/")).toBe(true);
        const relativePath = route.slice(1) + ".tsx";
        const targetPath = path.join(appDirectory, "(practitioner)", relativePath);
        expect(fs.existsSync(targetPath)).toBe(true);
      });
    });
  });

  it("should have zero duplicate routes across all categories", () => {
    const allRoutes = [
      ROUTES.INDEX,
      ...Object.values(ROUTES.AUTH),
      ...Object.values(ROUTES.PATIENT),
      ...Object.values(ROUTES.PRACTITIONER),
    ];
    const uniqueRoutes = new Set(allRoutes);
    expect(uniqueRoutes.size).toBe(allRoutes.length);
    expect(allRoutes.length).toBe(35); // 1 root + 3 auth + 24 patient + 7 practitioner
  });
});

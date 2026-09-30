import fs from "fs";
import path from "path";
import { ROUTES } from "@/constants/routes";
import {
  MOCK_NOTIFICATIONS,
  isNotificationActionRoute,
} from "@/api/notification.service";

const { auditRouteSource } = require("../../scripts/route-audit");

const MOBILE_ROOT = path.resolve(__dirname, "../..");
const APP_ROOT = path.join(MOBILE_ROOT, "app");

type Role = "auth" | "patient" | "practitioner" | "admin";

type RouteSpec = {
  label: string;
  value: string;
  expectedPath: string;
  file: string;
  role: Role;
};

function leafName(routeName: string) {
  return routeName.toLowerCase().replaceAll("_", "-");
}

function routeSpecsFor(role: Role): RouteSpec[] {
  const values = ROUTES[role.toUpperCase() as keyof typeof ROUTES] as Record<
    string,
    string
  >;
  const rolePath = role === "auth" ? "" : `${role}/`;
  const groupDirectory = role === "auth" ? "(auth)" : `(${role})/${role}`;

  return Object.entries(values).map(([name, value]) => {
    const leaf = leafName(name);
    return {
      label: `${role.toUpperCase()}.${name}`,
      value,
      expectedPath: `/${rolePath}${leaf}`,
      file: path.join(groupDirectory, `${leaf}.tsx`),
      role,
    };
  });
}

const routeSpecs = (
  ["auth", "patient", "practitioner", "admin"] as Role[]
).flatMap(routeSpecsFor);
const registryPaths = new Set([
  "/",
  ...routeSpecs.map((spec) => spec.expectedPath),
]);
const groupOnlyRoutePattern = /^\/\([^)]+\)/;

function publicPath(route: string) {
  const segments = route
    .split("/")
    .filter(Boolean)
    .filter((segment) => !/^\([^)]*\)$/.test(segment));
  return `/${segments.join("/")}`;
}

function appRouteFiles(directory = APP_ROOT): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return appRouteFiles(entryPath);
    }
    return entry.name.endsWith(".tsx") ? [entryPath] : [];
  });
}

function expoRouterContextKeys() {
  return appRouteFiles().map((filePath) => {
    const relativePath = path
      .relative(APP_ROOT, filePath)
      .replaceAll(path.sep, "/");
    return `./${relativePath}`;
  });
}

function codeFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return codeFiles(entryPath);
    return /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [entryPath] : [];
  });
}

const routeReferenceValues: Record<string, string> = {
  INDEX: ROUTES.INDEX,
  ...Object.fromEntries(
    Object.entries(ROUTES.AUTH).map(([name, value]) => [`AUTH.${name}`, value]),
  ),
  ...Object.fromEntries(
    Object.entries(ROUTES.PATIENT).map(([name, value]) => [
      `PATIENT.${name}`,
      value,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(ROUTES.PRACTITIONER).map(([name, value]) => [
      `PRACTITIONER.${name}`,
      value,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(ROUTES.ADMIN).map(([name, value]) => [
      `ADMIN.${name}`,
      value,
    ]),
  ),
};

const allRouteSourceFiles = [
  ...codeFiles(APP_ROOT),
  ...codeFiles(path.join(MOBILE_ROOT, "src")),
];

function flattenRouteTree(node: { route: string; children: any[] }): string[] {
  const absoluteRoute = node.route;
  if (!node.children.length) {
    return [publicPath(absoluteRoute)];
  }
  return node.children.flatMap((child: { route: string; children: any[] }) => {
    const childRoute = [absoluteRoute, child.route].filter(Boolean).join("/");
    return flattenRouteTree({ ...child, route: childRoute });
  });
}

describe("Expo Router route registry", () => {
  it("resolves every registered route to a unique public path", () => {
    const publicPaths = routeSpecs.map((spec) => publicPath(spec.value));
    const duplicates = publicPaths.filter(
      (route, index) => publicPaths.indexOf(route) !== index,
    );

    expect(duplicates).toEqual([]);
    expect(new Set(publicPaths).size).toBe(routeSpecs.length);
  });

  it("validates every route-valued notification action against the public registry", () => {
    expect(MOCK_NOTIFICATIONS.length).toBeGreaterThan(0);

    for (const notification of MOCK_NOTIFICATIONS) {
      expect(registryPaths.has(notification.actionRoute)).toBe(true);
      expect(notification.actionRoute).not.toMatch(groupOnlyRoutePattern);
      expect(isNotificationActionRoute(notification.actionRoute)).toBe(true);
    }
  });

  it("audits indirect route data throughout app and src", () => {
    const requiredSources = [
      "app/(patient)/patient/history.tsx",
      "src/components/navigation/PatientTabBar.tsx",
      "src/components/navigation/PractitionerTabBar.tsx",
      // Route values moved out of app/index.tsx when the launcher was
      // decomposed. They now live in the catalog data module, which is the
      // single place every catalog link resolves through.
      "src/data/catalog.tsx",
      "src/api/notification.service.ts",
    ];
    const issues: unknown[] = [];

    for (const filePath of allRouteSourceFiles) {
      const result = auditRouteSource({
        filePath,
        source: fs.readFileSync(filePath, "utf8"),
        registryPaths,
        routeReferenceValues,
      });
      issues.push(...result.issues);

      if (
        requiredSources.includes(
          path.relative(MOBILE_ROOT, filePath).replaceAll(path.sep, "/"),
        )
      ) {
        expect(result.routeValueCount).toBeGreaterThan(0);
      }
    }

    expect(issues).toEqual([]);
  });

  it("flags stale route values but ignores ordinary prose", () => {
    const prose = auditRouteSource({
      filePath: "fixture/prose.ts",
      source: 'const description = "Open /patient/dashboard for details";',
      registryPaths,
      routeReferenceValues,
    });
    const destinationProse = auditRouteSource({
      filePath: "fixture/destination-prose.ts",
      source:
        'const referral = { destination: "RSJ Menur Surabaya / Poli Jiwa" };',
      registryPaths,
      routeReferenceValues,
    });
    const knownRoute = auditRouteSource({
      filePath: "fixture/known-route.ts",
      source: 'const actionRoute = "/patient/dashboard";',
      registryPaths,
      routeReferenceValues,
    });
    const relativeValue = auditRouteSource({
      filePath: "fixture/relative-value.ts",
      source: 'const actionRoute = "patient/dashboard";',
      registryPaths,
      routeReferenceValues,
    });
    const stale = auditRouteSource({
      filePath: "fixture/stale.ts",
      source: 'const actionRoute = "/(patient)/dashboard";',
      registryPaths,
      routeReferenceValues,
    });

    expect(prose.issues).toEqual([]);
    expect(destinationProse.issues).toEqual([]);
    expect(destinationProse.routeValueCount).toBe(0);
    expect(knownRoute.issues).toEqual([]);
    expect(relativeValue.issues).toEqual([]);
    expect(stale.issues).toHaveLength(1);
    expect(stale.issues[0]).toMatchObject({
      kind: "route-literal",
      value: "/(patient)/dashboard",
    });
  });

  it("uses public role namespaces and has no stale group-only production paths", () => {
    for (const spec of routeSpecs) {
      expect(spec.value).not.toMatch(/^\/\([^)]+\)/);
      expect(spec.value).toBe(spec.expectedPath);
    }
  });

  it("maps every route constant to an existing Expo Router file", () => {
    const missingFiles = routeSpecs
      .filter((spec) => !fs.existsSync(path.join(APP_ROOT, spec.file)))
      .map((spec) => `${spec.label} -> ${spec.file}`);

    expect(missingFiles).toEqual([]);
  });

  it("does not retain the deleted login-form catalog or audit entry", () => {
    const routeSources = [
      path.join(MOBILE_ROOT, "src/constants/routes.ts"),
      path.join(MOBILE_ROOT, "src/api/notification.service.ts"),
      path.join(MOBILE_ROOT, "app/index.tsx"),
      path.join(MOBILE_ROOT, "scripts/e2e-audit.ts"),
    ];
    const staleSources = routeSources.filter((sourcePath) =>
      fs.readFileSync(sourcePath, "utf8").includes("login-form"),
    );
    const staleRouteFile = path.join(APP_ROOT, "(auth)/login-form.tsx");

    expect(staleSources).toEqual([]);
    expect(fs.existsSync(staleRouteFile)).toBe(false);
  });

  it("matches the actual Expo Router tree", () => {
    // This is the same SSR route-tree builder used by Expo's web export.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getExactRoutes } = require("expo-router/build/getRoutesSSR");
    const contextModule = Object.assign(
      (_key: string) => ({ default: () => null }),
      { keys: () => expoRouterContextKeys() },
    );
    const routeTree = getExactRoutes(contextModule, {
      platform: "web",
      ignoreEntryPoints: true,
      internal_stripLoadRoute: true,
      skipGenerated: true,
    });

    expect(routeTree).not.toBeNull();
    const generatedPaths = [...flattenRouteTree(routeTree!)].sort();
    const expectedGeneratedPaths = [
      "/index",
      ...routeSpecs.map((spec) => spec.expectedPath),
    ].sort();

    expect(generatedPaths).toEqual(expectedGeneratedPaths);
    expect(new Set(generatedPaths).size).toBe(generatedPaths.length);
  });
});

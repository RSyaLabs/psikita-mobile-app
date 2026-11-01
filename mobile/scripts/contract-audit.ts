import fs from "fs";
import path from "path";
import { ROUTES } from "../src/constants/routes";

const root = path.resolve(__dirname, "..");

// Point OPENAPI_PATH at ../staging-openapi.json to audit the deployed
// staging contract.
const openapiPath = process.env.OPENAPI_PATH
  ? path.resolve(root, process.env.OPENAPI_PATH)
  : path.resolve(root, "../staging-openapi.json");
const apiDir = path.join(root, "src/api");
const appDir = path.join(root, "app");

console.log("=================================================");
console.log("🔍 SERAPHANY UNIFIED CONTRACT & ROUTE AUDIT");
console.log("=================================================\n");

// ---------------------------------------------------------------------------
// 1. API Contract Audit (OpenAPI vs Services)
// ---------------------------------------------------------------------------
if (!fs.existsSync(openapiPath)) {
  console.error(`OpenAPI document not found: ${openapiPath}`);
  process.exit(1);
}

const document = JSON.parse(fs.readFileSync(openapiPath, "utf8")) as {
  paths?: Record<string, unknown>;
};
const documentedPaths = new Set(Object.keys(document.paths ?? {}));
const apiFindings: string[] = [];

function normalizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(/\$\{[^}]+\}/g, "{param}")
    .replace(/\?.*$/, "")
    .replace(/\/+/g, "/");
}

function pathMatches(endpoint: string): boolean {
  const normalized = normalizeEndpoint(endpoint);
  if (documentedPaths.has(normalized)) return true;
  return [...documentedPaths].some((documented) => {
    const actualSegments = normalized.split("/");
    const documentedSegments = documented.split("/");
    return (
      actualSegments.length === documentedSegments.length &&
      actualSegments.every(
        (segment, index) =>
          documentedSegments[index].startsWith("{") ||
          segment === documentedSegments[index],
      )
    );
  });
}

for (const fileName of fs.readdirSync(apiDir)) {
  if (!fileName.endsWith(".ts") || fileName === "client.ts") continue;
  const filePath = path.join(apiDir, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const callPattern = /apiRequest(?:<[^>]*>)?\s*\(\s*(["'`])([^"'`]+)\1/g;
  for (const match of source.matchAll(callPattern)) {
    const endpoint = match[2];
    if (!endpoint.startsWith("/")) continue;
    if (!pathMatches(endpoint)) {
      apiFindings.push(`${fileName}: undocumented endpoint ${endpoint}`);
    }
  }
}

if (apiFindings.length > 0) {
  console.error("❌ API Contract audit failed:");
  apiFindings.forEach((finding) => console.error(`  - ${finding}`));
} else {
  console.log(
    `✅ API Contract audit passed: ${documentedPaths.size} documented paths checked against services.`,
  );
}

// ---------------------------------------------------------------------------
// 2. Route Registry & File Integrity Audit (ROUTES vs app/)
// ---------------------------------------------------------------------------
const allRoutes: string[] = [
  ROUTES.INDEX,
  ...Object.values(ROUTES.AUTH),
  ...Object.values(ROUTES.PATIENT),
  ...Object.values(ROUTES.PRACTITIONER),
];

const routeFindings: string[] = [];

if (new Set(allRoutes).size !== allRoutes.length) {
  routeFindings.push("Route registry contains duplicate paths");
}

function resolveRouteFile(route: string): boolean {
  if (route === "/") {
    return fs.existsSync(path.join(appDir, "index.tsx"));
  }

  const clean = route.replace(/^\//, "");
  // Direct file: app/<route>.tsx
  if (fs.existsSync(path.join(appDir, `${clean}.tsx`))) return true;
  // Route group variants: e.g. /login -> app/(auth)/login.tsx
  const segments = clean.split("/");
  if (segments.length === 1) {
    if (fs.existsSync(path.join(appDir, `(auth)/${segments[0]}.tsx`))) return true;
  } else if (segments.length === 2) {
    // e.g. /patient/dashboard -> app/(patient)/patient/dashboard.tsx
    const group = `(${segments[0]})`;
    if (
      fs.existsSync(path.join(appDir, group, segments[0], `${segments[1]}.tsx`))
    ) {
      return true;
    }
  }

  return false;
}

for (const route of allRoutes) {
  if (!route.startsWith("/")) {
    routeFindings.push(`Non-absolute route path: "${route}"`);
    continue;
  }
  if (!resolveRouteFile(route)) {
    routeFindings.push(`Unresolved route destination: "${route}" has no matching page in app/`);
  }
}

if (routeFindings.length > 0) {
  console.error("\n❌ Route integrity audit failed:");
  routeFindings.forEach((finding) => console.error(`  - ${finding}`));
} else {
  console.log(
    `✅ Route integrity audit passed: ${allRoutes.length} navigation routes verified against app/ directory.`,
  );
}

console.log("\n=================================================");
if (apiFindings.length > 0 || routeFindings.length > 0) {
  console.error("🚨 AUDIT COMPLETED WITH FAILURES");
  process.exit(1);
} else {
  console.log("✨ ALL SYSTEM AUDITS PASSED CLEANLY");
  console.log("=================================================");
}

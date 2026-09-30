import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

// Two specs live in this repo. The default is the dated jsonapi contract;
// point OPENAPI_PATH at ../staging-openapi.json to audit the deployed
// staging contract instead.
const openapiPath = process.env.OPENAPI_PATH
  ? path.resolve(root, process.env.OPENAPI_PATH)
  : path.resolve(root, "../jsonapi/openapi-21-09-2026.json");
const apiDir = path.join(root, "src/api");

if (!fs.existsSync(openapiPath)) {
  console.error(`OpenAPI document not found: ${openapiPath}`);
  process.exit(1);
}

const document = JSON.parse(fs.readFileSync(openapiPath, "utf8")) as {
  paths?: Record<string, unknown>;
};
const documentedPaths = new Set(Object.keys(document.paths ?? {}));
const findings: string[] = [];

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
      findings.push(`${fileName}: undocumented endpoint ${endpoint}`);
    }
  }
}

if (findings.length > 0) {
  console.error("Contract audit failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log(
  `Contract audit passed: ${documentedPaths.size} documented paths checked.`,
);

const fs = require("fs");
const path = require("path");
const { auditRouteSource, parseRouteConstants } = require("./route-audit");

const rootDir = path.resolve(__dirname, "..");
const appDir = path.join(rootDir, "app");
const srcDir = path.join(rootDir, "src");
const routesSourcePath = path.join(srcDir, "constants", "routes.ts");

const routesSource = fs.readFileSync(routesSourcePath, "utf8");
const routeReferenceValues = parseRouteConstants(routesSource);
const knownRoutes = new Set(Object.values(routeReferenceValues));
const groupOnlyRoutePattern = /^\/\([^)]+\)/;

function getAllFiles(dir, extensions = [".ts", ".tsx"]) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const allAppFiles = getAllFiles(appDir);
const allSrcFiles = getAllFiles(srcDir);
const allRouteFiles = [
  ...getAllFiles(appDir, [".ts", ".tsx", ".js", ".jsx"]),
  ...getAllFiles(srcDir, [".ts", ".tsx", ".js", ".jsx"]),
];
const allFiles = [...allAppFiles, ...allSrcFiles];

console.log(`=== AUDIT QUALITY SCAN: ${allFiles.length} files ===\n`);

let issues = [];

for (const [constant, route] of Object.entries(routeReferenceValues)) {
  if (groupOnlyRoutePattern.test(route)) {
    issues.push({
      type: "INVALID_ROUTE_REGISTRY",
      file: path.relative(rootDir, routesSourcePath),
      detail: `Route constant ${constant} contains a group-only path: "${route}"`,
    });
  }
}

// Removed: ROUTE_INVENTORY_MISMATCH cross-check.
// e2e-audit.ts builds ROUTES_TO_TEST by spreading the same ROUTES constant
// this script parses, so the comparison is tautological. The old version
// regexed e2e-audit.ts for quoted route literals, found none (it uses
// ROUTES.PATIENT spreads), and flagged all 38 routes as missing.

for (const file of allRouteFiles) {
  const content = fs.readFileSync(file, "utf8");
  const result = auditRouteSource({
    filePath: file,
    source: content,
    registryPaths: knownRoutes,
    routeReferenceValues,
  });
  for (const issue of result.issues) {
    issues.push({
      type:
        issue.kind === "route-literal"
          ? "INVALID_ROUTE"
          : "INVALID_ROUTE_REFERENCE",
      file: path.relative(rootDir, file),
      detail: `${issue.kind} "${issue.value}" at line ${issue.line}`,
    });
  }
}

// 1. Audit Route Targets
for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(rootDir, file);

  // Check for raw HTML tags that break React Native
  const rawHtmlRegex =
    /<(div|span|p|button|a|h1|h2|h3|section|header|footer)\b[^>]*>/g;
  let htmlMatch;
  while ((htmlMatch = rawHtmlRegex.exec(content)) !== null) {
    // Ignore if inside comments or strings or ui component implementation
    if (
      !relPath.startsWith("src" + path.sep + "components" + path.sep + "ui")
    ) {
      issues.push({
        type: "RAW_HTML_ELEMENT",
        file: relPath,
        detail: `Found raw HTML tag <${htmlMatch[1]}> which may break on native iOS/Android`,
      });
    }
  }

  // Check for console.error or debugger
  if (content.includes("debugger;")) {
    issues.push({
      type: "DEBUGGER_STATEMENT",
      file: relPath,
      detail: "Found active debugger statement",
    });
  }
}

// 2. Check UI component buttons & pressables in screen files
for (const file of allAppFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(rootDir, file);

  // Find all <Button ...> tags
  const buttonRegex = /<Button\b([^>]*)>/g;
  let btnMatch;
  while ((btnMatch = buttonRegex.exec(content)) !== null) {
    const attrs = btnMatch[1];
    if (!attrs.includes("onPress") && !attrs.includes('type="submit"')) {
      // Check if it's a Button inside a custom component or disabled without action
      issues.push({
        type: "BUTTON_WITHOUT_ONPRESS",
        file: relPath,
        detail: `Found <Button> without onPress handler: ${btnMatch[0]}`,
      });
    }
  }

  // Find all <Pressable ...> tags
  const pressableRegex = /<Pressable\b([^>]*)>/g;
  let pressMatch;
  while ((pressMatch = pressableRegex.exec(content)) !== null) {
    const attrs = pressMatch[1];
    if (!attrs.includes("onPress")) {
      // Some pressables might be wrappers, check if needed
      issues.push({
        type: "PRESSABLE_WITHOUT_ONPRESS",
        file: relPath,
        detail: `Found <Pressable> without onPress handler: ${pressMatch[0].substring(0, 50)}...`,
      });
    }
  }
}

// Report
console.log(
  `Audited ${allAppFiles.length} screens and ${allSrcFiles.length} source components.`,
);
console.log(`Total potential issues flagged: ${issues.length}\n`);

if (issues.length > 0) {
  process.exitCode = 1;
  issues.forEach((iss, idx) => {
    console.log(`[${idx + 1}] [${iss.type}] ${iss.file}: ${iss.detail}`);
  });
} else {
  console.log(
    "✅ ZERO ISSUES DETECTED: All routes valid, all buttons have handlers, no raw HTML elements.",
  );
}

const fs = require("fs");
const path = require("path");

/**
 * Endpoint and method audit against a live OpenAPI document.
 *
 * `contract-audit.ts` checks that every documented path the client calls
 * exists. It does not check the HTTP method, so a client calling PUT against
 * an endpoint the contract only offers GET passes that audit and then fails
 * at runtime. This closes that gap.
 *
 * The method is read from the second argument of the call only. Scanning
 * forward from the call for `method:` is wrong: it bleeds into the next call
 * and reports mismatches that do not exist. This was observed, not
 * theorised — a text scan reported four false mismatches that a brace-matched
 * read shows are all correct.
 *
 * Usage:
 *   node scripts/endpoint-audit.js
 *   OPENAPI_PATH=<file> node scripts/endpoint-audit.js
 */

const apiDir = path.join(__dirname, "..", "src", "api");

function resolveSpecPath() {
  if (process.env.OPENAPI_PATH) {
    return path.resolve(__dirname, "..", process.env.OPENAPI_PATH);
  }
  // Prefer the checked-in staging contract, which the repository records as
  // identical to the deployed one. Fall back to the dated jsonapi copy.
  const candidates = [
    path.resolve(__dirname, "..", "..", "staging-openapi.json"),
    path.resolve(__dirname, "..", "..", "jsonapi", "openapi-21-09-2026.json"),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

const specPath = resolveSpecPath();
if (!specPath || !fs.existsSync(specPath)) {
  console.error("OpenAPI document not found. Set OPENAPI_PATH.");
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const paths = spec.paths ?? {};
const documentedNames = Object.keys(paths);

function findCalls(source) {
  const out = [];
  const re = /apiRequest(?:<[^>]*>)?\s*\(\s*(["'`])([^"'`]+)\1/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    let i = re.lastIndex - 1;
    let depth = 0;
    let end = -1;
    for (; i < source.length; i++) {
      const c = source[i];
      if (c === "(" || c === "{" || c === "[") depth++;
      else if (c === ")" || c === "}" || c === "]") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const args = source.slice(re.lastIndex, end < 0 ? source.length : end);
    const mm = args.match(/method\s*:\s*"([A-Z]+)"/);
    out.push({ endpoint: m[2], verb: mm ? mm[1] : "GET" });
  }
  return out;
}

function matchDocumented(endpoint) {
  const normalized = endpoint
    .replace(/\$\{[^}]+\}/g, "{param}")
    .replace(/\?.*$/, "")
    .replace(/\/+/g, "/");
  if (documentedNames.includes(normalized)) return normalized;
  const actual = normalized.split("/");
  for (const documented of documentedNames) {
    const segments = documented.split("/");
    if (segments.length !== actual.length) continue;
    let ok = true;
    for (let i = 0; i < segments.length; i++) {
      if (!segments[i].startsWith("{") && segments[i] !== actual[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return documented;
  }
  return null;
}

const rows = [];
for (const file of fs.readdirSync(apiDir)) {
  if (!file.endsWith(".service.ts")) continue;
  const source = fs.readFileSync(path.join(apiDir, file), "utf8");
  for (const call of findCalls(source)) {
    if (!call.endpoint.startsWith("/")) continue;
    rows.push({ file, ...call, documented: matchDocumented(call.endpoint) });
  }
}

const missing = [];
const wrongMethod = [];
for (const row of rows) {
  const shown = row.endpoint.replace(/\$\{[^}]+\}/g, "{p}");
  if (!row.documented) {
    missing.push(`${row.verb.padEnd(5)} ${shown}  (${row.file})`);
    continue;
  }
  const offered = Object.keys(paths[row.documented]);
  if (!offered.includes(row.verb.toLowerCase())) {
    wrongMethod.push(
      `${row.verb.padEnd(5)} ${shown}  contract offers ${offered.join(", ")}  (${row.file})`,
    );
  }
}

console.log(
  `Checked ${rows.length} client endpoints against ${documentedNames.length} documented paths in ${path.basename(specPath)}.`,
);

if (missing.length || wrongMethod.length) {
  if (missing.length) {
    console.error(
      `\n${missing.length} endpoint(s) the contract does not define:`,
    );
    missing.forEach((line) => console.error(`  ${line}`));
  }
  if (wrongMethod.length) {
    console.error(`\n${wrongMethod.length} method mismatch(es):`);
    wrongMethod.forEach((line) => console.error(`  ${line}`));
  }
  process.exit(1);
}

console.log("Endpoint and method audit passed.");

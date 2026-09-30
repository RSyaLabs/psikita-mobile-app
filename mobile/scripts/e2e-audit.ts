import http from "http";
import { ROUTES } from "../src/constants/routes";

interface RouteTestResult {
  route: string;
  statusCode: number;
  durationMs: number;
  passed: boolean;
  notes: string;
}

const ROUTES_TO_TEST = [
  ROUTES.INDEX,
  ...Object.values(ROUTES.AUTH),
  ...Object.values(ROUTES.PATIENT),
  ...Object.values(ROUTES.PRACTITIONER),
  ...Object.values(ROUTES.ADMIN),
];

// Default is the Expo web dev server (metro). Point E2E_BASE_URL at any
// other host, e.g. the staging server at
// http://staging.psikita.muammarzaki.tech:3000.
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:8081";

function testRoute(route: string): Promise<RouteTestResult> {
  const start = Date.now();
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${route}`, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const duration = Date.now() - start;
        const is200 = res.statusCode === 200;
        const hasErrorTrace =
          data.includes("While trying to resolve module") ||
          data.includes("ReferenceError") ||
          data.includes("SyntaxError");

        const passed = is200 && !hasErrorTrace;
        let notes = `Size: ${(data.length / 1024).toFixed(1)} KB`;
        if (!is200) notes = `HTTP Status ${res.statusCode}`;
        if (hasErrorTrace) notes = "Contains error trace in body";

        resolve({
          route,
          statusCode: res.statusCode || 0,
          durationMs: duration,
          passed,
          notes,
        });
      });
    });

    req.on("error", (err) => {
      const duration = Date.now() - start;
      resolve({
        route,
        statusCode: 0,
        durationMs: duration,
        passed: false,
        notes: `Network error: ${err.message}`,
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({
        route,
        statusCode: 408,
        durationMs: 15000,
        passed: false,
        notes: "Request timed out after 15s",
      });
    });
  });
}

function validateRouteRegistry() {
  if (new Set(ROUTES_TO_TEST).size !== ROUTES_TO_TEST.length) {
    throw new Error("Route registry contains duplicate paths");
  }
  if (ROUTES_TO_TEST.some((route) => !route.startsWith("/"))) {
    throw new Error("Route registry contains a non-absolute path");
  }
}

async function runE2EAudit() {
  validateRouteRegistry();
  console.log("==============================================================");
  console.log("🔬 AUDIT RINCI INTEGRASI & KESEHATAN RUTE PSIKITA MOBILE");
  console.log("==============================================================");
  console.log(`Target: ${BASE_URL} | Total Rute: ${ROUTES_TO_TEST.length}\n`);

  // Warm-up request to ensure Metro bundler is hot
  process.stdout.write("Warming up Metro bundler ... ");
  await testRoute("/");
  console.log("READY.\n");

  const results: RouteTestResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const route of ROUTES_TO_TEST) {
    process.stdout.write(`Testing ${route.padEnd(35)} ... `);
    const res = await testRoute(route);
    results.push(res);
    if (res.passed) {
      passCount++;
      console.log(`✅ PASS (${res.durationMs}ms, ${res.notes})`);
    } else {
      failCount++;
      console.log(`❌ FAIL (${res.statusCode}, ${res.notes})`);
    }
  }

  console.log(
    "\n==============================================================",
  );
  console.log(
    `📊 REKAPITULASI AUDIT: ${passCount} RUTE VALID, ${failCount} GAGAL`,
  );
  console.log("==============================================================");

  if (failCount > 0) {
    console.error("❌ ADA RUTE YANG MENGALAMI KENDALA.");
    process.exit(1);
  } else {
    console.log(
      `🎉 SELURUH ${ROUTES_TO_TEST.length} RUTE BERFUNGSI 100% TANPA BUG / SERVER CRASH!`,
    );
    process.exit(0);
  }
}

runE2EAudit();

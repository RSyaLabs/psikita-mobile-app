import fs from "fs";
import path from "path";
import ts from "typescript";
import {
  getCapability,
  type CapabilityKey,
  type CapabilityState,
} from "@/config/capabilities";
import { isDemoModeValue } from "@/config/demoMode";

type CapabilityCase = {
  key: CapabilityKey;
  production: CapabilityState;
  demo: CapabilityState;
};

type RuntimeConfig = {
  isDemoMode: () => boolean;
  getCapability: (key: CapabilityKey) => CapabilityState;
};

type CommonJsModule = {
  exports: Record<string, unknown>;
};

const capabilityCases: CapabilityCase[] = [
  { key: "patientProfile", production: "live", demo: "live" },
  { key: "triage", production: "live", demo: "live" },
  { key: "matching", production: "live", demo: "live" },
  // GET /payments answers 200 against staging, so this was switched on rather
  // than left disabled over a working backend path.
  { key: "payment", production: "live", demo: "live" },
  { key: "bpjsEligibility", production: "live", demo: "live" },
  { key: "articles", production: "unavailable", demo: "demo" },
  { key: "notifications", production: "unavailable", demo: "demo" },
  { key: "chatWrite", production: "unavailable", demo: "unavailable" },
  { key: "withdrawal", production: "unavailable", demo: "unavailable" },
  { key: "prescriptions", production: "live", demo: "live" },
  { key: "crisisEscalation", production: "unavailable", demo: "unavailable" },
];

function transpileConfigModule(filePath: string): string {
  return ts.transpileModule(fs.readFileSync(filePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
}

function evaluateConfigModule(
  filePath: string,
  localRequire: (request: string) => unknown,
): CommonJsModule {
  const module: CommonJsModule = { exports: {} };
  const executeModule = new Function(
    "exports",
    "require",
    "module",
    "process",
    "__filename",
    "__dirname",
    transpileConfigModule(filePath),
  );

  executeModule(
    module.exports,
    localRequire,
    module,
    process,
    filePath,
    path.dirname(filePath),
  );

  return module;
}

function loadRuntimeConfig(): RuntimeConfig {
  // jest-expo inlines EXPO_PUBLIC_* values during its normal transform. Transpile
  // these two config modules directly so this test exercises runtime env wiring.
  const configDir = path.resolve(__dirname, "../../src/config");
  const demoModeModule = evaluateConfigModule(
    path.join(configDir, "demoMode.ts"),
    (request) => {
      throw new Error(`Unexpected demoMode import: ${request}`);
    },
  );
  // The guard throws the shared ApiError so it and the request layer raise the
  // same class. api/response imports only zod and nothing local, so it is
  // transpiled here with that one allowance. Any local import it ever gains
  // would fail the test rather than be silently accepted.
  const responseModule = evaluateConfigModule(
    path.resolve(__dirname, "../../src/api/response.ts"),
    (request) => {
      if (request === "zod") return require("zod");
      throw new Error(`api/response must not import ${request}`);
    },
  );
  const capabilitiesModule = evaluateConfigModule(
    path.join(configDir, "capabilities.ts"),
    (request) => {
      if (request === "./demoMode") return demoModeModule.exports;
      if (request === "../api/response") return responseModule.exports;
      throw new Error(`Unexpected capabilities import: ${request}`);
    },
  );

  return {
    isDemoMode: demoModeModule.exports
      .isDemoMode as RuntimeConfig["isDemoMode"],
    getCapability: capabilitiesModule.exports
      .getCapability as RuntimeConfig["getCapability"],
  };
}

function restoreDemoMode(value: string | undefined): void {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, "EXPO_PUBLIC_DEMO_MODE");
  } else {
    Reflect.set(process.env, "EXPO_PUBLIC_DEMO_MODE", value);
  }
}

describe("capability registry", () => {
  it("reads the current demo environment through public no-argument APIs", () => {
    const runtimeConfig = loadRuntimeConfig();
    const originalDemoMode = Reflect.get(
      process.env,
      "EXPO_PUBLIC_DEMO_MODE",
    ) as string | undefined;
    const cases = [
      {
        value: "false" as const,
        demo: false,
        articles: "unavailable" as const,
      },
      { value: "true" as const, demo: true, articles: "demo" as const },
      { value: undefined, demo: false, articles: "unavailable" as const },
    ];

    try {
      cases.forEach(({ value, demo, articles }) => {
        restoreDemoMode(value);

        expect(runtimeConfig.isDemoMode()).toBe(demo);
        expect(runtimeConfig.getCapability("articles")).toBe(articles);
      });
    } finally {
      restoreDemoMode(originalDemoMode);
    }
  });

  it("supports deterministic mode checks through the test seam", () => {
    expect(isDemoModeValue("true")).toBe(true);
    expect(isDemoModeValue("false")).toBe(false);
    expect(getCapability("articles", false)).toBe("unavailable");
    expect(getCapability("articles", true)).toBe("demo");
    expect(getCapability("patientProfile", false)).toBe("live");
  });

  it.each(capabilityCases)(
    "maps $key to $production in production and $demo in demo mode",
    ({ key, production, demo }) => {
      expect(getCapability(key, false)).toBe(production);
      expect(getCapability(key, true)).toBe(demo);
    },
  );
});

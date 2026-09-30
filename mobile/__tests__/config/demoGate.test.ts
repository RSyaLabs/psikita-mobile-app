import fs from "fs";
import path from "path";
import ts from "typescript";
import {
  DEV_FIXTURE_LOG_MARKER,
  DEV_FIXTURE_UNDOCUMENTED_PATHS,
  devFixtureFor,
  isDevFixtureUndocumented,
} from "@/config/devFixtureRouter";
import type { CapabilityKey, CapabilityState } from "@/config/capabilities";

/**
 * Why this suite exists
 * ---------------------
 * `isDemoMode` is the condition that BLOCKS a money write, so it fires when
 * EITHER EXPO_PUBLIC_DEMO_MODE or EXPO_PUBLIC_USE_MOCK_FALLBACK is the exact
 * string "true". Two claims about that change are easy to break silently:
 *
 * 1. The gate reads process.env at RUNTIME. jest-expo inlines EXPO_PUBLIC_*
 *    during its normal transform, so importing the module under test would read
 *    a value baked at transform time and prove nothing. demoMode.ts and
 *    capabilities.ts are therefore transpiled and evaluated here with the real
 *    `process`, the same harness __tests__/config/capabilities.test.ts uses.
 * 2. The one line each fixture logs is the only evidence a reviewer can audit
 *    without a device, so every served fixture must produce one greppable line
 *    and the two endpoints the contract does not define must be named in it.
 *
 * Nothing here mutates production code. The env helpers always restore both
 * flags, so the rest of the run sees the environment it started with.
 */

const DEMO_FLAG = "EXPO_PUBLIC_DEMO_MODE";
const MOCK_FLAG = "EXPO_PUBLIC_USE_MOCK_FALLBACK";
const CONTRACT_PATH = path.resolve(__dirname, "../../../staging-openapi.json");
const EAS_PATH = path.resolve(__dirname, "../../eas.json");

// ---------------------------------------------------------------------------
// Runtime env helpers
//
// Reflect, never a `process.env.EXPO_PUBLIC_X` member expression, so this file
// cannot have a value inlined into it at transform time either.
// ---------------------------------------------------------------------------

function readFlag(name: string): string | undefined {
  return Reflect.get(process.env, name) as string | undefined;
}

function writeFlag(name: string, value: string | undefined): void {
  if (value === undefined) {
    Reflect.deleteProperty(process.env, name);
  } else {
    Reflect.set(process.env, name, value);
  }
}

function withFlags<T>(
  demoMode: string | undefined,
  mockFallback: string | undefined,
  run: () => T,
): T {
  const originalDemo = readFlag(DEMO_FLAG);
  const originalMock = readFlag(MOCK_FLAG);
  writeFlag(DEMO_FLAG, demoMode);
  writeFlag(MOCK_FLAG, mockFallback);
  try {
    return run();
  } finally {
    writeFlag(DEMO_FLAG, originalDemo);
    writeFlag(MOCK_FLAG, originalMock);
  }
}

// ---------------------------------------------------------------------------
// Runtime module harness
// ---------------------------------------------------------------------------

type CommonJsModule = {
  exports: Record<string, unknown>;
};

type RuntimeConfig = {
  isDemoMode: () => boolean;
  getCapability: (key: CapabilityKey, demoMode?: boolean) => CapabilityState;
  assertCapabilityLive: (key: CapabilityKey) => void;
};

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
  const configDir = path.resolve(__dirname, "../../src/config");
  const demoModeModule = evaluateConfigModule(
    path.join(configDir, "demoMode.ts"),
    (request) => {
      throw new Error(`Unexpected demoMode import: ${request}`);
    },
  );
  // The guard throws the shared ApiError so it and the request layer raise the
  // same class. api/response imports only zod and nothing local, so it is
  // transpiled here with that one allowance.
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
    assertCapabilityLive: capabilitiesModule.exports
      .assertCapabilityLive as RuntimeConfig["assertCapabilityLive"],
  };
}

const runtime = loadRuntimeConfig();

type GuardFailure = {
  name: string;
  message: string;
  statusCode: number;
  error?: string;
};

/** Runs the guard and returns the refusal, failing the test if it allowed. */
function captureRefusal(run: () => void): GuardFailure {
  try {
    run();
  } catch (caught) {
    const failure = caught as GuardFailure;
    expect(failure.name).toBe("ApiError");
    return failure;
  }
  throw new Error(
    "assertCapabilityLive allowed the write instead of refusing it",
  );
}

/** The one marked console line a served fixture produces. */
function loggedFixtureLine(endpoint: string): string {
  const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
  try {
    devFixtureFor(endpoint, undefined, "true");
    const marked = log.mock.calls
      .map((call) => String(call[0]))
      .filter((line) => line.includes(DEV_FIXTURE_LOG_MARKER));
    expect(marked).toHaveLength(1);
    return marked[0];
  } finally {
    log.mockRestore();
  }
}

// ---------------------------------------------------------------------------

describe("the single demo gate", () => {
  it.each([
    { demoMode: "true", mockFallback: "false", expected: true },
    { demoMode: "false", mockFallback: "true", expected: true },
    { demoMode: "true", mockFallback: "true", expected: true },
    { demoMode: "false", mockFallback: "false", expected: false },
    { demoMode: "false", mockFallback: undefined, expected: false },
    { demoMode: undefined, mockFallback: "false", expected: false },
    { demoMode: undefined, mockFallback: undefined, expected: false },
  ])(
    "DEMO_MODE=$demoMode and USE_MOCK_FALLBACK=$mockFallback gives $expected",
    ({ demoMode, mockFallback, expected }) => {
      // One flag alone must be enough. Narrowing this to a single flag is the
      // dangerous direction: the other flag would keep switching the
      // interceptor on while ceasing to block the writes it guards.
      expect(withFlags(demoMode, mockFallback, runtime.isDemoMode)).toBe(
        expected,
      );
    },
  );

  it.each(["TRUE", "1", "yes", ""])(
    "stays off for the near-miss value %p in either flag",
    (value) => {
      // The gate must not widen by accident either: a value the gate ignores
      // but a human reads as "on" is how a build profile drifts into a state
      // nobody believes it is in.
      expect(withFlags(value, "false", runtime.isDemoMode)).toBe(false);
      expect(withFlags("false", value, runtime.isDemoMode)).toBe(false);
      expect(withFlags(value, value, runtime.isDemoMode)).toBe(false);
    },
  );

  it("defaults getCapability to that same gate rather than re-deriving it", () => {
    // A demo-only capability follows the environment when no override is given,
    // which is only true because the default parameter calls the gate itself.
    expect(
      withFlags("false", "true", () => runtime.getCapability("articles")),
    ).toBe("demo");
    expect(
      withFlags("true", "false", () => runtime.getCapability("articles")),
    ).toBe("demo");
    expect(
      withFlags("false", "false", () => runtime.getCapability("articles")),
    ).toBe("unavailable");
  });

  it("keeps a live capability live in every flag combination", () => {
    for (const demoMode of ["true", "false"]) {
      for (const mockFallback of ["true", "false"]) {
        expect(
          withFlags(demoMode, mockFallback, () =>
            runtime.getCapability("payment"),
          ),
        ).toBe("live");
      }
    }
  });

  it("still honours the explicit override, which is the test seam", () => {
    // The new default must not have swallowed the parameter: a test that needs
    // one specific mode must not have to mutate process.env to get it.
    expect(runtime.getCapability("articles", false)).toBe("unavailable");
    expect(runtime.getCapability("articles", true)).toBe("demo");
    expect(runtime.getCapability("payment", true)).toBe("live");
  });
});

describe("the guard every write path goes through", () => {
  // payment and bpjsEligibility are `live` in the registry, so nothing but the
  // demo half of the guard can refuse them. That is precisely the path a stray
  // EXPO_PUBLIC_USE_MOCK_FALLBACK would have opened.
  const moneyKeys: CapabilityKey[] = ["payment", "bpjsEligibility"];

  it.each(moneyKeys)(
    "refuses %s when only EXPO_PUBLIC_DEMO_MODE is true",
    (key) => {
      const failure = captureRefusal(() =>
        withFlags("true", "false", () => runtime.assertCapabilityLive(key)),
      );
      expect(failure.statusCode).toBe(501);
      expect(failure.error).toBe("CAPABILITY_UNAVAILABLE");
      expect(failure.message.length).toBeGreaterThan(0);
    },
  );

  it.each(moneyKeys)(
    "refuses %s when only EXPO_PUBLIC_USE_MOCK_FALLBACK is true",
    (key) => {
      const failure = captureRefusal(() =>
        withFlags("false", "true", () => runtime.assertCapabilityLive(key)),
      );
      expect(failure.statusCode).toBe(501);
      expect(failure.error).toBe("CAPABILITY_UNAVAILABLE");
      expect(failure.message.length).toBeGreaterThan(0);
    },
  );

  it.each(moneyKeys)("refuses %s when both flags are true", (key) => {
    expect(() =>
      withFlags("true", "true", () => runtime.assertCapabilityLive(key)),
    ).toThrow("belum tersedia");
  });

  it.each(moneyKeys)(
    "allows %s when both flags are off, so the guard is not simply always throwing",
    (key) => {
      expect(() =>
        withFlags("false", "false", () => runtime.assertCapabilityLive(key)),
      ).not.toThrow();
    },
  );

  it.each(moneyKeys)(
    "blocks %s because of the gate and not because the capability is switched off",
    (key) => {
      // The registry still calls it live, so the refusal below comes from
      // isDemoMode. Conflating the two would let someone "fix" a blocked
      // payment by flipping a capability instead of finding the stray flag.
      expect(withFlags("false", "true", () => runtime.getCapability(key))).toBe(
        "live",
      );
      expect(() =>
        withFlags("false", "true", () => runtime.assertCapabilityLive(key)),
      ).toThrow();
    },
  );

  it("restores both flags afterwards, so the surrounding run is unaffected", () => {
    // A gate test that leaks EXPO_PUBLIC_DEMO_MODE=true would silently disable
    // the money-write guard in every suite that runs after it.
    const originalDemo = readFlag(DEMO_FLAG);
    const originalMock = readFlag(MOCK_FLAG);

    withFlags("true", "true", runtime.isDemoMode);

    expect(readFlag(DEMO_FLAG)).toBe(originalDemo);
    expect(readFlag(MOCK_FLAG)).toBe(originalMock);
  });
});

describe("dev fixture audit trail", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("exposes the exact token a reviewer greps for", () => {
    expect(DEV_FIXTURE_LOG_MARKER).toBe("DEV-FIXTURE");
  });

  it.each(["/articles", "/articles/1", "/notifications", "/notifications/xyz"])(
    "names %s as undocumented",
    (candidate) => {
      expect(isDevFixtureUndocumented(candidate)).toBe(true);
    },
  );

  it.each(["/patient/me", "/payments", "/triage"])(
    "does not name the contracted endpoint %s",
    (candidate) => {
      expect(isDevFixtureUndocumented(candidate)).toBe(false);
    },
  );

  it("matches whole path segments only, so a lookalike is not flagged", () => {
    // A false positive in this log would weaken the exact claim it exists to
    // make: these two are not the undocumented paths.
    expect(isDevFixtureUndocumented("/articles-archive")).toBe(false);
    expect(isDevFixtureUndocumented("/notificationsx")).toBe(false);
  });

  it("lists exactly the paths the checked-in contract does not define", () => {
    // Ties the list to staging-openapi.json rather than to itself, so adding a
    // fabricated path here, or a real one, both show up.
    const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8")) as {
      paths?: Record<string, unknown>;
    };
    const contractPaths = Object.keys(contract.paths ?? {});

    expect([...DEV_FIXTURE_UNDOCUMENTED_PATHS]).toEqual([
      "/articles",
      "/notifications",
    ]);
    for (const candidate of DEV_FIXTURE_UNDOCUMENTED_PATHS) {
      expect(contractPaths).not.toContain(candidate);
    }
    // The negative anchors: the endpoints the log calls documented are in fact
    // documented, so "undocumented" means something.
    for (const contracted of ["/patient/me", "/payments", "/triage"]) {
      expect(contractPaths).toContain(contracted);
    }
  });

  it.each([
    "/articles",
    "/articles/1",
    "/notifications",
    "/patient/me",
    "/triage",
    "/payments",
  ])("logs exactly one marked line for %s", (endpoint) => {
    // A fixture with no log line is a fabricated response nobody can find in
    // an audit, which is the failure the marker was added to prevent.
    const line = loggedFixtureLine(endpoint);
    expect(line).toContain(DEV_FIXTURE_LOG_MARKER);
    expect(line).toContain(endpoint);
  });

  it.each(["/articles", "/articles/1", "/notifications"])(
    "names %s as UNDOCUMENTED in its log line",
    (endpoint) => {
      const line = loggedFixtureLine(endpoint);
      expect(line).toContain("UNDOCUMENTED");
      expect(line).toContain("staging-openapi.json");
    },
  );

  it.each(["/patient/me", "/triage", "/payments"])(
    "does not accuse %s of being undocumented",
    (endpoint) => {
      expect(loggedFixtureLine(endpoint)).not.toContain("UNDOCUMENTED");
    },
  );

  it("stays silent for an endpoint with no fixture, because nothing was invented", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    expect(devFixtureFor("/consultation", undefined, "true")).toBeUndefined();
    expect(devFixtureFor("/nothing-here", undefined, "true")).toBeUndefined();
    expect(
      devFixtureFor("/patient/me/medical-records", undefined, "true"),
    ).toBeUndefined();
    expect(log).not.toHaveBeenCalled();
  });

  it("stays silent while the flag is off, because no fixture was served", () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    expect(devFixtureFor("/articles", undefined, "false")).toBeUndefined();
    expect(log).not.toHaveBeenCalled();
  });
});

describe("release profiles in eas.json", () => {
  const eas = JSON.parse(fs.readFileSync(EAS_PATH, "utf8")) as {
    build: Record<string, { env?: Record<string, string> }>;
  };

  it("pins both flags off in production", () => {
    const env = eas.build.production?.env ?? {};
    expect(env.EXPO_PUBLIC_DEMO_MODE).toBe("false");
    expect(env.EXPO_PUBLIC_USE_MOCK_FALLBACK).toBe("false");
  });

  it("pins both flags on in the demo profile", () => {
    const env = eas.build.demo?.env ?? {};
    expect(env.EXPO_PUBLIC_DEMO_MODE).toBe("true");
    expect(env.EXPO_PUBLIC_USE_MOCK_FALLBACK).toBe("true");
  });

  it("gives no profile other than demo a way to turn either flag on", () => {
    // The gate fires on the exact string "true", so anything a release profile
    // sets that is not "false" is a profile that can block every money write
    // while looking configured. A new profile is covered by this, not just the
    // two that exist today.
    const offenders: string[] = [];

    for (const [name, profile] of Object.entries(eas.build)) {
      if (name === "demo") continue;
      const env = profile?.env ?? {};
      for (const flag of [DEMO_FLAG, MOCK_FLAG]) {
        const value = env[flag];
        if (value !== undefined && value !== "false") {
          offenders.push(`${name}.${flag}=${String(value)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

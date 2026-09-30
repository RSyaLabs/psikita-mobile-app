import {
  devFixtureFor,
  devFixturePaths,
  isDevVoidFixture,
} from "@/config/devFixtureRouter";

/**
 * `devFixtureFor` is (endpoint, body, flag). The flag is the third argument, so
 * these tests pass it explicitly rather than relying on process.env, which the
 * production call site in `apiRequest` reads implicitly.
 */
const on = (endpoint: string, body?: unknown) =>
  devFixtureFor(endpoint, body, "true");
const off = (endpoint: string) => devFixtureFor(endpoint, undefined, "false");

/**
 * These tests cover the isolation claims, because the whole safety of the
 * feature rests on them. If any of these fail, fixtures can reach an
 * environment where they must not.
 */
describe("dev fixture routing", () => {
  describe("when the flag is off", () => {
    it("returns undefined for every path it knows about", () => {
      for (const path of devFixturePaths()) {
        expect(off(path)).toBeUndefined();
      }
    });

    it("returns undefined even for a real-looking request", () => {
      expect(off("/patient/me")).toBeUndefined();
      expect(off("/practitioner")).toBeUndefined();
    });

    it("cannot be switched on by passing a body that looks like the flag", () => {
      // The old 2-argument call shape put "true" in the body slot, which meant
      // the flag was never actually set. This pins that a body can never
      // enable fixtures on its own.
      expect(devFixtureFor("/patient/me", "true")).toBeUndefined();
      expect(devFixtureFor("/patient/me", "true", undefined)).toBeUndefined();
    });
  });

  describe("when the flag is on", () => {
    it("serves a fixture for a mapped endpoint", () => {
      const value = on("/patient/me") as {
        fullName?: string;
      };
      expect(value).toBeDefined();
      expect(value.fullName).toMatch(/Contoh/i);
    });

    it("returns undefined for an endpoint with no fixture, so the real request proceeds", () => {
      // The important negative: fixtures are not a whole backend. These paths
      // have no entry in the router at all, so the request must reach the
      // network rather than be answered with invented data.
      expect(on("/consultation")).toBeUndefined();
      expect(on("/rooms/dev-room-0001/typing")).toBeUndefined();
      expect(on("/auth/otp/verify/extra")).toBeUndefined();
    });

    it("distinguishes an endpoint that must be voided from one that has no fixture", () => {
      // A void fixture means "handled locally, return nothing, do not call the
      // network". An absent fixture means "call the network". Collapsing the
      // two is how a real request gets silently swallowed.
      expect(isDevVoidFixture(on("/billing-orders"))).toBe(true);
      expect(on("/nothing-here")).toBeUndefined();
    });

    it("reads the username out of a login body so a role can be selected", () => {
      const value = on("/auth/password/login", {
        username: "admin@dev.invalid",
      }) as { accessToken?: string };
      expect(value?.accessToken).toBeTruthy();
    });

    it("matches on path and ignores a query string", () => {
      expect(on("/patient/me?refresh=1")).toBeDefined();
    });

    it("serves a single-segment patient id, because updateProfile is PUT /patient/{id}", () => {
      const value = on("/patient/dev-patient-0001") as { id?: string };
      expect(value?.id).toBe("dev-patient-0001");
    });

    it("does not match a nested path that merely starts with the same word", () => {
      // Guards against a prefix match swallowing an unrelated endpoint. A
      // single-segment suffix cannot be used as the example, because it is a
      // real patient id; a nested path is what actually proves the boundary.
      expect(on("/patient/me/medical-records")).toBeUndefined();
      expect(on("/patient/me/conditions")).toBeUndefined();
    });

    it("exposes its path list so the whole surface is reviewable in one place", () => {
      expect(devFixturePaths().length).toBeGreaterThan(0);
      expect(devFixturePaths()).toContain("/patient/me");
      expect(devFixturePaths()).toContain("/rooms/");
    });
  });

  describe("returned values", () => {
    it("gives each caller its own object, so one screen cannot corrupt another", () => {
      const first = on("/practitioner") as unknown[];
      first.push({ id: "disappointed" });
      const second = on("/practitioner") as unknown[];
      expect(second).toHaveLength(first.length - 1);
    });
  });
});

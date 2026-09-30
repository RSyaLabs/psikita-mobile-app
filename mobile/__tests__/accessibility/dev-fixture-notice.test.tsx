import fs from "node:fs";
import path from "node:path";
import React from "react";
import { render } from "@testing-library/react-native";
import { DevFixtureBanner } from "@/components/common/DevFixtureBanner";

const mobileRoot = path.resolve(__dirname, "../..");

/**
 * The notice that fixture data is not real is the only thing standing between a
 * development build and a screenshot that gets mistaken for a clinical record.
 * That is not hypothetical: this repository previously rendered three invented
 * practitioners with ICD-10 codes and a GAD-7 score, labelled as a genuine
 * history, and nothing on screen said otherwise.
 *
 * So these tests check the wiring, not the copy. A banner that exists but is
 * never mounted renders nothing, and renders nothing looks identical to a build
 * with no fixtures at all.
 */
describe("development fixture notice", () => {
  it("is mounted in the root layout, above the navigator", () => {
    // Reading the layout as text is deliberate: the property that matters is
    // where the banner sits, and a behavioural render of the whole navigator
    // would not show that any screen inherits it.
    const layout = fs.readFileSync(
      path.join(mobileRoot, "app", "_layout.tsx"),
      "utf8",
    );
    expect(layout).toContain("DevFixtureBanner");
    // It must be inside AppErrorBoundary but outside Stack, so every route is
    // covered without each screen opting in.
    const bannerAt = layout.indexOf("<DevFixtureBanner");
    const stackAt = layout.indexOf("<Stack");
    const boundaryAt = layout.indexOf("<AppErrorBoundary");
    expect(boundaryAt).toBeGreaterThanOrEqual(0);
    expect(bannerAt).toBeGreaterThan(boundaryAt);
    expect(bannerAt).toBeLessThan(stackAt);
  });

  it("renders nothing while the flag is off", () => {
    // EXPO_PUBLIC_* is inlined at build time, so the default in this suite is
    // the off state, which is what production gets.
    const { toJSON } = render(<DevFixtureBanner />);
    expect(toJSON()).toBeNull();
  });

  it("carries the label from the fixture module rather than its own copy", () => {
    // One source of truth. If the wording changes in devFixtures.ts, the banner
    // must follow; a second literal here would drift silently.
    const banner = fs.readFileSync(
      path.join(
        mobileRoot,
        "src",
        "components",
        "common",
        "DevFixtureBanner.tsx",
      ),
      "utf8",
    );
    expect(banner).toContain("DEV_FIXTURE_NOTICE");
    expect(banner).not.toMatch(/DATA CONTOH/);
  });

  it("uses theme tokens and no raw hex", () => {
    const banner = fs.readFileSync(
      path.join(
        mobileRoot,
        "src",
        "components",
        "common",
        "DevFixtureBanner.tsx",
      ),
      "utf8",
    );
    expect(banner).not.toMatch(/#[0-9A-Fa-f]{3,8}\b/);
  });
});

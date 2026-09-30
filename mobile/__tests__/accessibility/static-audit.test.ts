import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderWithClient } from "../utils/test-utils";
import { Heading } from "@/components/ui";
import ArticlesScreen from "../../app/(patient)/patient/articles";

const mobileRoot = path.resolve(__dirname, "../..");

function source(relativePath: string): string {
  return fs.readFileSync(path.join(mobileRoot, relativePath), "utf8");
}

// The screen needs these two hooks to render its chrome (header, search field,
// category chips, tab bar). The list query result is irrelevant to the
// accessibility contract under test.
jest.mock("@/hooks/useApiQueries", () => ({
  useArticles: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: jest.fn(),
  }),
  usePrefetchData: () => ({ prefetchArticle: jest.fn() }),
}));

type HeadingTestProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  testID?: string;
  className?: string;
  children?: React.ReactNode;
};

// `Heading` is a memo(forwardRef(...)) component; the alias keeps the
// React.createElement overload below unambiguous under `strict`.
const HeadingComponent =
  Heading as unknown as React.FunctionComponent<HeadingTestProps>;

const HEADING_LEVELS: HeadingTestProps["level"][] = [1, 2, 3, 4, 5, 6];
const HEADING_SIZES: HeadingTestProps["size"][] = [
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

describe("static accessibility contracts", () => {
  it("keeps every heading level exposed as a header, whatever the visual size", () => {
    const view = renderWithClient(
      React.createElement(
        React.Fragment,
        null,
        ...HEADING_LEVELS.map((level, index) =>
          React.createElement(
            HeadingComponent,
            { level, size: HEADING_SIZES[index], testID: `heading-${level}` },
            `Bagian ${level}`,
          ),
        ),
      ),
    );

    // `size` is a visual variant only: changing it must not strip the heading
    // semantics a screen reader depends on.
    expect(view.getAllByRole("header")).toHaveLength(HEADING_LEVELS.length);
    for (const level of HEADING_LEVELS) {
      expect(view.getByTestId(`heading-${level}`).props.accessibilityRole).toBe(
        "header",
      );
    }
  });

  it("keeps form required/invalid/error semantics in the Gluestack wrapper", () => {
    const content = source("src/components/ui/form-control/index.tsx");
    expect(content).toContain("isRequired");
    expect(content).toContain("isInvalid");
    expect(content).toContain('accessibilityRole="alert"');
  });

  it("respects reduced-motion preferences", () => {
    // Source assertion only. It guards the global.css contract that the
    // prefers-reduced-motion media query exists and neutralises animation and
    // transition durations. It cannot prove that any animation is disabled,
    // because nothing in this app reads the OS reduced-motion setting: there is
    // no useReducedMotion or AccessibilityInfo consumer under app/ or src/, and
    // the Reanimated entering/exiting animations in ui/modal, ui/actionsheet and
    // ui/alert-dialog are unconditional.
    expect(source("global.css")).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps the audit checks for semantic primitives and raw palette classes", () => {
    const content = source("scripts/deep-gluestack-audit.ts");
    expect(content).toContain("primitiveContractFindings");
    expect(content).toContain("NON_SEMANTIC_TAILWIND");
  });

  it("gives the article search field a programmatic name", () => {
    const view = renderWithClient(React.createElement(ArticlesScreen));
    const searchField = view.getByPlaceholderText(
      "Cari topik, gejala, atau kata kunci...",
    );

    // The programmatic name is what a screen reader announces, and that comes from
    // accessibilityLabel. The earlier version of this test asserted nativeID,
    // reasoning that React Native forwards `id` as nativeID. That was never
    // observed to be true: Gluestack's Input consumes `id` for its FormControl
    // and does not pass it through to the host TextInput, so the assertion
    // failed for a reason that had nothing to do with accessibility. Asserting
    // the announced name keeps the test strict about the thing that matters.
    expect(searchField.props.accessibilityLabel).toBe("Cari artikel");
    expect(searchField.props.name).toBe("articleSearch");
  });
});

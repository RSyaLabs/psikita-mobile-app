import React from "react";
import { renderWithClient, screen } from "../utils/test-utils";
import { DataSourceBanner } from "@/components/common";

describe("DataSourceBanner", () => {
  it("renders an accessible warning for an explicit demo source", () => {
    renderWithClient(
      <DataSourceBanner
        source="demo"
        label="Sumber data demo"
        description="Data ini bukan data pasien sebenarnya."
        testID="demo-source-banner"
      />,
    );

    const banner = screen.getByRole("alert");
    expect(banner).toBe(screen.getByTestId("demo-source-banner"));
    expect(banner.props.accessibilityLabel).toBe("Sumber data demo");
    expect(screen.getByText("Sumber data demo")).toBeTruthy();
    expect(
      screen.getByText("Data ini bukan data pasien sebenarnya."),
    ).toBeTruthy();
  });

  it("does not render for a non-demo source", () => {
    renderWithClient(
      <DataSourceBanner
        source="live"
        label="Sumber data"
        testID="source-banner"
      />,
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByTestId("source-banner")).toBeNull();
  });
});

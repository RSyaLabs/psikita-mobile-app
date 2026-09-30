import React from "react";
import { renderWithClient, screen } from "../utils/test-utils";
import {
  BackendIntegrationBadge,
  BackendIntegrationBanner,
} from "@/components/common";

describe("BackendIntegrationBadge & BackendIntegrationBanner", () => {
  it("renders BackendIntegrationBadge with default text and optional endpoint", () => {
    renderWithClient(
      <BackendIntegrationBadge
        endpoint="POST /triage/submit"
        testID="backend-badge"
      />,
    );

    expect(screen.getByTestId("backend-badge")).toBeTruthy();
    expect(
      screen.getByText("Tahap Integrasi Backend • POST /triage/submit"),
    ).toBeTruthy();
  });

  it("renders BackendIntegrationBanner with title, endpoint, and alert accessibility role", () => {
    renderWithClient(
      <BackendIntegrationBanner
        endpoint="GET /consultations/:id/rtc-session"
        title="Pratinjau Antarmuka QA"
        description="Fitur panggilan video langsung belum tersedia dari server."
        testID="backend-banner"
      />,
    );

    const banner = screen.getByRole("alert");
    expect(banner).toBe(screen.getByTestId("backend-banner"));
    expect(screen.getByText("Pratinjau Antarmuka QA")).toBeTruthy();
    expect(
      screen.getByText("GET /consultations/:id/rtc-session"),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Fitur panggilan video langsung belum tersedia dari server.",
      ),
    ).toBeTruthy();
  });
});

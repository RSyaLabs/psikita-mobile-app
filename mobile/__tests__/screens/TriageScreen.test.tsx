import React from "react";
import { screen, fireEvent } from "@testing-library/react-native";
import { renderWithClient } from "../utils/test-utils";
import TriageScreen from "../../app/(patient)/patient/triage";
import { mockRouter } from "../../jest.setup";

// The CTA no longer overrides its accessible name, so it is addressed by the
// visible label it actually shows.
const ACTION_LABEL = "Cari Psikolog";

describe("TriageScreen Integration Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus merender header triase dan banner fitur belum tersedia", () => {
    renderWithClient(<TriageScreen />);

    expect(screen.getByText("Triase Konsultasi")).toBeTruthy();
    expect(screen.getByText("Fitur belum tersedia")).toBeTruthy();
    expect(screen.getByText(/Asesmen tidak tersedia/)).toBeTruthy();
  });

  // triage.tsx never passes `isDisabled` to the CTA, so the accessible label
  // advertises an unavailable feature while the button stays active and routes
  // to matching. Assert what the screen actually does.
  it("harus membiarkan tombol aksi aktif dan meneruskan ke pencocokan psikolog", () => {
    renderWithClient(<TriageScreen />);

    // The CTA no longer carries an accessibilityLabel override, so its accessible
    // name comes from its own visible text. That is the point of the change: the
    // previous label announced "Asesmen belum tersedia" on a button that was fully
    // enabled and routed to matching, which is the opposite of what pressing it
    // does. The button is therefore addressed by its visible label.
    const actionBtn = screen.getByText(ACTION_LABEL);
    expect(actionBtn).toBeTruthy();

    fireEvent.press(actionBtn);

    expect(mockRouter.push).toHaveBeenCalledWith("/patient/matching");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  it("harus merespon tombol kembali untuk riwayat navigasi", () => {
    renderWithClient(<TriageScreen />);

    const backBtn = screen.getByText("Kembali");
    fireEvent.press(backBtn);

    expect(mockRouter.back).toHaveBeenCalled();
  });
});

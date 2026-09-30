import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithClient } from "../utils/test-utils";
import PatientDashboard from "../../app/(patient)/patient/dashboard";
import { mockRouter } from "../../jest.setup";
import { patientService } from "@/api/patient.service";

describe("PatientDashboard Screen Integration Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("merender nama pasien dari server, dan tidak mengarang nama saat profil belum datang", async () => {
    jest
      .spyOn(patientService, "getMyProfile")
      .mockResolvedValue({ fullName: "Siti Rahayu" } as never);

    const { unmount } = renderWithClient(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Halo, Siti/i)).toBeTruthy();
    });
    expect(
      screen.getByText("Cek kabarmu hari ini atau lanjutkan sesi konselingmu."),
    ).toBeTruthy();
    unmount();

    // With no profile at all the greeting must stay neutral. It used to fall
    // back to "Siti", so a patient whose profile had not loaded was greeted
    // by name, and the old assertion passed for exactly that reason.
    jest
      .spyOn(patientService, "getMyProfile")
      .mockRejectedValue(new Error("no profile"));
    renderWithClient(<PatientDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Halo")).toBeTruthy();
    });
    expect(screen.queryByText(/Halo, Siti/i)).toBeNull();
  });

  it("harus merender opsi check-in mood harian", () => {
    renderWithClient(<PatientDashboard />);

    expect(screen.getByText("Tenang")).toBeTruthy();
    expect(screen.getByText("Biasa")).toBeTruthy();
    expect(screen.getByText("Lelah")).toBeTruthy();
    expect(screen.getByText("Cemas")).toBeTruthy();
    expect(screen.getByText("Sedih")).toBeTruthy();
  });

  // dashboard.tsx keeps the pick in `selectedMood`; the only observable effect
  // of a press is the chip label weight (font-bold when selected, font-medium
  // when not). Assert the selection actually moves off the default "Tenang".
  it("harus merespons saat mood dipilih", () => {
    renderWithClient(<PatientDashboard />);

    expect(screen.getByText("Tenang").props.className).toContain("font-bold");
    expect(screen.getByText("Cemas").props.className).toContain("font-medium");
    expect(screen.getByText("Cemas").props.className).not.toContain(
      "font-bold",
    );

    fireEvent.press(screen.getByText("Cemas"));

    expect(screen.getByText("Cemas").props.className).toContain("font-bold");
    expect(screen.getByText("Cemas").props.className).not.toContain(
      "font-medium",
    );
    expect(screen.getByText("Tenang").props.className).toContain("font-medium");
    expect(screen.getByText("Tenang").props.className).not.toContain(
      "font-bold",
    );
  });

  it("harus mengarahkan pasien ke asesmen triase saat memilih konsultasi langsung", () => {
    renderWithClient(<PatientDashboard />);

    const directConsultBtn = screen.getByLabelText("Konsultasi langsung");
    fireEvent.press(directConsultBtn);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/patient/triage",
      params: { mode: "consultation" },
    });
  });

  it("harus mengarahkan pasien ke asesmen tes mandiri saat memilih tes mandiri", () => {
    renderWithClient(<PatientDashboard />);

    const selfTestBtn = screen.getByLabelText("Tes mandiri");
    fireEvent.press(selfTestBtn);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: "/patient/triage",
      params: { mode: "assessment", guest: "false" },
    });
  });
});

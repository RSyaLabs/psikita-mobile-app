import React from "react";
import { fireEvent, renderWithClient, screen } from "../utils/test-utils";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";

describe("AsyncState", () => {
  it("exposes loading as a busy progress state with a label", () => {
    renderWithClient(
      <LoadingState
        label="Memuat data"
        description="Mohon tunggu sebentar."
        testID="loading-state"
      />,
    );

    const state = screen.getByRole("progressbar");
    expect(state).toBe(screen.getByTestId("loading-state"));
    expect(state.props.accessibilityLabel).toBe("Memuat data");
    expect(state.props.accessibilityState).toEqual(
      expect.objectContaining({ busy: true }),
    );
    expect(screen.getByText("Mohon tunggu sebentar.")).toBeTruthy();
  });

  it("renders an accessible empty state", () => {
    renderWithClient(
      <EmptyState
        label="Belum ada data"
        description="Data akan muncul saat tersedia."
        testID="empty-state"
      />,
    );

    const state = screen.getByRole("summary");
    expect(state).toBe(screen.getByTestId("empty-state"));
    expect(state.props.accessibilityLabel).toBe("Belum ada data");
    expect(screen.getByText("Data akan muncul saat tersedia.")).toBeTruthy();
  });

  it("renders only a safe error label and invokes the optional retry action", () => {
    const onRetry = jest.fn();
    renderWithClient(
      <ErrorState
        errorLabel="Permintaan belum dapat diproses"
        description="Silakan coba kembali."
        onRetry={onRetry}
        retryLabel="Coba lagi"
        testID="error-state"
      />,
    );

    const state = screen.getByRole("alert");
    expect(state).toBe(screen.getByTestId("error-state"));
    expect(state.props.accessibilityLabel).toBe(
      "Permintaan belum dapat diproses",
    );
    expect(screen.getByText("Silakan coba kembali.")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Coba lagi" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("omits the retry button when no callback is provided", () => {
    renderWithClient(
      <ErrorState errorLabel="Gagal memuat" testID="error-state" />,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders unavailable as an accessible alert without retry", () => {
    renderWithClient(
      <UnavailableState
        label="Fitur belum tersedia"
        description="Fitur ini belum dapat digunakan."
        testID="unavailable-state"
      />,
    );

    const state = screen.getByRole("alert");
    expect(state).toBe(screen.getByTestId("unavailable-state"));
    expect(state.props.accessibilityLabel).toBe("Fitur belum tersedia");
    expect(screen.queryByRole("button")).toBeNull();
  });
});

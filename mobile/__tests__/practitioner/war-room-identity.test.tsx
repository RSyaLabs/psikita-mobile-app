import React from "react";
import { render } from "@testing-library/react-native";
import WarRoom from "../../app/(practitioner)/practitioner/war-room";
import { useTriageQueue } from "@/hooks/useApiQueries";

jest.mock("@/hooks/useApiQueries", () => ({
  useTriageQueue: jest.fn(),
  // WarRoom calls this on mount, so the mock has to provide it. Omitting it
  // made the component throw on render, which masked the assertion entirely.
  useClaimMatching: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
  })),
}));

jest.mock("@/utils/haptics", () => ({
  haptics: { error: jest.fn(), medium: jest.fn(), success: jest.fn() },
}));

const queueItem = (over: Record<string, unknown> = {}) => ({
  id: "triage-1",
  patientId: "patient-abc",
  assessedBy: "nurse-1",
  assessmentType: "SELF_ASSESSMENT",
  score: 7,
  hasRedFlags: false,
  level: "YELLOW",
  disposition: "PENDING",
  notes: "",
  answers: {},
  createdAt: "2026-09-26T00:00:00.000Z",
  updatedAt: "2026-09-26T00:00:00.000Z",
  ...over,
});

describe("war-room triage queue identity", () => {
  it("shows which patient each triage entry belongs to", () => {
    (useTriageQueue as jest.Mock).mockReturnValue({
      data: [queueItem()],
      isLoading: false,
      isError: false,
    });

    const { getByText } = render(<WarRoom />);

    // A practitioner acting on an emergency queue must be able to tell
    // which patient the entry is about before doing anything.
    expect(getByText(/patient-abc/)).toBeTruthy();
  });

  it("distinguishes entries when the queue holds several patients", () => {
    (useTriageQueue as jest.Mock).mockReturnValue({
      data: [
        queueItem({ id: "triage-1", patientId: "patient-abc" }),
        queueItem({ id: "triage-2", patientId: "patient-xyz", level: "RED" }),
      ],
      isLoading: false,
      isError: false,
    });

    const { getByText } = render(<WarRoom />);

    expect(getByText(/patient-abc/)).toBeTruthy();
    expect(getByText(/patient-xyz/)).toBeTruthy();
  });
});

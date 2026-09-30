import React from "react";
import { usePatientProfile } from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

/**
 * Behavioural replacement for a source-text guard.
 *
 * The previous version read profile.tsx off disk and asserted that strings such
 * as "22 th", "Anggota连带责任 since 2024", "3174051209900001" and
 * "Sertraline 50mg" were absent from the file. That passed whether or not the
 * screen could render, and it could not tell a fabricated figure from a real
 * one arriving from the API.
 *
 * This renders the screen against an API that returns nothing, then asserts on
 * what the user actually sees. A fabricated value that reappears in the JSX now
 * fails here.
 */

jest.mock("@/hooks/useApiQueries", () => ({ usePatientProfile: jest.fn() }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("@/utils/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));
jest.mock("@/components/navigation/PatientTabBar", () => ({
  PatientTabBar: () => null,
}));

const NO_DATA = { data: undefined, isLoading: false };

const REAL_DATA = {
  data: {
    patientId: "01M34MQZ30KNDH4PAKMS9R3DHH",
    fullName: "Siti Rahayu",
    medicalRecordNumber: "MRN-REAL-0001",
    status: "PENDING_MANUAL_REVIEW",
    gender: "FEMALE",
  },
  isLoading: false,
};

/** Every string the screen actually put on the page. */
function renderProfileText(profileResult: unknown): string[] {
  (usePatientProfile as jest.Mock).mockReturnValue(profileResult);
  (useAuth as jest.Mock).mockReturnValue({ signOut: jest.fn() });

  const { render } = require("@testing-library/react-native");
  const Screen = require("../../app/(patient)/patient/profile").default;
  const { toJSON } = render(<Screen />);

  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (node === null || node === undefined) return;
    if (typeof node === "string") {
      if (node.trim()) out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const children = (node as { children?: unknown }).children;
    if (children) walk(children);
  };
  walk(toJSON());
  return out;
}

const rendered = (texts: string[]) => texts.join(" \u00b7 ");

describe("patient profile renders absent data honestly", () => {
  it("shows a placeholder rather than an invented record number when the API returns nothing", () => {
    const shown = rendered(renderProfileText(NO_DATA));

    expect(shown).toContain("Belum tersedia");
    for (const fabricated of [
      "3174051209900001",
      "0000 1234 5678 90",
      "Anggota sejak 2024",
      "22 th",
    ]) {
      expect(shown).not.toContain(fabricated);
    }
  });

  it("does not render invented medication or referral claims when the API returns nothing", () => {
    const shown = rendered(renderProfileText(NO_DATA));

    for (const fabricated of [
      "Sertraline 50mg",
      "Rujukan Poli Jiwa",
      "SATU SEHAT",
      "AKTIF JKN",
      "Puskesmas Tebet",
    ]) {
      expect(shown).not.toContain(fabricated);
    }
  });

  it("shows what the server actually returned when there is data", () => {
    // The other half of "never fabricates" is "still shows real values",
    // otherwise it is satisfied by rendering nothing at all.
    const shown = rendered(renderProfileText(REAL_DATA));

    expect(shown).toContain("Siti Rahayu");
    expect(shown).toContain("MRN-REAL-0001");
    expect(shown).not.toContain("Belum tersedia");
  });
});

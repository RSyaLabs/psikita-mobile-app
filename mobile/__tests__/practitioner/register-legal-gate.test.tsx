import React from "react";
import { render } from "@testing-library/react-native";
import { RegisterStepLegal } from "@/components/practitioner/register/RegisterStepLegal";

const SUBMIT_LABEL = "Kirim permohonan verifikasi akun praktisi";

function renderStep(
  overrides: Partial<React.ComponentProps<typeof RegisterStepLegal>> = {},
) {
  const props = {
    practitionerType: "PSYCHOLOGIST" as const,
    strNumber: "",
    onChangeStrNumber: jest.fn(),
    sippNumber: "",
    onChangeSippNumber: jest.fn(),
    docsUploaded: null,
    onOpenDocsModal: jest.fn(),
    agreedToEthic: false,
    onToggleEthic: jest.fn(),
    isSubmitting: false,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
    ...overrides,
  };
  return { ...render(<RegisterStepLegal {...props} />), props };
}

describe("RegisterStepLegal submit gate", () => {
  it("blocks submit while STR is empty", () => {
    const { getByLabelText } = renderStep({
      sippNumber: "123/456/DINKES/2024",
    });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("blocks submit while SIPP is empty", () => {
    const { getByLabelText } = renderStep({ strNumber: "123456789" });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("blocks submit while STR is shorter than the schema minimum", () => {
    const { getByLabelText } = renderStep({
      strNumber: "x",
      sippNumber: "123/456/DINKES/2024",
    });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("blocks submit while SIPP is shorter than the schema minimum", () => {
    const { getByLabelText } = renderStep({ strNumber: "123456789" });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it("enables submit once both licence numbers satisfy the schema", () => {
    const { getByLabelText } = renderStep({
      strNumber: "123456789",
      sippNumber: "123/456/DINKES/2024",
    });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(false);
  });

  // CreatePractitionerDto (types/api.ts:413) carries no document or
  // attestation field, and UploadDocsModal's picker is disabled with zero
  // onSelectDocs call sites, so blocking on those would strand every user
  // on a screen they can never leave.
  it("does not strand the user on the document upload", () => {
    const { getByLabelText } = renderStep({
      strNumber: "123456789",
      sippNumber: "123/456/DINKES/2024",
      docsUploaded: null,
    });
    expect(
      getByLabelText(SUBMIT_LABEL).props.accessibilityState?.disabled,
    ).toBe(false);
  });
});

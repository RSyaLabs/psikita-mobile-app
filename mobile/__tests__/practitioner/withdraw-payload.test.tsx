import React from "react";
import { fireEvent, waitFor } from "@testing-library/react-native";
import WithdrawScreen from "../../app/(practitioner)/practitioner/withdraw";
import {
  useRequestWithdrawal,
  useLedgerJournals,
  useLedgerAccounts,
} from "@/hooks/useApiQueries";
import { getCapability } from "@/config/capabilities";

const mockMutate = jest.fn();

jest.mock("@/hooks/useApiQueries", () => ({
  useRequestWithdrawal: jest.fn(),
  useLedgerJournals: jest.fn(),
  useLedgerAccounts: jest.fn(),
}));

// The screen gates the CTA on getCapability("withdrawal") === "live".
// The audited state is "unavailable", which masks the payload bug under test.
jest.mock("@/config/capabilities", () => ({
  getCapability: jest.fn(),
}));

jest.mock("@/utils", () => {
  const actual = jest.requireActual("@/utils");
  return {
    ...actual,
    haptics: { error: jest.fn(), medium: jest.fn(), success: jest.fn() },
  };
});

describe("withdraw payload integrity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCapability as jest.Mock).mockReturnValue("live");
    (useRequestWithdrawal as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useLedgerJournals as jest.Mock).mockReturnValue({ data: { data: [] } });
    // The balance card reads the ledger account instead of a literal, so this
    // default leaves it unresolved and the screen must render its honest
    // placeholder rather than an invented figure.
    (useLedgerAccounts as jest.Mock).mockReturnValue({ data: undefined });
  });

  it("sends the amount the user typed, not a hardcoded literal", async () => {
    const { getByDisplayValue, getByLabelText } = renderScreen();

    const input = getByDisplayValue("3.240.000");
    fireEvent.changeText(input, "500000");

    fireEvent.press(getByLabelText("Tarik Rp500000 sekarang"));

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(mockMutate.mock.calls[0][0]).toEqual({
      amount: 500000,
      bank: "BCA",
    });
  });
});

function renderScreen() {
  // Imported lazily to keep the mocks above registered first.
  const { render } = require("@testing-library/react-native");
  return render(<WithdrawScreen />);
}

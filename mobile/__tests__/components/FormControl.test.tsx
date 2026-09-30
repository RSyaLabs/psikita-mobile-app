import React, { useState } from "react";
import { renderWithClient, screen, fireEvent } from "../utils/test-utils";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Input,
  InputField,
} from "@/components/ui";

function TestLoginForm() {
  const [email, setEmail] = useState("");
  const isInvalid = email.length > 0 && !email.includes("@");

  return (
    <FormControl isInvalid={isInvalid} isRequired>
      <FormControlLabel>
        <FormControlLabelText>Alamat Email Pasien</FormControlLabelText>
      </FormControlLabel>
      <Input>
        <InputField
          testID="email-input"
          placeholder="nama@email.com"
          value={email}
          onChangeText={setEmail}
        />
      </Input>
      {isInvalid && (
        <FormControlError>
          <FormControlErrorText>Format email tidak valid</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
}

describe("Gluestack <FormControl> Compound Component", () => {
  it("harus merender label formulir semantik dengan benar", () => {
    renderWithClient(<TestLoginForm />);

    expect(screen.getByText("Alamat Email Pasien")).toBeTruthy();
    expect(screen.getByPlaceholderText("nama@email.com")).toBeTruthy();
  });

  it("harus dapat menerima input teks pengguna", () => {
    renderWithClient(<TestLoginForm />);

    const input = screen.getByTestId("email-input");
    fireEvent.changeText(input, "siti@psikita.id");

    expect(input.props.value).toBe("siti@psikita.id");
    expect(screen.queryByText("Format email tidak valid")).toBeNull();
  });

  it("harus menampilkan pesan error jika state isInvalid aktif", () => {
    renderWithClient(<TestLoginForm />);

    const input = screen.getByTestId("email-input");
    fireEvent.changeText(input, "invalid-email");

    expect(screen.getByText("Format email tidak valid")).toBeTruthy();
  });
});

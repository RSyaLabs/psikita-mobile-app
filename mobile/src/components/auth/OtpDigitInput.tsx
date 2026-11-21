import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Pressable,
  Platform,
} from "react-native";
import { haptics } from "@/utils/haptics";

interface OtpDigitInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpDigitInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}: OtpDigitInputProps) {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);

  // Pad or trim value into an array of length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const handleTextChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, "");

    // Handling paste of multiple digits
    if (clean.length > 1) {
      const pasted = clean.slice(0, length);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, length - 1);
      inputRefs.current[nextFocus]?.focus();
      haptics.light();
      return;
    }

    // Single digit input
    const newDigits = [...digits];
    newDigits[index] = clean;
    const combined = newDigits.join("");
    onChange(combined);

    if (clean) {
      haptics.selection();
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        haptics.light();
      }
    }
  };

  return (
    <View className="flex-row justify-between items-center w-full my-4">
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const isFilled = Boolean(digit);

        return (
          <Pressable
            key={index}
            onPress={() => {
              if (!disabled) {
                inputRefs.current[index]?.focus();
              }
            }}
            className="flex-1 max-w-[50px] mx-1"
          >
            <View
              className={`h-14 items-center justify-center rounded-xl border bg-card transition-colors ${
                isFocused
                  ? "border-primary border-2 shadow-sm"
                  : isFilled
                  ? "border-primary/60 border-[1.5px]"
                  : "border-border border"
              }`}
            >
              <TextInput
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChangeText={(text) => handleTextChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(-1)}
                keyboardType="number-pad"
                maxLength={length} // Allow paste into any box
                editable={!disabled}
                autoFocus={autoFocus && index === 0}
                selectTextOnFocus
                textAlign="center"
                cursorColor="#4A3B6B"
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: "#262130",
                  width: "100%",
                  height: "100%",
                  padding: 0,
                  ...Platform.select({
                    web: { outlineStyle: "none" } as any,
                  }),
                }}
                accessibilityLabel={`Digit ${index + 1}`}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

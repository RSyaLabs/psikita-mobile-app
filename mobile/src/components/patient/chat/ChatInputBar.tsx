import React, { useState } from "react";
import { TextInput } from "react-native";
import { Send, Paperclip } from "lucide-react-native";
import { Box, HStack, Pressable } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface ChatInputBarProps {
  placeholder?: string;
  disabled?: boolean;
  onSendMessage: (text: string) => void;
  onAttach?: () => void;
}

export function ChatInputBar({
  placeholder = "Tulis pesan...",
  disabled = false,
  onSendMessage,
  onAttach,
}: ChatInputBarProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;
    haptics.selection();
    onSendMessage(trimmed);
    setInputText("");
  };

  return (
    <Box className="px-4 py-2.5 bg-card border-t border-border">
      <HStack space="xs" className="items-center">
        {onAttach && (
          <Pressable
            onPress={() => {
              haptics.light();
              onAttach();
            }}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Lampiran dokumen atau foto"
            className="w-11 h-11 items-center justify-center rounded-full border border-border bg-background active:bg-muted"
          >
            <Paperclip size={18} color="#75618E" />
          </Pressable>
        )}

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder={placeholder}
          placeholderTextColor="#75618E"
          editable={!disabled}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          accessibilityLabel="Tulis pesan"
          className="flex-1 h-[50px] bg-background border border-border rounded-full px-4 text-foreground text-base leading-normal"
        />

        <Pressable
          onPress={handleSend}
          disabled={disabled || !inputText.trim()}
          accessibilityRole="button"
          accessibilityLabel="Kirim pesan"
          className={`w-11 h-11 rounded-full items-center justify-center ${
            inputText.trim() && !disabled
              ? "bg-primary active:opacity-90"
              : "bg-muted border border-border"
          }`}
        >
          <Send
            size={18}
            color={inputText.trim() && !disabled ? "#FFFFFF" : "#75618E"}
          />
        </Pressable>
      </HStack>
    </Box>
  );
}

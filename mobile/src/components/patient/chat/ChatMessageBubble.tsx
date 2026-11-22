import React from "react";
import { Box, Text, VStack } from "@/components/ui";

export type MessageRole = "PRACTITIONER" | "PATIENT" | "SYSTEM" | "UNKNOWN";

export interface ChatMessageItem {
  id: string;
  senderRole: MessageRole;
  content: string;
  timestamp?: string;
  statusLabel?: string; // e.g. "Terkirim", "Dibaca"
}

export interface ChatMessageBubbleProps {
  message: ChatMessageItem;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.senderRole === "SYSTEM") {
    return (
      <Box className="self-center my-2 px-4 py-2 bg-muted/60 rounded-full border border-border/80">
        <Text className="text-sm text-muted-foreground text-center font-medium leading-relaxed">
          {message.content}
        </Text>
      </Box>
    );
  }

  const isPatient = message.senderRole === "PATIENT";

  return (
    <VStack
      space="xs"
      className={`max-w-[82%] my-1 ${isPatient ? "self-end items-end" : "self-start items-start"}`}
    >
      <Box
        className={`px-4 py-3 rounded-2xl border ${
          isPatient
            ? "bg-[#F3EFEA] border-[#4A3B6B]/30 rounded-br-sm"
            : "bg-card border-border rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-[15px] leading-relaxed ${
            isPatient ? "text-foreground font-medium" : "text-foreground"
          }`}
        >
          {message.content}
        </Text>
      </Box>

      {/* Timestamp or Delivery Status */}
      <Text className="text-sm text-muted-foreground font-normal px-1">
        {isPatient ? message.statusLabel || "Terkirim" : message.timestamp || ""}
      </Text>
    </VStack>
  );
}

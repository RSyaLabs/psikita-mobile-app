import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react-native";
import { Box, Text, HStack, Badge, BadgeText } from "@/components/ui";

export interface PaymentCountdownTimerProps {
  deadlineText?: string;
  initialSeconds?: number;
  onExpire?: () => void;
}

export function PaymentCountdownTimer({
  deadlineText = "22 Nov, 12:00",
  initialSeconds = 900,
  onExpire,
}: PaymentCountdownTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onExpire]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const formattedTimer = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return (
    <Box className="border border-border bg-card rounded-2xl p-3.5 flex-row items-center justify-between">
      <HStack space="xs" className="items-center flex-1 mr-2">
        <Clock size={16} color="#75618E" />
        <Text size="sm" className="text-foreground font-medium">
          Bayar sebelum {deadlineText}
        </Text>
      </HStack>
      <Badge
        variant="outline"
        className="bg-muted px-2.5 py-1 rounded-full border border-border"
      >
        <BadgeText className="text-sm font-bold text-foreground">
          Sisa [{formattedTimer}]
        </BadgeText>
      </Badge>
    </Box>
  );
}

import React from "react";
import { Calendar } from "lucide-react-native";
import {
  VStack,
  Heading,
  HStack,
  Pressable,
  Box,
  Text,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface DoctorScheduleSelectorProps {
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export function DoctorScheduleSelector({
  slots,
  selectedSlot,
  onSelectSlot,
}: DoctorScheduleSelectorProps) {
  return (
    <VStack space="xs" className="mt-4">
      <Heading size="xs" bold className="text-foreground px-1">
        Jadwal Konsultasi Tersedia
      </Heading>
      <HStack space="xs" className="flex-wrap gap-2 pt-1">
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <Pressable
              key={slot}
              accessibilityRole="button"
              accessibilityLabel={`Pilih jadwal ${slot}`}
              onPress={() => {
                haptics.light();
                onSelectSlot(slot);
              }}
              className={`flex-1 min-w-[100px] p-3 rounded-2xl border items-center justify-center ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-card border-border active:bg-muted"
              }`}
            >
              <HStack space="xs" className="items-center mb-1">
                <Calendar
                  size={12}
                  className={
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                />
                <Text
                  size="xs"
                  className={`text-[10px] ${
                    isSelected
                      ? "text-primary-foreground/80 font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  Hari Ini
                </Text>
              </HStack>
              <Text
                size="xs"
                bold
                className={
                  isSelected
                    ? "text-primary-foreground"
                    : "text-foreground"
                }
              >
                {slot}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
}

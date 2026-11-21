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
      <Heading size="sm" bold className="text-foreground px-1">
        Jadwal Konsultasi Tersedia
      </Heading>
      {slots.length === 0 ? (
        <HStack space="sm" className="bg-card rounded-xl p-4 border border-border/80 shadow-xs items-center">
          <Box className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center shrink-0">
            <Calendar size={18} color="#4A3B6B" />
          </Box>
          <Text size="sm" className="text-muted-foreground font-medium leading-relaxed flex-1">
            Praktisi siap menerima sesi konsultasi langsung saat online, atau jadwal sesi dapat dikonfirmasi saat proses matching triase klinis.
          </Text>
        </HStack>
      ) : (
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
                className={`flex-1 min-w-[100px] p-3 rounded-xl border items-center justify-center ${
                  isSelected
                    ? "bg-primary border-primary shadow-xs"
                    : "bg-card border-border/80 active:bg-muted"
                }`}
              >
                <HStack space="xs" className="items-center mb-1">
                  <Calendar
                    size={14}
                    color={isSelected ? "#FFFFFF" : "#75618E"}
                  />
                  <Text
                    size="sm"
                    className={`text-sm ${
                      isSelected
                        ? "text-primary-foreground/90 font-medium"
                        : "text-muted-foreground font-medium"
                    }`}
                  >
                    Hari Ini
                  </Text>
                </HStack>
                <Text
                  size="sm"
                  bold
                  className={
                    isSelected
                      ? "text-primary-foreground font-bold"
                      : "text-foreground font-semibold"
                  }
                >
                  {slot}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      )}
    </VStack>
  );
}

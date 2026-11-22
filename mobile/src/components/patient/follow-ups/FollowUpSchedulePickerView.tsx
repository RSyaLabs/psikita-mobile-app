import React, { useState } from "react";
import { ArrowLeft } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface DateOption {
  id: string;
  dayName: string;
  dayNumber: string;
  fullDate: string;
}

export interface FollowUpSchedulePickerViewProps {
  practitionerName?: string;
  sessionDuration?: string;
  onProceedToCheckout: (selectedDate: string, selectedTime: string) => void;
  onDismiss: () => void;
}

export function FollowUpSchedulePickerView({
  practitionerName = "Dr. Sarah Jenkins, Sp.KJ",
  sessionDuration = "50 menit",
  onProceedToCheckout,
  onDismiss,
}: FollowUpSchedulePickerViewProps) {
  const dateOptions: DateOption[] = [
    { id: "d-1", dayName: "Rab", dayNumber: "18", fullDate: "18 November 2026" },
    { id: "d-2", dayName: "Kam", dayNumber: "19", fullDate: "19 November 2026" },
    { id: "d-3", dayName: "Jum", dayNumber: "20", fullDate: "20 November 2026" },
    { id: "d-4", dayName: "Sab", dayNumber: "21", fullDate: "21 November 2026" },
    { id: "d-5", dayName: "Min", dayNumber: "22", fullDate: "22 November 2026" },
  ];

  const timeSlots = ["09.00", "10.00", "11.00", "14.00", "15.00", "19.00"];

  const [selectedDateId, setSelectedDateId] = useState<string>("d-1");
  const [selectedTime, setSelectedTime] = useState<string>("10.00");

  const selectedDateObj =
    dateOptions.find((d) => d.id === selectedDateId) || dateOptions[0];

  const handleSelectDate = (id: string) => {
    haptics.selection();
    setSelectedDateId(id);
  };

  const handleSelectTime = (time: string) => {
    haptics.selection();
    setSelectedTime(time);
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Screen 49 Header: Back to Results & Title */}
      <Box className="bg-card px-4 py-3 border-b border-border">
        <HStack space="sm" className="items-center">
          <Pressable
            onPress={() => {
              haptics.light();
              onDismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke hasil"
            className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
          >
            <ArrowLeft size={24} color="#262130" />
          </Pressable>
          <Heading size="sm" bold className="text-foreground text-lg">
            Pilih jadwal lanjutan
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 18, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Practitioner Summary Card */}
        <Box className="border border-border bg-card rounded-2xl p-4 shadow-xs">
          <HStack space="sm" className="items-center">
            <Box className="w-11 h-11 rounded-full border-[1.5px] border-dashed border-[#75618E] bg-muted items-center justify-center flex-shrink-0">
              <Text className="text-sm font-bold text-primary">
                {practitionerName.charAt(0)}
              </Text>
            </Box>
            <VStack className="flex-1">
              <Text className="text-base font-bold text-foreground">
                {practitionerName}
              </Text>
              <Text className="text-sm text-muted-foreground mt-0.5">
                Sesi lanjutan · {sessionDuration}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Section 1: PILIH TANGGAL */}
        <VStack space="xs">
          <Heading
            size="sm"
            bold
            className="text-sm uppercase tracking-wider text-muted-foreground font-bold mb-1"
          >
            PILIH TANGGAL
          </Heading>
          <HStack space="xs" className="w-full">
            {dateOptions.map((date) => {
              const isSelected = date.id === selectedDateId;
              return (
                <Pressable
                  key={date.id}
                  onPress={() => handleSelectDate(date.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${date.dayName} ${date.dayNumber}`}
                  accessibilityState={{ selected: isSelected }}
                  className={`flex-1 min-h-[64px] rounded-2xl items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-muted border-[2.5px] border-primary"
                      : "bg-card border-border active:bg-muted"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "font-bold text-primary"
                        : "font-medium text-foreground"
                    }`}
                  >
                    {date.dayName}
                  </Text>
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "font-bold text-primary"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {date.dayNumber}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* Section 2: PILIH JAM (WIB) */}
        <VStack space="xs">
          <Heading
            size="sm"
            bold
            className="text-sm uppercase tracking-wider text-muted-foreground font-bold mb-1"
          >
            PILIH JAM (WIB)
          </Heading>
          <Box className="flex-row flex-wrap gap-2.5">
            {timeSlots.map((time) => {
              const isSelected = time === selectedTime;
              return (
                <Pressable
                  key={time}
                  onPress={() => handleSelectTime(time)}
                  accessibilityRole="button"
                  accessibilityLabel={`Jam ${time} WIB`}
                  accessibilityState={{ selected: isSelected }}
                  className={`w-[31%] min-h-[52px] rounded-2xl items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-muted border-[2.5px] border-primary"
                      : "bg-card border-border active:bg-muted"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isSelected
                        ? "font-bold text-primary"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </Box>
        </VStack>

        {/* Info Callout */}
        <Box className="border border-dashed border-[#75618E] bg-[#FAF8F5] rounded-2xl p-4">
          <Text className="text-sm text-foreground leading-relaxed">
            Jadwal ditahan 30 menit setelah kamu memesan. Bayar sebelum waktu habis.
          </Text>
        </Box>

        {/* Bottom Actions */}
        <VStack space="xs" className="mt-auto pb-6">
          <Button
            onPress={() => {
              haptics.selection();
              onProceedToCheckout(selectedDateObj.fullDate, selectedTime);
            }}
            accessibilityRole="button"
            accessibilityLabel="Pesan dan Lanjut Bayar"
            className="h-12 rounded-xl bg-primary active:opacity-90"
          >
            <ButtonText className="text-base font-bold text-primary-foreground">
              Pesan & Lanjut Bayar
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => {
              haptics.light();
              onDismiss();
            }}
            accessibilityRole="button"
            accessibilityLabel="Nanti saja"
            className="min-h-[44px] items-center justify-center active:opacity-70 mt-1"
          >
            <Text className="text-sm font-semibold text-foreground">
              Nanti saja
            </Text>
          </Pressable>
        </VStack>
      </ScrollView>
    </Box>
  );
}

import React from "react";
import { Check, Calendar } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface FollowUpConfirmedViewProps {
  practitionerName?: string;
  scheduledTime?: string;
  consultationFormat?: string;
  totalPaid?: string;
  rescheduleDeadline?: string;
  onAddToCalendar?: () => void;
  onViewMySchedule: () => void;
  onBackToHome: () => void;
}

export function FollowUpConfirmedView({
  practitionerName = "Psikolog Pendamping",
  scheduledTime = "Menunggu konfirmasi jadwal",
  consultationFormat = "Konsultasi Chat",
  totalPaid = "-",
  rescheduleDeadline = "2 jam",
  onAddToCalendar,
  onViewMySchedule,
  onBackToHome,
}: FollowUpConfirmedViewProps) {
  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingTop: 40,
          paddingBottom: 36,
          gap: 20,
          minHeight: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen 50 Success Hero: Big 72x72 Checkmark */}
        <VStack space="xs" className="items-center text-center">
          <Box className="w-[72px] h-[72px] rounded-full border-[2.5px] border-primary bg-[#EBF7EE] items-center justify-center mb-2 shadow-xs">
            <Check size={36} color="#4A3B6B" strokeWidth={3} />
          </Box>
          <Heading
            size="md"
            bold
            className="text-foreground text-2xl text-center leading-snug"
          >
            Jadwal lanjutan terkonfirmasi
          </Heading>
          <Text className="text-base text-muted-foreground text-center mt-0.5">
            Pembayaran berhasil.
          </Text>
        </VStack>

        {/* Order Summary DL List Card */}
        <Box className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Psikolog</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {practitionerName}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Tanggal</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {scheduledTime}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Format</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {consultationFormat}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Total dibayar</Text>
            <Text className="text-base font-bold text-primary text-right">
              {totalPaid}
            </Text>
          </HStack>
        </Box>

        {/* Add to Calendar Action Button */}
        <Button
          variant="outline"
          onPress={() => {
            haptics.success();
            onAddToCalendar?.();
          }}
          accessibilityRole="button"
          accessibilityLabel="Tambahkan ke Kalender"
          className="h-12 rounded-xl border border-border bg-card active:bg-muted"
        >
          <ButtonIcon as={Calendar} color="#4A3B6B" className="mr-2" />
          <ButtonText className="text-base font-semibold text-foreground">
            Tambahkan ke Kalender
          </ButtonText>
        </Button>

        {/* Reschedule Notice Callout */}
        <Box className="border border-dashed border-[#75618E] bg-[#FAF8F5] rounded-2xl p-4">
          <Text className="text-sm text-foreground leading-relaxed">
            Kamu bisa mengubah jadwal sampai {rescheduleDeadline} sebelum sesi.
          </Text>
        </Box>

        {/* Bottom Actions */}
        <VStack space="xs" className="mt-auto pt-4">
          <Button
            onPress={() => {
              haptics.selection();
              onViewMySchedule();
            }}
            accessibilityRole="button"
            accessibilityLabel="Lihat Jadwalku"
            className="h-12 rounded-xl bg-primary active:opacity-90"
          >
            <ButtonText className="text-base font-bold text-primary-foreground">
              Lihat Jadwalku
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => {
              haptics.light();
              onBackToHome();
            }}
            accessibilityRole="button"
            accessibilityLabel="Ke Beranda"
            className="min-h-[44px] items-center justify-center active:opacity-70 mt-1"
          >
            <Text className="text-sm font-semibold text-foreground">
              Ke Beranda
            </Text>
          </Pressable>
        </VStack>
      </ScrollView>
    </Box>
  );
}

import React from "react";
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

export interface FollowUpRecommendationViewProps {
  practitionerName?: string;
  sessionDate?: string;
  clinicalReason?: string;
  durationLabel?: string;
  formatLabel?: string;
  validUntil?: string;
  estimatedFee?: string;
  onProceedToSchedule: () => void;
  onDismiss: () => void;
}

export function FollowUpRecommendationView({
  practitionerName = "Dr. Sarah Jenkins, Sp.KJ",
  sessionDate = "22 November 2026",
  clinicalReason = "Memerlukan evaluasi penerapan teknik relaksasi diafragma 4-7-8 secara konsisten dan pemantauan penurunan gejala kecemasan mingguan.",
  durationLabel = "50 menit",
  formatLabel = "Chat / Video",
  validUntil = "29 November 2026",
  estimatedFee = "Rp 150.000",
  onProceedToSchedule,
  onDismiss,
}: FollowUpRecommendationViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Screen 51 Header: Back to Results & Title */}
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
            Sesi lanjutan
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 18, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Recommendation Card (2.5px solid border) */}
        <Box className="border-[2.5px] border-primary bg-card rounded-2xl p-4 shadow-xs">
          <VStack space="xs">
            <Heading
              size="sm"
              bold
              className="text-sm uppercase tracking-wider text-[#75618E] font-bold"
            >
              REKOMENDASI PSIKOLOG
            </Heading>
            <Heading size="md" bold className="text-foreground text-xl">
              Satu sesi lanjutan
            </Heading>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Dari {practitionerName} setelah sesi {sessionDate}.
            </Text>
          </VStack>
        </Box>

        {/* Section: ALASAN (Clinical Rationale) */}
        <VStack space="xs">
          <Heading
            size="sm"
            bold
            className="text-sm uppercase tracking-wider text-muted-foreground font-bold mb-1"
          >
            ALASAN
          </Heading>
          <Box className="border border-dashed border-[#75618E] bg-[#FAF8F5] rounded-2xl p-4">
            <Text className="text-sm text-foreground leading-relaxed font-medium">
              {clinicalReason}
            </Text>
          </Box>
        </VStack>

        {/* Specifications DL List Card */}
        <Box className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Psikolog</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {practitionerName} (sama)
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Durasi</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {durationLabel}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Format</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {formatLabel}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Berlaku sampai</Text>
            <Text className="text-base font-semibold text-foreground text-right">
              {validUntil}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border mx-4" />

          <HStack className="items-center justify-between p-4">
            <Text className="text-sm text-muted-foreground">Biaya</Text>
            <Text className="text-base font-bold text-primary text-right">
              {estimatedFee}
            </Text>
          </HStack>
        </Box>

        {/* Server pricing notice */}
        <Box className="border border-dashed border-border bg-[#FAF8F5] rounded-2xl p-4">
          <Text className="text-sm text-foreground leading-relaxed">
            Sesi lanjutan tidak mencari psikolog baru. Biaya final dihitung server di langkah pembayaran.
          </Text>
        </Box>

        {/* Bottom Actions */}
        <VStack space="xs" className="mt-auto pb-6">
          <Button
            onPress={() => {
              haptics.selection();
              onProceedToSchedule();
            }}
            accessibilityRole="button"
            accessibilityLabel="Pilih Jadwal"
            className="h-12 rounded-xl bg-primary active:opacity-90"
          >
            <ButtonText className="text-base font-bold text-primary-foreground">
              Pilih Jadwal
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

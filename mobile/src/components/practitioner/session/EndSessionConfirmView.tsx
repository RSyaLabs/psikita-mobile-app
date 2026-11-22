import React from "react";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react-native";

export interface EndSessionConfirmViewProps {
  patientName?: string;
  elapsedDuration?: string;
  remainingDuration?: string;
  onConfirmEndAndFillResults: () => void;
  onResumeSession: () => void;
}

export function EndSessionConfirmView({
  patientName = "Siti Rahma",
  elapsedDuration = "27:50",
  remainingDuration = "32:10",
  onConfirmEndAndFillResults,
  onResumeSession,
}: EndSessionConfirmViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onResumeSession}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Akhiri sesi
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* End Prompt Card */}
        <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-2">
          <Heading size="lg" bold className="text-foreground leading-snug">
            Akhiri sesi dengan {patientName}?
          </Heading>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Setelah sesi diakhiri, kamu perlu mengirim hasil agar pasien menerimanya.
          </Text>
        </Card>

        {/* Duration Stats */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Durasi berjalan
            </Text>
            <Text size="sm" bold className="text-foreground">
              {elapsedDuration}
            </Text>
          </HStack>
          <Box className="border-t border-dashed border-border" />
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Sisa waktu
            </Text>
            <Text size="sm" bold className="text-foreground">
              {remainingDuration}
            </Text>
          </HStack>
        </Box>

        {/* Notice */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-foreground leading-relaxed">
            Pasien belum menerima hasil sampai kamu mengirimnya.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={onConfirmEndAndFillResults}
        >
          <ButtonText className="text-background font-semibold">
            Akhiri & Isi Hasil
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onResumeSession}
        >
          <ButtonText className="text-foreground font-semibold">
            Lanjutkan Sesi
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

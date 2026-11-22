import React from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Button,
  ButtonText,
} from "@/components/ui";
import { ChevronLeft, ChevronRight, MessageSquare, UserCheck, AlertCircle } from "lucide-react-native";
import { haptics } from "@/utils/haptics";

export interface ScreeningResultViewProps {
  testCode: string;
  testTitle: string;
  categoryLabel: string;
  totalScore: number;
  maxScore: number;
  dateStr?: string;
  explanation?: string;
  onBack: () => void;
  onViewFeedTopic: () => void;
  onConsultDoctor: () => void;
  onOpenCrisisHelp: () => void;
  onBackToCatalog: () => void;
}

export function ScreeningResultView({
  testCode,
  testTitle,
  categoryLabel,
  totalScore,
  maxScore,
  dateStr = "22 Nov 2026",
  explanation,
  onBack,
  onViewFeedTopic,
  onConsultDoctor,
  onOpenCrisisHelp,
  onBackToCatalog,
}: ScreeningResultViewProps) {
  const defaultExplanation =
    explanation ||
    "Skor Anda menunjukkan adanya indikasi tingkat emosional yang perlu diperhatikan. Beristirahat cukup, berbagi cerita di ruang aman, atau berkonsultasi dengan profesional dapat membantu memulihkan keseimbangan pikiran.";

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header (Screen 66 · TR3) */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar tes"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Hasil tes
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Summary Score Card */}
          <Box className="border-[2.5px] border-foreground rounded-2xl p-5 bg-card gap-2">
            <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
              {testTitle}
            </Text>
            <Heading size="2xl" bold className="text-foreground text-2xl font-bold">
              {categoryLabel}
            </Heading>
            <Text size="sm" className="text-sm text-muted-foreground">
              Skor {totalScore} dari {maxScore} · {dateStr}
            </Text>
          </Box>

          {/* Explanation Text in Plain Language */}
          <Text size="sm" className="text-base text-foreground leading-relaxed">
            {defaultExplanation}
          </Text>

          {/* Clinical Disclaimer Notice Box */}
          <Box className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-card/60">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Teks hasil dari server. Bukan diagnosis.
            </Text>
          </Box>

          {/* Section: LANGKAH BERIKUTNYA */}
          <VStack space="xs" className="gap-2.5 pt-2">
            <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
              LANGKAH BERIKUTNYA
            </Text>

            <Box className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
              {/* Option 1: Feed Topic */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Lihat diskusi terkait di Feed"
                onPress={() => {
                  haptics.light();
                  onViewFeedTopic();
                }}
                className="flex-row items-center justify-between p-4 min-h-[60px] active:bg-muted"
              >
                <VStack space="xs" className="flex-1 pr-2">
                  <Text size="sm" bold className="text-sm font-semibold text-foreground">
                    Lihat diskusi terkait di Feed
                  </Text>
                  <Text size="sm" className="text-sm text-muted-foreground">
                    Koping & Komunitas
                  </Text>
                </VStack>
                <Text size="sm" bold className="text-base font-semibold text-primary">
                  ›
                </Text>
              </Pressable>

              {/* Option 2: Consult Doctor */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bicara dengan psikolog"
                onPress={() => {
                  haptics.medium();
                  onConsultDoctor();
                }}
                className="flex-row items-center justify-between p-4 min-h-[60px] border-t border-dashed border-border active:bg-muted"
              >
                <VStack space="xs" className="flex-1 pr-2">
                  <Text size="sm" bold className="text-sm font-semibold text-foreground">
                    Bicara dengan psikolog
                  </Text>
                  <Text size="sm" className="text-sm text-muted-foreground">
                    Cari yang sesuai
                  </Text>
                </VStack>
                <Text size="sm" bold className="text-base font-semibold text-primary">
                  ›
                </Text>
              </Pressable>
            </Box>
          </VStack>

          {/* Bottom Actions */}
          <VStack space="xs" className="gap-1 pt-6 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Merasa tidak aman? Lihat bantuan segera"
              onPress={() => {
                haptics.heavy();
                onOpenCrisisHelp();
              }}
              className="min-h-[44px] items-center justify-center px-4"
            >
              <Text size="sm" bold className="text-sm font-semibold text-foreground">
                Merasa tidak aman? Lihat bantuan segera
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali ke daftar tes"
              onPress={() => {
                haptics.light();
                onBackToCatalog();
              }}
              className="min-h-[44px] items-center justify-center px-4"
            >
              <Text size="sm" bold className="text-sm font-semibold text-muted-foreground">
                Kembali ke daftar tes
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

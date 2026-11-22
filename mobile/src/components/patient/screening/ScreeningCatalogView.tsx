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
import { ChevronLeft, ChevronRight, Activity, Clock } from "lucide-react-native";
import { PsychometricInstrumentDto } from "@/api/psychometrics.service";
import { haptics } from "@/utils/haptics";

export interface ScreeningHistoryItem {
  id: string;
  code: string;
  testName: string;
  category: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface ScreeningCatalogViewProps {
  instruments?: PsychometricInstrumentDto[];
  history?: ScreeningHistoryItem[];
  onBack: () => void;
  onSelectInstrument: (instrument: PsychometricInstrumentDto) => void;
  onViewHistoryItem: (item: ScreeningHistoryItem) => void;
  onOpenCrisisHelp: () => void;
}

export const FALLBACK_INSTRUMENTS: PsychometricInstrumentDto[] = [
  {
    code: "DASS-21",
    title: "DASS-21 (Depresi, Cemas, Stres)",
    description: "Evaluasi menyeluruh terhadap tingkat depresi, kecemasan, dan stres.",
    category: "Emosional & Suasana Hati",
    totalQuestions: 21,
    estimatedMinutes: 5,
  },
  {
    code: "PHQ-9",
    title: "PHQ-9 (Skrining Depresi)",
    description: "Kuesioner klinis untuk menilai gejala depresi dalam 2 minggu terakhir.",
    category: "Depresi",
    totalQuestions: 9,
    estimatedMinutes: 3,
  },
  {
    code: "GAD-7",
    title: "GAD-7 (Skrining Kecemasan)",
    description: "Alat ukur terstandarisasi untuk mendeteksi gangguan kecemasan umum.",
    category: "Kecemasan",
    totalQuestions: 7,
    estimatedMinutes: 2,
  },
];

export const FALLBACK_HISTORY: ScreeningHistoryItem[] = [
  {
    id: "hist-1",
    code: "DASS-21",
    testName: "DASS-21 (Kecemasan)",
    category: "Kecemasan Sedang",
    score: 12,
    maxScore: 42,
    date: "18 Nov 2026",
  },
  {
    id: "hist-2",
    code: "PHQ-9",
    testName: "PHQ-9 (Depresi)",
    category: "Gejala Minimal",
    score: 3,
    maxScore: 27,
    date: "10 Nov 2026",
  },
];

export function ScreeningCatalogView({
  instruments,
  history,
  onBack,
  onSelectInstrument,
  onViewHistoryItem,
  onOpenCrisisHelp,
}: ScreeningCatalogViewProps) {
  const displayInstruments =
    instruments && instruments.length > 0 ? instruments : FALLBACK_INSTRUMENTS;
  const displayHistory = history && history.length > 0 ? history : FALLBACK_HISTORY;

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header (Screen 64 · TR1) */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Tes mandiri
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Subtitle */}
          <Text size="sm" className="text-sm text-muted-foreground leading-relaxed">
            Cek singkat untuk mengenali dirimu. Hasilnya bukan diagnosis.
          </Text>

          {/* Instruments List */}
          <VStack space="sm" className="gap-3.5">
            {displayInstruments.map((inst, index) => {
              const isFeatured = index === 0;

              return (
                <Box
                  key={inst.code}
                  className={`rounded-2xl p-4 bg-card gap-2.5 ${
                    isFeatured
                      ? "border-[2.5px] border-foreground"
                      : "border-[1.5px] border-border"
                  }`}
                >
                  <VStack space="xs" className="gap-1">
                    <Text size="sm" bold className="text-base font-bold text-foreground">
                      {inst.title}
                    </Text>
                    <Text size="sm" className="text-sm text-muted-foreground">
                      {inst.totalQuestions} pertanyaan · sekitar {inst.estimatedMinutes} menit
                    </Text>
                  </VStack>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Mulai ${inst.title}`}
                    onPress={() => {
                      haptics.medium();
                      onSelectInstrument(inst);
                    }}
                    className={`min-h-[52px] rounded-xl items-center justify-center border-[1.5px] ${
                      isFeatured
                        ? "border-foreground bg-foreground active:opacity-90"
                        : "border-border bg-card active:bg-muted"
                    }`}
                  >
                    <Text
                      size="sm"
                      bold
                      className={`text-base font-semibold ${
                        isFeatured ? "text-white" : "text-foreground"
                      }`}
                    >
                      Mulai
                    </Text>
                  </Pressable>
                </Box>
              );
            })}
          </VStack>

          {/* Riwayat (History) Section */}
          <VStack space="xs" className="gap-2.5 pt-2">
            <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
              RIWAYAT
            </Text>

            <Box className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
              {displayHistory.map((item, idx) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Riwayat ${item.testName}`}
                  onPress={() => {
                    haptics.light();
                    onViewHistoryItem(item);
                  }}
                  className={`flex-row items-center justify-between p-3.5 min-h-[60px] active:bg-muted ${
                    idx > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <VStack space="xs" className="flex-1 pr-2">
                    <Text size="sm" bold className="text-sm font-semibold text-foreground">
                      {item.testName}
                    </Text>
                    <Text size="sm" className="text-sm text-muted-foreground">
                      {item.category} · {item.date}
                    </Text>
                  </VStack>
                  <HStack className="items-center gap-1">
                    <Text size="sm" bold className="text-sm font-semibold text-primary">
                      Lihat ›
                    </Text>
                  </HStack>
                </Pressable>
              ))}
            </Box>
          </VStack>

          {/* Emergency Bottom Link */}
          <Box className="pt-4 items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Butuh bantuan segera"
              onPress={() => {
                haptics.medium();
                onOpenCrisisHelp();
              }}
              className="min-h-[44px] items-center justify-center px-4"
            >
              <Text size="sm" bold className="text-sm font-semibold text-foreground">
                Butuh bantuan segera?
              </Text>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

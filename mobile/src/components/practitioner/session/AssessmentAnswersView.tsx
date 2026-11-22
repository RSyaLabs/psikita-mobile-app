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

export interface AssessmentAnswersViewProps {
  instrumentName?: string;
  patientName?: string;
  completionTime?: string;
  totalScore?: string;
  interpretation?: string;
  onTransferToNotes: () => void;
  onBack: () => void;
}

export function AssessmentAnswersView({
  instrumentName = "GAD-7 (Kecemasan)",
  patientName = "Siti Rahma",
  completionTime = "10 menit lalu",
  totalScore = "14 / 21",
  interpretation = "Kecemasan Sedang",
  onTransferToNotes,
  onBack,
}: AssessmentAnswersViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Jawaban asesmen
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Instrument Card */}
        <Card className="border border-border rounded-2xl p-4 bg-card gap-2">
          <Box className="self-start border border-foreground rounded-full px-3 py-0.5 bg-muted">
            <Text size="sm" bold className="text-foreground">
              Selesai diisi
            </Text>
          </Box>
          <Heading size="md" bold className="text-foreground">
            {instrumentName}
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            Diisi {patientName} · {completionTime}
          </Text>
        </Card>

        {/* Jawaban Pasien */}
        <VStack space="xs">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            JAWABAN
          </Heading>
          <Box className="border border-border rounded-2xl bg-card overflow-hidden">
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                1. Merasa gugup, cemas, atau gelisah
              </Text>
              <Text size="sm" bold className="text-foreground">
                Lebih dari separuh hari
              </Text>
            </VStack>
            <Box className="border-t border-dashed border-border" />
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                2. Tidak mampu mengendalikan rasa khawatir
              </Text>
              <Text size="sm" bold className="text-foreground">
                Hampir setiap hari
              </Text>
            </VStack>
            <Box className="border-t border-dashed border-border" />
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                3. Mengkhawatirkan berbagai hal berlebihan
              </Text>
              <Text size="sm" bold className="text-foreground">
                Beberapa hari
              </Text>
            </VStack>
          </Box>
        </VStack>

        {/* Score & Interpretation */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Skor total
            </Text>
            <Text size="sm" bold className="text-foreground">
              {totalScore}
            </Text>
          </HStack>
          <Box className="border-t border-dashed border-border" />
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Interpretasi
            </Text>
            <Text size="sm" bold className="text-foreground">
              {interpretation}
            </Text>
          </HStack>
        </Box>

        {/* Disclaimer Note */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-foreground leading-relaxed">
            Skor adalah alat bantu. Penilaian klinis tetap milikmu.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Actions */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          variant="outline"
          className="h-[52px] border border-foreground rounded-xl"
          onPress={onTransferToNotes}
        >
          <ButtonText className="text-foreground font-semibold">
            Masukkan ke Catatan
          </ButtonText>
        </Button>
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={onBack}
        >
          <ButtonText className="text-background font-semibold">
            Kembali ke Sesi
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";

export interface RequestAssessmentViewProps {
  onSendAssessment: (instrumentId: string) => void;
  onCancel: () => void;
}

interface AssessmentInstrument {
  id: string;
  name: string;
  duration: string;
}

const INSTRUMENTS: AssessmentInstrument[] = [
  { id: "gad7", name: "GAD-7 (Kecemasan)", duration: "5 menit · 7 pertanyaan" },
  { id: "phq9", name: "PHQ-9 (Depresi)", duration: "5 menit · 9 pertanyaan" },
  { id: "dass21", name: "DASS-21 (Depresi, Cemas, Stres)", duration: "10 menit · 21 pertanyaan" },
];

export function RequestAssessmentView({
  onSendAssessment,
  onCancel,
}: RequestAssessmentViewProps) {
  const [selectedId, setSelectedId] = useState<string>("gad7");

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onCancel}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Minta asesmen
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" className="text-muted-foreground leading-relaxed">
          Pilih instrumen yang dikirim ke pasien lewat chat. Jawabannya muncul di sini.
        </Text>

        <VStack space="xs">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            PILIH INSTRUMEN
          </Heading>
          <VStack space="sm" className="gap-2.5">
            {INSTRUMENTS.map((inst) => {
              const isSelected = selectedId === inst.id;
              return (
                <Pressable
                  key={inst.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={inst.name}
                  onPress={() => setSelectedId(inst.id)}
                  className={`flex-row items-center p-3.5 rounded-2xl min-h-[64px] border-2 gap-3 ${
                    isSelected
                      ? "border-foreground bg-muted"
                      : "border-border bg-card"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 size={22} color="#262130" />
                  ) : (
                    <Circle size={22} color="#75618E" />
                  )}
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      {inst.name}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      {inst.duration}
                    </Text>
                  </VStack>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>

        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Instrumen klinis terstandar dikirimkan ke pasien dan hasilnya tersimpan pada rekam konsultasi.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Actions */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSendAssessment(selectedId)}
        >
          <ButtonText className="text-background font-semibold">
            Kirim ke Pasien
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onCancel}
        >
          <ButtonText className="text-foreground font-semibold">
            Batal
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

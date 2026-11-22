import React, { useState } from "react";
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
import { ChevronLeft } from "lucide-react-native";
import { PsychometricQuestionDto } from "@/api/psychometrics.service";
import { haptics } from "@/utils/haptics";

export interface ScreeningQuestionViewProps {
  testTitle: string;
  questions: PsychometricQuestionDto[];
  initialAnswers?: Record<string, number>;
  onBack: () => void;
  onSubmit: (answers: Record<string, number>) => void;
}

export const FALLBACK_QUESTIONS: PsychometricQuestionDto[] = [
  {
    id: "q-1",
    questionText: "Saya merasa sulit untuk menenangkan diri setelah merasa kesal atau tegang.",
    orderIndex: 1,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
  {
    id: "q-2",
    questionText: "Saya merasa mulut saya kering atau sering merasa haus tanpa sebab jelas.",
    orderIndex: 2,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
  {
    id: "q-3",
    questionText: "Saya sama sekali tidak dapat merasakan perasaan positif atau antusias.",
    orderIndex: 3,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
  {
    id: "q-4",
    questionText: "Saya mengalami kesulitan bernapas (misal napas cepat walau tidak beraktivitas fisik).",
    orderIndex: 4,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
  {
    id: "q-5",
    questionText: "Saya merasa sulit untuk memulai inisiatif melakukan suatu kegiatan.",
    orderIndex: 5,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
  {
    id: "q-6",
    questionText: "Saya cenderung bereaksi berlebihan terhadap situasi yang tidak terduga.",
    orderIndex: 6,
    options: [
      { value: 0, label: "Tidak pernah" },
      { value: 1, label: "Kadang-kadang" },
      { value: 2, label: "Sering" },
      { value: 3, label: "Hampir selalu" },
    ],
  },
];

export function ScreeningQuestionView({
  testTitle,
  questions,
  initialAnswers = {},
  onBack,
  onSubmit,
}: ScreeningQuestionViewProps) {
  const activeQuestions =
    questions && questions.length > 0 ? questions : FALLBACK_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);

  const currentQ = activeQuestions[currentIndex];
  const total = activeQuestions.length;
  const currentAnswer = answers[currentQ.id];
  const isAnswered = currentAnswer !== undefined;
  const isLastQuestion = currentIndex === total - 1;

  const handleSelectOption = (value: number) => {
    haptics.selection();
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));
  };

  const handleNext = () => {
    if (!isAnswered) {
      haptics.error();
      return;
    }
    haptics.medium();
    if (isLastQuestion) {
      onSubmit(answers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    haptics.light();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header (Screen 65 · TR2) */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={handlePrev}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          {testTitle}
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Segmented Progress Bar */}
          <HStack className="gap-1 w-full" aria-hidden={true}>
            {activeQuestions.map((q, idx) => (
              <Box
                key={q.id}
                className={`flex-1 h-1.5 rounded-full ${
                  idx <= currentIndex ? "bg-foreground" : "bg-[#CCCCCC]"
                }`}
              />
            ))}
          </HStack>

          {/* Question Index Badge */}
          <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
            PERTANYAAN {currentIndex + 1} DARI {total}
          </Text>

          {/* Question Prompt */}
          <Heading size="lg" bold className="text-foreground text-xl leading-relaxed">
            {currentQ.questionText}
          </Heading>

          {/* Likert Scale Options */}
          <VStack space="sm" className="gap-2.5 pt-2">
            {(currentQ.options || [
              { value: 0, label: "Tidak pernah" },
              { value: 1, label: "Kadang-kadang" },
              { value: 2, label: "Sering" },
              { value: 3, label: "Hampir selalu" },
            ]).map((opt) => {
              const isSelected = currentAnswer === opt.value;

              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={opt.label}
                  onPress={() => handleSelectOption(opt.value)}
                  className={`flex-row items-center gap-3.5 min-h-[60px] px-4 rounded-xl border ${
                    isSelected
                      ? "border-[2.5px] border-foreground bg-[#EEEEEE]"
                      : "border-[1.5px] border-border bg-card"
                  }`}
                >
                  <Box
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? "border-foreground bg-foreground"
                        : "border-muted-foreground bg-transparent"
                    }`}
                  >
                    {isSelected && <Box className="w-2 h-2 rounded-full bg-white" />}
                  </Box>
                  <Text size="sm" bold className="text-base font-semibold text-foreground flex-1">
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </VStack>

          {/* Technical Notice Box */}
          <Box className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-card/60 mt-2">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Jawaban tersimpan otomatis di perangkat. Instrumen dari server.
            </Text>
          </Box>

          {/* Navigation CTAs */}
          <HStack space="xs" className="gap-2.5 pt-6">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali ke pertanyaan sebelumnya"
              onPress={handlePrev}
              className="flex-1 min-h-[52px] rounded-xl border-[1.5px] border-border bg-card items-center justify-center"
            >
              <Text size="sm" bold className="text-base font-semibold text-foreground">
                Kembali
              </Text>
            </Pressable>

            <Button
              size="lg"
              disabled={!isAnswered}
              onPress={handleNext}
              className={`flex-1 min-h-[52px] rounded-xl ${
                isAnswered ? "bg-primary" : "bg-muted"
              }`}
            >
              <ButtonText className="text-base font-semibold text-white">
                {isLastQuestion ? "Selesai" : "Lanjut"}
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

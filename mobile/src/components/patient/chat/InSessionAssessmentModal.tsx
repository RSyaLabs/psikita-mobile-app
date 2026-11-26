import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface InSessionQuestion {
  id: string;
  question: string;
}

export interface InSessionAssessmentModalProps {
  isOpen: boolean;
  practitionerName?: string;
  questions?: InSessionQuestion[];
  onClose: () => void;
  onSubmitAnswers: (answers: Record<string, number>) => void;
}

const DEFAULT_QUESTIONS: InSessionQuestion[] = [
  {
    id: "q1",
    question: "Seberapa sering Anda merasa gugup, cemas, atau sangat gelisah belakangan ini?",
  },
  {
    id: "q2",
    question: "Seberapa sering Anda mengalami kesulitan tidur atau merasa tidur tidak nyenyak?",
  },
  {
    id: "q3",
    question: "Seberapa sering Anda merasa lelah, lesu, atau kehilangan energi untuk beraktivitas?",
  },
];

const LIKERT_OPTIONS = [
  { label: "Tidak sama sekali", value: 0 },
  { label: "Beberapa hari", value: 1 },
  { label: "Lebih dari separuh hari", value: 2 },
  { label: "Hampir setiap hari", value: 3 },
];

export function InSessionAssessmentModal({
  isOpen,
  practitionerName = "Psikolog Sesi",
  questions = DEFAULT_QUESTIONS,
  onClose,
  onSubmitAnswers,
}: InSessionAssessmentModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQ = questions[currentIndex] || questions[0];
  const selectedScore = answers[currentQ.id];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (score: number) => {
    haptics.selection();
    setAnswers((prev) => ({ ...prev, [currentQ.id]: score }));
  };

  const handleNext = () => {
    if (selectedScore === undefined) return;
    haptics.selection();
    if (isLastQuestion) {
      onSubmitAnswers(answers);
      onClose();
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    haptics.light();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent className="m-0 p-0 flex-1 bg-background max-w-[640px] md:max-w-[720px] self-center w-full">
        <ModalBody className="p-0 flex-1">
          {/* Header */}
          <Box className="px-5 pt-4 pb-3 border-b border-border bg-card">
            <HStack space="sm" className="items-center">
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
              >
                <ArrowLeft size={22} color="#262130" />
              </Pressable>
              <Heading size="md" bold className="text-foreground text-lg">
                Asesmen singkat
              </Heading>
            </HStack>
            <Text className="text-sm text-muted-foreground mt-1">
              Diminta oleh {practitionerName} · jawabanmu hanya untuk sesi ini.
            </Text>
          </Box>

          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingVertical: 20, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* 3-segment progress indicator */}
            <HStack space="xs" className="w-full">
              {questions.map((_, idx) => (
                <Box
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full ${
                    idx <= currentIndex ? "bg-primary" : "bg-[#D4C9BA]"
                  }`}
                />
              ))}
            </HStack>

            {/* Step Counter */}
            <Text className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
              PERTANYAAN {currentIndex + 1} DARI {totalQuestions}
            </Text>

            {/* Question Title */}
            <Heading size="lg" bold className="text-foreground text-xl leading-snug">
              {currentQ.question}
            </Heading>

            {/* 4 Likert Options */}
            <VStack space="sm" className="w-full mt-2">
              {LIKERT_OPTIONS.map((opt) => {
                const isSelected = selectedScore === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleSelectOption(opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    className={`min-h-[60px] px-4 py-3 rounded-2xl flex-row items-center gap-3 border ${
                      isSelected
                        ? "bg-[#F3EFEA] border-primary border-[2.5px]"
                        : "bg-card border-border border-[1.5px] active:bg-muted/50"
                    }`}
                  >
                    <Box
                      className={`w-6 h-6 rounded-full border items-center justify-center ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                    </Box>
                    <Text className="text-base font-semibold text-foreground flex-1">
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>

            {/* Clinical Privacy Notice */}
            <Box className="border border-dashed border-[#75618E] rounded-2xl p-4 bg-muted/40 mt-2">
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Jawaban dan skor akan langsung dikirim ke praktisi secara aman selama sesi berlangsung.
              </Text>
            </Box>
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <Box className="p-5 border-t border-border bg-card">
            <VStack space="sm" className="w-full">
              <Button
                size="lg"
                isDisabled={selectedScore === undefined}
                onPress={handleNext}
                className="w-full h-[52px] bg-primary rounded-xl items-center justify-center active:opacity-90"
              >
                <ButtonText className="text-primary-foreground font-semibold text-base">
                  {isLastQuestion ? "Kirim Jawaban" : "Lanjut"}
                </ButtonText>
              </Button>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Kembali ke chat"
                className="w-full min-h-[44px] items-center justify-center py-2 active:opacity-70"
              >
                <Text className="text-[15px] font-semibold text-foreground text-center">
                  Kembali ke chat
                </Text>
              </Pressable>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

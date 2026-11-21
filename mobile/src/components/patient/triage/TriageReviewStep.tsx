import React from "react";
import { ArrowLeft, ArrowRight, Lock, Pencil } from "lucide-react-native";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Badge,
  BadgeText,
  Pressable,
  Button,
  ButtonText,
  ButtonSpinner,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { TriageQuestion } from "./TriageQuestionStep";

interface TriageReviewStepProps {
  questions: TriageQuestion[];
  answers: Record<string, string>;
  isSubmitting: boolean;
  onEditQuestion: (stepNumber: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function TriageReviewStep({
  questions,
  answers,
  isSubmitting,
  onEditQuestion,
  onBack,
  onSubmit,
}: TriageReviewStepProps) {
  return (
    <VStack space="md" className="flex-1">
      {/* Header */}
      <HStack space="sm" className="items-center mb-1">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke pertanyaan 5"
          className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted shadow-xs"
        >
          <ArrowLeft size={20} color="#262130" strokeWidth={2} />
        </Pressable>
        <Heading size="md" bold className="text-foreground ml-1">
          Periksa jawabanmu
        </Heading>
      </HStack>

      {/* Lead Section */}
      <VStack space="xs" className="mt-1">
        <Badge
          variant="outline"
          className="bg-primary/10 border-primary/20 rounded-md px-2.5 py-0.5 self-start"
        >
          <BadgeText className="text-sm font-bold text-primary">
            LANGKAH TERAKHIR
          </BadgeText>
        </Badge>
        <Text size="sm" className="text-muted-foreground leading-relaxed mt-1">
          Kamu masih bisa mengubah jawaban sebelum dikirim.
        </Text>
      </VStack>

      {/* 5-Question Review List (Wireframe Screen 26) */}
      <VStack space="sm" className="my-2">
        {questions.map((q, idx) => {
          const userAns = answers[q.id] || "Belum dijawab";
          return (
            <Card
              key={q.id}
              className="bg-card rounded-xl p-4 border border-border/80 shadow-xs flex-row items-center justify-between gap-3"
            >
              <VStack space="xs" className="flex-1">
                <Text size="sm" bold className="text-foreground">
                  {idx + 1}. {q.shortTitle}
                </Text>
                <Text size="sm" className="text-primary font-semibold">
                  {userAns}
                </Text>
              </VStack>

              <Pressable
                onPress={() => {
                  haptics.light();
                  onEditQuestion(idx + 1);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Ubah jawaban nomor ${idx + 1}`}
                className="flex-row items-center px-3 py-1.5 rounded-lg bg-primary/10 active:bg-primary/20 border border-primary/20"
              >
                <Pencil size={14} color="#4A3B6B" />
                <Text size="sm" bold className="text-primary ml-1.5">
                  Ubah
                </Text>
              </Pressable>
            </Card>
          );
        })}
      </VStack>

      {/* Disclaimer Micro-copy */}
      <Card className="bg-card rounded-xl p-3.5 border border-border/80 shadow-xs flex-row items-center gap-3">
        <Lock size={18} color="#4A3B6B" />
        <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
          Pembayaran baru diminta setelah psikolog ditemukan. Jawabanmu hanya dipakai untuk mencocokkan psikolog.
        </Text>
      </Card>

      {/* Submit Action Button */}
      <VStack space="sm" className="mt-auto pt-4">
        <Button
          size="lg"
          onPress={() => {
            haptics.medium();
            onSubmit();
          }}
          disabled={isSubmitting}
          className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
        >
          {isSubmitting ? (
            <ButtonSpinner color="#FFFFFF" />
          ) : (
            <>
              <ButtonText className="text-white font-bold text-sm mr-2">
                Kirim & Cari Psikolog
              </ButtonText>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
            </>
          )}
        </Button>
      </VStack>
    </VStack>
  );
}

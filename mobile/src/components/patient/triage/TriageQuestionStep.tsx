import React from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react-native";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Progress,
  ProgressFilledTrack,
  Pressable,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  RadioGroup,
  Radio,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface TriageQuestion {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
}

interface TriageQuestionStepProps {
  currentStep: number;
  question: TriageQuestion;
  options: string[];
  selectedOption: string;
  onSelectOption: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenExit: () => void;
}

export function TriageQuestionStep({
  currentStep,
  question,
  options,
  selectedOption,
  onSelectOption,
  onNext,
  onBack,
  onOpenExit,
}: TriageQuestionStepProps) {
  return (
    <VStack space="md" className="flex-1">
      {/* Top Bar: Keluar & Progress Info */}
      <VStack space="xs" className="mb-2">
        <HStack space="md" className="items-center justify-between mb-2">
          <Pressable
            onPress={() => {
              haptics.light();
              onOpenExit();
            }}
            accessibilityRole="button"
            accessibilityLabel="Keluar dari triase"
            className="px-2 py-1 rounded-lg active:bg-muted"
          >
            <Text size="sm" bold className="text-muted-foreground hover:text-foreground">
              Keluar
            </Text>
          </Pressable>

          <HStack space="xs" className="items-center">
            <Text size="sm" bold className="text-foreground">
              Pertanyaan {currentStep} dari 5
            </Text>
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/20 rounded-md px-2 py-0.5 ml-1"
            >
              <BadgeText className="text-sm font-bold text-primary">
                {currentStep * 20}%
              </BadgeText>
            </Badge>
          </HStack>
        </HStack>

        {/* Progress Bar */}
        <Progress
          value={currentStep * 20}
          className="w-full h-2 bg-muted rounded-full"
        >
          <ProgressFilledTrack className="bg-primary" />
        </Progress>
      </VStack>

      {/* Question Card */}
      <Card className="bg-card rounded-xl p-5 border border-border/80 shadow-xs gap-2">
        <Heading size="lg" bold className="text-foreground leading-snug">
          {question.title}
        </Heading>
        <Text size="sm" className="text-muted-foreground font-medium">
          Pilih satu yang paling sesuai.
        </Text>
      </Card>

      {/* Radio Options List */}
      <RadioGroup
        value={selectedOption}
        onChange={(val) => {
          haptics.selection();
          onSelectOption(val);
        }}
        className="gap-3 my-1"
      >
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          return (
            <Radio
              key={opt}
              value={opt}
              accessibilityRole="radio"
              accessibilityLabel={opt}
              accessibilityState={{ checked: isSelected }}
              className={`p-4 rounded-xl border flex-row items-center active:opacity-90 shadow-xs ${
                isSelected
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border/80"
              }`}
            >
              <RadioIndicator className="border-2 border-border/80 bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary">
                <RadioIcon />
              </RadioIndicator>
              <RadioLabel
                className={`text-sm ml-3 flex-1 ${
                  isSelected
                    ? "font-bold text-primary"
                    : "font-normal text-foreground"
                }`}
              >
                {opt}
              </RadioLabel>
            </Radio>
          );
        })}
      </RadioGroup>

      {/* Micro-Reassurance Note */}
      <Card className="bg-card rounded-xl p-3 border border-border/80 shadow-xs flex-row items-center gap-2.5 mt-2">
        <ShieldCheck size={16} color="#4A3B6B" />
        <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
          Jawabanmu tersimpan di perangkat dan baru dikirim setelah kamu menekan Kirim di akhir.
        </Text>
      </Card>

      {/* Navigation Buttons Row */}
      <HStack space="sm" className="items-center mt-auto pt-4">
        <Button
          variant="outline"
          size="lg"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="h-12 px-5 rounded-xl bg-card border-border/80 active:bg-muted flex-row items-center justify-center shadow-xs"
        >
          <ArrowLeft size={18} color="#262130" strokeWidth={2} />
          <ButtonText className="text-foreground font-semibold text-sm ml-1.5">
            Kembali
          </ButtonText>
        </Button>

        <Button
          size="lg"
          onPress={() => {
            haptics.medium();
            onNext();
          }}
          disabled={!selectedOption}
          className={`flex-1 h-12 rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center ${
            !selectedOption ? "bg-muted" : "bg-primary"
          }`}
        >
          <ButtonText className="text-white font-bold text-sm mr-1.5">
            {currentStep === 5 ? "Periksa Jawaban" : "Lanjut"}
          </ButtonText>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
        </Button>
      </HStack>
    </VStack>
  );
}

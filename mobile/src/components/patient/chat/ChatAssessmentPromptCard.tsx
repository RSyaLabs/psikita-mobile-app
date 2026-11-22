import React from "react";
import { ClipboardList, CheckCircle2 } from "lucide-react-native";
import { Box, VStack, HStack, Heading, Text, Button, ButtonText } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface ChatAssessmentPromptCardProps {
  isCompleted?: boolean;
  onOpenAssessment: () => void;
}

export function ChatAssessmentPromptCard({
  isCompleted = false,
  onOpenAssessment,
}: ChatAssessmentPromptCardProps) {
  if (isCompleted) {
    return (
      <Box className="w-full my-2 border border-border bg-card rounded-2xl p-4">
        <HStack space="sm" className="items-center">
          <CheckCircle2 size={20} color="#75618E" />
          <VStack className="flex-1">
            <Heading size="sm" bold className="text-foreground text-sm">
              Asesmen singkat telah diisi
            </Heading>
            <Text className="text-sm text-muted-foreground">
              Jawaban telah terkirim dan tersimpan untuk sesi ini.
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }

  return (
    <Box className="w-full my-2 border-[2.5px] border-primary bg-card rounded-2xl p-4">
      <VStack space="xs" className="w-full">
        <HStack space="xs" className="items-center">
          <ClipboardList size={18} color="#4A3B6B" />
          <Heading size="sm" bold className="text-foreground text-[15px]">
            Psikolog meminta asesmen singkat
          </Heading>
        </HStack>

        <Text className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
          Sekitar 2 menit. Jawabanmu hanya untuk sesi ini.
        </Text>

        <Button
          onPress={() => {
            haptics.selection();
            onOpenAssessment();
          }}
          className="mt-3 w-full h-11 bg-primary rounded-xl items-center justify-center active:opacity-90"
          accessibilityRole="button"
          accessibilityLabel="Isi Sekarang"
        >
          <ButtonText className="text-primary-foreground font-semibold text-[15px]">
            Isi Sekarang
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

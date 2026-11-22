import React from "react";
import { Check, Clock, FileCheck } from "lucide-react-native";
import { Box, VStack, HStack, Heading, Text, Button, ButtonText, Pressable } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface SessionCompletedViewProps {
  onBackToHome: () => void;
  onViewResult?: () => void;
  isResultReady?: boolean;
}

export function SessionCompletedView({
  onBackToHome,
  onViewResult,
  isResultReady = false,
}: SessionCompletedViewProps) {
  return (
    <Box className="flex-1 bg-background px-6 py-6 justify-between max-w-[640px] md:max-w-[720px] self-center w-full">
      <VStack space="lg" className="w-full pt-8">
        {/* Big Checkmark Circle */}
        <VStack space="sm" className="items-center text-center">
          <Box className="w-[72px] h-[72px] rounded-full border-[2.5px] border-primary items-center justify-center bg-card">
            <Check size={36} color="#4A3B6B" strokeWidth={3} />
          </Box>
          <Heading className="text-2xl font-bold text-foreground mt-2 text-center">
            Sesi selesai
          </Heading>
          <Text className="text-[15px] text-muted-foreground text-center leading-relaxed">
            Psikolog sedang menyusun hasil dan sarannya untukmu.
          </Text>
        </VStack>

        {/* 3-Step Timeline Box */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden mt-2">
          {/* Step 1: Sesi Selesai (Completed) */}
          <HStack space="md" className="p-4 items-center">
            <Box className="w-6 h-6 rounded-full bg-primary items-center justify-center flex-shrink-0">
              <Check size={14} color="#FFFFFF" strokeWidth={3} />
            </Box>
            <Text className="text-[15px] font-bold text-foreground">
              Sesi selesai
            </Text>
          </HStack>

          {/* Step 2: Hasil Sedang Disusun (Active) */}
          <HStack
            space="md"
            className="p-4 items-center border-t border-dashed border-border bg-[#F3EFEA]/60"
          >
            <Box className="w-6 h-6 rounded-full border-[2.5px] border-primary items-center justify-center flex-shrink-0">
              <Box className="w-2.5 h-2.5 rounded-full bg-primary" />
            </Box>
            <Text className="text-[15px] font-bold text-foreground">
              Hasil sedang disusun
            </Text>
          </HStack>

          {/* Step 3: Hasil Siap Dibaca (Upcoming / Ready) */}
          <HStack
            space="md"
            className="p-4 items-center border-t border-dashed border-border"
          >
            <Box
              className={`w-6 h-6 rounded-full border items-center justify-center flex-shrink-0 ${
                isResultReady
                  ? "bg-primary border-primary"
                  : "border-dashed border-[#75618E]"
              }`}
            >
              {isResultReady && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </Box>
            <Text
              className={`text-[15px] ${
                isResultReady
                  ? "font-bold text-foreground"
                  : "font-normal text-muted-foreground"
              }`}
            >
              Hasil siap dibaca
            </Text>
          </HStack>
        </Box>

        {/* Dashed Information Box */}
        <Box className="border border-dashed border-[#75618E] rounded-2xl p-4 bg-muted/40">
          <Text className="text-sm text-foreground leading-relaxed">
            Kami kabari saat hasil siap. Isinya: ringkasan, saran, dan rencana perawatan jika ada.
          </Text>
        </Box>
      </VStack>

      {/* Bottom CTAs */}
      <VStack space="sm" className="w-full pb-4">
        {onViewResult && (
          <Button
            size="lg"
            onPress={() => {
              haptics.selection();
              onViewResult();
            }}
            className="w-full h-[52px] bg-primary rounded-xl items-center justify-center active:opacity-90"
          >
            <ButtonText className="text-primary-foreground font-semibold text-base">
              Lihat Hasil Konsultasi
            </ButtonText>
          </Button>
        )}

        <Pressable
          onPress={() => {
            haptics.light();
            onBackToHome();
          }}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          className={`w-full h-[52px] rounded-xl items-center justify-center ${
            onViewResult
              ? "border border-border bg-card active:bg-muted"
              : "bg-primary active:opacity-90"
          }`}
        >
          <Text
            className={`text-base font-semibold text-center ${
              onViewResult ? "text-foreground" : "text-primary-foreground"
            }`}
          >
            Kembali ke Beranda
          </Text>
        </Pressable>
      </VStack>
    </Box>
  );
}

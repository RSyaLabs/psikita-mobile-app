import React from "react";
import { Clock } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PaymentExpiredViewProps {
  onBackToCheckout: () => void;
  onCheckStatus: () => void;
}

export function PaymentExpiredView({
  onBackToCheckout,
  onCheckStatus,
}: PaymentExpiredViewProps) {
  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl" className="w-full max-w-[640px] md:max-w-[720px] self-center items-center">
          {/* Header Visual */}
          <VStack space="md" className="items-center mt-8 text-center">
            <Box className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-warning items-center justify-center bg-warning/10">
              <Clock size={36} color="#D97706" />
            </Box>

            <Heading level={1} size="xl" bold className="text-foreground text-center font-bold text-2xl">
              Waktu pembayaran habis
            </Heading>

            <Text size="sm" className="text-muted-foreground text-center leading-relaxed font-medium max-w-[340px]">
              Kode QR / tautan e-wallet ini tidak berlaku lagi. Jangan membayar dengan kode lama.
            </Text>
          </VStack>

          {/* Notice Box */}
          <Box className="w-full border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground text-center leading-relaxed font-medium">
              Sudah terlanjur membayar sebelum waktu habis? Tekan Cek Status. Kami akan memeriksanya dulu.
            </Text>
          </Box>

          {/* Action Buttons */}
          <VStack space="xs" className="w-full pt-2">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onBackToCheckout();
              }}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90"
            >
              <ButtonText className="text-primary-foreground font-bold text-sm">
                Kembali ke Pembayaran
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                haptics.selection();
                onCheckStatus();
              }}
              accessibilityRole="button"
              accessibilityLabel="Cek Status Sekarang"
              className="min-h-[44px] items-center justify-center active:opacity-80"
            >
              <Text size="sm" bold className="text-foreground font-semibold">
                Cek Status Sekarang
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

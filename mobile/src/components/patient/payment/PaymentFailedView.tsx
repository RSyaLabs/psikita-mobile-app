import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PaymentFailedViewProps {
  methodName?: string;
  serverReason?: string;
  onSelectOtherMethod: () => void;
  onCheckStatus: () => void;
}

export function PaymentFailedView({
  methodName = "e-wallet / bank",
  serverReason,
  onSelectOtherMethod,
  onCheckStatus,
}: PaymentFailedViewProps) {
  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl" className="w-full max-w-[640px] md:max-w-[720px] self-center items-center">
          {/* Header Visual */}
          <VStack space="md" className="items-center mt-8 text-center">
            <Box className="w-[76px] h-[76px] rounded-full border-2 border-destructive items-center justify-center bg-destructive/10">
              <AlertCircle size={36} color="#DC2626" />
            </Box>

            <Heading level={1} size="xl" bold className="text-foreground text-center font-bold text-2xl">
              Pembayaran tidak berhasil
            </Heading>

            <Text size="sm" className="text-muted-foreground text-center leading-relaxed font-medium max-w-[340px]">
              Pembayaran dibatalkan atau ditolak oleh {methodName}. Kamu belum dikenai biaya.
            </Text>
          </VStack>

          {/* Reason Box */}
          <Box className="w-full border border-border bg-card rounded-xl p-4">
            <Text size="sm" className="text-foreground leading-relaxed font-medium">
              {serverReason ||
                "Saldo tidak cukup, pembayaran dibatalkan di aplikasi, atau batas transaksi tercapai. Alasan pasti dari server bila tersedia."}
            </Text>
          </Box>

          {/* Notice Box */}
          <Box className="w-full border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground text-center leading-relaxed">
              Merasa sudah terpotong? Tekan Cek Status. Jangan membayar ulang dulu.
            </Text>
          </Box>

          {/* Action Buttons */}
          <VStack space="xs" className="w-full pt-2">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onSelectOtherMethod();
              }}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90"
            >
              <ButtonText className="text-primary-foreground font-bold text-sm">
                Pilih Metode Lain
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

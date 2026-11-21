import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import { PaymentCountdownTimer } from "./PaymentCountdownTimer";
import { haptics } from "@/utils/haptics";

export interface PaymentInstructionEwalletProps {
  walletName?: "ShopeePay" | "DANA" | string;
  amount?: number;
  deadlineText?: string;
  onOpenApp: () => void;
  onChangeWallet: () => void;
  onPaid: () => void;
  onBack?: () => void;
}

export function PaymentInstructionEwallet({
  walletName = "ShopeePay",
  amount = 151500,
  deadlineText = "22 Nov, 12:00",
  onOpenApp,
  onChangeWallet,
  onPaid,
  onBack,
}: PaymentInstructionEwalletProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={onBack || onChangeWallet}
          accessibilityRole="button"
          accessibilityLabel={`Kembali dari bayar dengan ${walletName}`}
          className="p-1 -ml-1"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading level={1} size="md" bold className="text-foreground text-lg">
          Bayar dengan {walletName}
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Countdown Timer */}
          <PaymentCountdownTimer deadlineText={deadlineText} />

          {/* Wallet Summary Card */}
          <Box className="border-2 border-foreground bg-card rounded-2xl p-4 gap-3">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider font-semibold"
            >
              {walletName.toUpperCase()}
            </Text>

            <Text size="sm" className="text-foreground leading-relaxed font-medium">
              Setujui pembayaran di aplikasi {walletName}. Kamu akan dikembalikan ke sini setelahnya.
            </Text>

            {/* Amount Row */}
            <Box className="border-t border-dashed border-border pt-3">
              <HStack className="justify-between items-center">
                <VStack space="xs">
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Jumlah yang dibayar
                  </Text>
                  <Text size="lg" bold className="text-foreground text-xl">
                    Rp {amount.toLocaleString("id-ID")}
                  </Text>
                </VStack>
                <Text size="sm" className="text-muted-foreground font-medium">
                  dari server
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Stepper Timeline */}
          <Box className="border border-border bg-card rounded-2xl overflow-hidden">
            {/* Step 1 */}
            <HStack space="md" className="p-4 items-center">
              <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center">
                <Text size="sm" bold className="text-card font-bold">
                  ✓
                </Text>
              </Box>
              <Text size="sm" bold className="text-foreground font-bold">
                Pembayaran dibuat
              </Text>
            </HStack>

            {/* Step 2 */}
            <HStack space="md" className="p-4 items-center border-t border-dashed border-border bg-muted/20">
              <Box className="w-6 h-6 rounded-full border-2 border-foreground items-center justify-center">
                <Box className="w-2.5 h-2.5 rounded-full bg-foreground" />
              </Box>
              <Text size="sm" bold className="text-foreground font-bold">
                Setujui di {walletName}
              </Text>
            </HStack>

            {/* Step 3 */}
            <HStack space="md" className="p-4 items-center border-t border-dashed border-border">
              <Box className="w-6 h-6 rounded-full border-2 border-dashed border-border items-center justify-center" />
              <Text size="sm" className="text-muted-foreground font-medium">
                Menunggu konfirmasi
              </Text>
            </HStack>
          </Box>

          {/* Warning Tip 1 */}
          <Box className="border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed">
              Kembali dari {walletName} belum berarti pembayaran berhasil. Kami menunggu konfirmasi dari server.
            </Text>
          </Box>

          {/* Warning Tip 2 */}
          <Box className="border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed">
              Aplikasi tidak terbuka? Pastikan {walletName} terpasang dan akunmu aktif, atau ganti metode.
            </Text>
          </Box>

          {/* Action CTAs */}
          <VStack space="xs" className="pt-2">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onOpenApp();
              }}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
            >
              <ButtonIcon as={ExternalLink} className="text-primary-foreground" />
              <ButtonText className="text-primary-foreground font-bold text-sm">
                Buka {walletName}
              </ButtonText>
            </Button>

            <Button
              size="lg"
              variant="outline"
              onPress={() => {
                haptics.medium();
                onPaid();
              }}
              className="w-full h-[50px] border border-border bg-card rounded-xl flex-row items-center justify-center active:opacity-90 mt-1"
            >
              <ButtonText className="text-foreground font-semibold text-sm">
                Saya Sudah Bayar
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                haptics.selection();
                onChangeWallet();
              }}
              accessibilityRole="button"
              accessibilityLabel="Ganti e-wallet"
              className="min-h-[44px] items-center justify-center active:opacity-80"
            >
              <Text size="sm" bold className="text-foreground font-semibold">
                Ganti e-wallet
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

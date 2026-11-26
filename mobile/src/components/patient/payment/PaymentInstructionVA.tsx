import React, { useState } from "react";
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { PaymentCountdownTimer } from "./PaymentCountdownTimer";
import { haptics } from "@/utils/haptics";

export interface PaymentInstructionVAProps {
  bankName?: string;
  vaNumber?: string;
  amount?: number;
  deadlineText?: string;
  onPaid: () => void;
  onChangeMethod: () => void;
  onBack?: () => void;
}

export function PaymentInstructionVA({
  bankName = "BANK BCA",
  vaNumber = "8277 0812 3456 7890",
  amount = 154000,
  deadlineText = "-",
  onPaid,
  onChangeMethod,
  onBack,
}: PaymentInstructionVAProps) {
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [atmOpen, setAtmOpen] = useState(true);
  const [mBankingOpen, setMBankingOpen] = useState(false);

  const handleCopyVa = () => {
    haptics.success();
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2500);
  };

  const handleCopyAmount = () => {
    haptics.success();
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={onBack || onChangeMethod}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke pembayaran"
          className="p-1 -ml-1"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading level={1} size="md" bold className="text-foreground text-lg">
          Selesaikan pembayaran
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Countdown Timer */}
          <PaymentCountdownTimer deadlineText={deadlineText} />

          {/* VA Card */}
          <Box className="border-2 border-foreground bg-card rounded-2xl p-4 gap-3">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider font-semibold"
            >
              VIRTUAL ACCOUNT {bankName}
            </Text>

            {/* VA Number Row */}
            <HStack className="justify-between items-center py-1">
              <Text size="lg" bold className="text-foreground tracking-wider font-bold text-xl">
                {vaNumber}
              </Text>
              <Pressable
                onPress={handleCopyVa}
                accessibilityRole="button"
                accessibilityLabel="Salin nomor virtual account"
                className="h-[44px] px-4 border border-border rounded-xl bg-card flex-row items-center gap-1.5 active:opacity-80"
              >
                {copiedVa ? (
                  <>
                    <Check size={16} color="#4A3B6B" />
                    <Text size="sm" bold className="text-primary font-semibold">
                      Tersalin
                    </Text>
                  </>
                ) : (
                  <>
                    <Copy size={16} color="#262130" />
                    <Text size="sm" bold className="text-foreground font-semibold">
                      Salin
                    </Text>
                  </>
                )}
              </Pressable>
            </HStack>

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
                <Pressable
                  onPress={handleCopyAmount}
                  accessibilityRole="button"
                  accessibilityLabel="Salin jumlah pembayaran"
                  className="h-[44px] px-4 border border-border rounded-xl bg-card flex-row items-center gap-1.5 active:opacity-80"
                >
                  {copiedAmount ? (
                    <>
                      <Check size={16} color="#4A3B6B" />
                      <Text size="sm" bold className="text-primary font-semibold">
                        Tersalin
                      </Text>
                    </>
                  ) : (
                    <>
                      <Copy size={16} color="#262130" />
                      <Text size="sm" bold className="text-foreground font-semibold">
                        Salin
                      </Text>
                    </>
                  )}
                </Pressable>
              </HStack>
            </Box>
          </Box>

          {/* Section CARA MEMBAYAR */}
          <VStack space="xs">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider ml-1 mb-1 font-semibold"
            >
              CARA MEMBAYAR
            </Text>

            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              {/* Accordion ATM */}
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setAtmOpen(!atmOpen);
                }}
                className="p-4 flex-row items-center justify-between active:opacity-90"
              >
                <Text size="sm" bold className="text-foreground font-semibold text-base">
                  Lewat ATM
                </Text>
                {atmOpen ? (
                  <ChevronUp size={18} color="#262130" />
                ) : (
                  <ChevronDown size={18} color="#262130" />
                )}
              </Pressable>

              {atmOpen && (
                <VStack space="xs" className="px-4 pb-4 pt-1 border-t border-dashed border-border">
                  <Text size="sm" className="text-foreground leading-relaxed">
                    1. Masukkan kartu ATM dan PIN kamu.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    2. Pilih menu Bayar/Beli &gt; Pembayaran Lainnya &gt; Virtual Account.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    3. Masukkan nomor VA: {vaNumber}.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    4. Periksa nominal Rp {amount.toLocaleString("id-ID")} lalu konfirmasi pembayaran.
                  </Text>
                </VStack>
              )}

              {/* Accordion m-Banking */}
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setMBankingOpen(!mBankingOpen);
                }}
                className="p-4 flex-row items-center justify-between border-t border-border active:opacity-90"
              >
                <Text size="sm" bold className="text-foreground font-semibold text-base">
                  Lewat m-Banking
                </Text>
                {mBankingOpen ? (
                  <ChevronUp size={18} color="#262130" />
                ) : (
                  <ChevronDown size={18} color="#262130" />
                )}
              </Pressable>

              {mBankingOpen && (
                <VStack space="xs" className="px-4 pb-4 pt-1 border-t border-dashed border-border">
                  <Text size="sm" className="text-foreground leading-relaxed">
                    1. Buka aplikasi m-Banking dan lakukan login.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    2. Pilih menu Transfer &gt; Virtual Account.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    3. Masukkan nomor VA: {vaNumber}.
                  </Text>
                  <Text size="sm" className="text-foreground leading-relaxed">
                    4. Pastikan jumlah tagihan sesuai dan konfirmasi dengan PIN m-Banking.
                  </Text>
                </VStack>
              )}
            </Box>
          </VStack>

          {/* Warning Banner */}
          <Box className="border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed">
              Jangan membayar dua kali. Jika sudah membayar, tekan tombol di bawah.
            </Text>
          </Box>

          {/* Action CTAs */}
          <VStack space="xs" className="pt-2">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onPaid();
              }}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90"
            >
              <ButtonText className="text-primary-foreground font-bold text-sm">
                Saya Sudah Bayar
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                haptics.selection();
                onChangeMethod();
              }}
              accessibilityRole="button"
              accessibilityLabel="Ganti metode pembayaran"
              className="min-h-[44px] items-center justify-center active:opacity-80"
            >
              <Text size="sm" bold className="text-foreground font-semibold">
                Ganti metode pembayaran
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

import React, { useState } from "react";
import { ArrowLeft, Download, Maximize2, Check, QrCode } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Image,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { PaymentCountdownTimer } from "./PaymentCountdownTimer";
import { haptics } from "@/utils/haptics";

export interface PaymentInstructionQRISProps {
  amount?: number;
  qrCodeUrl?: string;
  deadlineText?: string;
  onPaid: () => void;
  onChangeMethod: () => void;
  onBack?: () => void;
}

export function PaymentInstructionQRIS({
  amount = 151050,
  qrCodeUrl,
  deadlineText = "22 Nov, 12:00",
  onPaid,
  onChangeMethod,
  onBack,
}: PaymentInstructionQRISProps) {
  const [saved, setSaved] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const handleSaveQR = () => {
    haptics.success();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleZoom = () => {
    haptics.selection();
    setZoomed(!zoomed);
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
          Bayar dengan QRIS
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Countdown Timer */}
          <PaymentCountdownTimer deadlineText={deadlineText} />

          {/* QRIS Card */}
          <Box className="border-2 border-foreground bg-card rounded-2xl p-4 items-center gap-3">
            <Text
              size="sm"
              bold
              className="self-start text-muted-foreground uppercase tracking-wider font-semibold"
            >
              QRIS
            </Text>

            {/* QR Code Container */}
            <Box
              className={`${
                zoomed ? "w-[280px] h-[280px]" : "w-[220px] h-[220px]"
              } border-2 border-dashed border-border rounded-2xl bg-muted/40 items-center justify-center p-4 overflow-hidden`}
            >
              {qrCodeUrl ? (
                <Image
                  source={{ uri: qrCodeUrl }}
                  alt="Kode QRIS Pembayaran"
                  className={zoomed ? "w-[240px] h-[240px]" : "w-[180px] h-[180px]"}
                  resizeMode="contain"
                />
              ) : (
                <>
                  <QrCode size={zoomed ? 160 : 120} color="#4A3B6B" />
                  <Text size="sm" className="text-center text-muted-foreground mt-2 font-medium">
                    Dibuat khusus untuk pesanan ini
                  </Text>
                </>
              )}
            </Box>

            {/* QR Actions */}
            <HStack space="xs" className="w-full">
              <Pressable
                onPress={handleSaveQR}
                accessibilityRole="button"
                accessibilityLabel="Simpan gambar QR"
                className="flex-1 h-[44px] border border-border rounded-xl bg-card items-center justify-center flex-row gap-1.5 active:opacity-80"
              >
                {saved ? (
                  <>
                    <Check size={16} color="#4A3B6B" />
                    <Text size="sm" bold className="text-primary font-semibold">
                      Tersimpan
                    </Text>
                  </>
                ) : (
                  <>
                    <Download size={16} color="#262130" />
                    <Text size="sm" bold className="text-foreground font-semibold">
                      Simpan gambar QR
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleZoom}
                accessibilityRole="button"
                accessibilityLabel="Perbesar gambar QR"
                className="flex-1 h-[44px] border border-border rounded-xl bg-card items-center justify-center flex-row gap-1.5 active:opacity-80"
              >
                <Maximize2 size={16} color="#262130" />
                <Text size="sm" bold className="text-foreground font-semibold">
                  {zoomed ? "Perkecil" : "Perbesar"}
                </Text>
              </Pressable>
            </HStack>

            {/* Amount Row */}
            <Box className="w-full border-t border-dashed border-border pt-3">
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

          {/* Section CARA MEMBAYAR */}
          <VStack space="xs">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider ml-1 mb-1 font-semibold"
            >
              CARA MEMBAYAR
            </Text>

            <Box className="border border-border bg-card rounded-2xl p-4 gap-2">
              <Text size="sm" className="text-foreground leading-relaxed">
                1. Buka aplikasi bank atau e-wallet apa pun yang mendukung QRIS.
              </Text>
              <Text size="sm" className="text-foreground leading-relaxed">
                2. Pilih Scan / Bayar, lalu scan kode di atas (atau unggah gambar QR yang disimpan).
              </Text>
              <Text size="sm" className="text-foreground leading-relaxed">
                3. Pastikan nominal sesuai, lalu setujui pembayaran.
              </Text>
              <Text size="sm" className="text-foreground leading-relaxed">
                4. Kembali ke sini. Status diperbarui otomatis.
              </Text>
            </Box>
          </VStack>

          {/* Warning Banner */}
          <Box className="border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed">
              Satu kode QR hanya untuk satu pembayaran. Jangan membayar dua kali.
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

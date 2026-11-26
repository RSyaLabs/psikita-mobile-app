import React, { useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  Badge,
  BadgeText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PaymentInvoiceViewProps {
  invoiceNumber?: string;
  dateText?: string;
  doctorName?: string;
  paymentMethodName?: string;
  status?: "PENDING" | "SETTLEMENT" | "FAILED" | "EXPIRED" | string;
  serviceFee?: number;
  discount?: number;
  adminFee?: number;
  total?: number;
  onBack: () => void;
  onProceedToChat?: () => void;
}

export function PaymentInvoiceView({
  invoiceNumber = "-",
  dateText = "22 Nov 2026 · 12:00 WIB",
  doctorName = "Psikolog Klinis",
  paymentMethodName = "BCA Virtual Account",
  status = "PENDING",
  serviceFee = 150000,
  discount = 0,
  adminFee = 4000,
  total = 154000,
  onBack,
  onProceedToChat,
}: PaymentInvoiceViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    haptics.success();
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isLunas = status === "SETTLEMENT" || status === "SUCCESS";
  const isFailed = status === "FAILED" || status === "CANCEL" || status === "EXPIRE";

  const statusLabel = isLunas ? "Lunas" : isFailed ? "Gagal" : "Menunggu";

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke status pembayaran"
          className="p-1 -ml-1"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading level={1} size="md" bold className="text-foreground text-lg">
          Invoice
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Invoice Card */}
          <Box className="border-2 border-foreground bg-card rounded-2xl p-4 gap-3">
            <HStack className="justify-between items-center">
              <Text
                size="sm"
                bold
                className="text-muted-foreground uppercase tracking-wider font-semibold"
              >
                INVOICE {invoiceNumber}
              </Text>
              <Badge
                variant="outline"
                className={`px-2.5 py-0.5 rounded-full ${
                  isLunas
                    ? "bg-primary/10 border-primary"
                    : isFailed
                    ? "bg-destructive/10 border-destructive"
                    : "bg-muted border-border"
                }`}
              >
                <BadgeText
                  className={`text-sm font-bold ${
                    isLunas
                      ? "text-primary"
                      : isFailed
                      ? "text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {statusLabel}
                </BadgeText>
              </Badge>
            </HStack>

            {/* Invoice Breakdown Details */}
            <VStack space="xs" className="pt-1">
              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Tanggal
                </Text>
                <Text size="sm" className="text-foreground font-semibold">
                  {dateText}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Layanan
                </Text>
                <Text size="sm" className="text-foreground font-semibold">
                  Konsultasi {doctorName}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Metode
                </Text>
                <Text size="sm" className="text-foreground font-semibold">
                  {paymentMethodName}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Status
                </Text>
                <Text
                  size="sm"
                  bold
                  className={
                    isLunas
                      ? "text-primary font-bold"
                      : isFailed
                      ? "text-destructive font-bold"
                      : "text-foreground font-semibold"
                  }
                >
                  {statusLabel}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5 border-t border-border mt-1 pt-2">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Biaya layanan
                </Text>
                <Text size="sm" className="text-foreground font-semibold">
                  Rp {serviceFee.toLocaleString("id-ID")}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Diskon
                </Text>
                <Text
                  size="sm"
                  className={discount > 0 ? "text-primary font-bold" : "text-foreground font-semibold"}
                >
                  {discount > 0 ? `-Rp ${discount.toLocaleString("id-ID")}` : "Rp —"}
                </Text>
              </HStack>

              <HStack className="justify-between items-center py-1.5">
                <Text size="sm" className="text-muted-foreground font-medium">
                  Biaya pembayaran
                </Text>
                <Text size="sm" className="text-foreground font-semibold">
                  Rp {adminFee.toLocaleString("id-ID")}
                </Text>
              </HStack>

              {/* Total */}
              <Box className="border-t border-dashed border-border pt-3 mt-1">
                <HStack className="justify-between items-center">
                  <Text size="sm" bold className="text-foreground text-base">
                    Total
                  </Text>
                  <Text size="sm" bold className="text-foreground text-xl">
                    Rp {total.toLocaleString("id-ID")}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </Box>

          {/* Wireframe Note */}
          <Box className="border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed">
              Invoice tampil dari data server. Status Lunas hanya muncul setelah pembayaran terkonfirmasi, bukan dari redirect aplikasi pembayaran.
            </Text>
          </Box>

          {/* Action Buttons */}
          <VStack space="xs" className="pt-2">
            <Button
              size="lg"
              onPress={handleCopy}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
            >
              {copied ? (
                <>
                  <Check size={18} color="#FAF8F5" />
                  <ButtonText className="text-primary-foreground font-bold text-sm">
                    Nomor Invoice Disalin
                  </ButtonText>
                </>
              ) : (
                <>
                  <Copy size={18} color="#FAF8F5" />
                  <ButtonText className="text-primary-foreground font-bold text-sm">
                    Salin Nomor Invoice
                  </ButtonText>
                </>
              )}
            </Button>

            {isLunas && onProceedToChat && (
              <Button
                size="lg"
                variant="outline"
                onPress={() => {
                  haptics.medium();
                  onProceedToChat();
                }}
                className="w-full h-[50px] border border-border bg-card rounded-xl flex-row items-center justify-center active:opacity-90 mt-1"
              >
                <ButtonText className="text-foreground font-semibold text-sm">
                  Masuk ke Ruang Konsultasi
                </ButtonText>
              </Button>
            )}

            <Pressable
              onPress={() => {
                haptics.selection();
                onBack();
              }}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="min-h-[44px] items-center justify-center active:opacity-80"
            >
              <Text size="sm" bold className="text-foreground font-semibold">
                Kembali
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

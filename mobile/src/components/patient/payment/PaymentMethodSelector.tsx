import React from "react";
import { ShieldCheck, Wallet, QrCode } from "lucide-react-native";
import {
  Box,
  Text,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
} from "@/components/ui";

export interface PaymentMethodSelectorProps {
  selectedMethod: "gopay" | "qris";
  onSelectMethod: (method: "gopay" | "qris") => void;
  paymentEnabled: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  paymentEnabled,
}: PaymentMethodSelectorProps) {
  return (
    <VStack space="sm">
      <HStack space="md" className="items-center justify-between">
        <Text
          size="xs"
          bold
          className="text-muted-foreground uppercase tracking-wider"
        >
          Midtrans • Pembayaran aman
        </Text>
        <ShieldCheck size={16} className="text-secondary" />
      </HStack>

      {/* GoPay / E-Wallet */}
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel="E-WALLET"
        accessibilityState={{
          checked: selectedMethod === "gopay",
          disabled: !paymentEnabled,
        }}
        disabled={!paymentEnabled}
        onPress={() => onSelectMethod("gopay")}
        className={`p-3 rounded-xl border flex-row items-center justify-between active:opacity-90 ${
          selectedMethod === "gopay"
            ? "bg-muted border-primary"
            : "bg-card border-border"
        }`}
      >
        <HStack space="md" className="items-center">
          <Wallet size={20} color="#4A3B6B" />
          <VStack space="xs">
            <Text size="sm" bold className="text-foreground">
              E-WALLET
            </Text>
            <Text size="sm" className="text-muted-foreground font-medium text-sm">
              Kanal dan saldo ditentukan server
            </Text>
          </VStack>
        </HStack>
        <Box
          className={`w-5 h-5 rounded-full border items-center justify-center ${
            selectedMethod === "gopay"
              ? "border-primary bg-primary"
              : "border-border"
          }`}
        >
          {selectedMethod === "gopay" && (
            <Box className="w-2 h-2 rounded-full bg-primary-foreground" />
          )}
        </Box>
      </Pressable>

      {/* QRIS */}
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel="QRIS"
        accessibilityState={{
          checked: selectedMethod === "qris",
          disabled: !paymentEnabled,
        }}
        disabled={!paymentEnabled}
        onPress={() => onSelectMethod("qris")}
        className={`p-3.5 rounded-xl border flex-row items-center justify-between active:opacity-90 ${
          selectedMethod === "qris"
            ? "bg-muted border-primary"
            : "bg-card border-border"
        }`}
      >
        <HStack space="md" className="items-center">
          <QrCode size={20} color="#4A3B6B" />
          <VStack space="xs">
            <Text size="sm" bold className="text-foreground">
              QRIS
            </Text>
            <Text size="sm" className="text-muted-foreground font-medium text-sm">
              Pindai sekali untuk membayar
            </Text>
          </VStack>
        </HStack>
        <Box
          className={`w-5 h-5 rounded-full border items-center justify-center ${
            selectedMethod === "qris"
              ? "border-primary bg-primary"
              : "border-border"
          }`}
        >
          {selectedMethod === "qris" && (
            <Box className="w-2 h-2 rounded-full bg-primary-foreground" />
          )}
        </Box>
      </Pressable>

      {/* Inactive Credit / Debit Card Option */}
      <Box className="p-3.5 rounded-xl border border-border bg-card flex-row items-center justify-between">
        <VStack space="xs">
          <Text size="sm" bold className="text-foreground">
            Kartu kredit/debit
          </Text>
          <Text size="sm" className="text-muted-foreground font-medium text-sm">
            Belum tersedia dalam kontrak pembayaran.
          </Text>
        </VStack>
        <Badge variant="outline" className="bg-muted border-border px-3 py-1 rounded-full">
          <BadgeText className="text-sm font-semibold text-muted-foreground">
            Tidak aktif
          </BadgeText>
        </Badge>
      </Box>
    </VStack>
  );
}

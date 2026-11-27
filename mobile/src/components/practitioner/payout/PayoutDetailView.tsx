import React from "react";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, Check, Circle } from "lucide-react-native";

export interface PayoutDetailViewProps {
  amount?: string;
  statusLabel?: string;
  period?: string;
  referenceNumber?: string;
  includedSessionsCount?: number;
  deductionsAmount?: string;
  bankAccountMasked?: string;
  calculatedAt?: string;
  estimatedAt?: string;
  onContactSupport?: () => void;
  onBack: () => void;
}

export function PayoutDetailView({
  amount = "Rp 0",
  statusLabel = "Menunggu",
  period = "-",
  referenceNumber = "-",
  includedSessionsCount = 0,
  deductionsAmount = "Rp 0",
  bankAccountMasked = "-",
  calculatedAt = "-",
  estimatedAt = "-",
  onContactSupport,
  onBack,
}: PayoutDetailViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Detail pencairan
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Status & Amount Card */}
        <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-2">
          <Box className="self-start border border-foreground rounded-full px-3 py-0.5 bg-muted">
            <Text size="sm" bold className="text-foreground">
              {statusLabel}
            </Text>
          </Box>
          <Heading size="2xl" bold className="text-foreground">
            {amount}
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            Periode {period} · Ref {referenceNumber}
          </Text>
        </Card>

        {/* Breakdown Info */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Sesi termasuk
            </Text>
            <Text size="sm" bold className="text-foreground">
              {includedSessionsCount} sesi
            </Text>
          </HStack>
          <Box className="border-t border-dashed border-border" />
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Potongan
            </Text>
            <Text size="sm" bold className="text-foreground">
              {deductionsAmount}
            </Text>
          </HStack>
          <Box className="border-t border-dashed border-border" />
          <HStack className="justify-between items-center p-3.5">
            <Text size="sm" className="text-muted-foreground">
              Rekening
            </Text>
            <Text size="sm" bold className="text-foreground">
              {bankAccountMasked}
            </Text>
          </HStack>
        </Box>

        {/* Timeline Steps */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          {/* Step 1: Dihitung */}
          <HStack className="items-start gap-3 p-3.5">
            <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center mt-0.5">
              <Check size={14} color="#ffffff" strokeWidth={3} />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Dihitung
              </Text>
              <Text size="sm" className="text-muted-foreground">
                {calculatedAt}
              </Text>
            </VStack>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          {/* Step 2: Diproses */}
          <HStack className="items-start gap-3 p-3.5">
            <Box className="w-6 h-6 rounded-full border-2 border-foreground items-center justify-center mt-0.5" />
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Diproses
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Menunggu bank
              </Text>
            </VStack>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          {/* Step 3: Diterima */}
          <HStack className="items-start gap-3 p-3.5 opacity-60">
            <Circle size={22} color="#75618E" className="mt-0.5" />
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Diterima
              </Text>
              <Text size="sm" className="text-muted-foreground">
                {estimatedAt}
              </Text>
            </VStack>
          </HStack>
        </Box>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          variant="outline"
          className="h-[52px] border border-foreground rounded-xl"
          onPress={onContactSupport}
        >
          <ButtonText className="text-foreground font-semibold">
            Nominal tidak sesuai? Hubungi Support
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onBack}
        >
          <ButtonText className="text-foreground font-semibold">
            Kembali
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

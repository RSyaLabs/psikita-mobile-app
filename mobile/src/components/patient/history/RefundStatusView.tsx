import React from "react";
import { ArrowLeft, Check, HelpCircle } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";

export interface RefundStatusViewProps {
  onBack: () => void;
  onContactSupport: () => void;
  onReturnToSessions: () => void;
  referenceNumber?: string;
  submissionDate?: string;
  requestedAmount?: string;
}

export function RefundStatusView({
  onBack,
  onContactSupport,
  onReturnToSessions,
  referenceNumber = "REF-20261122-8921",
  submissionDate = "Hari ini · 14:15 WIB",
  requestedAmount = "Rp 150.000",
}: RefundStatusViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        gap: 18,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header with Back Button (Wireframe RW5) */}
      <HStack space="xs" className="items-center -ml-3">
        <Pressable
          testID="btn-back-status"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke detail sesi"
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <AppIcon icon={ArrowLeft} size={24} tone="foreground" />
        </Pressable>
        <Text size="md" bold className="text-foreground text-[17px] font-bold">
          Status pengajuan
        </Text>
      </HStack>

      {/* Status Summary Card (Wireframe RW5) */}
      <Card
        testID="refund-summary-card"
        className="border-[1.5px] border-border rounded-2xl p-4 bg-card gap-2"
      >
        <Box className="self-start">
          <Badge
            variant="outline"
            className="border-2 border-foreground rounded-full px-2.5 py-0.5 bg-card"
          >
            <BadgeText className="text-foreground text-sm font-bold">
              Sedang ditinjau
            </BadgeText>
          </Badge>
        </Box>
        <Text size="sm" className="text-muted-foreground text-sm">
          Diajukan {submissionDate} · Nomor {referenceNumber}
        </Text>
      </Card>

      {/* Progress Timeline Ordered List (Wireframe RW5) */}
      <Card className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
        {/* Step 1: Pengajuan diterima (Done) */}
        <HStack space="md" className="items-start p-4">
          <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center mt-0.5">
            <AppIcon icon={Check} size={14} tone="white" strokeWidth={3} />
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="md" bold className="text-foreground font-semibold text-[15px]">
              Pengajuan diterima
            </Text>
            <Text size="sm" className="text-muted-foreground text-sm">
              {submissionDate}
            </Text>
          </VStack>
        </HStack>

        {/* Step 2: Sedang ditinjau (In Progress) */}
        <HStack space="md" className="items-start p-4 border-t border-dashed border-border">
          <Box className="w-6 h-6 rounded-full border-[2.5px] border-foreground bg-card items-center justify-center mt-0.5">
            <Box className="w-2 h-2 rounded-full bg-foreground" />
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="md" bold className="text-foreground font-semibold text-[15px]">
              Sedang ditinjau
            </Text>
            <Text size="sm" className="text-muted-foreground text-sm">
              Biasanya 1x24 jam kerja
            </Text>
          </VStack>
        </HStack>

        {/* Step 3: Keputusan (Pending) */}
        <HStack space="md" className="items-start p-4 border-t border-dashed border-border opacity-70">
          <Box className="w-6 h-6 rounded-full border-[1.5px] border-dashed border-muted-foreground items-center justify-center mt-0.5" />
          <VStack space="xs" className="flex-1">
            <Text size="md" bold className="text-foreground font-semibold text-[15px]">
              Keputusan
            </Text>
            <Text size="sm" className="text-muted-foreground text-sm">
              Kami kabari lewat notifikasi
            </Text>
          </VStack>
        </HStack>

        {/* Step 4: Dana dikembalikan (Pending) */}
        <HStack space="md" className="items-start p-4 border-t border-dashed border-border opacity-70">
          <Box className="w-6 h-6 rounded-full border-[1.5px] border-dashed border-muted-foreground items-center justify-center mt-0.5" />
          <VStack space="xs" className="flex-1">
            <Text size="md" bold className="text-foreground font-semibold text-[15px]">
              Dana dikembalikan
            </Text>
            <Text size="sm" className="text-muted-foreground text-sm">
              Jika disetujui
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* DL Card: Nilai yang diajukan */}
      <Card className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
        <HStack space="sm" className="items-center justify-between p-4">
          <Text size="sm" className="text-muted-foreground text-sm">
            Nilai yang diajukan
          </Text>
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            {requestedAmount}
          </Text>
        </HStack>
      </Card>

      {/* Server Disclaimer Notice (Wireframe RW5) */}
      <Box className="border-[1.5px] border-dashed border-muted-foreground/60 rounded-xl p-4 bg-card/60">
        <Text size="sm" className="text-muted-foreground text-sm leading-relaxed">
          Estimasi dan nilai dari server, bukan tebakan klien.
        </Text>
      </Box>

      {/* Actions */}
      <VStack space="sm" className="mt-auto pt-2">
        <Button
          testID="btn-hubungi-support"
          variant="outline"
          size="lg"
          onPress={onContactSupport}
          className="h-[52px] w-full rounded-xl border-[1.5px] border-foreground items-center justify-center bg-card"
        >
          <ButtonText className="text-foreground text-base font-semibold">
            Hubungi Support
          </ButtonText>
        </Button>

        <Pressable
          testID="btn-kembali-ke-sesi"
          onPress={onReturnToSessions}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar sesi"
          className="items-center justify-center min-h-[44px] py-2"
        >
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            Kembali ke Sesi
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
}

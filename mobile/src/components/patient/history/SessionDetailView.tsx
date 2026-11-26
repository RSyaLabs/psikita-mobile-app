import React from "react";
import { ArrowLeft, User, FileText, Calendar, AlertCircle } from "lucide-react-native";
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
import type { SessionItem } from "./SessionListView";

export interface SessionDetailViewProps {
  session?: SessionItem | null;
  onBack: () => void;
  onViewResults: () => void;
  onScheduleFollowUp: () => void;
  onRequestRefund: () => void;
}

export function SessionDetailView({
  session,
  onBack,
  onViewResults,
  onScheduleFollowUp,
  onRequestRefund,
}: SessionDetailViewProps) {
  if (!session) {
    return (
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <HStack space="xs" className="items-center -ml-3">
          <Pressable
            testID="btn-back-detail"
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke daftar sesi"
            className="w-11 h-11 items-center justify-center rounded-full"
          >
            <AppIcon icon={ArrowLeft} size={24} tone="foreground" />
          </Pressable>
          <Text size="md" bold className="text-foreground text-[17px] font-bold">
            Detail sesi
          </Text>
        </HStack>
        <Card className="border-[1.5px] border-border rounded-2xl p-5 bg-card gap-2">
          <Text size="md" bold className="text-foreground">
            Detail sesi belum tersedia
          </Text>
          <Text size="sm" className="text-muted-foreground">
            Pilih sesi dari daftar riwayat untuk melihat ringkasan lengkapnya.
          </Text>
        </Card>
      </ScrollView>
    );
  }
  const currentSession: SessionItem = session;

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
      {/* Top Header with Back Button (Wireframe RW2) */}
      <HStack space="xs" className="items-center -ml-3">
        <Pressable
          testID="btn-back-detail"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar sesi"
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <AppIcon icon={ArrowLeft} size={24} tone="foreground" />
        </Pressable>
        <Text size="md" bold className="text-foreground text-[17px] font-bold">
          Detail sesi
        </Text>
      </HStack>

      {/* Practitioner Card (Wireframe RW2) */}
      <Card
        testID="practitioner-info-card"
        className="border-[1.5px] border-border rounded-2xl p-4 bg-card gap-2.5"
      >
        <HStack space="md" className="items-center">
          <Box className="w-12 h-12 rounded-full border-[1.5px] border-dashed border-muted-foreground/60 items-center justify-center bg-muted/20">
            <AppIcon icon={User} size={22} tone="foreground" />
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="md" bold className="text-foreground text-[17px] font-bold">
              {currentSession.practitionerName}
            </Text>
            <Text size="sm" className="text-muted-foreground text-sm">
              {currentSession.practitionerSpecialization || "Praktisi Kesehatan Jiwa"}
            </Text>
          </VStack>
        </HStack>

        <Box className="self-start mt-1">
          <Badge
            variant="outline"
            className="border-2 border-foreground rounded-full px-2.5 py-0.5 bg-card"
          >
            <BadgeText className="text-foreground text-sm font-bold">
              Hasil tersedia
            </BadgeText>
          </Badge>
        </Box>
      </Card>

      {/* Session Details DL Card (Wireframe RW2) */}
      <Card className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
        <HStack space="sm" className="items-center justify-between p-4">
          <Text size="sm" className="text-muted-foreground text-sm">
            Tanggal
          </Text>
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            {currentSession.date}
          </Text>
        </HStack>

        <HStack space="sm" className="items-center justify-between p-4 border-t border-dashed border-border">
          <Text size="sm" className="text-muted-foreground text-sm">
            Durasi
          </Text>
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            50 menit
          </Text>
        </HStack>

        <HStack space="sm" className="items-center justify-between p-4 border-t border-dashed border-border">
          <Text size="sm" className="text-muted-foreground text-sm">
            Format
          </Text>
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            {currentSession.format || "Chat"}
          </Text>
        </HStack>

        <HStack space="sm" className="items-center justify-between p-4 border-t border-dashed border-border">
          <Text size="sm" className="text-muted-foreground text-sm">
            Total dibayar
          </Text>
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            Rp 150.000
          </Text>
        </HStack>
      </Card>

      {/* Action Buttons */}
      <VStack space="md" className="pt-1">
        {/* Primary Action Button */}
        <Button
          testID="btn-lihat-hasil"
          size="lg"
          onPress={onViewResults}
          className="h-[52px] w-full rounded-xl bg-foreground border-[1.5px] border-foreground items-center justify-center"
        >
          <ButtonText className="text-background text-base font-semibold">
            Lihat Hasil & Rencana Perawatan
          </ButtonText>
        </Button>

        {/* Secondary Action Button */}
        <Button
          testID="btn-jadwalkan-lanjutan"
          variant="outline"
          size="lg"
          onPress={onScheduleFollowUp}
          className="h-[52px] w-full rounded-xl border-[1.5px] border-foreground items-center justify-center bg-card"
        >
          <ButtonText className="text-foreground text-base font-semibold">
            Jadwalkan Sesi Lanjutan
          </ButtonText>
        </Button>

        {/* Problem / Refund Link */}
        <Pressable
          testID="btn-ajukan-refund"
          onPress={onRequestRefund}
          accessibilityRole="button"
          accessibilityLabel="Ada masalah dengan sesi ini? Ajukan pengembalian dana"
          className="items-center justify-center min-h-[44px] py-1"
        >
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            Ada masalah dengan sesi ini?
          </Text>
        </Pressable>
      </VStack>

      {/* Clinical Notice (Wireframe RW2) */}
      <Box className="border-[1.5px] border-dashed border-muted-foreground/60 rounded-xl p-4 bg-card/60">
        <Text size="sm" className="text-muted-foreground text-sm leading-relaxed">
          Tidak ada tombol cari ulang: sesi lanjutan memakai psikolog yang sama.
        </Text>
      </Box>
    </ScrollView>
  );
}

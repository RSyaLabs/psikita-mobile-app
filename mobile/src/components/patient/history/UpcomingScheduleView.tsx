import React from "react";
import { ArrowLeft, Calendar, Clock, ChevronRight, HelpCircle } from "lucide-react-native";
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

export interface UpcomingScheduleViewProps {
  onBack: () => void;
  onEnterSession: () => void;
  onReschedule: () => void;
  onPayPendingSession: () => void;
  onContactSupport: () => void;
}

export function UpcomingScheduleView({
  onBack,
  onEnterSession,
  onReschedule,
  onPayPendingSession,
  onContactSupport,
}: UpcomingScheduleViewProps) {
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
      {/* Top Header with Back Button (Wireframe RW3) */}
      <HStack space="xs" className="items-center -ml-3">
        <Pressable
          testID="btn-back-upcoming"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke sesi"
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <AppIcon icon={ArrowLeft} size={24} tone="foreground" />
        </Pressable>
        <Text size="md" bold className="text-foreground text-[17px] font-bold">
          Jadwal mendatang
        </Text>
      </HStack>

      {/* Confirmed Schedule Card (Wireframe RW3) */}
      <Card
        testID="confirmed-schedule-card"
        className="border-[2.5px] border-foreground rounded-2xl p-4 bg-card gap-2.5"
      >
        <Box className="self-start">
          <Badge
            variant="outline"
            className="border-2 border-foreground rounded-full px-2.5 py-0.5 bg-card"
          >
            <BadgeText className="text-foreground text-sm font-bold">
              Terkonfirmasi
            </BadgeText>
          </Badge>
        </Box>

        <VStack space="xs">
          <Text size="md" bold className="text-foreground text-[17px] font-bold">
            Belum ada jadwal terkonfirmasi
          </Text>
          <Text size="sm" className="text-muted-foreground text-sm">
            Jadwal sesi lanjutan yang sudah dibayar akan tampil di sini.
          </Text>
        </VStack>

        <VStack space="sm" className="pt-2">
          <Button
            testID="btn-masuk-sesi"
            size="lg"
            onPress={onEnterSession}
            className="h-[52px] w-full rounded-xl bg-foreground border-[1.5px] border-foreground items-center justify-center"
          >
            <ButtonText className="text-background text-base font-semibold">
              Masuk Sesi
            </ButtonText>
          </Button>

          <Button
            testID="btn-ubah-jadwal"
            variant="outline"
            size="lg"
            onPress={onReschedule}
            className="h-[52px] w-full rounded-xl border-[1.5px] border-foreground items-center justify-center bg-card"
          >
            <ButtonText className="text-foreground text-base font-semibold">
              Ubah Jadwal
            </ButtonText>
          </Button>
        </VStack>
      </Card>

      {/* Reschedule Policy Section (Wireframe RW3) */}
      <VStack space="xs">
        <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider font-bold">
          MENGUBAH JADWAL
        </Text>
        <Box className="border-[1.5px] border-dashed border-muted-foreground/60 rounded-xl p-3 bg-card/60">
          <Text size="sm" className="text-foreground text-sm leading-relaxed">
            Bisa diubah sampai 2 jam sebelum sesi, maksimal 2 kali. Setelah itu hubungi support.
          </Text>
        </Box>
      </VStack>

      {/* Sesi Berikutnya / Menunggu Pembayaran Section (Wireframe RW3) */}
      <VStack space="xs">
        <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider font-bold">
          SESI BERIKUTNYA
        </Text>
        <Card className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
          <Pressable
            testID="btn-bayar-pending"
            onPress={onPayPendingSession}
            accessibilityRole="button"
            accessibilityLabel="Bayar sesi mendatang"
            className="flex-row items-center justify-between min-h-[68px] px-4 py-3"
          >
            <VStack space="xs" className="flex-1 pr-3">
              <Text size="md" bold className="text-foreground text-[15px] font-bold">
                Belum ada pembayaran tertunda
              </Text>
              <Text size="sm" className="text-muted-foreground text-sm">
                Menunggu pembayaran · ketuk untuk melihat atau melanjutkan
              </Text>
            </VStack>
            <HStack space="xs" className="items-center">
              <Text size="sm" bold className="text-foreground font-semibold">
                Bayar ›
              </Text>
            </HStack>
          </Pressable>
        </Card>
      </VStack>

      {/* Help Link Footer */}
      <Box className="mt-auto pt-4 items-center">
        <Pressable
          testID="btn-bantuan-jadwal"
          onPress={onContactSupport}
          accessibilityRole="button"
          accessibilityLabel="Butuh bantuan soal jadwal?"
          className="items-center justify-center min-h-[44px] py-2"
        >
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            Butuh bantuan soal jadwal?
          </Text>
        </Pressable>
      </Box>
    </ScrollView>
  );
}

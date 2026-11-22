import React, { useState } from "react";
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

export interface PractitionerSessionLobbyViewProps {
  onEnterSession: (consultationId: string) => void;
  onCompleteResult: (consultationId: string) => void;
  onViewPendingPayment?: (consultationId: string) => void;
}

type SessionFilter = "today" | "upcoming" | "completed";

export function PractitionerSessionLobbyView({
  onEnterSession,
  onCompleteResult,
  onViewPendingPayment,
}: PractitionerSessionLobbyViewProps) {
  const [filter, setFilter] = useState<SessionFilter>("today");

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="xs" className="pt-2">
        <Heading size="2xl" bold className="text-foreground">
          Sesi
        </Heading>
      </VStack>

      {/* Filter Tabs */}
      <HStack space="sm" className="gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter Hari ini"
          onPress={() => setFilter("today")}
          className={`flex-1 min-h-[44px] items-center justify-center rounded-full border-2 ${
            filter === "today"
              ? "border-foreground bg-muted"
              : "border-border bg-card"
          }`}
        >
          <Text
            size="sm"
            bold={filter === "today"}
            className="text-foreground"
          >
            Hari ini
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter Mendatang"
          onPress={() => setFilter("upcoming")}
          className={`flex-1 min-h-[44px] items-center justify-center rounded-full border ${
            filter === "upcoming"
              ? "border-foreground bg-muted font-bold"
              : "border-border bg-card"
          }`}
        >
          <Text
            size="sm"
            bold={filter === "upcoming"}
            className="text-foreground"
          >
            Mendatang
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter Selesai"
          onPress={() => setFilter("completed")}
          className={`flex-1 min-h-[44px] items-center justify-center rounded-full border ${
            filter === "completed"
              ? "border-foreground bg-muted font-bold"
              : "border-border bg-card"
          }`}
        >
          <Text
            size="sm"
            bold={filter === "completed"}
            className="text-foreground"
          >
            Selesai
          </Text>
        </Pressable>
      </HStack>

      {/* Perlu Tindakan */}
      <VStack space="xs">
        <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          PERLU TINDAKAN
        </Heading>
        <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-2">
          <HStack className="justify-between items-center">
            <Box className="border border-foreground rounded-xl px-2.5 py-0.5 bg-muted">
              <Text size="sm" bold className="text-foreground">
                Hasil belum dikirim
              </Text>
            </Box>
            <Text size="sm" className="text-muted-foreground">
              Selesai 11:30
            </Text>
          </HStack>

          <Text size="md" bold className="text-foreground">
            Budi Santoso
          </Text>

          <Button
            className="h-[52px] w-full rounded-xl bg-foreground"
            onPress={() => onCompleteResult("pending-result-consultation-1")}
          >
            <ButtonText className="text-background font-semibold">
              Selesaikan Hasil
            </ButtonText>
          </Button>
        </Card>
      </VStack>

      {/* Jadwal */}
      <VStack space="xs">
        <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          JADWAL
        </Heading>
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Masuk sesi Siti Rahma"
            onPress={() => onEnterSession("active-consultation-siti")}
            className="flex-row items-center justify-between p-4 min-h-[68px] active:bg-muted/50"
          >
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="md" bold className="text-foreground">
                14:00 · Siti Rahma
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Sesi lanjutan · Chat
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              Masuk ›
            </Text>
          </Pressable>

          <Box className="border-t border-dashed border-border" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lihat jadwal Ahmad Fauzi"
            onPress={() => onViewPendingPayment?.("pending-payment-consultation-2")}
            className="flex-row items-center justify-between p-4 min-h-[68px] active:bg-muted/50"
          >
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="md" bold className="text-foreground">
                16:30 · Ahmad Fauzi
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Menunggu pasien membayar
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              Lihat ›
            </Text>
          </Pressable>
        </Box>
      </VStack>

      {/* Info Notice */}
      <Box className="border border-dashed border-border rounded-2xl p-4 bg-muted/40">
        <Text size="sm" className="text-muted-foreground leading-relaxed">
          Sesi berpindah ke Selesai setelah hasil terkirim.
        </Text>
      </Box>
    </ScrollView>
  );
}

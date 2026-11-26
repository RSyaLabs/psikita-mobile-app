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
  pendingResult?: {
    id: string;
    patientName: string;
    finishedTime: string;
  } | null;
  onEnterSession: (consultationId: string) => void;
  onCompleteResult: (consultationId: string) => void;
  onViewPendingPayment?: (consultationId: string) => void;
}

type SessionFilter = "today" | "upcoming" | "completed";

export function PractitionerSessionLobbyView({
  pendingResult = null,
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
        {!pendingResult ? (
          <Box className="border border-border rounded-2xl bg-card p-4">
            <Text size="sm" className="text-muted-foreground">
              Belum ada hasil sesi yang menunggu penyelesaian.
            </Text>
          </Box>
        ) : (
          <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-2">
            <HStack className="justify-between items-center">
              <Box className="border border-foreground rounded-xl px-2.5 py-0.5 bg-muted">
                <Text size="sm" bold className="text-foreground">
                  Hasil belum dikirim
                </Text>
              </Box>
              <Text size="sm" className="text-muted-foreground">
                Selesai {pendingResult.finishedTime}
              </Text>
            </HStack>

            <Text size="md" bold className="text-foreground">
              {pendingResult.patientName}
            </Text>

            <Button
              className="h-[52px] w-full rounded-xl bg-foreground"
              onPress={() => onCompleteResult(pendingResult.id)}
            >
              <ButtonText className="text-background font-semibold">
                Selesaikan Hasil
              </ButtonText>
            </Button>
          </Card>
        )}
      </VStack>

      {/* Jadwal */}
      <VStack space="xs">
        <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          JADWAL
        </Heading>
        <Box className="border border-border rounded-2xl bg-card p-4">
          <Text size="sm" className="text-muted-foreground">
            Belum ada jadwal sesi mendatang hari ini.
          </Text>
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

import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MessageSquare, User } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, Button, ButtonText, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface WeeklyScheduleViewProps {
  onBack: () => void;
  onOpenAvailability: () => void;
  onEnterSession?: (sessionId: string) => void;
  onViewCase?: (caseId: string) => void;
}

export const WeeklyScheduleView = React.memo(function WeeklyScheduleView({
  onBack,
  onOpenAvailability,
  onEnterSession,
  onViewCase,
}: WeeklyScheduleViewProps) {
  const [activePeriod, setActivePeriod] = useState<"week" | "month">("week");

  return (
    <VStack className="flex-1 bg-background">
      <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
        <Pressable onPress={() => { haptics.selection(); onBack(); }} accessibilityRole="button" accessibilityLabel="Kembali" className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted">
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>
        <Text size="lg" bold className="text-foreground ml-1">Jadwal</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <VStack space="md">
          <HStack space="sm">
            {(["week", "month"] as const).map((period) => {
              const isSelected = activePeriod === period;
              return (
                <Pressable key={period} onPress={() => { haptics.selection(); setActivePeriod(period); }} accessibilityRole="button" accessibilityState={{ selected: isSelected }} className={`flex-1 py-2.5 items-center justify-center rounded-full border ${isSelected ? "bg-muted border-primary" : "bg-card border-border"}`}>
                  <Text size="sm" bold={isSelected} className={isSelected ? "text-primary font-bold" : "text-foreground font-medium"}>
                    {period === "week" ? "Minggu ini" : "Bulan ini"}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">SENIN 23 NOV</Text>
            <Box className="border border-border bg-card rounded-2xl p-4 flex-row items-center justify-between">
              <HStack space="sm" className="items-center flex-1 pr-2">
                <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <User size={18} color="#4A3B6B" />
                </Box>
                <VStack className="flex-1">
                  <Text size="md" bold className="text-foreground">09.00 · Rina Kusuma</Text>
                  <HStack space="xs" className="items-center mt-0.5">
                    <MessageSquare size={14} color="#75618E" />
                    <Text size="sm" className="text-muted-foreground font-medium">Sesi lanjutan · Chat</Text>
                  </HStack>
                </VStack>
              </HStack>
              <Pressable onPress={() => { haptics.selection(); if (onEnterSession) onEnterSession("session-101"); }} accessibilityRole="button" accessibilityLabel="Masuk sesi bersama Rina Kusuma" className="bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg active:opacity-80">
                <HStack space="xs" className="items-center">
                  <Text size="sm" bold className="text-primary font-semibold">Masuk</Text>
                  <ChevronRight size={14} color="#4A3B6B" />
                </HStack>
              </Pressable>
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">SELASA 24 NOV</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Box className="p-4 flex-row items-center justify-between">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center">
                    <Clock size={18} color="#D97706" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">13.00 · Budi Santoso</Text>
                    <Text size="sm" className="text-amber-600 font-medium">Menunggu pembayaran</Text>
                  </VStack>
                </HStack>
                <Pressable onPress={() => { haptics.selection(); if (onViewCase) onViewCase("case-202"); }} accessibilityRole="button" accessibilityLabel="Lihat kasus Budi Santoso" className="bg-muted px-3 py-1.5 rounded-lg active:opacity-80">
                  <HStack space="xs" className="items-center">
                    <Text size="sm" bold className="text-foreground font-semibold">Lihat</Text>
                    <ChevronRight size={14} color="#262130" />
                  </HStack>
                </Pressable>
              </Box>

              <Box className="p-4 flex-row items-center justify-between border-t border-dashed border-border bg-muted/20">
                <HStack space="sm" className="items-center flex-1">
                  <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                    <Calendar size={18} color="#75618E" />
                  </Box>
                  <VStack>
                    <Text size="md" bold className="text-foreground">15.00</Text>
                    <Text size="sm" className="text-muted-foreground font-medium">Slot kosong</Text>
                  </VStack>
                </HStack>
                <Text size="sm" className="text-muted-foreground italic">Tersedia</Text>
              </Box>
            </Box>
          </VStack>

          <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
            <Text size="sm" className="text-foreground font-medium leading-relaxed">
              Perubahan jadwal oleh pasien muncul sebagai notifikasi.
            </Text>
          </Box>

          <Button variant="outline" onPress={() => { haptics.selection(); onOpenAvailability(); }} accessibilityRole="button" accessibilityLabel="Atur Ketersediaan" className="border-primary/40 bg-card h-12 rounded-xl mt-2 active:opacity-90">
            <ButtonText className="text-primary font-bold text-base">Atur Ketersediaan</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </VStack>
  );
});

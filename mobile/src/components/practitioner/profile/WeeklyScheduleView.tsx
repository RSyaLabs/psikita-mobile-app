import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, MessageSquare, User } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, Button, ButtonText, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface ScheduleAppointmentItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  patientName: string;
  subtitle: string;
  status: "confirmed" | "pending_payment";
}

export interface WeeklyScheduleViewProps {
  appointments?: ScheduleAppointmentItem[];
  onBack: () => void;
  onOpenAvailability: () => void;
  onEnterSession?: (sessionId: string) => void;
  onViewCase?: (caseId: string) => void;
}

export const WeeklyScheduleView = React.memo(function WeeklyScheduleView({
  appointments = [],
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

          {appointments.length === 0 ? (
            <Box className="border border-border bg-card rounded-2xl p-4">
              <HStack space="sm" className="items-center">
                <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                  <Calendar size={18} color="#75618E" />
                </Box>
                <VStack className="flex-1">
                  <Text size="md" bold className="text-foreground">Slot kosong</Text>
                  <Text size="sm" className="text-muted-foreground">Belum ada sesi terjadwal untuk periode ini.</Text>
                </VStack>
              </HStack>
            </Box>
          ) : (
            appointments.map((apt) => (
              <VStack key={apt.id} space="xs">
                <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">{apt.dayLabel}</Text>
                <Box className="border border-border bg-card rounded-2xl p-4 flex-row items-center justify-between">
                  <HStack space="sm" className="items-center flex-1 pr-2">
                    <Box className={`w-10 h-10 rounded-xl items-center justify-center ${apt.status === "confirmed" ? "bg-primary/10" : "bg-amber-500/10"}`}>
                      {apt.status === "confirmed" ? <User size={18} color="#4A3B6B" /> : <Clock size={18} color="#D97706" />}
                    </Box>
                    <VStack className="flex-1">
                      <Text size="md" bold className="text-foreground">{apt.timeLabel} · {apt.patientName}</Text>
                      <HStack space="xs" className="items-center mt-0.5">
                        {apt.status === "confirmed" && <MessageSquare size={14} color="#75618E" />}
                        <Text size="sm" className={apt.status === "confirmed" ? "text-muted-foreground font-medium" : "text-amber-600 font-medium"}>{apt.subtitle}</Text>
                      </HStack>
                    </VStack>
                  </HStack>
                  <Pressable
                    onPress={() => {
                      haptics.selection();
                      if (apt.status === "confirmed") onEnterSession?.(apt.id);
                      else onViewCase?.(apt.id);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={apt.status === "confirmed" ? `Masuk sesi bersama ${apt.patientName}` : `Lihat kasus ${apt.patientName}`}
                    className={apt.status === "confirmed" ? "bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg active:opacity-80" : "bg-muted px-3 py-1.5 rounded-lg active:opacity-80"}
                  >
                    <HStack space="xs" className="items-center">
                      <Text size="sm" bold className={apt.status === "confirmed" ? "text-primary font-semibold" : "text-foreground font-semibold"}>
                        {apt.status === "confirmed" ? "Masuk" : "Lihat"}
                      </Text>
                      <ChevronRight size={14} color={apt.status === "confirmed" ? "#4A3B6B" : "#262130"} />
                    </HStack>
                  </Pressable>
                </Box>
              </VStack>
            ))
          )}

          <Box className="border border-border bg-card rounded-2xl overflow-hidden">
            <Box className="p-4 flex-row items-center justify-between bg-muted/20">
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

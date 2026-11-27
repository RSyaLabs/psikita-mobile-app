import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MessageSquare, Video } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, Button, ButtonText, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface DaySchedule {
  day: string;
  hours: string;
  isActive: boolean;
}

export interface DailyAvailabilityViewProps {
  onBack: () => void;
  onEditDay: (day: string) => void;
  onSave?: (availability: {
    isReady: boolean;
    chatEnabled: boolean;
    videoEnabled: boolean;
    schedules: DaySchedule[];
  }) => boolean | void | Promise<boolean | void>;
  initialReady?: boolean;
  initialSchedules?: DaySchedule[];
}

const DEFAULT_SCHEDULES: DaySchedule[] = [
  { day: "Senin", hours: "09.00 - 17.00", isActive: true },
  { day: "Selasa", hours: "09.00 - 17.00", isActive: true },
  { day: "Rabu", hours: "09.00 - 17.00", isActive: true },
  { day: "Kamis", hours: "09.00 - 17.00", isActive: true },
  { day: "Jumat", hours: "09.00 - 17.00", isActive: true },
];

function SwitchPill({ checked }: { checked: boolean }) {
  return (
    <Box className={`w-12 h-7 rounded-full p-0.5 justify-center ${checked ? "bg-primary items-end" : "bg-muted-foreground/30 items-start"}`}>
      <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
    </Box>
  );
}

export const DailyAvailabilityView = React.memo(function DailyAvailabilityView({
  onBack,
  onEditDay,
  onSave,
  initialReady = true,
  initialSchedules,
}: DailyAvailabilityViewProps) {
  const [isReady, setIsReady] = useState(initialReady);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const schedules =
    initialSchedules && initialSchedules.length > 0
      ? initialSchedules
      : DEFAULT_SCHEDULES;

  const handleSave = async () => {
    haptics.success();
    const result = onSave
      ? await onSave({ isReady, chatEnabled, videoEnabled, schedules })
      : true;
    if (result !== false) {
      onBack();
    }
  };

  return (
    <VStack className="flex-1 bg-background">
      <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
        <Pressable onPress={() => { haptics.selection(); onBack(); }} accessibilityRole="button" accessibilityLabel="Kembali ke akun praktisi" className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted">
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>
        <Text size="lg" bold className="text-foreground ml-1">Ketersediaan</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <VStack space="md">
          <Pressable onPress={() => { haptics.selection(); setIsReady((prev) => !prev); }} accessibilityRole="switch" accessibilityState={{ checked: isReady }} accessibilityLabel="Siap menerima kasus" className="border border-border bg-card rounded-2xl p-4 flex-row items-center justify-between active:opacity-90">
            <VStack className="flex-1 pr-3">
              <Text size="md" bold className="text-foreground">Siap menerima kasus</Text>
              <Text size="sm" className="text-muted-foreground mt-0.5">Kasus baru masuk saat aktif</Text>
            </VStack>
            <SwitchPill checked={isReady} />
          </Pressable>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">JAM PRAKTIK</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              {schedules.map((item, idx) => (
                <Pressable key={item.day} onPress={() => { haptics.selection(); onEditDay(item.day); }} accessibilityRole="button" accessibilityLabel={`Ubah jam praktik hari ${item.day}`} className={`p-4 flex-row items-center justify-between active:bg-muted ${idx > 0 ? "border-t border-dashed border-border" : ""}`}>
                  <HStack space="sm" className="items-center flex-1">
                    <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                      <Clock size={16} color="#4A3B6B" />
                    </Box>
                    <VStack>
                      <Text size="md" bold className="text-foreground">{item.day}</Text>
                      <Text size="sm" className="text-muted-foreground">{item.hours}</Text>
                    </VStack>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <Text size="sm" bold className="text-primary font-semibold">Ubah</Text>
                    <ChevronRight size={16} color="#4A3B6B" />
                  </HStack>
                </Pressable>
              ))}
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">FORMAT LAYANAN</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Pressable onPress={() => { haptics.selection(); setChatEnabled((prev) => !prev); }} accessibilityRole="switch" accessibilityState={{ checked: chatEnabled }} accessibilityLabel="Layanan Chat" className="p-4 flex-row items-center justify-between active:bg-muted">
                <HStack space="sm" className="items-center flex-1">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <MessageSquare size={16} color="#4A3B6B" />
                  </Box>
                  <Text size="md" bold className="text-foreground">Chat</Text>
                </HStack>
                <SwitchPill checked={chatEnabled} />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); setVideoEnabled((prev) => !prev); }} accessibilityRole="switch" accessibilityState={{ checked: videoEnabled }} accessibilityLabel="Layanan Video" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Video size={16} color="#4A3B6B" />
                  </Box>
                  <Text size="md" bold className="text-foreground">Video</Text>
                </HStack>
                <SwitchPill checked={videoEnabled} />
              </Pressable>
            </Box>
          </VStack>

          <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
            <Text size="sm" className="text-foreground font-medium leading-relaxed">
              Mengubah jam tidak membatalkan sesi yang sudah dijadwalkan.
            </Text>
          </Box>

          <Button onPress={handleSave} accessibilityRole="button" accessibilityLabel="Simpan pengaturan ketersediaan" className="bg-primary h-12 rounded-xl mt-2 active:opacity-90">
            <ButtonText className="text-white font-bold text-base">Simpan</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </VStack>
  );
});

import React from "react";
import { ArrowLeft, ChevronRight, AlertCircle } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface ConsultationResultViewProps {
  dateLabel?: string;
  practitionerName?: string;
  doctorNotes?: string;
  carePlanItems?: string[];
  followUpDeadline?: string;
  onBack: () => void;
  onViewFullCarePlan?: () => void;
  onViewFollowUpDetail?: () => void;
  onSelectFollowUpSchedule?: () => void;
  onOpenCrisisHelp?: () => void;
}

export function ConsultationResultView({
  dateLabel = "22 November 2026",
  practitionerName = "Dr. Sarah Jenkins, Sp.KJ",
  doctorNotes = "Pertahankan teknik relaksasi pernapasan 4-7-8 setiap sebelum tidur. Jadwalkan waktu istirahat teratur dan kurangi stimulasi layar 1 jam sebelum beristirahat.",
  carePlanItems = [
    "Latihan pernapasan diafragma 10 menit setiap pagi dan malam",
    "Jurnal harian pemicu rasa cemas dan catatan pola tidur",
    "Jalan kaki santai 20 menit saat sore hari tanpa gawai",
  ],
  followUpDeadline = "29 November 2026",
  onBack,
  onViewFullCarePlan,
  onViewFollowUpDetail,
  onSelectFollowUpSchedule,
  onOpenCrisisHelp,
}: ConsultationResultViewProps) {
  return (
    <Box className="flex-1 bg-background max-w-[640px] md:max-w-[720px] self-center w-full">
      {/* Header */}
      <Box className="px-5 pt-4 pb-3 border-b border-border bg-card">
        <HStack space="sm" className="items-center">
          <Pressable
            onPress={() => {
              haptics.light();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-foreground text-lg">
            Hasil konsultasi
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Date */}
        <VStack space="xs">
          <Heading className="text-2xl font-bold text-foreground">
            Ringkasan sesimu
          </Heading>
          <Text className="text-sm font-medium text-muted-foreground">
            {dateLabel} · {practitionerName}
          </Text>
        </VStack>

        {/* Section 1: Saran dari Psikolog */}
        <Box className="border border-border rounded-2xl p-4 bg-card">
          <VStack space="xs">
            <Text className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
              SARAN DARI PSIKOLOG
            </Text>
            <Text className="text-[15px] text-foreground leading-relaxed mt-1">
              {doctorNotes}
            </Text>
          </VStack>
        </Box>

        {/* Section 2: Rencana Perawatan */}
        <VStack space="xs">
          <Text className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
            RENCANA PERAWATAN
          </Text>

          <Box className="border border-border rounded-2xl bg-card overflow-hidden mt-1">
            {carePlanItems.map((item, idx) => (
              <HStack
                key={idx}
                space="sm"
                className={`p-4 items-start ${
                  idx > 0 ? "border-t border-dashed border-border" : ""
                }`}
              >
                <Text className="text-[15px] text-primary font-bold leading-relaxed">
                  •
                </Text>
                <Text className="text-[15px] text-foreground leading-relaxed flex-1">
                  {item}
                </Text>
              </HStack>
            ))}
          </Box>

          {onViewFullCarePlan && (
            <Pressable
              onPress={() => {
                haptics.selection();
                onViewFullCarePlan();
              }}
              accessibilityRole="button"
              accessibilityLabel="Lihat rencana lengkap"
              className="min-h-[44px] flex-row items-center py-2 active:opacity-70"
            >
              <Text className="text-[15px] font-semibold text-primary">
                Lihat rencana lengkap
              </Text>
              <ChevronRight size={16} color="#4A3B6B" />
            </Pressable>
          )}
        </VStack>

        {/* Section 3: Saran Sesi Lanjutan */}
        <Box className="border-[2.5px] border-primary rounded-2xl p-5 bg-card">
          <VStack space="xs">
            <Heading size="md" bold className="text-foreground text-lg">
              Psikolog menyarankan sesi lanjutan
            </Heading>
            <Text className="text-sm text-muted-foreground leading-relaxed mt-1">
              Dengan psikolog yang sama. Jadwal bisa dipesan sampai {followUpDeadline}.
            </Text>

            {onViewFollowUpDetail && (
              <Pressable
                onPress={() => {
                  haptics.selection();
                  onViewFollowUpDetail();
                }}
                accessibilityRole="button"
                accessibilityLabel="Lihat detail rekomendasi"
                className="min-h-[44px] flex-row items-center py-1 active:opacity-70"
              >
                <Text className="text-[15px] font-semibold text-primary">
                  Lihat detail rekomendasi
                </Text>
                <ChevronRight size={16} color="#4A3B6B" />
              </Pressable>
            )}

            <Button
              size="lg"
              onPress={() => {
                haptics.selection();
                onSelectFollowUpSchedule?.();
              }}
              className="mt-3 w-full h-[52px] bg-primary rounded-xl items-center justify-center active:opacity-90"
              accessibilityRole="button"
              accessibilityLabel="Pilih Jadwal Lanjutan"
            >
              <ButtonText className="text-primary-foreground font-semibold text-base">
                Pilih Jadwal Lanjutan
              </ButtonText>
            </Button>
          </VStack>
        </Box>

        {/* Emergency Disclaimer & Help Link */}
        <VStack space="xs" className="pt-2 pb-6">
          <Pressable
            onPress={() => {
              haptics.selection();
              onOpenCrisisHelp?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Merasa memburuk? Lihat bantuan segera"
            className="min-h-[44px] flex-row items-center py-1 active:opacity-70"
          >
            <AlertCircle size={18} color="#4A3B6B" className="mr-1.5" />
            <Text className="text-sm font-semibold text-primary">
              Merasa memburuk? Lihat bantuan segera
            </Text>
          </Pressable>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Hasil ini bukan pengganti penanganan darurat.
          </Text>
        </VStack>
      </ScrollView>
    </Box>
  );
}

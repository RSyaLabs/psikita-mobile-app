import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronLeft, Lock } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";
import { MatchingOfferItem } from "./NewCaseListView";

interface CaseSummaryViewProps {
  caseData?: MatchingOfferItem;
  onBack?: () => void;
  onAcceptCase?: () => void;
}

export function CaseSummaryView({
  caseData,
  onBack,
  onAcceptCase,
}: CaseSummaryViewProps) {
  const remaining = caseData?.remainingTime || "02:10";
  const urgency = caseData?.urgency || "Mendesak";
  const waitingMinutes = caseData?.waitingMinutes || 6;
  const functional = caseData?.functionalImpact || "Sulit tidur hampir setiap minggu, mulai mengganggu pekerjaan.";

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="case-summary-scroll"
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between -ml-3">
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke daftar kasus"
            testID="btn-back-to-offers"
            onPress={() => { haptics.light(); onBack?.(); }}
            className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
          >
            <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
          </Pressable>
          <Text className="text-[17px] font-bold text-[#222222]">Ringkasan kasus</Text>
        </View>
        <View className="border-2 border-[#222222] rounded-xl px-2.5 py-0.5 -mr-3">
          <Text className="text-sm font-bold text-[#222222]">Sisa {remaining}</Text>
        </View>
      </View>

      {/* Urgency & Waiting Pill */}
      <View className="flex-row items-center gap-2">
        <View className="border-[1.5px] border-[#222222] rounded-xl px-2.5 py-0.5">
          <Text className="text-sm font-bold text-[#222222]">{urgency}</Text>
        </View>
        <Text className="text-sm text-[#555555]">Menunggu {waitingMinutes} menit</Text>
      </View>

      {/* Section: Keluhan Utama */}
      <View className="gap-2">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">KELUHAN UTAMA</Text>
        <View className="flex-row gap-2 flex-wrap">
          <View className="border-[1.5px] border-[#333333] rounded-xl px-3 py-1 bg-white">
            <Text className="text-sm text-[#222222]">Kecemasan</Text>
          </View>
          <View className="border-[1.5px] border-[#333333] rounded-xl px-3 py-1 bg-white">
            <Text className="text-sm text-[#222222]">Gangguan tidur</Text>
          </View>
        </View>
      </View>

      {/* Details Box */}
      <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
        <View className="gap-1 p-3.5">
          <Text className="text-sm text-[#555555]">Dampak fungsional</Text>
          <Text className="text-[15px] text-[#222222]">{functional}</Text>
        </View>
        <View className="border-t border-dashed border-[#999999] gap-1 p-3.5">
          <Text className="text-sm text-[#555555]">Kompetensi dibutuhkan</Text>
          <Text className="text-[15px] text-[#222222]">Psikologi klinis dewasa</Text>
        </View>
        <View className="border-t border-dashed border-[#999999] gap-1 p-3.5">
          <Text className="text-sm text-[#555555]">Format layanan</Text>
          <Text className="text-[15px] text-[#222222]">Chat atau Panggilan Video</Text>
        </View>
      </View>

      {/* Privacy Notice */}
      <View className="flex-row items-start gap-2.5 border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-stone-50/60">
        <AppIcon icon={Lock} size={18} tone="foreground" />
        <Text className="flex-1 text-sm leading-relaxed text-[#333333]">
          Identitas dan jawaban lengkap pasien baru terlihat setelah kamu menerima kasus.
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="mt-auto gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Terima Kasus"
          testID="btn-accept-case"
          onPress={() => { haptics.success(); onAcceptCase?.(); }}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-white">Terima Kasus</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke daftar"
          testID="btn-cancel-summary"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="min-h-[44px] items-center justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Kembali ke daftar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

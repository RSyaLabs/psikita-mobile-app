import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Check } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface CaseAcceptedViewProps {
  patientName?: string;
  isPaid?: boolean;
  onViewPatientContext?: () => void;
  onEnterSession?: () => void;
  onBackToCases?: () => void;
}

export function CaseAcceptedView({
  patientName = "Pasien SeraPhany",
  isPaid = false,
  onViewPatientContext,
  onEnterSession,
  onBackToCases,
}: CaseAcceptedViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="case-accepted-scroll"
    >
      {/* Hero Success Badge */}
      <View className="items-center gap-2.5 mt-10 text-center">
        <View
          aria-hidden={true}
          className="w-[72px] h-[72px] border-[2.5px] border-[#222222] rounded-full items-center justify-center bg-white"
        >
          <AppIcon icon={Check} size={32} tone="foreground" />
        </View>
        <Text className="text-[26px] font-bold text-[#222222] mt-1.5">Kasus diterima</Text>
        <Text className="text-[15px] leading-relaxed text-[#555555]">
          Kasus ini sekarang ditugaskan kepadamu.
        </Text>
      </View>

      {/* Patient Section */}
      <View className="border-[1.5px] border-[#333333] rounded-[14px] p-4 gap-1.5 bg-white">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">PASIEN</Text>
        <Text className="text-[17px] font-bold text-[#222222]">{patientName}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat konteks klinis lengkap"
          testID="btn-view-patient-context"
          onPress={() => { haptics.selection(); onViewPatientContext?.(); }}
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Lihat konteks klinis lengkap ›</Text>
        </Pressable>
      </View>

      {/* Stepper Status List */}
      <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
        {/* Step 1 */}
        <View className="flex-row items-center gap-3 p-3.5">
          <View className="w-6 h-6 rounded-full bg-[#222222] items-center justify-center">
            <AppIcon icon={Check} size={14} tone="white" />
          </View>
          <Text className="text-[15px] font-bold text-[#222222]">Kasus ditugaskan kepadamu</Text>
        </View>

        {/* Step 2 */}
        <View className="flex-row items-center gap-3 p-3.5 border-t border-dashed border-[#999999]">
          <View className="w-6 h-6 rounded-full border-[2.5px] border-[#222222]" />
          <Text className="text-[15px] font-bold text-[#222222]">Menunggu pasien membayar</Text>
        </View>

        {/* Step 3 */}
        <View className="flex-row items-center gap-3 p-3.5 border-t border-dashed border-[#999999]">
          <View className="w-6 h-6 rounded-full border-[1.5px] border-dashed border-[#777777]" />
          <Text className="text-[15px] text-[#555555]">Sesi siap dimulai</Text>
        </View>
      </View>

      {/* Enter Session CTA */}
      <View className="gap-1.5 mt-auto">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Masuk Sesi"
          accessibilityState={{ disabled: !isPaid }}
          testID="btn-enter-session"
          disabled={!isPaid}
          onPress={() => {
            if (isPaid) {
              haptics.success();
              onEnterSession?.();
            }
          }}
          className={`h-[52px] rounded-[10px] items-center justify-center ${
            isPaid
              ? "bg-[#222222] border-[1.5px] border-[#222222] active:opacity-90"
              : "border-[1.5px] border-dashed border-[#777777] bg-[#f2f2f2]"
          }`}
        >
          <Text
            className={`text-[16px] font-semibold ${
              isPaid ? "text-white" : "text-[#555555]"
            }`}
          >
            Masuk Sesi
          </Text>
        </Pressable>
        <Text className="text-sm text-center text-[#555555]">
          Aktif setelah pembayaran pasien terkonfirmasi.
        </Text>
      </View>

      {/* Back to Cases */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke Kasus Saya"
        testID="btn-back-to-cases"
        onPress={() => { haptics.light(); onBackToCases?.(); }}
        className="min-h-[44px] items-center justify-center active:opacity-70 -mt-2"
      >
        <Text className="text-[15px] font-semibold text-[#222222]">Kembali ke Kasus Saya</Text>
      </Pressable>
    </ScrollView>
  );
}

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { haptics } from "@/utils/haptics";

interface OfferExpiredViewProps {
  onViewOtherOffers?: () => void;
  onBackToDashboard?: () => void;
}

export function OfferExpiredView({
  onViewOtherOffers,
  onBackToDashboard,
}: OfferExpiredViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="offer-expired-scroll"
    >
      <View className="items-center gap-2.5 mt-14 text-center">
        <View
          aria-hidden={true}
          className="w-[72px] h-[72px] border-[2.5px] border-dashed border-[#222222] rounded-full items-center justify-center bg-white"
        >
          <Text className="text-sm font-bold text-[#222222]">00:00</Text>
        </View>
        <Text className="text-[26px] font-bold text-[#222222] mt-1.5">Waktu penawaran habis</Text>
        <Text className="text-[15px] leading-relaxed text-[#555555] text-center">
          Kasus ini diteruskan ke psikolog lain. Kamu tidak perlu melakukan apa pun.
        </Text>
      </View>

      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-stone-50/60 mt-4">
        <Text className="text-sm leading-relaxed text-[#333333]">
          Kasus lain bisa datang kapan saja selama status kamu siap menerima kasus.
        </Text>
      </View>

      <View className="mt-auto gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat Kasus Lain"
          testID="btn-expired-view-other-offers"
          onPress={() => { haptics.medium(); onViewOtherOffers?.(); }}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-white">Lihat Kasus Lain</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ke Beranda"
          testID="btn-expired-back-dashboard"
          onPress={() => { haptics.light(); onBackToDashboard?.(); }}
          className="min-h-[44px] items-center justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Ke Beranda</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

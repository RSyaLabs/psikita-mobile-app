import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

export interface MatchingOfferItem {
  id: string;
  urgency: "Mendesak" | "Sedang" | "Terjadwal";
  remainingTime: string;
  chiefComplaint: string;
  functionalImpact: string;
  waitingMinutes?: number;
}

interface NewCaseListViewProps {
  offers?: MatchingOfferItem[];
  onBack?: () => void;
  onSelectOffer?: (offer: MatchingOfferItem) => void;
}

const DEFAULT_OFFERS: MatchingOfferItem[] = [
  {
    id: "off-1",
    urgency: "Mendesak",
    remainingTime: "02:10",
    chiefComplaint: "Kecemasan · Gangguan tidur",
    functionalImpact: "Sulit tidur hampir setiap minggu, mulai mengganggu pekerjaan.",
    waitingMinutes: 6,
  },
  {
    id: "off-2",
    urgency: "Sedang",
    remainingTime: "08:40",
    chiefComplaint: "Tekanan Kerja & Kelelahan",
    functionalImpact: "Sulit konsentrasi dan merasa kewalahan dengan beban kerja.",
    waitingMinutes: 2,
  },
  {
    id: "off-3",
    urgency: "Terjadwal",
    remainingTime: "14:00",
    chiefComplaint: "Konsultasi Hubungan Keluarga",
    functionalImpact: "Butuh pendampingan resolusi konflik dan komunikasi sehat.",
  },
];

export function NewCaseListView({
  offers = DEFAULT_OFFERS,
  onBack,
  onSelectOffer,
}: NewCaseListViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 12 }}
      showsVerticalScrollIndicator={false}
      testID="new-case-list-scroll"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between -ml-3">
        <View className="flex-row items-center gap-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            testID="btn-back-to-dashboard"
            onPress={() => { haptics.light(); onBack?.(); }}
            className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
          >
            <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
          </Pressable>
          <Text className="text-[17px] font-bold text-[#222222]">Kasus baru</Text>
        </View>
        <View className="border-[1.5px] border-[#333333] rounded-xl px-2.5 py-0.5 -mr-3">
          <Text className="text-sm font-semibold text-[#222222]">Siap</Text>
        </View>
      </View>

      {/* Notice Banner */}
      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#333333]">
          Data lengkap pasien baru terlihat setelah kamu menerima kasus. Daftar ini diperbarui otomatis.
        </Text>
      </View>

      {/* Offers Cards */}
      {offers.map((item, idx) => {
        const isUrgent = item.urgency === "Mendesak";
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.urgency}, ${item.chiefComplaint}`}
            testID={`btn-offer-item-${idx}`}
            onPress={() => {
              haptics.selection();
              onSelectOffer?.(item);
            }}
            className={`flex-col gap-2 rounded-2xl p-4 bg-white active:bg-stone-50 ${
              isUrgent ? "border-[2.5px] border-[#222222]" : "border-[1.5px] border-[#333333]"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="border-[1.5px] border-[#222222] rounded-xl px-2.5 py-0.5">
                <Text className="text-sm font-bold text-[#222222]">{item.urgency}</Text>
              </View>
              <Text className="text-sm font-bold text-[#222222]">Sisa {item.remainingTime}</Text>
            </View>
            <Text className="text-[16px] font-bold text-[#222222]">{item.chiefComplaint}</Text>
            <Text className="text-sm leading-snug text-[#555555]">{item.functionalImpact}</Text>
            {item.waitingMinutes ? (
              <Text className="text-sm text-[#555555]">Menunggu {item.waitingMinutes} menit</Text>
            ) : null}
          </Pressable>
        );
      })}

      {/* Other Cases Claimed Notice */}
      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60 mt-1">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Kasus lain sudah diambil psikolog lain dan dihapus dari daftar.
        </Text>
      </View>

      {/* Return to Beranda Action */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke Beranda"
        testID="btn-bottom-return-dashboard"
        onPress={() => { haptics.light(); onBack?.(); }}
        className="min-h-[44px] items-center justify-center mt-auto active:opacity-70"
      >
        <Text className="text-[15px] font-semibold text-[#222222]">Kembali ke Beranda</Text>
      </Pressable>
    </ScrollView>
  );
}

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { haptics } from "@/utils/haptics";

interface MyCaseItem {
  id: string;
  patientName: string;
  complaint: string;
  statusText: string;
  actionText: string;
  actionType: "session" | "view" | "fill" | "follow-up";
}

interface MyCasesListViewProps {
  cases?: MyCaseItem[];
  onOpenSession?: (id: string) => void;
  onOpenDiagnosis?: (id: string) => void;
  onGoToNewOffers?: () => void;
}

export function MyCasesListView({
  cases = [],
  onOpenSession,
  onOpenDiagnosis,
  onGoToNewOffers,
}: MyCasesListViewProps) {
  const [filter, setFilter] = useState<"aktif" | "selesai">("aktif");

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="my-cases-list-scroll"
    >
      {/* Header */}
      <View className="pt-2 gap-0.5">
        <Text className="text-[26px] font-bold text-[#222222]">Kasus</Text>
        <Text className="text-[15px] text-[#555555]">Semua kasus yang kamu pegang.</Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row gap-2">
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Kasus Aktif"
          accessibilityState={{ selected: filter === "aktif" }}
          testID="tab-cases-active"
          onPress={() => { haptics.selection(); setFilter("aktif"); }}
          className={`flex-1 min-h-[44px] rounded-full items-center justify-center ${
            filter === "aktif"
              ? "border-2 border-[#222222] bg-[#eeeeee]"
              : "border-[1.5px] border-[#333333] bg-white"
          }`}
        >
          <Text
            className={`text-sm ${
              filter === "aktif" ? "font-bold text-[#222222]" : "text-[#555555]"
            }`}
          >
            Aktif
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Kasus Selesai"
          accessibilityState={{ selected: filter === "selesai" }}
          testID="tab-cases-completed"
          onPress={() => { haptics.selection(); setFilter("selesai"); }}
          className={`flex-1 min-h-[44px] rounded-full items-center justify-center ${
            filter === "selesai"
              ? "border-2 border-[#222222] bg-[#eeeeee]"
              : "border-[1.5px] border-[#333333] bg-white"
          }`}
        >
          <Text
            className={`text-sm ${
              filter === "selesai" ? "font-bold text-[#222222]" : "text-[#555555]"
            }`}
          >
            Selesai
          </Text>
        </Pressable>
      </View>

      {/* Cases List */}
      <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
        {cases.map((item, idx) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.patientName}, ${item.complaint}, ${item.statusText}`}
            testID={`btn-case-row-${idx}`}
            onPress={() => {
              haptics.selection();
              if (item.actionType === "session") onOpenSession?.(item.id);
              else if (item.actionType === "fill") onOpenDiagnosis?.(item.id);
            }}
            className={`flex-row items-center justify-between min-h-[72px] px-4 py-2.5 active:bg-stone-50 ${
              idx > 0 ? "border-t border-dashed border-[#999999]" : ""
            }`}
          >
            <View className="flex-1 mr-2.5">
              <Text className="text-[15px] font-bold text-[#222222]">{item.patientName}</Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                {item.complaint} · {item.statusText}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-[#222222]">{item.actionText}</Text>
          </Pressable>
        ))}
      </View>

      {/* Info Notice Box */}
      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#333333]">
          Kasus baru ada di{" "}
          <Text
            onPress={() => { haptics.selection(); onGoToNewOffers?.(); }}
            className="font-bold underline text-[#222222]"
          >
            Kasus baru
          </Text>
          . Kasus lanjutan tidak dicocokkan ulang.
        </Text>
      </View>
    </ScrollView>
  );
}

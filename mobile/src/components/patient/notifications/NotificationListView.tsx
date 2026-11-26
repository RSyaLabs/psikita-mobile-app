import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  category: "BARU" | "SEBELUMNYA";
  route?: string;
}

interface NotificationListViewProps {
  onBack?: () => void;
  onOpenSettings?: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
  items?: NotificationItem[];
}

const SECTIONS = ["BARU", "SEBELUMNYA"] as const;

export function NotificationListView({
  onBack,
  onOpenSettings,
  onSelectNotification,
  items = [],
}: NotificationListViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="notification-list-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-notification-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Notifikasi</Text>
      </View>

      {items.length === 0 ? (
        <View className="border-[1.5px] border-[#CCCCCC] rounded-xl bg-white p-5 items-center">
          <Text className="text-[15px] font-bold text-[#222222]">Belum ada notifikasi</Text>
          <Text className="text-sm text-[#555555] text-center mt-1">
            Pembaruan status konsultasi, pembayaran, dan pengingat jadwal akan muncul di sini.
          </Text>
        </View>
      ) : (
        SECTIONS.map((sec) => {
          const group = items.filter((i) => i.category === sec);
          if (group.length === 0) return null;
          return (
            <View key={sec} className="gap-2.5">
              <Text className="text-sm font-bold tracking-wider text-[#555555]">{sec}</Text>
              <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
                {group.map((item, idx) => (
                  <Pressable
                    key={item.id}
                    testID={`notification-item-${item.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}, ${item.subtitle}`}
                    onPress={() => { haptics.selection(); onSelectNotification?.(item); }}
                    className={`flex-row items-center justify-between min-h-[68px] px-4 py-2.5 active:bg-stone-50 ${idx > 0 ? "border-t border-dashed border-[#999999]" : ""}`}
                  >
                    <View className="flex-1 mr-2.5">
                      <Text className="text-[15px] font-bold text-[#222222]">{item.title}</Text>
                      <Text className="text-sm text-[#555555] mt-0.5">{item.subtitle}</Text>
                    </View>
                    <AppIcon icon={ChevronRight} size={18} tone="muted" />
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })
      )}

      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Isi notifikasi tidak menampilkan detail medis di layar kunci.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Atur preferensi notifikasi"
        testID="btn-open-notification-settings"
        onPress={() => { haptics.selection(); onOpenSettings?.(); }}
        className="min-h-[44px] items-center justify-center active:opacity-70 mt-1"
      >
        <Text className="text-[15px] font-semibold text-[#222222]">Atur preferensi notifikasi</Text>
      </Pressable>
    </ScrollView>
  );
}

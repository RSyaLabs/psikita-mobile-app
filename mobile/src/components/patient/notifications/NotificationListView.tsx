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

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "nt-1",
    title: "Psikolog ditemukan",
    subtitle: "Lanjut ke pembayaran · 2 mnt lalu",
    category: "BARU",
    route: "/patient/payment-regular",
  },
  {
    id: "nt-2",
    title: "Hasil konsultasi tersedia",
    subtitle: "Baca saran dan rencana perawatan",
    category: "BARU",
    route: "/patient/assessment-result",
  },
  {
    id: "nt-3",
    title: "Pembayaran berhasil",
    subtitle: "18 Nov 2026, 14:30",
    category: "SEBELUMNYA",
    route: "/patient/history",
  },
  {
    id: "nt-4",
    title: "Verifikasi identitas disetujui",
    subtitle: "15 Nov 2026, 09:15",
    category: "SEBELUMNYA",
    route: "/patient/profile",
  },
];

export function NotificationListView({
  onBack,
  onOpenSettings,
  onSelectNotification,
  items = DEFAULT_NOTIFICATIONS,
}: NotificationListViewProps) {
  const newItems = items.filter((i) => i.category === "BARU");
  const previousItems = items.filter((i) => i.category === "SEBELUMNYA");

  const handleItemPress = (item: NotificationItem) => {
    haptics.selection();
    onSelectNotification?.(item);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="notification-list-scroll"
    >
      {/* Top Header */}
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-notification-back"
          onPress={() => {
            haptics.light();
            onBack?.();
          }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Notifikasi</Text>
      </View>

      {/* Section: BARU */}
      {newItems.length > 0 && (
        <View className="gap-2.5">
          <Text className="text-sm font-bold tracking-wider text-[#555555]">
            BARU
          </Text>
          <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
            {newItems.map((item, idx) => (
              <Pressable
                key={item.id}
                testID={`notification-item-${item.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.subtitle}`}
                onPress={() => handleItemPress(item)}
                className={`flex-row items-center justify-between min-h-[68px] px-4 py-2.5 active:bg-stone-50 ${
                  idx > 0 ? "border-t border-dashed border-[#999999]" : ""
                }`}
              >
                <View className="flex-1 mr-2.5">
                  <Text className="text-[15px] font-bold text-[#222222]">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-[#555555] mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Section: SEBELUMNYA */}
      {previousItems.length > 0 && (
        <View className="gap-2.5">
          <Text className="text-sm font-bold tracking-wider text-[#555555]">
            SEBELUMNYA
          </Text>
          <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
            {previousItems.map((item, idx) => (
              <Pressable
                key={item.id}
                testID={`notification-item-${item.id}`}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.subtitle}`}
                onPress={() => handleItemPress(item)}
                className={`flex-row items-center justify-between min-h-[68px] px-4 py-2.5 active:bg-stone-50 ${
                  idx > 0 ? "border-t border-dashed border-[#999999]" : ""
                }`}
              >
                <View className="flex-1 mr-2.5">
                  <Text className="text-[15px] font-bold text-[#222222]">
                    {item.title}
                  </Text>
                  <Text className="text-sm text-[#555555] mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Privacy Notice Box */}
      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Isi notifikasi tidak menampilkan detail medis di layar kunci.
        </Text>
      </View>

      {/* Preference Settings CTA */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Atur preferensi notifikasi"
        testID="btn-open-notification-settings"
        onPress={() => {
          haptics.selection();
          onOpenSettings?.();
        }}
        className="min-h-[44px] items-center justify-center active:opacity-70 mt-1"
      >
        <Text className="text-[15px] font-semibold text-[#222222]">
          Atur preferensi notifikasi
        </Text>
      </Pressable>
    </ScrollView>
  );
}

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

export interface NotificationSettingsState {
  paymentAndSession: boolean;
  consultationResult: boolean;
  sessionReminder: boolean;
  carePlanReminder: boolean;
  educationAndTips: boolean;
}

interface NotificationSettingsViewProps {
  onBack?: () => void;
  initialSettings?: NotificationSettingsState;
  onSettingsChange?: (settings: NotificationSettingsState) => void;
}

const DEFAULT_SETTINGS: NotificationSettingsState = {
  paymentAndSession: true,
  consultationResult: true,
  sessionReminder: true,
  carePlanReminder: false,
  educationAndTips: false,
};

const SECTIONS = [
  {
    title: "PENTING",
    items: [
      { key: "paymentAndSession" as const, title: "Status pembayaran & sesi", subtitle: "Wajib untuk layanan", testID: "switch-payment-session", locked: true },
      { key: "consultationResult" as const, title: "Hasil konsultasi tersedia", subtitle: "Rekomendasi tetap aktif", testID: "switch-consultation-result", locked: false },
    ],
  },
  {
    title: "PENGINGAT",
    items: [
      { key: "sessionReminder" as const, title: "Pengingat jadwal sesi", subtitle: "[1 jam sebelumnya]", testID: "switch-session-reminder", locked: false },
      { key: "carePlanReminder" as const, title: "Pengingat rencana perawatan", subtitle: "[hari · jam]", testID: "switch-care-plan-reminder", locked: false },
    ],
  },
  {
    title: "LAINNYA",
    items: [
      { key: "educationAndTips" as const, title: "Edukasi & tips", subtitle: "Maks. [N] per minggu", testID: "switch-education-tips", locked: false },
    ],
  },
];

export function NotificationSettingsView({
  onBack,
  initialSettings = DEFAULT_SETTINGS,
  onSettingsChange,
}: NotificationSettingsViewProps) {
  const [settings, setSettings] = useState<NotificationSettingsState>(initialSettings);

  const updateSetting = (key: keyof NotificationSettingsState, value: boolean) => {
    if (key === "paymentAndSession") return;
    haptics.selection();
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onSettingsChange?.(updated);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="notification-settings-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-notification-settings-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Notifikasi</Text>
      </View>

      {SECTIONS.map((sec) => (
        <View key={sec.title} className="gap-2.5">
          <Text className="text-sm font-bold tracking-wider text-[#555555]">{sec.title}</Text>
          <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
            {sec.items.map((item, idx) => (
              <View key={item.key}>
                {idx > 0 && <View className="border-t border-dashed border-[#999999]" />}
                <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
                  <View className="flex-1 mr-3">
                    <Text className="text-[15px] font-bold text-[#222222]">{item.title}</Text>
                    <Text className="text-sm text-[#555555] mt-0.5">{item.subtitle}</Text>
                  </View>
                  <Switch
                    testID={item.testID}
                    accessibilityLabel={item.title}
                    value={item.locked ? true : settings[item.key]}
                    disabled={item.locked ? true : false}
                    onValueChange={(val) => updateSetting(item.key, val)}
                    trackColor={{ false: "#D1D5DB", true: item.locked ? "#75618E" : "#4A3B6B" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}

      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#333333]">
          {'Layar kunci hanya menampilkan "Ada pembaruan", tanpa detail medis.'}
        </Text>
      </View>

      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Kategori wajib vs opsional ditentukan produk.
        </Text>
      </View>
    </ScrollView>
  );
}

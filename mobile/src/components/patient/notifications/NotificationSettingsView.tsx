import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface NotificationSettingsViewProps {
  onBack?: () => void;
  initialSettings?: NotificationSettingsState;
  onSettingsChange?: (settings: NotificationSettingsState) => void;
}

export interface NotificationSettingsState {
  paymentAndSession: boolean; // locked true
  consultationResult: boolean;
  sessionReminder: boolean;
  carePlanReminder: boolean;
  educationAndTips: boolean;
}

const DEFAULT_SETTINGS: NotificationSettingsState = {
  paymentAndSession: true,
  consultationResult: true,
  sessionReminder: true,
  carePlanReminder: false,
  educationAndTips: false,
};

export function NotificationSettingsView({
  onBack,
  initialSettings = DEFAULT_SETTINGS,
  onSettingsChange,
}: NotificationSettingsViewProps) {
  const [settings, setSettings] = useState<NotificationSettingsState>(initialSettings);

  const updateSetting = (key: keyof NotificationSettingsState, value: boolean) => {
    if (key === "paymentAndSession") return; // locked
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
      {/* Top Header */}
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-notification-settings-back"
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

      {/* Section: PENTING */}
      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">
          PENTING
        </Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {/* Switch 1: Status pembayaran & sesi */}
          <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
            <View className="flex-1 mr-3">
              <Text className="text-[15px] font-bold text-[#222222]">
                Status pembayaran & sesi
              </Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                Wajib untuk layanan
              </Text>
            </View>
            <Switch
              testID="switch-payment-session"
              accessibilityLabel="Status pembayaran & sesi"
              value={true}
              disabled={true}
              trackColor={{ false: "#D1D5DB", true: "#75618E" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="border-t border-dashed border-[#999999]" />

          {/* Switch 2: Hasil konsultasi tersedia */}
          <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
            <View className="flex-1 mr-3">
              <Text className="text-[15px] font-bold text-[#222222]">
                Hasil konsultasi tersedia
              </Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                Rekomendasi tetap aktif
              </Text>
            </View>
            <Switch
              testID="switch-consultation-result"
              accessibilityLabel="Hasil konsultasi tersedia"
              value={settings.consultationResult}
              onValueChange={(val) => updateSetting("consultationResult", val)}
              trackColor={{ false: "#D1D5DB", true: "#4A3B6B" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Section: PENGINGAT */}
      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">
          PENGINGAT
        </Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {/* Switch 3: Pengingat jadwal sesi */}
          <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
            <View className="flex-1 mr-3">
              <Text className="text-[15px] font-bold text-[#222222]">
                Pengingat jadwal sesi
              </Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                [1 jam sebelumnya]
              </Text>
            </View>
            <Switch
              testID="switch-session-reminder"
              accessibilityLabel="Pengingat jadwal sesi"
              value={settings.sessionReminder}
              onValueChange={(val) => updateSetting("sessionReminder", val)}
              trackColor={{ false: "#D1D5DB", true: "#4A3B6B" }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View className="border-t border-dashed border-[#999999]" />

          {/* Switch 4: Pengingat rencana perawatan */}
          <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
            <View className="flex-1 mr-3">
              <Text className="text-[15px] font-bold text-[#222222]">
                Pengingat rencana perawatan
              </Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                [hari · jam]
              </Text>
            </View>
            <Switch
              testID="switch-care-plan-reminder"
              accessibilityLabel="Pengingat rencana perawatan"
              value={settings.carePlanReminder}
              onValueChange={(val) => updateSetting("carePlanReminder", val)}
              trackColor={{ false: "#D1D5DB", true: "#4A3B6B" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Section: LAINNYA */}
      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">
          LAINNYA
        </Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {/* Switch 5: Edukasi & tips */}
          <View className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5">
            <View className="flex-1 mr-3">
              <Text className="text-[15px] font-bold text-[#222222]">
                Edukasi & tips
              </Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                Maks. [N] per minggu
              </Text>
            </View>
            <Switch
              testID="switch-education-tips"
              accessibilityLabel="Edukasi & tips"
              value={settings.educationAndTips}
              onValueChange={(val) => updateSetting("educationAndTips", val)}
              trackColor={{ false: "#D1D5DB", true: "#4A3B6B" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Lockscreen Notice 1 */}
      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#333333]">
          {'Layar kunci hanya menampilkan "Ada pembaruan", tanpa detail medis.'}
        </Text>
      </View>

      {/* Product Policy Notice 2 */}
      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Kategori wajib vs opsional ditentukan produk.
        </Text>
      </View>
    </ScrollView>
  );
}

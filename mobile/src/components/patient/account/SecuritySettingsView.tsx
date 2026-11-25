import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface SecuritySettingsViewProps {
  onBack?: () => void;
  onChangePassword?: () => void;
  onLogoutOtherDevice?: (deviceId: string) => void;
  onLogoutAllDevices?: () => void;
  onDeleteAccount?: () => void;
  activeSessionCount?: number;
  isRevoking?: boolean;
}

export function SecuritySettingsView({
  onBack,
  onChangePassword,
  onLogoutOtherDevice,
  onLogoutAllDevices,
  onDeleteAccount,
  activeSessionCount,
  isRevoking = false,
}: SecuritySettingsViewProps) {
  const loginMethods = [
    { id: "pwd", title: "Ubah kata sandi", subtitle: "Kelola kata sandi akun Anda", action: onChangePassword, testID: "btn-goto-change-password" },
    { id: "otp", title: "Masuk dengan kode OTP", subtitle: "Aktif melalui email terdaftar" },
    { id: "google", title: "Akun Google", subtitle: "Tersedia saat masuk aplikasi" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="security-settings-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-security-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Keamanan</Text>
      </View>

      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">MASUK</Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {loginMethods.map((item, idx) => (
            <Pressable
              key={item.id}
              testID={item.testID}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}, ${item.subtitle}`}
              onPress={() => { haptics.selection(); item.action?.(); }}
              className={`flex-row items-center justify-between min-h-[60px] px-4 py-2.5 active:bg-stone-50 ${
                idx > 0 ? "border-t border-dashed border-[#999999]" : ""
              }`}
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

      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">PERANGKAT AKTIF</Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          <View className="min-h-[64px] px-4 py-2.5 justify-center">
            <Text className="text-[15px] font-bold text-[#222222]">Perangkat saat ini</Text>
            <Text className="text-sm text-[#555555] mt-0.5">
              {typeof activeSessionCount === "number"
                ? `Sesi aktif sekarang (${activeSessionCount} total sesi)`
                : "Sesi aktif sekarang"}
            </Text>
          </View>
          <View className="border-t border-dashed border-[#999999]" />
          <View className="flex-row items-center justify-between min-h-[64px] px-4 py-2.5">
            <View className="flex-1 mr-2.5">
              <Text className="text-[15px] font-bold text-[#222222]">Perangkat lain yang masuk</Text>
              <Text className="text-sm text-[#555555] mt-0.5">
                {typeof activeSessionCount === "number" && activeSessionCount > 1
                  ? `${activeSessionCount - 1} sesi lain terhubung ke akun Anda`
                  : "Akhiri semua sesi perangkat lain"}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Keluar dari perangkat lain"
              testID="btn-logout-other-device"
              disabled={isRevoking}
              onPress={() => { haptics.medium(); onLogoutOtherDevice?.("other-sessions"); }}
              className="py-1.5 px-2 active:opacity-70"
            >
              <Text className="text-sm font-semibold text-[#222222]">Keluar ›</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Keluar dari Semua Perangkat"
        testID="btn-logout-all-devices"
        onPress={() => { haptics.medium(); onLogoutAllDevices?.(); }}
        className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] items-center justify-center bg-white active:bg-stone-100"
      >
        <Text className="text-[16px] font-semibold text-[#222222]">Keluar dari Semua Perangkat</Text>
      </Pressable>

      <View className="gap-2.5 mt-2">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">ZONA SENSITIF</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus akun"
          testID="btn-goto-delete-account"
          onPress={() => { haptics.medium(); onDeleteAccount?.(); }}
          className="flex-row items-center justify-between min-h-[56px] border-[1.5px] border-dashed border-[#222222] rounded-xl px-4 active:bg-red-50/50"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Hapus akun</Text>
          <AppIcon icon={ChevronRight} size={18} tone="foreground" />
        </Pressable>
      </View>

      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Menghapus akun membutuhkan konfirmasi di halaman penuh, bukan modal.
        </Text>
      </View>
    </ScrollView>
  );
}

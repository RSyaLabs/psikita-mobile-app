import React from "react";
import { View, Text, Pressable, ScrollView, Switch } from "react-native";
import { Bell, ChevronRight } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface PractitionerDashboardViewProps {
  doctorName?: string;
  isAvailable?: boolean;
  onToggleAvailability?: (value: boolean) => void;
  onOpenNotifications?: () => void;
  onCompleteResults?: () => void;
  onViewOffers?: () => void;
  onOpenNextSession?: () => void;
  onViewIncome?: () => void;
}

export function PractitionerDashboardView({
  doctorName = "Praktisi",
  isAvailable = true,
  onToggleAvailability,
  onOpenNotifications,
  onCompleteResults,
  onViewOffers,
  onOpenNextSession,
  onViewIncome,
}: PractitionerDashboardViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      testID="practitioner-dashboard-scroll"
    >
      {/* Top Header */}
      <View className="flex-row items-center justify-between pt-2">
        <View className="gap-0.5 flex-1 pr-2">
          <Text className="text-[26px] font-bold text-[#222222]">Halo, {doctorName}</Text>
          <Text className="text-[15px] text-[#555555]">Yang perlu kamu selesaikan hari ini.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifikasi"
          testID="btn-practitioner-notifications"
          onPress={() => { haptics.light(); onOpenNotifications?.(); }}
          className="w-11 h-11 border-[1.5px] border-dashed border-[#555555] rounded-xl items-center justify-center bg-white active:bg-stone-100"
        >
          <AppIcon icon={Bell} size={22} tone="foreground" />
        </Pressable>
      </View>

      {/* Switch Availability Card */}
      <View className="flex-row items-center justify-between min-h-[60px] border-[1.5px] border-[#333333] rounded-[14px] px-4 py-2 bg-white">
        <View className="flex-1 mr-3">
          <Text className="text-[15px] font-bold text-[#222222]">Siap menerima kasus</Text>
          <Text className="text-sm text-[#555555] mt-0.5">Kasus baru hanya masuk saat ini aktif.</Text>
        </View>
        <Switch
          value={isAvailable}
          onValueChange={(val) => { haptics.selection(); onToggleAvailability?.(val); }}
          trackColor={{ false: "#d1d5db", true: "#222222" }}
          thumbColor="#ffffff"
          accessibilityLabel="Siap menerima kasus"
          testID="switch-availability"
        />
      </View>

      {/* Urgent Action Card: Perlu Tindakan */}
      <View className="border-[2.5px] border-[#222222] rounded-[14px] p-4 gap-2.5 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold tracking-wider text-[#222222]">PERLU TINDAKAN</Text>
          <View className="border-[1.5px] border-[#333333] rounded-xl px-2.5 py-0.5">
            <Text className="text-sm font-semibold text-[#222222]">1 sesi</Text>
          </View>
        </View>
        <Text className="text-[17px] font-bold text-[#222222]">Hasil sesi belum dikirim</Text>
        <Text className="text-sm leading-relaxed text-[#555555]">
          Anindya Putri · selesai pukul 14:00. Pasien belum menerima hasil sampai kamu mengirimnya.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selesaikan Hasil"
          testID="btn-complete-results"
          onPress={() => { haptics.medium(); onCompleteResults?.(); }}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90 mt-1"
        >
          <Text className="text-[16px] font-semibold text-white">Selesaikan Hasil</Text>
        </Pressable>
      </View>

      {/* New Offers Waiting Card */}
      <View className="flex-row items-center justify-between border-[1.5px] border-[#333333] rounded-[14px] p-4 bg-white">
        <View className="flex-1 mr-3 gap-0.5">
          <Text className="text-[16px] font-bold text-[#222222]">3 kasus baru menunggu</Text>
          <Text className="text-sm text-[#555555]">Terdekat berakhir dalam 02:10</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat kasus baru"
          testID="btn-view-new-offers"
          onPress={() => { haptics.medium(); onViewOffers?.(); }}
          className="h-11 px-4 border-[1.5px] border-[#222222] rounded-[10px] items-center justify-center bg-white active:bg-stone-100"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Lihat</Text>
        </Pressable>
      </View>

      {/* Next Schedule Section */}
      <View className="gap-2">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">JADWAL BERIKUTNYA</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jadwal berikutnya: 15:30 Sesi lanjutan Budi Pratama"
          testID="btn-next-schedule"
          onPress={() => { haptics.selection(); onOpenNextSession?.(); }}
          className="flex-row items-center justify-between min-h-[60px] border-[1.5px] border-[#333333] rounded-[14px] px-4 py-2.5 bg-white active:bg-stone-50"
        >
          <View className="flex-1 mr-2">
            <Text className="text-[15px] font-bold text-[#222222]">15:30 · Sesi lanjutan</Text>
            <Text className="text-sm text-[#555555] mt-0.5">Budi Pratama</Text>
          </View>
          <AppIcon icon={ChevronRight} size={18} tone="foreground" />
        </Pressable>
      </View>

      {/* Income Summary Banner */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pendapatan bulan ini: dari server"
        testID="btn-income-banner"
        onPress={() => { haptics.selection(); onViewIncome?.(); }}
        className="flex-row items-center justify-between min-h-[56px] border-[1.5px] border-dashed border-[#555555] rounded-[14px] px-4 bg-white active:bg-stone-50"
      >
        <Text className="text-sm text-[#222222]">
          Pendapatan bulan ini: <Text className="font-bold">—</Text> (dari server)
        </Text>
        <AppIcon icon={ChevronRight} size={18} tone="foreground" />
      </Pressable>
    </ScrollView>
  );
}

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronLeft, Check } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface ChangePasswordViewProps {
  onBack?: () => void;
  onSubmit?: (data: { currentPass: string; newPass: string; logoutOtherDevices: boolean }) => void;
  onForgotPassword?: () => void;
  onCancel?: () => void;
}

export function ChangePasswordView({
  onBack,
  onSubmit,
  onForgotPassword,
  onCancel,
}: ChangePasswordViewProps) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [logoutOthers, setLogoutOthers] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!currentPass.trim() || !newPass.trim() || !confirmPass.trim()) {
      haptics.error();
      setErrorMsg("Semua kolom kata sandi wajib diisi.");
      return;
    }
    if (newPass !== confirmPass) {
      haptics.error();
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setErrorMsg(null);
    haptics.medium();
    onSubmit?.({ currentPass, newPass, logoutOtherDevices: logoutOthers });
  };

  const handleCancel = () => {
    haptics.light();
    onCancel ? onCancel() : onBack?.();
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="change-password-scroll"
    >
      {/* Top Header */}
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-change-password-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Ubah kata sandi</Text>
      </View>

      {/* Field 1: Kata sandi saat ini */}
      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Kata sandi saat ini</Text>
        <TextInput
          placeholder="Masukkan kata sandi saat ini"
          placeholderTextColor="#777777"
          secureTextEntry
          value={currentPass}
          onChangeText={(val) => { setCurrentPass(val); setErrorMsg(null); }}
          testID="input-current-password"
          accessibilityLabel="Kata sandi saat ini"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      {/* Field 2: Kata sandi baru */}
      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Kata sandi baru</Text>
        <TextInput
          placeholder="Minimal [N] karakter"
          placeholderTextColor="#777777"
          secureTextEntry
          value={newPass}
          onChangeText={(val) => { setNewPass(val); setErrorMsg(null); }}
          testID="input-new-password"
          accessibilityLabel="Kata sandi baru"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      {/* Field 3: Ulangi kata sandi baru */}
      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Ulangi kata sandi baru</Text>
        <TextInput
          placeholder="Ketik ulang"
          placeholderTextColor="#777777"
          secureTextEntry
          value={confirmPass}
          onChangeText={(val) => { setConfirmPass(val); setErrorMsg(null); }}
          testID="input-confirm-password"
          accessibilityLabel="Ulangi kata sandi baru"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      {errorMsg && (
        <Text testID="txt-password-error" className="text-sm font-semibold text-red-600 -mt-2">
          {errorMsg}
        </Text>
      )}

      {/* Server Rules Notice Box */}
      <View className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#333333]">
          Aturan kata sandi dari server. Pesan salah tampil di bawah kolom yang bermasalah.
        </Text>
      </View>

      {/* Logout other devices checkbox */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: logoutOthers }}
        accessibilityLabel="Keluar dari perangkat lain setelah diubah"
        testID="checkbox-logout-others"
        onPress={() => {
          haptics.selection();
          setLogoutOthers(!logoutOthers);
        }}
        className="flex-row items-center gap-3 min-h-[56px] border-[1.5px] border-[#333333] rounded-xl px-4 bg-white active:bg-stone-50"
      >
        <View
          className={`w-6 h-6 border-[1.5px] border-[#333333] rounded items-center justify-center ${
            logoutOthers ? "bg-[#222222]" : "bg-white"
          }`}
        >
          {logoutOthers && <AppIcon icon={Check} size={16} tone="white" />}
        </View>
        <Text className="flex-1 text-[15px] text-[#222222]">
          Keluar dari perangkat lain setelah diubah
        </Text>
      </Pressable>

      {/* Forgot Password Link */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lupa kata sandi saat ini?"
        testID="btn-forgot-password-link"
        onPress={() => {
          haptics.selection();
          onForgotPassword?.();
        }}
        className="min-h-[44px] justify-center active:opacity-70"
      >
        <Text className="text-[15px] font-semibold text-[#222222]">
          Lupa kata sandi saat ini?
        </Text>
      </Pressable>

      {/* Action Buttons */}
      <View className="mt-4 gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Simpan Kata Sandi"
          testID="btn-submit-change-password"
          onPress={handleSubmit}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-white">Simpan Kata Sandi</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Batal"
          testID="btn-cancel-change-password"
          onPress={handleCancel}
          className="min-h-[44px] items-center justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Batal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

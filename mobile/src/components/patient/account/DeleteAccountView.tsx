import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronLeft, Check } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface DeleteAccountViewProps {
  onBack?: () => void;
  onConfirmDelete?: (password: string) => void;
  onCancel?: () => void;
}

export function DeleteAccountView({
  onBack,
  onConfirmDelete,
  onCancel,
}: DeleteAccountViewProps) {
  const [password, setPassword] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = () => {
    if (!password.trim()) {
      haptics.error();
      setErrorMsg("Masukkan kata sandi untuk konfirmasi.");
      return;
    }
    if (!isAgreed) {
      haptics.error();
      setErrorMsg("Centang persetujuan sebelum menghapus akun.");
      return;
    }
    setErrorMsg(null);
    haptics.medium();
    onConfirmDelete?.(password);
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="delete-account-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-delete-account-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Hapus akun</Text>
      </View>

      <View className="border-[2.5px] border-[#222222] rounded-[14px] p-4 gap-2 bg-white">
        <Text className="text-[22px] font-bold text-[#222222]">Hapus akunmu?</Text>
        <Text className="text-[15px] leading-relaxed text-[#333333]">
          Tindakan ini tidak bisa dibatalkan. Permintaan penghapusan akun dijadwalkan dalam 30 hari sesuai kebijakan privasi dan hukum yang berlaku.
        </Text>
      </View>

      <View className="gap-2 px-1">
        {["Kamu tidak bisa masuk lagi dengan akun ini.", "Profil pribadi, preferensi, dan sesi masuk akan dihapus permanen setelah masa tunggu 30 hari.", "Riwayat transaksi dan rekam medis klinis disimpan sesuai kewajiban hukum layanan kesehatan."].map((item, idx) => (
          <View key={idx} className="flex-row items-start gap-2">
            <Text className="text-[15px] text-[#333333]">•</Text>
            <Text className="flex-1 text-[15px] leading-relaxed text-[#333333]">{item}</Text>
          </View>
        ))}
      </View>

      <View className="border-[1.5px] border-[#333333] rounded-xl p-3 bg-white">
        <Text className="text-sm leading-relaxed text-[#333333]">
          Ada konsultasi atau pembayaran yang berjalan? Selesaikan dulu. Server bisa menolak penghapusan sampai semuanya beres.
        </Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Kata sandi</Text>
        <TextInput
          placeholder="Konfirmasi dengan kata sandimu"
          placeholderTextColor="#777777"
          secureTextEntry
          value={password}
          onChangeText={(val) => { setPassword(val); setErrorMsg(null); }}
          testID="input-delete-password-confirm"
          accessibilityLabel="Kata sandi"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isAgreed }}
        accessibilityLabel="Saya mengerti dan ingin menghapus akun"
        testID="checkbox-delete-confirm"
        onPress={() => { haptics.selection(); setIsAgreed(!isAgreed); setErrorMsg(null); }}
        className="flex-row items-center gap-3 min-h-[56px] border-[1.5px] border-[#333333] rounded-xl px-4 bg-white active:bg-stone-50"
      >
        <View
          className={`w-6 h-6 border-[1.5px] border-[#333333] rounded items-center justify-center ${
            isAgreed ? "bg-[#222222]" : "bg-white"
          }`}
        >
          {isAgreed && <AppIcon icon={Check} size={16} tone="white" />}
        </View>
        <Text className="flex-1 text-[15px] text-[#222222]">Saya mengerti dan ingin menghapus akun</Text>
      </Pressable>

      {errorMsg && (
        <Text testID="txt-delete-error" className="text-sm font-semibold text-red-600 -mt-2">
          {errorMsg}
        </Text>
      )}

      <View className="mt-4 gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus Akun Saya"
          testID="btn-confirm-delete-account"
          onPress={handleDelete}
          className="h-[52px] border-[1.5px] border-dashed border-[#222222] rounded-[10px] items-center justify-center bg-white active:bg-red-50"
        >
          <Text className="text-[16px] font-semibold text-[#222222]">Hapus Akun Saya</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Batal, simpan akunku"
          testID="btn-cancel-delete-account"
          onPress={() => { haptics.light(); onCancel ? onCancel() : onBack?.(); }}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-white">Batal, simpan akunku</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

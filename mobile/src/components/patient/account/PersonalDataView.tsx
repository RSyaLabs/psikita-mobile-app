import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface PersonalDataViewProps {
  initialData?: { fullName?: string; email?: string; phone?: string; birthDate?: string };
  isKycVerified?: boolean;
  onBack?: () => void;
  onSave?: (data: { fullName: string; email: string; phone: string; birthDate: string }) => void;
  onCancel?: () => void;
  onChangePhoto?: () => void;
}

export function PersonalDataView({
  initialData,
  isKycVerified = false,
  onBack,
  onSave,
  onCancel,
  onChangePhoto,
}: PersonalDataViewProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || "");

  useEffect(() => {
    if (initialData?.fullName !== undefined) setFullName(initialData.fullName);
    if (initialData?.email !== undefined) setEmail(initialData.email);
    if (initialData?.phone !== undefined) setPhone(initialData.phone);
    if (initialData?.birthDate !== undefined) setBirthDate(initialData.birthDate);
  }, [initialData?.fullName, initialData?.email, initialData?.phone, initialData?.birthDate]);

  const avatarInitial = fullName.trim() ? fullName.trim()[0].toUpperCase() : "S";

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="personal-data-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-personal-data-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Data diri</Text>
      </View>

      <View className="flex-row items-center gap-3.5">
        <View
          aria-hidden={true}
          className="w-16 h-16 border-[1.5px] border-[#333333] rounded-full items-center justify-center bg-white"
        >
          <Text className="text-[28px] font-bold text-[#222222]">{avatarInitial}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ganti foto"
          testID="btn-change-photo"
          onPress={() => { haptics.selection(); onChangePhoto?.(); }}
          className="min-h-[44px] justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Ganti foto</Text>
        </Pressable>
      </View>

      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Nama lengkap</Text>
        <TextInput
          placeholder="Contoh: Sinta Maharani"
          placeholderTextColor="#777777"
          value={fullName}
          onChangeText={setFullName}
          editable={!isKycVerified}
          testID="input-fullname"
          accessibilityLabel="Nama lengkap"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
        <Text className="text-sm text-[#555555]">Terkunci setelah verifikasi identitas.</Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Email</Text>
        <TextInput
          placeholder="nama@email.com"
          placeholderTextColor="#777777"
          value={email}
          onChangeText={setEmail}
          editable={false}
          testID="input-email"
          accessibilityLabel="Email"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-stone-100"
        />
        <Text className="text-sm text-[#555555]">Terverifikasi</Text>
      </View>

      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Nomor telepon</Text>
        <TextInput
          placeholder="+62 812-3456-7890"
          placeholderTextColor="#777777"
          value={phone}
          onChangeText={setPhone}
          testID="input-phone"
          accessibilityLabel="Nomor telepon"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      <View className="gap-1.5">
        <Text className="text-[15px] font-semibold text-[#222222]">Tanggal lahir</Text>
        <TextInput
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#777777"
          value={birthDate}
          onChangeText={setBirthDate}
          testID="input-birthdate"
          accessibilityLabel="Tanggal lahir"
          className="h-[52px] border-[1.5px] border-[#333333] rounded-[10px] px-4 text-[16px] text-[#222222] bg-white"
        />
      </View>

      <View className="border-[1.5px] border-dashed border-[#777777] rounded-xl p-3.5 bg-stone-50/60">
        <Text className="text-sm leading-relaxed text-[#555555]">
          Data disimpan aman ke profil pasien dan disesuaikan dengan identitas terverifikasi Anda.
        </Text>
      </View>

      <View className="mt-4 gap-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Simpan"
          testID="btn-personal-data-save"
          onPress={() => { haptics.medium(); onSave?.({ fullName, email, phone, birthDate }); }}
          className="h-[52px] border-[1.5px] border-[#222222] rounded-[10px] bg-[#222222] items-center justify-center active:opacity-90"
        >
          <Text className="text-[16px] font-semibold text-white">Simpan</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Batal"
          testID="btn-personal-data-cancel"
          onPress={() => { haptics.light(); onCancel ? onCancel() : onBack?.(); }}
          className="min-h-[44px] items-center justify-center active:opacity-70"
        >
          <Text className="text-[15px] font-semibold text-[#222222]">Batal</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

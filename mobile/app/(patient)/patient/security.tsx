import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SecuritySettingsView,
  ChangePasswordView,
  DeleteAccountView,
} from "@/components/patient/account";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";
import { haptics } from "@/utils/haptics";

export type SecurityStep = "main" | "change-password" | "delete-account";

export default function SecurityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: SecurityStep }>();
  const [step, setStep] = useState<SecurityStep>(params.step || "main");
  const { signOut } = useAuth();

  const handleBack = () => {
    if (step !== "main") setStep("main");
    else safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
  };

  const handleLogoutAllDevices = () => {
    Alert.alert("Keluar dari Semua Perangkat", "Keluarkan akun dari semua perangkat lain?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar Semua",
        style: "destructive",
        onPress: () => {
          haptics.success();
          Alert.alert("Berhasil", "Semua perangkat lain telah dikeluarkan.");
        },
      },
    ]);
  };

  const handleConfirmDelete = async (_password: string) => {
    haptics.error();
    Alert.alert("Akun Berhasil Dihapus", "Akunmu dijadwalkan untuk penghapusan permanen.", [
      {
        text: "Mengerti",
        onPress: async () => {
          try { await signOut(); } finally { router.replace(ROUTES.AUTH.LOGIN); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      {step === "main" && (
        <SecuritySettingsView
          onBack={handleBack}
          onChangePassword={() => setStep("change-password")}
          onLogoutOtherDevice={() => Alert.alert("Sesi Berakhir", "Perangkat lain berhasil dikeluarkan.")}
          onLogoutAllDevices={handleLogoutAllDevices}
          onDeleteAccount={() => setStep("delete-account")}
        />
      )}
      {step === "change-password" && (
        <ChangePasswordView
          onBack={handleBack}
          onSubmit={() => {
            haptics.success();
            Alert.alert("Sukses", "Kata sandi berhasil diubah.", [{ text: "OK", onPress: () => setStep("main") }]);
          }}
          onForgotPassword={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD as any)}
          onCancel={() => setStep("main")}
        />
      )}
      {step === "delete-account" && (
        <DeleteAccountView
          onBack={handleBack}
          onConfirmDelete={handleConfirmDelete}
          onCancel={() => setStep("main")}
        />
      )}
    </SafeAreaView>
  );
}

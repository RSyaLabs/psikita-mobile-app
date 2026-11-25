import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SecuritySettingsView,
  ChangePasswordView,
  DeleteAccountView,
} from "@/components/patient/account";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/api/auth.service";
import { ApiError } from "@/api/client";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";
import { haptics } from "@/utils/haptics";

export type SecurityStep = "main" | "change-password" | "delete-account";

function resolveSecurityStep(step?: string, view?: string): SecurityStep {
  if (view === "password" || step === "change-password") return "change-password";
  if (view === "delete" || step === "delete-account") return "delete-account";
  return "main";
}

export default function SecurityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: SecurityStep; view?: string; guest?: string }>();
  const [step, setStep] = useState<SecurityStep>(() =>
    resolveSecurityStep(params.step, params.view),
  );
  const { user, signOut } = useAuth();
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [activeSessionCount, setActiveSessionCount] = useState<number | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const isGuest = params.guest === "true";

  useEffect(() => {
    setStep(resolveSecurityStep(params.step, params.view));
  }, [params.step, params.view]);

  useEffect(() => {
    if (isGuest || !user) return;
    let mounted = true;
    authService
      .getMySessions()
      .then((res) => {
        if (!mounted) return;
        setSessionUserId(res.userId);
        setActiveSessionCount(res.count);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isGuest, user]);

  const handleBack = () => {
    if (step !== "main") setStep("main");
    else safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
  };

  const executeRevokeAllSessions = async () => {
    if (isGuest) {
      haptics.success();
      Alert.alert("Mode Pratinjau", "Aksi akhiri sesi tersedia setelah masuk akun.");
      return;
    }
    const targetUserId = sessionUserId || user?.id;
    if (!targetUserId) {
      Alert.alert("Gagal Memproses", "ID pengguna aktif tidak ditemukan. Silakan masuk kembali.");
      return;
    }
    setIsBusy(true);
    try {
      await authService.revokeAllUserSessions(targetUserId);
      haptics.success();
      await signOut();
      router.replace(ROUTES.AUTH.LOGIN as any);
    } catch (err: unknown) {
      haptics.error();
      const message =
        err instanceof ApiError
          ? err.message
          : "Terjadi kendala saat mengakhiri sesi perangkat.";
      Alert.alert("Gagal Mengakhiri Sesi", message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogoutAllDevices = () => {
    Alert.alert(
      "Keluar dari Semua Perangkat",
      "Seluruh sesi aktif termasuk perangkat ini akan diakhiri. Anda perlu masuk kembali.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar Semua",
          style: "destructive",
          onPress: () => {
            void executeRevokeAllSessions();
          },
        },
      ],
    );
  };

  const handleChangePasswordSubmit = async (data: {
    currentPass: string;
    newPass: string;
    logoutOtherDevices: boolean;
  }) => {
    if (isGuest) {
      haptics.success();
      Alert.alert("Mode Pratinjau", "Simulasi pratinjau: kata sandi divalidasi.", [
        { text: "OK", onPress: () => setStep("main") },
      ]);
      return;
    }
    setIsBusy(true);
    try {
      await authService.updatePassword({
        oldPassword: data.currentPass,
        newPassword: data.newPass,
      });
      haptics.success();
      Alert.alert("Sukses", "Kata sandi Anda berhasil diperbarui.", [
        { text: "OK", onPress: () => setStep("main") },
      ]);
    } catch (err: unknown) {
      haptics.error();
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal memperbarui kata sandi. Periksa koneksi Anda.";
      Alert.alert("Gagal Mengubah Kata Sandi", message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleConfirmDelete = async (_password: string) => {
    if (isGuest) {
      haptics.error();
      Alert.alert("Mode Pratinjau", "Penghapusan akun hanya tersedia pada akun terdaftar.", [
        { text: "Mengerti", onPress: () => setStep("main") },
      ]);
      return;
    }
    setIsBusy(true);
    try {
      const res = await authService.deleteMyAccount();
      haptics.success();
      Alert.alert(
        "Penghapusan Akun Dijadwalkan",
        res.message || "Akunmu dijadwalkan untuk penghapusan permanen dalam 30 hari.",
        [
          {
            text: "Mengerti",
            onPress: async () => {
              try {
                await signOut();
              } finally {
                router.replace(ROUTES.AUTH.LOGIN as any);
              }
            },
          },
        ],
      );
    } catch (err: unknown) {
      haptics.error();
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal memproses penghapusan akun. Silakan coba lagi.";
      Alert.alert("Gagal Menghapus Akun", message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      {step === "main" && (
        <SecuritySettingsView
          onBack={handleBack}
          onChangePassword={() => setStep("change-password")}
          onLogoutOtherDevice={handleLogoutAllDevices}
          onLogoutAllDevices={handleLogoutAllDevices}
          onDeleteAccount={() => setStep("delete-account")}
          activeSessionCount={activeSessionCount}
          isRevoking={isBusy}
        />
      )}
      {step === "change-password" && (
        <ChangePasswordView
          onBack={handleBack}
          onSubmit={(data) => {
            void handleChangePasswordSubmit(data);
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

import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonalDataView } from "@/components/patient/account";
import { ChangePhotoModal } from "@/components/modals";
import {
  usePatientProfile,
  useUpdatePatientProfile,
  useMyVerificationStatus,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/api/client";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";
import { haptics } from "@/utils/haptics";

function formatBirthDateForDisplay(raw?: string): string {
  if (!raw) return "";
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  return raw;
}

function normalizeBirthDateForApi(input: string): string | undefined {
  const trimmed = input.trim();
  if (!trimmed) return undefined;
  const dmyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed;
  return undefined;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ guest?: string }>();
  const toast = useToast();
  const { user } = useAuth();
  const isGuest = params.guest === "true";
  const { data: profile } = usePatientProfile({ enabled: !isGuest });
  const { data: kycStatus } = useMyVerificationStatus();
  const updateProfileMutation = useUpdatePatientProfile();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const isKycVerified =
    kycStatus?.status === "APPROVED" ||
    kycStatus?.status === "VERIFIED" ||
    profile?.status === "VERIFIED";

  const showErrorToast = (title: string, description: string) => {
    haptics.error();
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={id} action="error">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  const handleSave = (data: { fullName: string; phone: string; birthDate: string }) => {
    if (isGuest) {
      haptics.success();
      safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
      return;
    }

    if (!profile?.id) {
      showErrorToast(
        "Profil Belum Terdaftar",
        "Silakan lengkapi data pasien awal melalui halaman verifikasi terlebih dahulu.",
      );
      return;
    }

    const normalizedDate = normalizeBirthDateForApi(data.birthDate);
    if (data.birthDate.trim() && !normalizedDate) {
      showErrorToast(
        "Format Tanggal Tidak Valid",
        "Gunakan format DD/MM/YYYY (contoh: 15/08/1998).",
      );
      return;
    }

    updateProfileMutation.mutate(
      {
        patientId: profile.id,
        dto: {
          fullName: data.fullName.trim() || undefined,
          phoneNumber: data.phone.trim() || undefined,
          birthDate: normalizedDate,
        },
      },
      {
        onSuccess: () => {
          haptics.success();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Profil Disimpan</ToastTitle>
                <ToastDescription>Data dirimu berhasil diperbarui.</ToastDescription>
              </Toast>
            ),
          });
          safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
        },
        onError: (err: unknown) => {
          const message =
            err instanceof ApiError
              ? err.message
              : "Gagal menyimpan perubahan data diri. Periksa koneksi Anda.";
          showErrorToast("Gagal Menyimpan Profil", message);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      <PersonalDataView
        initialData={{
          fullName: profile?.fullName || "",
          email: user?.email || "",
          phone: profile?.phoneNumber || "",
          birthDate: formatBirthDateForDisplay(profile?.birthDate),
        }}
        isKycVerified={isKycVerified}
        isSaving={updateProfileMutation.isPending}
        onBack={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
        onCancel={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
        onChangePhoto={() => setShowPhotoModal(true)}
        onSave={handleSave}
      />
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSelectCamera={() => {
          Alert.alert(
            "Foto Profil",
            "Gunakan verifikasi e-KTP atau pembaruan perangkat untuk mengganti foto profil.",
          );
        }}
        onSelectGallery={() => {
          Alert.alert(
            "Foto Profil",
            "Pemilihan foto galeri memerlukan izin penyimpanan tambahan.",
          );
        }}
      />
    </SafeAreaView>
  );
}

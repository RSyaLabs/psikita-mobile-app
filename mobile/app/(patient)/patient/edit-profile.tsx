import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PersonalDataView } from "@/components/patient/account";
import { ChangePhotoModal } from "@/components/modals";
import {
  usePatientProfile,
  useUpdatePatientProfile,
  useMyVerificationStatus,
} from "@/hooks/useApiQueries";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";
import { haptics } from "@/utils/haptics";

export default function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: profile } = usePatientProfile();
  const { data: kycStatus } = useMyVerificationStatus();
  const updateProfileMutation = useUpdatePatientProfile();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const isKycVerified =
    kycStatus?.status === "APPROVED" ||
    kycStatus?.status === "VERIFIED" ||
    profile?.status === "VERIFIED";

  const handleSave = (data: { fullName: string; phone: string; birthDate: string }) => {
    updateProfileMutation.mutate(
      {
        patientId: profile?.id ?? "",
        dto: {
          fullName: data.fullName,
          phoneNumber: data.phone,
          birthDate: data.birthDate,
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
        onError: () => {
          haptics.error();
          safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      <PersonalDataView
        initialData={{
          fullName: profile?.fullName || "SeraPhany User",
          email: (profile as any)?.user?.email || "user@seraphany.id",
          phone: profile?.phoneNumber || "+62 812-3456-7890",
          birthDate: profile?.birthDate || "15/08/1998",
        }}
        isKycVerified={isKycVerified}
        onBack={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
        onCancel={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
        onChangePhoto={() => setShowPhotoModal(true)}
        onSave={handleSave}
      />
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </SafeAreaView>
  );
}

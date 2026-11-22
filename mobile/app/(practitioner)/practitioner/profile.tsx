import React, { useState } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  DailyAvailabilityView,
  WeeklyScheduleView,
  EditScheduleHoursView,
  PractitionerAccountHubView,
  ProfessionalProfileView,
  PractitionerSettingsView,
} from "@/components/practitioner/profile";
import { PractitionerTabBar } from "@/components/navigation";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import {
  usePractitionerProfile,
  useMyAvatar,
  useStartPractitionerVerification,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

export type ProfileActiveView =
  | "account-hub"
  | "ketersediaan"
  | "jadwal"
  | "ubah-jam"
  | "profil-profesional"
  | "pengaturan";

export default function PractitionerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: string; day?: string }>();
  const { data: profile } = usePractitionerProfile();
  const { data: avatarData } = useMyAvatar();
  const { signOut } = useAuth();
  const startPractitionerVerification = useStartPractitionerVerification();

  const [activeView, setActiveView] = useState<ProfileActiveView>(
    (params.view as ProfileActiveView) || "account-hub",
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    params.day || "Senin",
  );

  const fullName = profile?.fullName || "dr. Sarah Wijaya, Sp.KJ";
  const title = profile?.title || "Psikiater Klinis";
  const avatarUrl = avatarData?.avatarUrl;

  const handleVerifyCredentials = async () => {
    haptics.selection();
    if (profile?.id) {
      try {
        await startPractitionerVerification.mutateAsync(profile.id);
        Alert.alert(
          "Verifikasi STR / SIP",
          "Sesi verifikasi identitas klinis telah dimulai.",
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memulai sesi verifikasi kredensial.";
        Alert.alert("Kendala Verifikasi", message);
      }
    }
  };

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } finally {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  };

  const handleHelpAction = () => {
    haptics.selection();
    Alert.alert(
      "Pusat Bantuan Praktisi",
      "Untuk bantuan operasional, eskalasi medis darurat, atau pertanyaan kemitraan, hubungi tim dukungan SeraPhany di support@seraphany.id atau WhatsApp Priority Hotline.",
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {activeView === "ketersediaan" && (
        <DailyAvailabilityView
          onBack={() => setActiveView("account-hub")}
          onEditDay={(day) => {
            setSelectedDay(day);
            setActiveView("ubah-jam");
          }}
          onSave={() => {
            Alert.alert("Sukses", "Jadwal ketersediaan berhasil disimpan.");
            setActiveView("account-hub");
          }}
        />
      )}

      {activeView === "jadwal" && (
        <WeeklyScheduleView
          onBack={() => setActiveView("account-hub")}
          onOpenAvailability={() => setActiveView("ketersediaan")}
          onEnterSession={(sessionId) => {
            router.push(`${ROUTES.PRACTITIONER.CHAT}?id=${sessionId}`);
          }}
          onViewCase={(caseId) => {
            router.push(`${ROUTES.PRACTITIONER.WAR_ROOM}?caseId=${caseId}`);
          }}
        />
      )}

      {activeView === "ubah-jam" && (
        <EditScheduleHoursView
          dayName={selectedDay}
          onBack={() => setActiveView("ketersediaan")}
          onCancel={() => setActiveView("ketersediaan")}
          onSaveHours={({ dayName, startTime, endTime }) => {
            Alert.alert(
              "Jam Diperbarui",
              `Jam praktik hari ${dayName} (${startTime} - ${endTime}) berhasil disimpan.`,
            );
            setActiveView("ketersediaan");
          }}
        />
      )}

      {activeView === "profil-profesional" && (
        <ProfessionalProfileView
          initialName={fullName}
          avatarUrl={avatarUrl}
          onBack={() => setActiveView("account-hub")}
          onCancel={() => setActiveView("account-hub")}
          onVerifyCredentials={handleVerifyCredentials}
          onChangePhoto={() => {
            Alert.alert(
              "Ubah Foto",
              "Pilih foto baru dari galeri atau kamera untuk profil mitra.",
            );
          }}
          onSave={({ displayName }) => {
            Alert.alert(
              "Profil Disimpan",
              `Profil profesional ${displayName} berhasil diperbarui.`,
            );
            setActiveView("account-hub");
          }}
        />
      )}

      {activeView === "pengaturan" && (
        <PractitionerSettingsView
          onBack={() => setActiveView("account-hub")}
          onChangeLanguage={() => {
            Alert.alert(
              "Bahasa",
              "Pengaturan bahasa aplikasi saat ini: Bahasa Indonesia.",
            );
          }}
          onChangeSound={() => {
            Alert.alert(
              "Suara Notifikasi",
              "Nada dering notifikasi kasus baru diatur ke nada standar perangkat.",
            );
          }}
        />
      )}

      {activeView === "account-hub" && (
        <>
          <PractitionerAccountHubView
            fullName={fullName}
            title={title}
            avatarUrl={avatarUrl}
            onOpenProfessionalProfile={() =>
              setActiveView("profil-profesional")
            }
            onOpenAvailability={() => setActiveView("ketersediaan")}
            onOpenBankAccount={() =>
              router.push(
                `${ROUTES.PRACTITIONER.HISTORY}?view=bank-account`,
              )
            }
            onOpenPayoutHistory={() =>
              router.push(
                `${ROUTES.PRACTITIONER.HISTORY}?view=payout-history`,
              )
            }
            onSwitchToPatientView={() =>
              router.push(ROUTES.PATIENT.DASHBOARD)
            }
            onOpenSettings={() => setActiveView("pengaturan")}
            onOpenHelp={handleHelpAction}
            onSignOut={handleSignOut}
          />
          <PractitionerTabBar activeTab="akun" />
        </>
      )}
    </SafeAreaView>
  );
}

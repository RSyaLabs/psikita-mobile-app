import React, { useState, useEffect } from "react";
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
  type DaySchedule,
} from "@/components/practitioner/profile";
import { ChangePhotoModal } from "@/components/modals";
import { PractitionerTabBar } from "@/components/navigation";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import { practitionerService } from "@/api/practitioner.service";
import { ApiError } from "@/api/client";
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

const DAY_NUMBER_TO_NAME: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7,
};

export default function PractitionerProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: string; day?: string; guest?: string }>();
  const isGuest = params.guest === "true";
  const { data: profile, refetch: refetchProfile } = usePractitionerProfile();
  const { data: avatarData } = useMyAvatar();
  const { user, signOut } = useAuth();
  const startPractitionerVerification = useStartPractitionerVerification();

  const [activeView, setActiveView] = useState<ProfileActiveView>(
    (params.view as ProfileActiveView) || "account-hub",
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    params.day || "Senin",
  );
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [weeklySchedules, setWeeklySchedules] = useState<DaySchedule[]>([
    { day: "Senin", hours: "09:00 - 17:00", isActive: true },
    { day: "Selasa", hours: "09:00 - 17:00", isActive: true },
    { day: "Rabu", hours: "09:00 - 17:00", isActive: true },
    { day: "Kamis", hours: "09:00 - 17:00", isActive: true },
    { day: "Jumat", hours: "09:00 - 17:00", isActive: true },
  ]);

  useEffect(() => {
    if (params.view) {
      setActiveView(params.view as ProfileActiveView);
    }
  }, [params.view]);

  useEffect(() => {
    if (params.day) {
      setSelectedDay(params.day);
    }
  }, [params.day]);

  useEffect(() => {
    if (isGuest || !user) return;
    let mounted = true;
    practitionerService
      .getMySchedules()
      .then((res) => {
        if (!mounted || !Array.isArray(res?.schedules) || res.schedules.length === 0) {
          return;
        }
        const mapped = res.schedules.map((item) => ({
          day: DAY_NUMBER_TO_NAME[item.dayOfWeek] || `Hari ${item.dayOfWeek}`,
          hours: `${item.startTime} - ${item.endTime}`,
          isActive: item.isActive,
        }));
        setWeeklySchedules(mapped);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [isGuest, user]);

  const fullName =
    profile?.fullName || user?.email?.split("@")[0] || "Mitra Praktisi";
  const title =
    profile?.title ||
    (profile?.type === "PSYCHIATRIST" ? "Psikiater Klinis" : "Psikolog Klinis");
  const avatarUrl = avatarData?.avatarUrl;

  const persistWeeklySchedules = async (updated: DaySchedule[]) => {
    if (isGuest) {
      setWeeklySchedules(updated);
      Alert.alert("Sukses", "Jadwal pratinjau berhasil diperbarui.");
      return true;
    }
    try {
      const payload = updated.map((item) => {
        const [rawStart = "09:00", rawEnd = "17:00"] = item.hours.split("-").map((s) => s.trim().replace(".", ":"));
        return {
          type: "WAR_ROOM_DUTY" as const,
          dayOfWeek: DAY_NAME_TO_NUMBER[item.day] || 1,
          startTime: rawStart,
          endTime: rawEnd,
          timezone: "Asia/Jakarta",
          isActive: item.isActive,
        };
      });
      await practitionerService.replaceMyWeeklySchedules(payload);
      setWeeklySchedules(updated);
      return true;
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Menyimpan Jadwal",
        err instanceof ApiError ? err.message : "Tidak dapat memperbarui jadwal ke server.",
      );
      return false;
    }
  };

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
          initialReady={profile?.availabilityStatus === "AVAILABLE"}
          initialSchedules={weeklySchedules}
          onBack={() => setActiveView("account-hub")}
          onEditDay={(day) => {
            setSelectedDay(day);
            setActiveView("ubah-jam");
          }}
          onSave={async (availability) => {
            const ok = await persistWeeklySchedules(availability.schedules);
            if (ok) {
              Alert.alert("Sukses", "Jadwal ketersediaan berhasil disimpan.");
              setActiveView("account-hub");
            }
            return ok;
          }}
        />
      )}

      {activeView === "jadwal" && (
        <WeeklyScheduleView
          onBack={() => setActiveView("account-hub")}
          onOpenAvailability={() => setActiveView("ketersediaan")}
          onEnterSession={(sessionId) => {
            router.push({
              pathname: ROUTES.PRACTITIONER.CHAT,
              params: { consultationId: sessionId },
            } as any);
          }}
          onViewCase={(caseId) => {
            router.push({
              pathname: ROUTES.PRACTITIONER.WAR_ROOM,
              params: { offerId: caseId },
            } as any);
          }}
        />
      )}

      {activeView === "ubah-jam" && (
        <EditScheduleHoursView
          dayName={selectedDay}
          onBack={() => setActiveView("ketersediaan")}
          onCancel={() => setActiveView("ketersediaan")}
          onSaveHours={async ({ dayName, startTime, endTime, isActive, applyToAll }) => {
            const normStart = startTime.replace(".", ":");
            const normEnd = endTime.replace(".", ":");
            const nextSchedules = weeklySchedules.map((item) =>
              applyToAll || item.day === dayName
                ? { ...item, hours: `${normStart} - ${normEnd}`, isActive }
                : item,
            );
            const ok = await persistWeeklySchedules(nextSchedules);
            if (ok) {
              Alert.alert(
                "Jam Diperbarui",
                `Jam praktik hari ${dayName} (${normStart} - ${normEnd}) berhasil disimpan.`,
              );
              setActiveView("ketersediaan");
            }
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
          onChangePhoto={() => setShowPhotoModal(true)}
          onSave={async ({ displayName }) => {
            if (isGuest) {
              Alert.alert("Profil Disimpan", `Profil profesional ${displayName} diperbarui.`);
              setActiveView("account-hub");
              return;
            }
            if (!profile?.id) {
              Alert.alert("Profil Belum Tersedia", "Profil praktisi belum ditemukan di server.");
              return;
            }
            try {
              await practitionerService.updateProfile(profile.id, {
                fullNameWithTitle: displayName.trim(),
              });
              await refetchProfile();
              haptics.success();
              Alert.alert(
                "Profil Disimpan",
                `Profil profesional ${displayName} berhasil diperbarui.`,
              );
              setActiveView("account-hub");
            } catch (err: unknown) {
              haptics.error();
              Alert.alert(
                "Gagal Menyimpan Profil",
                err instanceof ApiError ? err.message : "Terjadi kendala saat memperbarui profil.",
              );
            }
          }}
        />
      )}

      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />

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

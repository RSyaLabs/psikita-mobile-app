import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "@/components/ui";
import { PractitionerNotifModal } from "@/components/modals";
import { ROUTES } from "@/constants";
import { PractitionerTabBar } from "@/components/navigation";
import {
  PractitionerDashboardHeader,
  PractitionerStatsRow,
  PractitionerQueueSection,
  PractitionerQuickActions,
} from "@/components/practitioner/dashboard";
import {
  usePractitionerProfile,
  useTriageQueue,
  useChangeAvailability,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils";
import { resolveServerValue } from "@/utils/server-value";

export default function PractitionerDashboardScreen() {
  const router = useRouter();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const { data: profile } = usePractitionerProfile();
  const queueQuery = useTriageQueue();
  const changeAvailabilityMutation = useChangeAvailability();
  const isOnline = profile?.availabilityStatus === "AVAILABLE";

  // No invented practitioner identity or credentials: an unverified profile
  // used to render a licensed doctor with a Kemenkes verification badge.
  const doctorName = resolveServerValue(
    profile?.fullName,
    (value) => value,
    "Nama belum tersedia",
  );
  const specText = resolveServerValue(
    profile?.specialization,
    (value) => value,
    "Spesialisasi belum tersedia",
  );
  const licenseText = profile?.strNumber
    ? `STR: ${profile.strNumber}`
    : profile?.sippNumber
      ? `SIPP: ${profile.sippNumber}`
      : "Nomor STR/SIPP belum tersedia";

  const queueCount =
    queueQuery.isLoading || queueQuery.isError
      ? undefined
      : queueQuery.data?.length;

  const queueMessage = queueQuery.isLoading
    ? "Memuat status antrian dari server…"
    : queueQuery.isError
      ? "Status antrian tidak tersedia dari server."
      : queueCount === 0
        ? "Antrian server kosong."
        : queueCount === undefined
          ? "Jumlah antrian belum tersedia dari server."
          : `${queueCount} permintaan triase menunggu respons Anda di Ruang Siaga.`;

  const handleToggleOnline = (val: boolean) => {
    if (!profile?.id) {
      haptics.error();
      return;
    }
    haptics.light();
    changeAvailabilityMutation.mutate({
      practitionerId: profile.id,
      status: val ? "AVAILABLE" : "INACTIVE",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PractitionerDashboardHeader
        doctorName={doctorName}
        specText={specText}
        isOnline={isOnline}
        licenseText={licenseText}
        onToggleOnline={handleToggleOnline}
        onOpenNotif={() => {
          haptics.light();
          setShowNotifModal(true);
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* "Sesi berikutnya" is intentionally absent. The API exposes no next
            session, and the card used to present a named patient, a fixed
            clock time and a GAD diagnosis as a real appointment that a
            practitioner could act on. It returns once the server sends one. */}
        <PractitionerStatsRow
          queueCount={queueCount}
          todaySessionsCount={undefined}
          rating={profile?.rating}
        />

        <PractitionerQueueSection
          queueMessage={queueMessage}
          onOpenWarRoom={() => router.push(ROUTES.PRACTITIONER.WAR_ROOM)}
        />

        <PractitionerQuickActions
          onOpenHistory={() => router.push(ROUTES.PRACTITIONER.HISTORY)}
          onOpenDiagnosis={() => router.push(ROUTES.PRACTITIONER.DIAGNOSIS)}
          onOpenWithdraw={() => router.push(ROUTES.PRACTITIONER.WITHDRAW)}
          onOpenProfile={() => router.push(ROUTES.PRACTITIONER.PROFILE)}
        />
      </ScrollView>

      <PractitionerNotifModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        queueCount={queueCount}
        onOpenWarRoom={() => {
          setShowNotifModal(false);
          router.push(ROUTES.PRACTITIONER.WAR_ROOM);
        }}
      />

      <PractitionerTabBar activeTab="beranda" />
    </SafeAreaView>
  );
}

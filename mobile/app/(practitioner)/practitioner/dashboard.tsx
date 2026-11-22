import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PractitionerDashboardView } from "@/components/practitioner/dashboard";
import { PractitionerNotifModal } from "@/components/modals";
import { PractitionerTabBar } from "@/components/navigation";
import {
  usePractitionerProfile,
  useChangeAvailability,
} from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function PractitionerDashboardScreen() {
  const router = useRouter();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const { data: profile } = usePractitionerProfile();
  const changeAvailabilityMutation = useChangeAvailability();

  const isOnline = profile?.availabilityStatus === "AVAILABLE";
  const doctorName = profile?.fullName || "dr. Sarah Sp.KJ";

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
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      <PractitionerDashboardView
        doctorName={doctorName}
        isAvailable={isOnline}
        onToggleAvailability={handleToggleOnline}
        onOpenNotifications={() => {
          haptics.light();
          setShowNotifModal(true);
        }}
        onCompleteResults={() => {
          haptics.selection();
          router.push(ROUTES.PRACTITIONER.DIAGNOSIS as any);
        }}
        onViewOffers={() => {
          haptics.medium();
          router.push(ROUTES.PRACTITIONER.WAR_ROOM as any);
        }}
        onOpenNextSession={() => {
          haptics.selection();
          router.push(ROUTES.PRACTITIONER.CHAT as any);
        }}
        onViewIncome={() => {
          haptics.selection();
          router.push(ROUTES.PRACTITIONER.HISTORY as any);
        }}
      />

      {/* Persistent Bottom Tab Bar */}
      <PractitionerTabBar activeTab="beranda" />

      {/* Notifications Modal */}
      <PractitionerNotifModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        onOpenWarRoom={() => {
          setShowNotifModal(false);
          router.push(ROUTES.PRACTITIONER.WAR_ROOM as any);
        }}
      />
    </SafeAreaView>
  );
}

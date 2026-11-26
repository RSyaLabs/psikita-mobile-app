import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionOvertimeSheet } from "@/components/patient/chat";
import { useActiveConsultation, usePractitioner } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";

export default function OvertimeModalScreen() {
  const router = useRouter();
  const { consultationId, guest } = useLocalSearchParams<{
    consultationId?: string;
    guest?: string;
  }>();

  const isGuest = guest === "true";
  const consultation = useActiveConsultation(consultationId);
  const practitioner = usePractitioner(consultation.context?.practitionerId);
  const practitionerName = practitioner.data?.fullName || "Psikolog Sesi";

  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    safeNavigateBack(router, ROUTES.PATIENT.CHAT_ROOM);
  };

  const handleProceedToPayment = (minutes: 15 | 30) => {
    setIsOpen(false);
    router.push({
      pathname: ROUTES.PATIENT.CHECKOUT,
      params: {
        consultationId: consultationId || "",
        overtime: String(minutes),
        ...(isGuest ? { guest: "true" } : {}),
      },
    } as any);
  };

  const handleEndSessionOnTime = () => {
    setIsOpen(false);
    router.push({
      pathname: ROUTES.PATIENT.SESSION_SUMMARY,
      params: {
        consultationId: consultationId || "",
        ...(isGuest ? { guest: "true" } : {}),
      },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SessionOvertimeSheet
        isOpen={isOpen}
        timeRemaining="05:00"
        practitionerName={practitionerName}
        rate15Label="Rp 25.000"
        rate30Label="Rp 45.000"
        onClose={handleClose}
        onProceedToPayment={handleProceedToPayment}
        onEndSessionOnTime={handleEndSessionOnTime}
      />
    </SafeAreaView>
  );
}

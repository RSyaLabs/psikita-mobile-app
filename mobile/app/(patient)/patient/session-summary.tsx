import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  SessionCompletedView,
  ConsultationResultView,
} from "@/components/patient/chat";
import { CrisisHelpModal } from "@/components/modals";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useConsultationNotes,
  useCarePlan,
  usePatientResultDetail,
  usePractitioner,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";

export default function SessionSummaryScreen() {
  const router = useRouter();
  const {
    consultationId: routeConsultationId,
    step: initialStep,
    guest,
  } = useLocalSearchParams<{
    consultationId?: string;
    step?: string;
    guest?: string;
  }>();

  const isGuest = guest === "true";
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;

  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const targetConsultationId = context?.consultationId || consultationId || "";

  const notesQuery = useConsultationNotes(targetConsultationId);
  const { data: carePlan } = useCarePlan(targetConsultationId);
  const { data: resultDetail } = usePatientResultDetail(targetConsultationId);

  // Toggle between Screen 46 ("completed") and Screen 47 ("result")
  const [activeView, setActiveView] = useState<"completed" | "result">(
    initialStep === "result" ? "result" : "completed",
  );
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);

  useEffect(() => {
    setActiveView(initialStep === "result" ? "result" : "completed");
  }, [initialStep]);

  const note = notesQuery.data?.[0];
  const practitioner = usePractitioner(context?.practitionerId);
  const practitionerName =
    resultDetail?.practitionerName ||
    practitioner.data?.fullName ||
    "Psikolog Sesi";

  const doctorAdvice =
    resultDetail?.patientFacingAdvice ||
    note?.soap?.plan ||
    note?.soapData?.plan ||
    "Catatan klinis sedang disiapkan oleh praktisi Anda.";

  const carePlanList: string[] =
    carePlan?.interventions?.map((i) => i.title || i.description) ||
    carePlan?.goals ||
    ["Belum ada tugas perawatan lanjutan yang ditetapkan."];

  const handleBackToHome = () => {
    haptics.light();
    router.replace(ROUTES.PATIENT.DASHBOARD as any);
  };

  const handleSelectFollowUpSchedule = () => {
    haptics.selection();
    router.push({
      pathname: ROUTES.PATIENT.FOLLOW_UPS,
      params: {
        consultationId: targetConsultationId,
        ...(isGuest ? { guest: "true" } : {}),
      },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {activeView === "completed" ? (
        /* Screen 46: Sesi Selesai */
        <SessionCompletedView
          isResultReady={Boolean(note || resultDetail || initialStep === "ready")}
          onBackToHome={handleBackToHome}
          onViewResult={() => {
            haptics.selection();
            setActiveView("result");
          }}
        />
      ) : (
        /* Screen 47: Hasil Konsultasi */
        <ConsultationResultView
          dateLabel={
            note?.createdAt
              ? new Date(note.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Sesi Terbaru"
          }
          practitionerName={practitionerName}
          doctorNotes={doctorAdvice}
          carePlanItems={carePlanList}
          followUpDeadline="Dalam 7 hari ke depan"
          onBack={() => setActiveView("completed")}
          onViewFullCarePlan={() => {
            haptics.selection();
            router.push({
              pathname: ROUTES.PATIENT.FOLLOW_UPS,
              params: {
                consultationId: targetConsultationId,
                step: "care-plan",
                ...(isGuest ? { guest: "true" } : {}),
              },
            } as any);
          }}
          onViewFollowUpDetail={() => {
            haptics.selection();
            router.push({
              pathname: ROUTES.PATIENT.FOLLOW_UPS,
              params: {
                consultationId: targetConsultationId,
                step: "recommendation",
                ...(isGuest ? { guest: "true" } : {}),
              },
            } as any);
          }}
          onSelectFollowUpSchedule={() => {
            haptics.selection();
            router.push({
              pathname: ROUTES.PATIENT.FOLLOW_UPS,
              params: {
                consultationId: targetConsultationId,
                step: "picker",
                ...(isGuest ? { guest: "true" } : {}),
              },
            } as any);
          }}
          onOpenCrisisHelp={() => setShowCrisisHelp(true)}
        />
      )}

      {/* Emergency Crisis Help Modal */}
      <CrisisHelpModal
        isOpen={showCrisisHelp}
        onClose={() => setShowCrisisHelp(false)}
      />
    </SafeAreaView>
  );
}

import React, { useState } from "react";
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

  const note = notesQuery.data?.[0];
  const practitioner = usePractitioner(context?.practitionerId);
  const practitionerName =
    resultDetail?.practitionerName ||
    practitioner.data?.fullName ||
    "Dr. Sarah Jenkins, Sp.KJ";

  const doctorAdvice =
    resultDetail?.patientFacingAdvice ||
    note?.soap?.plan ||
    note?.soapData?.plan ||
    "Pertahankan teknik relaksasi pernapasan 4-7-8 setiap sebelum tidur. Jadwalkan waktu istirahat teratur dan kurangi stimulasi layar 1 jam sebelum beristirahat.";

  const carePlanList: string[] =
    carePlan?.interventions?.map((i) => i.title || i.description) ||
    carePlan?.goals || [
      "Latihan pernapasan diafragma 10 menit setiap pagi dan malam",
      "Jurnal harian pemicu rasa cemas dan catatan pola tidur",
      "Jalan kaki santai 20 menit saat sore hari tanpa gawai",
    ];

  const handleBackToHome = () => {
    haptics.light();
    router.replace(ROUTES.PATIENT.DASHBOARD as any);
  };

  const handleSelectFollowUpSchedule = () => {
    haptics.selection();
    router.push({
      pathname: ROUTES.PATIENT.FOLLOW_UPS,
      params: { consultationId: targetConsultationId, guest: guest || "true" },
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
          dateLabel="22 November 2026"
          practitionerName={practitionerName}
          doctorNotes={doctorAdvice}
          carePlanItems={carePlanList}
          followUpDeadline="29 November 2026"
          onBack={() => setActiveView("completed")}
          onViewFullCarePlan={() => {
            haptics.selection();
            router.push(ROUTES.PATIENT.PRESCRIPTION as any);
          }}
          onViewFollowUpDetail={() => {
            haptics.selection();
            router.push(ROUTES.PATIENT.FOLLOW_UPS as any);
          }}
          onSelectFollowUpSchedule={handleSelectFollowUpSchedule}
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

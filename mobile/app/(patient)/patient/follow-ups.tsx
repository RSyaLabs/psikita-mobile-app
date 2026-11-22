import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CarePlanDetailView,
  FollowUpSchedulePickerView,
  FollowUpConfirmedView,
  FollowUpRecommendationView,
} from "@/components/patient/follow-ups";
import { CrisisHelpModal } from "@/components/modals";
import { ROUTES } from "@/constants/routes";
import {
  useCarePlan,
  useActiveConsultation,
  usePractitioner,
  useMyFollowUps,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function FollowUpsScreen() {
  const router = useRouter();
  const {
    consultationId: routeConsultationId,
    step: initialStep,
    guest,
    date: routeDate,
    time: routeTime,
  } = useLocalSearchParams<{
    consultationId?: string;
    step?: string;
    guest?: string;
    date?: string;
    time?: string;
  }>();

  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId || "demo-session";

  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const targetConsultationId = context?.consultationId || consultationId;

  const { data: carePlan } = useCarePlan(targetConsultationId);
  const practitioner = usePractitioner(context?.practitionerId);
  const practitionerName =
    practitioner.data?.fullName || "Dr. Sarah Jenkins, Sp.KJ";

  // Map care plan interventions from API into UI tasks
  const carePlanTasks =
    carePlan?.interventions && carePlan.interventions.length > 0
      ? carePlan.interventions.map((item, idx) => ({
          id: `task-${idx + 1}`,
          title: item.title,
          frequency: item.description,
          completed: idx === 0,
        }))
      : undefined;

  // View state: 'care-plan' (Screen 48), 'picker' (Screen 49), 'confirmed' (Screen 50), 'recommendation' (Screen 51)
  const [currentStep, setCurrentStep] = useState<
    "care-plan" | "picker" | "confirmed" | "recommendation"
  >(
    initialStep === "care-plan"
      ? "care-plan"
      : initialStep === "confirmed"
        ? "confirmed"
        : initialStep === "recommendation"
          ? "recommendation"
          : "picker",
  );

  const [confirmedSchedule, setConfirmedSchedule] = useState({
    date: routeDate || "Rabu, 18 November 2026",
    time: routeTime || "10.00 WIB",
  });

  const [showCrisisHelp, setShowCrisisHelp] = useState(false);

  const handleBackToResults = () => {
    haptics.light();
    router.push({
      pathname: ROUTES.PATIENT.SESSION_SUMMARY,
      params: {
        consultationId: targetConsultationId,
        step: "result",
        guest: guest || "true",
      },
    } as any);
  };

  const handleProceedToCheckout = (selectedDate: string, selectedTime: string) => {
    haptics.selection();
    setConfirmedSchedule({
      date: selectedDate,
      time: `${selectedTime} WIB`,
    });
    // In demo / test flow, can advance directly to confirmed or checkout
    setCurrentStep("confirmed");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <SafeAreaView
        edges={[]}
        className="flex-1 max-w-[640px] md:max-w-[720px] self-center w-full"
      >
        {/* Screen 48: Rencana Perawatan */}
        {currentStep === "care-plan" && (
          <CarePlanDetailView
            practitionerName={practitionerName}
            validUntil="29 November 2026"
            tasks={carePlanTasks}
            reminderSchedule="Setiap hari · 08.00 & 20.00 WIB"
            onSelectSchedule={() => setCurrentStep("picker")}
            onBackToResults={handleBackToResults}
            onOpenCrisisHelp={() => setShowCrisisHelp(true)}
          />
        )}

        {/* Screen 49: Pilih Jadwal Lanjutan */}
        {currentStep === "picker" && (
          <FollowUpSchedulePickerView
            practitionerName={practitionerName}
            sessionDuration="50 menit"
            onProceedToCheckout={handleProceedToCheckout}
            onDismiss={handleBackToResults}
          />
        )}

        {/* Screen 50: Jadwal Lanjutan Terkonfirmasi */}
        {currentStep === "confirmed" && (
          <FollowUpConfirmedView
            practitionerName={practitionerName}
            scheduledTime={`${confirmedSchedule.date} · ${confirmedSchedule.time}`}
            consultationFormat="Konsultasi Chat"
            totalPaid="Rp 150.000"
            rescheduleDeadline="2 jam"
            onAddToCalendar={() => haptics.success()}
            onViewMySchedule={() => {
              haptics.selection();
              router.push(ROUTES.PATIENT.HISTORY as any);
            }}
            onBackToHome={() => {
              haptics.selection();
              safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
            }}
          />
        )}

        {/* Screen 51: Detail Rekomendasi Sesi Lanjutan */}
        {currentStep === "recommendation" && (
          <FollowUpRecommendationView
            practitionerName={practitionerName}
            sessionDate="22 November 2026"
            clinicalReason="Memerlukan evaluasi penerapan teknik relaksasi diafragma 4-7-8 secara konsisten dan pemantauan penurunan gejala kecemasan mingguan."
            durationLabel="50 menit"
            formatLabel="Chat / Video"
            validUntil="29 November 2026"
            estimatedFee="Rp 150.000"
            onProceedToSchedule={() => setCurrentStep("picker")}
            onDismiss={handleBackToResults}
          />
        )}

        {/* Emergency Crisis Help Modal */}
        <CrisisHelpModal
          isOpen={showCrisisHelp}
          onClose={() => setShowCrisisHelp(false)}
        />
      </SafeAreaView>
    </SafeAreaView>
  );
}

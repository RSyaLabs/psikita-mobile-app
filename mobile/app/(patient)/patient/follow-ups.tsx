import React, { useState, useEffect } from "react";
import { Alert, Share } from "react-native";
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
import { followUpService } from "@/api";
import { ApiError } from "@/api/client";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

type FollowUpStep = "care-plan" | "picker" | "confirmed" | "recommendation";

function resolveFollowUpStep(view?: string, step?: string): FollowUpStep {
  const target = view || step;
  if (
    target === "care-plan" ||
    target === "confirmed" ||
    target === "recommendation" ||
    target === "picker"
  ) {
    return target;
  }
  return "picker";
}

export default function FollowUpsScreen() {
  const router = useRouter();
  const {
    consultationId: routeConsultationId,
    step: initialStep,
    view: routeView,
    guest,
    date: routeDate,
    time: routeTime,
  } = useLocalSearchParams<{
    consultationId?: string;
    step?: string;
    view?: string;
    guest?: string;
    date?: string;
    time?: string;
  }>();

  const isGuest = guest === "true";
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId || "";

  const consultation = useActiveConsultation(consultationId || undefined);
  const context = consultation.context;
  const targetConsultationId = context?.consultationId || consultationId;

  const { data: myFollowUps, refetch: refetchFollowUps } = useMyFollowUps();
  const activeFollowUp = myFollowUps?.[0];
  const { data: carePlan } = useCarePlan(targetConsultationId || undefined, {
    enabled: false,
  });
  const practitioner = usePractitioner(
    context?.practitionerId || activeFollowUp?.practitionerId,
  );
  const practitionerName = practitioner.data?.fullName || "Psikolog Pendamping";

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
  const [currentStep, setCurrentStep] = useState<FollowUpStep>(() =>
    resolveFollowUpStep(routeView, initialStep),
  );

  useEffect(() => {
    setCurrentStep(resolveFollowUpStep(routeView, initialStep));
  }, [routeView, initialStep]);

  const [confirmedSchedule, setConfirmedSchedule] = useState({
    date: routeDate || "Menunggu Jadwal",
    time: routeTime || "-",
  });

  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleBackToResults = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push({
      pathname: ROUTES.PATIENT.SESSION_SUMMARY,
      params: {
        consultationId: targetConsultationId,
        step: "result",
        ...(isGuest ? { guest: "true" } : {}),
      },
    } as any);
  };

  const handleProceedToCheckout = async (
    selectedDate: string,
    selectedTime: string,
    isoDate?: string,
  ) => {
    if (isBooking) return;
    haptics.selection();
    if (isGuest) {
      setConfirmedSchedule({
        date: selectedDate,
        time: `${selectedTime} WIB`,
      });
      setCurrentStep("confirmed");
      return;
    }

    if (!activeFollowUp?.id) {
      Alert.alert(
        "Rekomendasi Belum Tersedia",
        "Belum ada sesi tindak lanjut yang disiapkan oleh praktisi untuk dijadwalkan.",
      );
      return;
    }

    setIsBooking(true);
    try {
      const normalizedTime = selectedTime
        .replace(/WIB|WITA|WIT/gi, "")
        .trim()
        .replace(".", ":");
      const baseDate =
        isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)
          ? isoDate
          : /^\d{4}-\d{2}-\d{2}/.test(selectedDate)
            ? selectedDate.slice(0, 10)
            : new Date(Date.now() + 86400000).toISOString().slice(0, 10);
      const slotIso = selectedDate.includes("T")
        ? selectedDate
        : `${baseDate}T${normalizedTime}:00+07:00`;
      await followUpService.bookFollowUpSlot(activeFollowUp.id, slotIso);
      await refetchFollowUps();
      haptics.success();
      setConfirmedSchedule({
        date: selectedDate,
        time: `${selectedTime} WIB`,
      });
      setCurrentStep("confirmed");
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Memesan Jadwal",
        err instanceof ApiError
          ? err.message
          : "Tidak dapat mengunci jadwal sesi lanjutan saat ini.",
      );
    } finally {
      setIsBooking(false);
    }
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
            validUntil="-"
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
            totalPaid="-"
            rescheduleDeadline="2 jam"
            onAddToCalendar={() => {
              haptics.success();
              const scheduleLabel = `${confirmedSchedule.date} · ${confirmedSchedule.time}`;
              Alert.alert(
                "Pengingat Jadwal",
                `Jadwal konsultasi lanjutan dengan ${practitionerName} (${scheduleLabel}) siap dicatat ke kalender perangkat Anda.`,
                [
                  {
                    text: "Bagikan / Simpan",
                    onPress: () => {
                      void Share.share({
                        title: "Jadwal Konsultasi Seraphany",
                        message: `Konsultasi Lanjutan Seraphany\nPraktisi: ${practitionerName}\nJadwal: ${scheduleLabel}`,
                      }).catch(() => {});
                    },
                  },
                  { text: "Tutup", style: "cancel" },
                ],
              );
            }}
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
            sessionDate="-"
            clinicalReason="Direkomendasikan untuk evaluasi perkembangan sesi."
            durationLabel="50 menit"
            formatLabel="Chat / Video"
            validUntil="-"
            estimatedFee="Dihitung saat checkout"
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

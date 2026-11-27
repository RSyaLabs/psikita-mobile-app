import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import {
  CompleteSessionResultView,
  ClinicalDecisionView,
  CarePlanEditorView,
  FollowUpRecommendationsView,
  CarePlanTask,
  PrescriptionOption,
} from "@/components/practitioner/diagnosis";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useCreateSoapNote,
  useFinishConsultation,
  useCdssPatientAlerts,
  useDiagnosisCodes,
  useCreateCarePlan,
} from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";
import { haptics, safeNavigateBack } from "@/utils";

type DiagnosisView =
  | "complete-result"
  | "clinical-decision"
  | "care-plan"
  | "follow-up";

export default function DiagnosisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: DiagnosisView;
    consultationId?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";
  const initialView: DiagnosisView = params.view || "complete-result";
  const [activeView, setActiveView] = useState<DiagnosisView>(initialView);

  useEffect(() => {
    if (params.view) {
      setActiveView(params.view);
    }
  }, [params.view]);

  const routeConsultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const consultation = useActiveConsultation(routeConsultationId);
  const context = consultation.context;

  const soapMutation = useCreateSoapNote();
  const finishMutation = useFinishConsultation();
  const carePlanMutation = useCreateCarePlan();
  const { data: _cdssAlerts } = useCdssPatientAlerts(context?.patientId);
  const { data: _serverIcdCodes } = useDiagnosisCodes({ system: "ICD10" });

  // State for clinical decisions
  const [diagnosis, setDiagnosis] = useState("");
  const [advice, setAdvice] = useState("");
  const [needFollowUp, setNeedFollowUp] = useState(true);
  const [prescriptionOption, setPrescriptionOption] =
    useState<PrescriptionOption>("none");
  const [carePlanTasks, setCarePlanTasks] = useState<CarePlanTask[]>([]);
  const [carePlanValidUntil, setCarePlanValidUntil] = useState("");

  const handleSubmitResult = async (data: {
    advice: string;
    needFollowUp: boolean;
  }) => {
    setAdvice(data.advice);
    setNeedFollowUp(data.needFollowUp);
    if (isGuest) {
      haptics.success();
      router.push({
        pathname: ROUTES.PRACTITIONER.HISTORY,
        params: { consultationId: routeConsultationId, guest: "true" },
      } as never);
      return;
    }

    if (!context) {
      haptics.error();
      Alert.alert(
        "Sesi Tidak Ditemukan",
        "Buka halaman ini dari ruang konsultasi aktif agar hasil klinis dapat dikirim ke pasien.",
      );
      return;
    }

    try {
      await soapMutation.mutateAsync({
        context,
        dto: {
          subjective: "Keluhan pasien selama sesi konsultasi.",
          objective: "Evaluasi klinis selama sesi berlangsung.",
          assessment: diagnosis.trim() || "Evaluasi Klinis",
          plan: data.advice,
          icd10Code: diagnosis.trim().split(/\s+/)[0] || undefined,
          icd10Description: diagnosis.trim() || undefined,
        },
      });
      await finishMutation.mutateAsync(context);
      haptics.success();
      router.push({
        pathname: ROUTES.PRACTITIONER.HISTORY,
        params: { consultationId: context.consultationId },
      } as never);
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Mengirim Hasil Sesi",
        err instanceof ApiError
          ? err.message
          : "Catatan klinis belum tersimpan ke server. Silakan coba lagi.",
      );
    }
  };

  const handleSaveCarePlan = async (data: {
    tasks: CarePlanTask[];
    validUntil: string;
  }) => {
    haptics.light();
    setCarePlanTasks(data.tasks);
    setCarePlanValidUntil(data.validUntil);
    if (!isGuest && context && data.tasks.length > 0) {
      try {
        await carePlanMutation.mutateAsync({
          consultationId: context.consultationId,
          payload: {
            goals: ["Pemantauan progres dan kepatuhan intervensi pasien"],
            interventions: data.tasks.map((t) => ({
              title: t.title,
              description: t.frequency,
              frequency: t.frequency,
            })),
            targetReviewDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          },
        });
      } catch (err: unknown) {
        haptics.error();
        Alert.alert(
          "Gagal Menyimpan Care Plan",
          err instanceof ApiError
            ? err.message
            : "Rencana perawatan belum tersimpan ke server.",
        );
        return;
      }
    }
    setActiveView("complete-result");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Box className="flex-1">
        {activeView === "complete-result" && (
          <CompleteSessionResultView
            patientName="Pasien Sesi"
            initialDiagnosis={diagnosis}
            initialAdvice={advice}
            initialNeedFollowUp={needFollowUp}
            hasCarePlan={carePlanTasks.length > 0}
            isSubmitting={soapMutation.isPending || finishMutation.isPending}
            onOpenClinicalDecision={() => setActiveView("clinical-decision")}
            onOpenCarePlan={() => setActiveView("care-plan")}
            onViewNotes={() => {
              haptics.light();
              router.push({
                pathname: ROUTES.PRACTITIONER.CHAT,
                params: { view: "notes", consultationId: routeConsultationId },
              } as never);
            }}
            onSubmitResult={handleSubmitResult}
            onSaveDraftAndExit={() =>
              safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)
            }
            onBack={() =>
              safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)
            }
          />
        )}

        {activeView === "clinical-decision" && (
          <ClinicalDecisionView
            initialDiagnosis={diagnosis}
            initialPrescriptionOption={prescriptionOption}
            onSave={(data) => {
              haptics.light();
              setDiagnosis(data.diagnosis);
              setPrescriptionOption(data.prescriptionOption);
              setActiveView("complete-result");
            }}
            onCancel={() => setActiveView("complete-result")}
          />
        )}

        {activeView === "care-plan" && (
          <CarePlanEditorView
            initialTasks={carePlanTasks}
            initialValidUntil={carePlanValidUntil}
            onSavePlan={handleSaveCarePlan}
            onCancel={() => setActiveView("complete-result")}
          />
        )}

        {activeView === "follow-up" && (
          <FollowUpRecommendationsView
            onBack={() =>
              safeNavigateBack(router, ROUTES.PRACTITIONER.WAR_ROOM)
            }
            onSelectFollowUp={(id) => {
              haptics.light();
              router.push({
                pathname: ROUTES.PRACTITIONER.WAR_ROOM,
                params: { view: "my-cases", selectedId: id },
              } as never);
            }}
          />
        )}
      </Box>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
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
  }>();

  const initialView: DiagnosisView = params.view || "complete-result";
  const [activeView, setActiveView] = useState<DiagnosisView>(initialView);

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
  const [diagnosis, setDiagnosis] = useState(
    "F41.1 Generalized Anxiety Disorder dengan insomnia sekunder",
  );
  const [prescriptionOption, setPrescriptionOption] =
    useState<PrescriptionOption>("none");
  const [carePlanTasks, setCarePlanTasks] = useState<CarePlanTask[]>([
    {
      id: "task-1",
      title: "Latihan pernapasan 4-7-8",
      frequency: "2x sehari, pagi dan sebelum tidur",
    },
    {
      id: "task-2",
      title: "Jurnal kecemasan harian",
      frequency: "1x sehari saat merasa cemas",
    },
  ]);
  const [carePlanValidUntil, setCarePlanValidUntil] =
    useState("30 hari ke depan");

  const handleSubmitResult = (data: {
    advice: string;
    needFollowUp: boolean;
  }) => {
    haptics.success();
    if (context) {
      soapMutation.mutate({
        context,
        dto: {
          subjective: "Keluhan kecemasan dan insomnia 3 minggu terakhir.",
          objective: "Afek terbatas, tanda vital stabil.",
          assessment: diagnosis,
          plan: data.advice,
          icd10Code: "F41.1",
          icd10Description: "Generalized anxiety disorder",
        },
      });
      finishMutation.mutate(context);
    }
    router.push({
      pathname: ROUTES.PRACTITIONER.HISTORY,
      params: { consultationId: routeConsultationId },
    } as never);
  };

  const handleSaveCarePlan = (data: {
    tasks: CarePlanTask[];
    validUntil: string;
  }) => {
    haptics.light();
    setCarePlanTasks(data.tasks);
    setCarePlanValidUntil(data.validUntil);
    if (context && data.tasks.length > 0) {
      carePlanMutation.mutate({
        consultationId: context.consultationId,
        payload: {
          goals: ["Mengurangi kecemasan dan memperbaiki pola tidur"],
          interventions: data.tasks.map((t) => ({
            title: t.title,
            description: t.frequency,
            frequency: t.frequency,
          })),
          targetReviewDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      });
    }
    setActiveView("complete-result");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Box className="flex-1">
        {activeView === "complete-result" && (
          <CompleteSessionResultView
            patientName="Siti Rahma"
            initialDiagnosis={diagnosis}
            hasCarePlan={carePlanTasks.length > 0}
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

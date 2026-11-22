import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box, Spinner, Text } from "@/components/ui";
import {
  ScreeningCatalogView,
  ScreeningQuestionView,
  ScreeningResultView,
  FALLBACK_INSTRUMENTS,
  FALLBACK_QUESTIONS,
  type ScreeningHistoryItem,
} from "@/components/patient/screening";
import {
  usePsychometricInstruments,
  usePsychometricForm,
  useScorePsychometricDryRun,
} from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PsychometricInstrumentDto } from "@/api/psychometrics.service";
import { safeNavigateBack } from "@/utils/navigation";

export default function SelfScreeningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    step?: string;
    code?: string;
    guest?: string;
  }>();

  // Mode: "catalog" (TR1) | "form" (TR2) | "result" (TR3)
  const initialStep =
    params.step === "form"
      ? "form"
      : params.step === "result"
        ? "result"
        : "catalog";

  const [currentStep, setCurrentStep] = useState<"catalog" | "form" | "result">(
    initialStep,
  );
  const [selectedCode, setSelectedCode] = useState<string>(params.code || "DASS-21");
  const [testResult, setTestResult] = useState<{
    score: number;
    maxScore: number;
    category: string;
    explanation?: string;
  }>({
    score: 12,
    maxScore: 42,
    category: "Kecemasan Sedang",
    explanation:
      "Skor Anda menunjukkan adanya tingkat kecemasan sedang. Anda mungkin sering merasa tegang, khawatir berlebihan, atau gelisah dalam aktivitas harian.",
  });

  const { data: instrumentsData, isLoading: isInstrumentsLoading } =
    usePsychometricInstruments();
  const { data: formData, isLoading: isFormLoading } =
    usePsychometricForm(selectedCode);
  const dryRunMutation = useScorePsychometricDryRun();

  const instruments =
    instrumentsData && instrumentsData.length > 0
      ? instrumentsData
      : FALLBACK_INSTRUMENTS;

  const currentInstrument =
    instruments.find((i) => i.code === selectedCode) || instruments[0];

  const questions =
    formData && formData.questions && formData.questions.length > 0
      ? formData.questions
      : FALLBACK_QUESTIONS;

  const handleSelectInstrument = (inst: PsychometricInstrumentDto) => {
    setSelectedCode(inst.code);
    setCurrentStep("form");
  };

  const handleViewHistoryItem = (item: ScreeningHistoryItem) => {
    setSelectedCode(item.code);
    setTestResult({
      score: item.score,
      maxScore: item.maxScore,
      category: item.category,
      explanation: `Catatan historis dari tes mandiri ${item.testName} pada ${item.date}.`,
    });
    setCurrentStep("result");
  };

  const handleSubmitAnswers = (answers: Record<string, number>) => {
    // Calculate total score locally and run dry-run API scoring
    const totalScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const maxScore = questions.length * 3;

    let category = "Gejala Ringan";
    if (totalScore >= 15) {
      category = "Kecemasan Berat";
    } else if (totalScore >= 8) {
      category = "Kecemasan Sedang";
    }

    setTestResult({
      score: totalScore,
      maxScore,
      category,
      explanation: `Berdasarkan jawaban Anda pada tes ${currentInstrument.title}, terdeteksi ${category.toLowerCase()}. Hasil ini bukan diagnosis klinis resmi.`,
    });

    dryRunMutation.mutate(
      {
        code: selectedCode,
        dto: { answers },
      },
      {
        onSuccess: (data) => {
          if (data?.severity?.label) {
            setTestResult((prev) => ({
              ...prev,
              category: data.severity?.label || prev.category,
              explanation: data.severity?.description || prev.explanation,
            }));
          }
        },
      },
    );

    haptics.success();
    setCurrentStep("result");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {currentStep === "form" ? (
        <ScreeningQuestionView
          testTitle={currentInstrument.title}
          questions={questions}
          onBack={() => setCurrentStep("catalog")}
          onSubmit={handleSubmitAnswers}
        />
      ) : currentStep === "result" ? (
        <ScreeningResultView
          testCode={selectedCode}
          testTitle={currentInstrument.title}
          categoryLabel={testResult.category}
          totalScore={testResult.score}
          maxScore={testResult.maxScore}
          explanation={testResult.explanation}
          onBack={() => setCurrentStep("catalog")}
          onViewFeedTopic={() => {
            router.push(ROUTES.PATIENT.COMMUNITY as never);
          }}
          onConsultDoctor={() => {
            router.push(ROUTES.PATIENT.TRIAGE as never);
          }}
          onOpenCrisisHelp={() => {
            router.push({
              pathname: ROUTES.PATIENT.COMMUNITY,
              params: { step: "crisis", guest: params.guest },
            } as any);
          }}
          onBackToCatalog={() => setCurrentStep("catalog")}
        />
      ) : (
        <ScreeningCatalogView
          instruments={instruments}
          onBack={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
          onSelectInstrument={handleSelectInstrument}
          onViewHistoryItem={handleViewHistoryItem}
          onOpenCrisisHelp={() => {
            router.push({
              pathname: ROUTES.PATIENT.COMMUNITY,
              params: { step: "crisis", guest: params.guest },
            } as any);
          }}
        />
      )}
    </SafeAreaView>
  );
}

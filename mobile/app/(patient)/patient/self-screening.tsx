import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
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
import { ApiError } from "@/api/client";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PsychometricInstrumentDto } from "@/api/psychometrics.service";
import { safeNavigateBack } from "@/utils/navigation";

function resolveScreeningStep(step?: string): "catalog" | "form" | "result" {
  if (step === "form" || step === "question") return "form";
  if (step === "result") return "result";
  return "catalog";
}

export default function SelfScreeningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    step?: string;
    code?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";

  // Mode: "catalog" (TR1) | "form" (TR2) | "result" (TR3)
  const [currentStep, setCurrentStep] = useState<"catalog" | "form" | "result">(
    () => resolveScreeningStep(params.step),
  );
  const [selectedCode, setSelectedCode] = useState<string>(params.code || "DASS-21");

  useEffect(() => {
    setCurrentStep(resolveScreeningStep(params.step));
  }, [params.step]);

  useEffect(() => {
    if (params.code) {
      setSelectedCode(params.code);
    }
  }, [params.code]);

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
    const totalScore = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    const maxScore = questions.length * 3;

    let fallbackCategory = "Gejala Ringan";
    if (totalScore >= 15) {
      fallbackCategory = "Kecemasan Berat";
    } else if (totalScore >= 8) {
      fallbackCategory = "Kecemasan Sedang";
    }

    if (isGuest) {
      setTestResult({
        score: totalScore,
        maxScore,
        category: fallbackCategory,
        explanation: `Berdasarkan jawaban Anda pada tes ${currentInstrument.title}, terdeteksi ${fallbackCategory.toLowerCase()}. Hasil ini bukan diagnosis klinis resmi.`,
      });
      haptics.success();
      setCurrentStep("result");
      return;
    }

    dryRunMutation.mutate(
      {
        code: selectedCode,
        dto: { answers },
      },
      {
        onSuccess: (data) => {
          const category = data?.severity?.label || fallbackCategory;
          const explanation =
            data?.severity?.description ||
            `Berdasarkan jawaban Anda pada tes ${currentInstrument.title}, terdeteksi ${category.toLowerCase()}. Hasil ini bukan diagnosis klinis resmi.`;
          setTestResult({
            score: typeof data?.totalScore === "number" ? data.totalScore : totalScore,
            maxScore,
            category,
            explanation,
          });
          haptics.success();
          setCurrentStep("result");
        },
        onError: (err: unknown) => {
          haptics.error();
          Alert.alert(
            "Gagal Memproses Hasil",
            err instanceof ApiError
              ? err.message
              : "Terjadi kendala saat menghitung skor dari server.",
          );
        },
      },
    );
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

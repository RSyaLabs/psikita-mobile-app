import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck } from "lucide-react-native";
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  ScrollView,
  Text,
  VStack,
  HStack,
  Heading,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import {
  TriageIntroStep,
  TriageQuestionStep,
  TriageReviewStep,
  TriageSuccessStep,
  TriageQuestion,
} from "@/components/patient/triage";
import { CrisisHelpModal } from "@/components/modals";
import { ROUTES } from "@/constants/routes";
import {
  useSubmitTriage,
  useStartDiditVerification,
  useMyVerificationStatus,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { ApiError } from "@/api/client";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {
    id: "question_1",
    number: 1,
    title:
      "Dalam 2 minggu terakhir, seberapa sering kamu merasa kurang bersemangat atau sulit menikmati hal-hal yang biasanya kamu sukai?",
    shortTitle: "Kurang bersemangat atau sulit menikmati aktivitas harian",
  },
  {
    id: "question_2",
    number: 2,
    title:
      "Dalam 2 minggu terakhir, seberapa sering kamu merasa sedih, murung, atau merasa putus asa?",
    shortTitle: "Merasa sedih, murung, atau putus asa",
  },
  {
    id: "question_3",
    number: 3,
    title:
      "Dalam 2 minggu terakhir, seberapa sering kamu merasa cemas sampai susah tidur?",
    shortTitle: "Cemas sampai susah tidur dalam 2 minggu terakhir",
  },
  {
    id: "question_4",
    number: 4,
    title:
      "Dalam 2 minggu terakhir, seberapa sering kamu merasa lelah berlebihan atau tidak bertenaga?",
    shortTitle: "Lelah berlebihan atau kekurangan energi fisik & emosional",
  },
  {
    id: "question_5",
    number: 5,
    title:
      "Dalam 2 minggu terakhir, seberapa sering kamu merasa kewalahan menghadapi beban pikiran atau aktivitas sehari-hari?",
    shortTitle: "Kewalahan menghadapi beban pikiran atau aktivitas",
  },
];

export const TRIAGE_OPTIONS = [
  "Tidak pernah",
  "Beberapa hari",
  "Sering, hampir tiap minggu",
  "Hampir setiap hari",
];

const SCORE_MAP: Record<string, number> = {
  "Tidak pernah": 0,
  "Beberapa hari": 1,
  "Sering, hampir tiap minggu": 2,
  "Hampir setiap hari": 3,
};

export default function TriageScreen() {
  const router = useRouter();
  const toast = useToast();
  const { guest, mode, step } = useLocalSearchParams<{
    guest?: string;
    mode?: string;
    step?: string;
  }>();

  const isGuest = guest === "true";
  const isAssessment = mode === "assessment" || isGuest;

  // Step state: 0 = Intro (Screen 24), 1..5 = Questions (Screen 25), 6 = Review (Screen 26), 7 = Confirmation (Screen 27)
  const parseStepParam = (rawStep?: string): number => {
    if (rawStep === "review") return 6;
    if (rawStep === "emergency") return 0;
    const parsed = rawStep ? parseInt(rawStep, 10) : 0;
    return isNaN(parsed) ? 0 : Math.min(Math.max(parsed, 0), 7);
  };
  const [currentStep, setCurrentStep] = useState<number>(() => parseStepParam(step));
  const [submittedTriageId, setSubmittedTriageId] = useState<string | undefined>(undefined);

  const [answers, setAnswers] = useState<Record<string, string>>((): Record<string, string> =>
    isGuest && step === "review"
      ? {
          question_1: "Beberapa hari",
          question_2: "Beberapa hari",
          question_3: "Sering, hampir tiap minggu",
          question_4: "Beberapa hari",
          question_5: "Beberapa hari",
        }
      : {},
  );

  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isKycLaunching, setIsKycLaunching] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(step === "emergency");
  const [exitModalOpen, setExitModalOpen] = useState(false);

  useEffect(() => {
    setCurrentStep(parseStepParam(step));
    if (step === "emergency") {
      setEmergencyModalOpen(true);
    }
  }, [step]);

  const submitTriageMutation = useSubmitTriage();
  const startKycMutation = useStartDiditVerification();
  const { refetch: refetchKyc } = useMyVerificationStatus();

  const handleLaunchDidit = async () => {
    haptics.selection();
    setIsKycLaunching(true);
    try {
      const session = await startKycMutation.mutateAsync();
      await launchDiditVerification(session, {
        onApproved: () => {
          haptics.success();
          setKycModalOpen(false);
          refetchKyc();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Verifikasi Berhasil</ToastTitle>
                <ToastDescription>
                  Identitas Anda telah terverifikasi. Silakan tekan Lanjut untuk memproses triase klinis.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onCompleted: () => refetchKyc(),
        onFallbackUrlLaunched: () => setKycModalOpen(false),
        onError: (err) => {
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="error">
                <ToastTitle>Kendala Verifikasi</ToastTitle>
                <ToastDescription>{err.message}</ToastDescription>
              </Toast>
            ),
          });
        },
      });
    } catch (err: unknown) {
      haptics.error();
      const msg = err instanceof Error ? err.message : "Gagal memulai sesi verifikasi identitas.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Gagal Memulai</ToastTitle>
            <ToastDescription>{msg}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsKycLaunching(false);
    }
  };

  const handleBackToDashboard = () => {
    haptics.light();
    safeNavigateBack(router, isGuest ? ROUTES.AUTH.LOGIN : ROUTES.PATIENT.DASHBOARD);
  };

  const handleSubmitTriage = () => {
    haptics.medium();

    let totalScore = 0;
    let hasSevere = false;
    for (const q of TRIAGE_QUESTIONS) {
      const ans = answers[q.id] || "Tidak pernah";
      const s = SCORE_MAP[ans] ?? 0;
      totalScore += s;
      if (s === 3) hasSevere = true;
    }

    submitTriageMutation.mutate(
      {
        score: totalScore,
        hasRedFlags: totalScore >= 10 || hasSevere,
        assessmentType: "SELF_ASSESSMENT",
        answers,
      },
      {
        onSuccess: (data) => {
          haptics.success();
          setSubmittedTriageId(data.id);
          if (isAssessment) {
            router.push({
              pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
              params: {
                triageId: data.id,
                guest: isGuest ? "true" : "false",
                mode: "assessment",
              },
            } as never);
          } else {
            setCurrentStep(7);
          }
        },
        onError: (err) => {
          if (isGuest) {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
              params: { guest: "true", mode: "assessment" },
            } as never);
            return;
          }
          if (err instanceof ApiError && err.statusCode === 403) {
            haptics.error();
            setKycModalOpen(true);
            return;
          }
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="error">
                <ToastTitle>Gagal Mengirim Triase</ToastTitle>
                <ToastDescription>
                  {err instanceof ApiError
                    ? err.message
                    : "Terjadi kendala jaringan saat mengirim jawaban."}
                </ToastDescription>
              </Toast>
            ),
          });
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="w-full max-w-[640px] md:max-w-[720px] self-center flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* SCREEN 24: Mulai Konsultasi */}
          {currentStep === 0 && (
            <TriageIntroStep
              onStart={() => setCurrentStep(1)}
              onCancel={handleBackToDashboard}
              onOpenEmergency={() => setEmergencyModalOpen(true)}
            />
          )}

          {/* SCREEN 25: Pertanyaan Triase 1..5 */}
          {currentStep >= 1 && currentStep <= 5 && (
            <TriageQuestionStep
              currentStep={currentStep}
              question={TRIAGE_QUESTIONS[currentStep - 1]}
              options={TRIAGE_OPTIONS}
              selectedOption={answers[TRIAGE_QUESTIONS[currentStep - 1].id] || ""}
              onSelectOption={(val) =>
                setAnswers((prev) => ({
                  ...prev,
                  [TRIAGE_QUESTIONS[currentStep - 1].id]: val,
                }))
              }
              onNext={() => setCurrentStep((prev) => prev + 1)}
              onBack={() => setCurrentStep((prev) => prev - 1)}
              onOpenExit={() => setExitModalOpen(true)}
            />
          )}

          {/* SCREEN 26: Periksa Jawaban Triase */}
          {currentStep === 6 && (
            <TriageReviewStep
              questions={TRIAGE_QUESTIONS}
              answers={answers}
              isSubmitting={submitTriageMutation.isPending}
              onEditQuestion={(stepNum) => setCurrentStep(stepNum)}
              onBack={() => setCurrentStep(5)}
              onSubmit={handleSubmitTriage}
            />
          )}

          {/* SCREEN 27: Jawaban Triase Diterima */}
          {currentStep === 7 && (
            <TriageSuccessStep
              onGoToMatching={() =>
                router.push(
                  (submittedTriageId
                    ? {
                        pathname: ROUTES.PATIENT.MATCHING,
                        params: { triageId: submittedTriageId },
                      }
                    : ROUTES.PATIENT.MATCHING) as never,
                )
              }
              onOpenEmergency={() => setEmergencyModalOpen(true)}
            />
          )}
        </ScrollView>
      </Box>

      {/* SCREEN 28: Crisis Help Modal */}
      <CrisisHelpModal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
        onContinueConsultation={() => setEmergencyModalOpen(false)}
        onBackToHome={() => {
          setEmergencyModalOpen(false);
          router.push(ROUTES.PATIENT.DASHBOARD as never);
        }}
      />

      {/* Exit Confirmation Modal */}
      <Modal isOpen={exitModalOpen} onClose={() => setExitModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="w-full max-w-[380px] p-5 rounded-3xl bg-card border border-border/80 shadow-lg">
          <ModalHeader className="pb-2">
            <Heading size="md" bold className="text-foreground">
              Keluar dari Pertanyaan?
            </Heading>
          </ModalHeader>
          <ModalBody className="py-2">
            <Text size="sm" className="text-muted-foreground leading-relaxed">
              Jawabanmu belum dikirim ke server. Kamu dapat kembali dan mengisi pertanyaan kapan saja.
            </Text>
          </ModalBody>
          <ModalFooter className="flex-col gap-2 pt-3">
            <Button
              size="sm"
              onPress={() => {
                haptics.light();
                setExitModalOpen(false);
              }}
              className="w-full bg-primary rounded-xl h-11"
            >
              <ButtonText className="text-sm font-bold text-white">
                Lanjut Mengisi
              </ButtonText>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                haptics.light();
                setExitModalOpen(false);
                router.push(ROUTES.PATIENT.DASHBOARD as never);
              }}
              className="w-full border-border/80 rounded-xl h-11"
            >
              <ButtonText className="text-sm font-semibold text-foreground">
                Keluar ke Beranda
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Verifikasi Identitas Gate Modal */}
      <Modal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="w-full max-w-[420px] p-5 rounded-3xl bg-card border border-border/80 shadow-lg">
          <ModalHeader className="pb-3 border-b border-border/70">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <ShieldCheck size={22} color="#4A3B6B" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Verifikasi Identitas
                </Heading>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Keamanan Rekam Medis
                </Text>
              </VStack>
              <ModalCloseButton />
            </HStack>
          </ModalHeader>
          <ModalBody className="py-4">
            <VStack space="sm">
              <Text size="sm" className="text-foreground leading-relaxed">
                Hasil triase klinis dan pencocokan psikolog hanya dapat diproses untuk akun yang telah berstatus <Text bold className="text-primary">VERIFIED</Text>.
              </Text>
              <Box className="bg-muted p-3.5 rounded-2xl border border-border/60">
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Verifikasi e-KTP dan pindai wajah berlangsung sekitar 3 menit untuk melindungi privasi rekam medismu.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col gap-2 pt-3 border-t border-border/70">
            <Button
              onPress={handleLaunchDidit}
              disabled={isKycLaunching}
              className="w-full bg-primary rounded-xl h-11 flex-row items-center justify-center shadow-xs"
            >
              {isKycLaunching ? (
                <ButtonSpinner color="#FFFFFF" />
              ) : (
                <ButtonText className="text-sm font-bold text-primary-foreground">
                  Mulai Verifikasi Sekarang
                </ButtonText>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => setKycModalOpen(false)}
              className="w-full border-border/80 rounded-xl h-11"
            >
              <ButtonText className="text-sm font-semibold text-foreground">
                Nanti Saja
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

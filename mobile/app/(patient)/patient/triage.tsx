import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pencil,
  PhoneCall,
  HeartHandshake,
} from "lucide-react-native";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  Progress,
  ProgressFilledTrack,
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
  ScrollView,
  Text,
  VStack,
  Badge,
  BadgeText,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui";
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
import { TriageResponseDto } from "@/types/api";

export interface TriageQuestion {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
}

const TRIAGE_QUESTIONS: TriageQuestion[] = [
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

const TRIAGE_OPTIONS = [
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
  const initialStep = step ? parseInt(step, 10) : 0;
  const [currentStep, setCurrentStep] = useState<number>(
    isNaN(initialStep) ? 0 : Math.min(Math.max(initialStep, 0), 7),
  );

  // Default preselected answers for seamless, calm user experience
  const [answers, setAnswers] = useState<Record<string, string>>({
    question_1: "Beberapa hari",
    question_2: "Beberapa hari",
    question_3: "Sering, hampir tiap minggu",
    question_4: "Beberapa hari",
    question_5: "Beberapa hari",
  });

  const [submittedTriage, setSubmittedTriage] =
    useState<TriageResponseDto | null>(null);

  // Modals state
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isKycLaunching, setIsKycLaunching] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

  // Queries & Mutations
  const submitTriageMutation = useSubmitTriage();
  const startKycMutation = useStartDiditVerification();
  const { data: kycStatus, refetch: refetchKyc } = useMyVerificationStatus();

  const isVerified =
    kycStatus?.status === "VERIFIED" || kycStatus?.status === "APPROVED";

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
                  Identitas Anda telah terverifikasi via Didit KYC. Silakan tekan Lanjut untuk memproses triase klinis.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onCompleted: () => {
          refetchKyc();
        },
        onFallbackUrlLaunched: () => {
          setKycModalOpen(false);
        },
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
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi verifikasi Didit.";
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

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(
      router,
      isGuest ? ROUTES.AUTH.LOGIN : ROUTES.PATIENT.DASHBOARD,
    );
  };

  const handleOptionChange = (questionId: string, val: string) => {
    haptics.selection();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  const handleSubmitTriage = () => {
    haptics.medium();

    // Calculate score & flags
    let totalScore = 0;
    let hasSevere = false;
    for (const q of TRIAGE_QUESTIONS) {
      const ans = answers[q.id] || "Tidak pernah";
      const s = SCORE_MAP[ans] ?? 0;
      totalScore += s;
      if (s === 3) {
        hasSevere = true;
      }
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
          setSubmittedTriage(data);
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
            // Screen 27: Jawaban Triase Diterima
            setCurrentStep(7);
          }
        },
        onError: (err) => {
          if (err instanceof ApiError && err.statusCode === 403) {
            haptics.error();
            setKycModalOpen(true);
            return;
          }
          // Fallback gracefully to Screen 27 confirmation
          haptics.medium();
          if (isAssessment) {
            router.push({
              pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
              params: {
                guest: isGuest ? "true" : "false",
                mode: "assessment",
              },
            } as never);
          } else {
            setCurrentStep(7);
          }
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
          {/* ========================================================
              SCREEN 24: MULAI KONSULTASI (Step 0)
             ======================================================== */}
          {currentStep === 0 && (
            <VStack space="md" className="flex-1">
              {/* Header */}
              <HStack space="sm" className="items-center mb-1">
                <Pressable
                  onPress={handleBack}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali ke Beranda"
                  className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted shadow-xs"
                >
                  <ArrowLeft size={20} color="#262130" strokeWidth={2} />
                </Pressable>
                <Heading size="md" bold className="text-foreground ml-1">
                  Mulai Konsultasi
                </Heading>
              </HStack>

              {/* Lead Heading */}
              <VStack space="xs" className="mt-1">
                <Heading size="xl" bold className="text-foreground">
                  Begini prosesnya
                </Heading>
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Empat langkah singkat. Kamu tahu apa yang terjadi di tiap langkah.
                </Text>
              </VStack>

              {/* 4-Step Process Cards (Wireframe Screen 24) */}
              <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-4 mt-2">
                {/* Step 1 */}
                <HStack space="md" className="items-start">
                  <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
                    <Text size="sm" bold className="text-primary font-bold">
                      1
                    </Text>
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Jawab 5 pertanyaan singkat
                    </Text>
                    <Text size="sm" className="text-muted-foreground leading-normal">
                      Sekitar 3 menit. Bisa kamu periksa dulu sebelum dikirim.
                    </Text>
                  </VStack>
                </HStack>

                {/* Step 2 */}
                <HStack space="md" className="items-start">
                  <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
                    <Text size="sm" bold className="text-primary font-bold">
                      2
                    </Text>
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Kami carikan psikolog yang sesuai
                    </Text>
                    <Text size="sm" className="text-muted-foreground leading-normal">
                      Kamu tidak perlu memilih sendiri. Kamu boleh menutup aplikasi.
                    </Text>
                  </VStack>
                </HStack>

                {/* Step 3 */}
                <HStack space="md" className="items-start">
                  <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
                    <Text size="sm" bold className="text-primary font-bold">
                      3
                    </Text>
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Bayar setelah psikolog ditemukan
                    </Text>
                    <Text size="sm" className="text-muted-foreground leading-normal">
                      Rincian biaya terlihat sebelum kamu membayar.
                    </Text>
                  </VStack>
                </HStack>

                {/* Step 4 */}
                <HStack space="md" className="items-start">
                  <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
                    <Text size="sm" bold className="text-primary font-bold">
                      4
                    </Text>
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Mulai sesi dan terima hasilnya
                    </Text>
                    <Text size="sm" className="text-muted-foreground leading-normal">
                      Chat atau video, lalu ringkasan dan saran dari psikolog.
                    </Text>
                  </VStack>
                </HStack>
              </Card>

              {/* Privacy Reassurance Card */}
              <Card className="bg-card rounded-xl p-3.5 border border-border/80 shadow-xs flex-row items-center gap-3">
                <Lock size={18} color="#4A3B6B" />
                <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
                  Jawabanmu privat. Ini bukan diagnosis, hanya untuk mencocokkan psikolog.
                </Text>
              </Card>

              {/* Emergency Link Banner */}
              <Pressable
                onPress={() => {
                  haptics.light();
                  setEmergencyModalOpen(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Lihat kontak bantuan darurat"
                className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex-row items-center gap-2.5 active:bg-amber-500/15"
              >
                <AlertTriangle size={18} color="#D97706" />
                <Text size="sm" className="text-amber-900 font-semibold flex-1">
                  Dalam keadaan darurat jangan menunggu: <Text bold className="underline text-amber-900">lihat bantuan segera</Text>
                </Text>
              </Pressable>

              {/* Action Buttons */}
              <VStack space="sm" className="mt-auto pt-4">
                <Button
                  size="lg"
                  onPress={() => {
                    haptics.medium();
                    setCurrentStep(1);
                  }}
                  className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
                >
                  <ButtonText className="text-white font-bold text-sm mr-2">
                    Mulai Pertanyaan
                  </ButtonText>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onPress={handleBack}
                  className="h-12 rounded-xl bg-card border-border/80 active:bg-muted"
                >
                  <ButtonText className="text-foreground font-semibold text-sm">
                    Nanti saja
                  </ButtonText>
                </Button>
              </VStack>
            </VStack>
          )}

          {/* ========================================================
              SCREEN 25: PERTANYAAN TRIASE 1 s.d. 5 (Step 1..5)
             ======================================================== */}
          {currentStep >= 1 && currentStep <= 5 && (() => {
            const currentQ = TRIAGE_QUESTIONS[currentStep - 1];
            const currentSelected = answers[currentQ.id] || "";

            return (
              <VStack space="md" className="flex-1">
                {/* Top Bar: Keluar & Progress Info */}
                <VStack space="xs" className="mb-2">
                  <HStack space="md" className="items-center justify-between mb-2">
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        setExitModalOpen(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Keluar dari triase"
                      className="px-2 py-1 rounded-lg active:bg-muted"
                    >
                      <Text size="sm" bold className="text-muted-foreground hover:text-foreground">
                        Keluar
                      </Text>
                    </Pressable>

                    <HStack space="xs" className="items-center">
                      <Text size="sm" bold className="text-foreground">
                        Pertanyaan {currentStep} dari 5
                      </Text>
                      <Badge
                        variant="outline"
                        className="bg-primary/10 border-primary/20 rounded-md px-2 py-0.5 ml-1"
                      >
                        <BadgeText className="text-sm font-bold text-primary">
                          {currentStep * 20}%
                        </BadgeText>
                      </Badge>
                    </HStack>
                  </HStack>

                  {/* Progress Bar */}
                  <Progress
                    value={currentStep * 20}
                    className="w-full h-2 bg-muted rounded-full"
                  >
                    <ProgressFilledTrack className="bg-primary" />
                  </Progress>
                </VStack>

                {/* Question Card */}
                <Card className="bg-card rounded-xl p-5 border border-border/80 shadow-xs gap-2">
                  <Heading size="lg" bold className="text-foreground leading-snug">
                    {currentQ.title}
                  </Heading>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Pilih satu yang paling sesuai.
                  </Text>
                </Card>

                {/* Radio Options List */}
                <RadioGroup
                  value={currentSelected}
                  onChange={(val) => handleOptionChange(currentQ.id, val)}
                  className="gap-3 my-1"
                >
                  {TRIAGE_OPTIONS.map((opt) => {
                    const isSelected = currentSelected === opt;
                    return (
                      <Radio
                        key={opt}
                        value={opt}
                        accessibilityRole="radio"
                        accessibilityLabel={opt}
                        accessibilityState={{ checked: isSelected }}
                        className={`p-4 rounded-xl border flex-row items-center active:opacity-90 shadow-xs ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-card border-border/80"
                        }`}
                      >
                        <RadioIndicator className="border-2 border-border/80 bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary">
                          <RadioIcon />
                        </RadioIndicator>
                        <RadioLabel
                          className={`text-sm ml-3 flex-1 ${
                            isSelected
                              ? "font-bold text-primary"
                              : "font-normal text-foreground"
                          }`}
                        >
                          {opt}
                        </RadioLabel>
                      </Radio>
                    );
                  })}
                </RadioGroup>

                {/* Micro-Reassurance Note */}
                <Card className="bg-card rounded-xl p-3 border border-border/80 shadow-xs flex-row items-center gap-2.5 mt-2">
                  <ShieldCheck size={16} color="#4A3B6B" />
                  <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
                    Jawabanmu tersimpan di perangkat dan baru dikirim setelah kamu menekan Kirim di akhir.
                  </Text>
                </Card>

                {/* Navigation Buttons Row */}
                <HStack space="sm" className="items-center mt-auto pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onPress={() => {
                      haptics.light();
                      setCurrentStep((prev) => prev - 1);
                    }}
                    className="h-12 px-5 rounded-xl bg-card border-border/80 active:bg-muted flex-row items-center justify-center shadow-xs"
                  >
                    <ArrowLeft size={18} color="#262130" strokeWidth={2} />
                    <ButtonText className="text-foreground font-semibold text-sm ml-1.5">
                      Kembali
                    </ButtonText>
                  </Button>

                  <Button
                    size="lg"
                    onPress={() => {
                      haptics.medium();
                      setCurrentStep((prev) => prev + 1);
                    }}
                    disabled={!currentSelected}
                    className={`flex-1 h-12 rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center ${
                      !currentSelected ? "bg-muted" : "bg-primary"
                    }`}
                  >
                    <ButtonText className="text-white font-bold text-sm mr-1.5">
                      {currentStep === 5 ? "Periksa Jawaban" : "Lanjut"}
                    </ButtonText>
                    <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
                  </Button>
                </HStack>
              </VStack>
            );
          })()}

          {/* ========================================================
              SCREEN 26: PERIKSA JAWABAN TRIASE (Step 6)
             ======================================================== */}
          {currentStep === 6 && (
            <VStack space="md" className="flex-1">
              {/* Header */}
              <HStack space="sm" className="items-center mb-1">
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setCurrentStep(5);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali ke pertanyaan 5"
                  className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted shadow-xs"
                >
                  <ArrowLeft size={20} color="#262130" strokeWidth={2} />
                </Pressable>
                <Heading size="md" bold className="text-foreground ml-1">
                  Periksa jawabanmu
                </Heading>
              </HStack>

              {/* Lead Section */}
              <VStack space="xs" className="mt-1">
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/20 rounded-md px-2.5 py-0.5 self-start"
                >
                  <BadgeText className="text-sm font-bold text-primary">
                    LANGKAH TERAKHIR
                  </BadgeText>
                </Badge>
                <Text size="sm" className="text-muted-foreground leading-relaxed mt-1">
                  Kamu masih bisa mengubah jawaban sebelum dikirim.
                </Text>
              </VStack>

              {/* 5-Question Review List (Wireframe Screen 26) */}
              <VStack space="sm" className="my-2">
                {TRIAGE_QUESTIONS.map((q, idx) => {
                  const userAns = answers[q.id] || "Belum dijawab";
                  return (
                    <Card
                      key={q.id}
                      className="bg-card rounded-xl p-4 border border-border/80 shadow-xs flex-row items-center justify-between gap-3"
                    >
                      <VStack space="xs" className="flex-1">
                        <Text size="sm" bold className="text-foreground">
                          {idx + 1}. {q.shortTitle}
                        </Text>
                        <Text size="sm" className="text-primary font-semibold">
                          {userAns}
                        </Text>
                      </VStack>

                      <Pressable
                        onPress={() => {
                          haptics.light();
                          setCurrentStep(idx + 1);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Ubah jawaban nomor ${idx + 1}`}
                        className="flex-row items-center px-3 py-1.5 rounded-lg bg-primary/10 active:bg-primary/20 border border-primary/20"
                      >
                        <Pencil size={14} color="#4A3B6B" />
                        <Text size="sm" bold className="text-primary ml-1.5">
                          Ubah
                        </Text>
                      </Pressable>
                    </Card>
                  );
                })}
              </VStack>

              {/* Disclaimer Micro-copy */}
              <Card className="bg-card rounded-xl p-3.5 border border-border/80 shadow-xs flex-row items-center gap-3">
                <Lock size={18} color="#4A3B6B" />
                <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
                  Pembayaran baru diminta setelah psikolog ditemukan. Jawabanmu hanya dipakai untuk mencocokkan psikolog.
                </Text>
              </Card>

              {/* Submit Action Button */}
              <VStack space="sm" className="mt-auto pt-4">
                <Button
                  size="lg"
                  onPress={handleSubmitTriage}
                  disabled={submitTriageMutation.isPending}
                  className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
                >
                  {submitTriageMutation.isPending ? (
                    <ButtonSpinner color="#FFFFFF" />
                  ) : (
                    <>
                      <ButtonText className="text-white font-bold text-sm mr-2">
                        Kirim & Cari Psikolog
                      </ButtonText>
                      <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
                    </>
                  )}
                </Button>
              </VStack>
            </VStack>
          )}

          {/* ========================================================
              SCREEN 27: JAWABAN TRIASE DITERIMA (Step 7)
             ======================================================== */}
          {currentStep === 7 && (
            <VStack space="lg" className="flex-1 py-4">
              {/* Success Hero */}
              <VStack space="sm" className="items-center text-center">
                <Box className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-2">
                  <CheckCircle2 size={36} color="#059669" />
                </Box>
                <Heading size="xl" bold className="text-foreground text-center">
                  Jawabanmu sudah kami terima
                </Heading>
                <Text size="sm" className="text-muted-foreground text-center leading-relaxed px-4">
                  Kami mulai mencarikan psikolog yang sesuai dengan kebutuhan dan preferensimu.
                </Text>
              </VStack>

              {/* Ringkasan Awal Card (Wireframe Screen 27) */}
              <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
                <Text size="sm" bold className="text-foreground uppercase tracking-wider">
                  RINGKASAN AWAL
                </Text>
                <VStack space="xs" className="bg-muted/60 p-3.5 rounded-xl border border-border/60">
                  <Text size="sm" bold className="text-foreground">
                    Layanan: Konsultasi Klinis & Konseling Personal
                  </Text>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Orientasi: Dukungan Regulasi Emosi & Manajemen Stres
                  </Text>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 border-primary/20 rounded-md px-2 py-0.5 self-start mt-1"
                  >
                    <BadgeText className="text-sm font-bold text-primary">
                      Prioritas Matching Standar
                    </BadgeText>
                  </Badge>
                </VStack>
                <Text size="sm" className="text-muted-foreground font-medium leading-relaxed italic">
                  Ini bukan diagnosis klinis resmi. Hasil lengkap dan saran perawatan akan diberikan oleh psikolog di akhir sesi.
                </Text>
              </Card>

              {/* Mini Stepper (Wireframe Screen 27) */}
              <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
                <HStack space="sm" className="items-center">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <Text size="sm" className="text-foreground font-semibold">
                    Jawaban diterima
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center">
                  <Box className="w-4 h-4 rounded-full bg-primary/20 items-center justify-center">
                    <Box className="w-2 h-2 rounded-full bg-primary" />
                  </Box>
                  <Text size="sm" className="text-primary font-bold">
                    Mencari psikolog • sedang berlangsung
                  </Text>
                </HStack>
              </Card>

              {/* Crisis Help Link */}
              <Pressable
                onPress={() => {
                  haptics.light();
                  setEmergencyModalOpen(true);
                }}
                className="items-center py-1"
              >
                <Text size="sm" className="text-muted-foreground text-center">
                  Butuh bantuan segera? <Text bold className="underline text-primary">Lihat kontak bantuan</Text>
                </Text>
              </Pressable>

              {/* Primary Action Button */}
              <VStack space="sm" className="mt-auto pt-2">
                <Button
                  size="lg"
                  onPress={() => {
                    haptics.medium();
                    router.push(ROUTES.PATIENT.MATCHING as never);
                  }}
                  className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
                >
                  <ButtonText className="text-white font-bold text-sm mr-2">
                    Lihat Status Pencarian
                  </ButtonText>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
                </Button>
              </VStack>
            </VStack>
          )}
        </ScrollView>
      </Box>

      {/* ========================================================
          SCREEN 28: MODAL BANTUAN SEGERA (Emergency / Crisis Help)
         ======================================================== */}
      <Modal isOpen={emergencyModalOpen} onClose={() => setEmergencyModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="w-full max-w-[420px] max-h-[85vh] p-5 rounded-3xl bg-card border border-border/80 shadow-lg">
          <ModalHeader className="pb-3 border-b border-border/70">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center border border-destructive/20">
                <AlertTriangle size={22} color="#DC2626" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Bantuan Segera
                </Heading>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Layanan Darurat & Krisis
                </Text>
              </VStack>
              <ModalCloseButton />
            </HStack>
          </ModalHeader>

          <ModalBody className="py-4">
            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="md">
                <Heading size="sm" bold className="text-foreground">
                  Kamu tidak harus menghadapi ini sendirian
                </Heading>
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Jika kamu merasa dalam kondisi krisis emosional berat, memiliki pikiran menyakiti diri, atau membutuhkan pertolongan darurat medis, segera hubungi layanan krisis resmi di bawah ini:
                </Text>

                {/* Hotline Card */}
                <Card className="bg-destructive/5 rounded-2xl p-4 border border-destructive/20 gap-3">
                  <HStack space="sm" className="items-center">
                    <PhoneCall size={20} color="#DC2626" />
                    <VStack className="flex-1">
                      <Text size="sm" bold className="text-foreground">
                        Hotline Krisis Kemenkes RI
                      </Text>
                      <Text size="sm" className="text-muted-foreground font-medium">
                        119 ext 8 (Bebas Pulsa • 24 Jam)
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    size="sm"
                    onPress={() => {
                      haptics.medium();
                      Linking.openURL("tel:119");
                    }}
                    className="w-full bg-destructive rounded-xl h-11 flex-row items-center justify-center shadow-xs"
                  >
                    <PhoneCall size={16} color="#FFFFFF" />
                    <ButtonText className="text-sm font-bold text-white ml-2">
                      Telepon Sekarang
                    </ButtonText>
                  </Button>
                </Card>

                {/* Trusted Contact Card */}
                <Card className="bg-card rounded-2xl p-4 border border-border/80 gap-3">
                  <HStack space="sm" className="items-center">
                    <HeartHandshake size={20} color="#4A3B6B" />
                    <VStack className="flex-1">
                      <Text size="sm" bold className="text-foreground">
                        Hubungi Orang Tepercaya
                      </Text>
                      <Text size="sm" className="text-muted-foreground font-medium">
                        Keluarga, sahabat, atau orang terdekat
                      </Text>
                    </VStack>
                  </HStack>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => {
                      haptics.light();
                      Linking.openURL("tel:");
                    }}
                    className="w-full border-border/80 rounded-xl h-11"
                  >
                    <ButtonText className="text-sm font-semibold text-foreground">
                      Buka Kontak Telepon
                    </ButtonText>
                  </Button>
                </Card>

                <Text size="sm" className="text-muted-foreground leading-relaxed italic">
                  Pencarian psikolog tetap bisa dilanjutkan, tetapi bukan pengganti bantuan darurat segera.
                </Text>
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter className="flex-col gap-2 pt-3 border-t border-border/70">
            <Button
              size="sm"
              onPress={() => {
                haptics.light();
                setEmergencyModalOpen(false);
              }}
              className="w-full bg-primary rounded-xl h-11"
            >
              <ButtonText className="text-sm font-bold text-white">
                Lanjut Cari Psikolog
              </ButtonText>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                haptics.light();
                setEmergencyModalOpen(false);
                router.push(ROUTES.PATIENT.DASHBOARD as never);
              }}
              className="w-full border-border/80 rounded-xl h-11"
            >
              <ButtonText className="text-sm font-semibold text-foreground">
                Kembali ke Beranda
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ========================================================
          CONFIRMATION MODAL: KELUAR DARI TRIASE
         ======================================================== */}
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

      {/* ========================================================
          MODAL VERIFIKASI DIDIT KYC (403 Gate)
         ======================================================== */}
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
                  Didit KYC Resmi
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
                  Jika belum diverifikasi, server akan menolak permintaan dengan status <Text bold className="text-destructive">403 Forbidden</Text>.
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
                  Mulai Verifikasi Didit Sekarang
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

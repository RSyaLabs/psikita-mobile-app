import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  ShieldCheck,
  ShieldAlert,
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

const TRIAGE_OPTIONS = [
  "Tidak pernah",
  "Beberapa hari",
  "Sering, hampir tiap minggu",
  "Hampir setiap hari",
];

export default function TriageScreen() {
  const router = useRouter();
  const toast = useToast();
  const { guest, mode } = useLocalSearchParams<{
    guest?: string;
    mode?: string;
  }>();
  const isGuest = guest === "true";
  const isAssessment = mode === "assessment" || isGuest;

  const [selectedOpt, setSelectedOpt] = useState("Sering, hampir tiap minggu");
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isKycLaunching, setIsKycLaunching] = useState(false);

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

  const handleContinue = () => {
    haptics.medium();
    if (!isGuest && !isVerified) {
      setKycModalOpen(true);
      return;
    }

    const scoreMap: Record<string, number> = {
      "Tidak pernah": 0,
      "Beberapa hari": 1,
      "Sering, hampir tiap minggu": 2,
      "Hampir setiap hari": 3,
    };
    const score = scoreMap[selectedOpt] ?? 1;

    submitTriageMutation.mutate(
      {
        score,
        hasRedFlags: score >= 3,
        assessmentType: "SELF_ASSESSMENT",
        answers: { question_1: selectedOpt },
      },
      {
        onSuccess: (data) => {
          router.push({
            pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
            params: {
              triageId: data.id,
              guest: isGuest ? "true" : "false",
              mode: isAssessment ? "assessment" : "consultation",
            },
          } as never);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.statusCode === 403) {
            haptics.error();
            setKycModalOpen(true);
            return;
          }
          router.push({
            pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
            params: {
              guest: isGuest ? "true" : "false",
              mode: isAssessment ? "assessment" : "consultation",
            },
          } as never);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <VStack space="xs" className="mb-4">
          <HStack space="sm" className="items-center mb-3">
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="p-1 -ml-1 active:opacity-70"
            >
              <ArrowLeft size={22} color="#262130" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">
              {isAssessment ? "Asesmen" : "Triase Konsultasi"}
            </Heading>
          </HStack>

          {/* Progress Row */}
          <HStack space="md" className="items-center justify-between mb-1.5">
            <Text size="sm" bold className="text-foreground font-bold">
              {isAssessment
                ? "Pertanyaan 3 dari 5 • Skrining Mandiri"
                : "Pertanyaan 3 dari 5 • Menuju Konsultasi"}
            </Text>
            <Text size="sm" className="text-muted-foreground font-semibold">
              60%
            </Text>
          </HStack>
          <Progress value={60} className="w-full h-2 bg-muted rounded-full">
            <ProgressFilledTrack className="bg-primary" />
          </Progress>
        </VStack>

        {/* Question Zone */}
        <Box className="mb-5">
          <Heading size="lg" bold className="text-foreground leading-snug">
            Dalam 2 minggu terakhir, seberapa sering kamu merasa cemas sampai susah tidur?
          </Heading>
        </Box>

        {/* Accessible Gluestack RadioGroup */}
        <RadioGroup
          value={selectedOpt}
          onChange={(val) => {
            haptics.selection();
            setSelectedOpt(val);
          }}
          className="mb-6 gap-3"
        >
          {TRIAGE_OPTIONS.map((opt) => {
            const isSelected = selectedOpt === opt;
            return (
              <Radio
                key={opt}
                value={opt}
                accessibilityRole="radio"
                accessibilityLabel={opt}
                accessibilityState={{ checked: isSelected }}
                className={`p-4 rounded-xl border flex-row items-center active:opacity-90 ${
                  isSelected
                    ? "bg-muted border-primary"
                    : "bg-card border-border"
                }`}
              >
                <RadioIndicator className="border-2 border-border bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary">
                  <RadioIcon />
                </RadioIndicator>
                <RadioLabel
                  className={`text-sm ml-3 flex-1 ${
                    isSelected
                      ? "font-semibold text-foreground"
                      : "font-normal text-foreground"
                  }`}
                >
                  {opt}
                </RadioLabel>
              </Radio>
            );
          })}
        </RadioGroup>

        {/* Navigation Action Buttons */}
        <HStack space="sm" className="items-center mt-auto mb-4">
          <Button
            variant="outline"
            size="lg"
            onPress={handleBack}
            className="h-[52px] px-6 rounded-xl bg-card border-border active:bg-muted flex-row items-center justify-center"
          >
            <ButtonIcon as={ArrowLeft} color="#262130" className="mr-1" />
            <ButtonText className="text-foreground font-semibold text-base">
              Kembali
            </ButtonText>
          </Button>

          <Button
            size="lg"
            onPress={handleContinue}
            className="flex-1 h-[52px] bg-primary rounded-xl active:opacity-90"
          >
            <ButtonText className="text-white font-bold text-base">
              {isAssessment ? "Lihat Hasil Evaluasi" : "Lihat Hasil & Cari Psikolog"}
            </ButtonText>
            <ButtonIcon as={ArrowRight} color="#FFFFFF" />
          </Button>
        </HStack>

        {/* Secure Note */}
        <Card className="bg-muted rounded-xl p-3 border border-border flex-row items-center gap-2.5">
          <Lock size={16} color="#4A3B6B" />
          <Text size="sm" className="text-foreground flex-1 font-medium">
            Jawabanmu tersimpan secara privat. {isAssessment ? "Hasil evaluasi mandiri akan ditampilkan setelah ini." : "Hasil triase digunakan untuk menentukan psikolog yang sesuai."}
          </Text>
        </Card>
      </ScrollView>

      {/* Modal Verifikasi Didit KYC */}
      <Modal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="max-w-[92%] p-5 rounded-3xl bg-card border border-border">
          <ModalHeader className="pb-3 border-b border-border">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <ShieldCheck size={22} color="#4A3B6B" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Verifikasi Identitas
                </Heading>
                <Text size="sm" className="text-muted-foreground">
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
              <Box className="bg-muted p-3.5 rounded-2xl border border-border">
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Jika belum diverifikasi, server akan menolak permintaan dengan status <Text bold className="text-destructive">403 Forbidden</Text>.
                </Text>
              </Box>
              <Text size="sm" className="text-muted-foreground leading-relaxed">
                Verifikasi berjalan secara native di dalam aplikasi melalui Didit Native SDK tanpa membuka browser external.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col gap-2 pt-3 border-t border-border">
            <Button
              onPress={handleLaunchDidit}
              disabled={isKycLaunching}
              className="w-full bg-primary rounded-xl py-3"
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
              onPress={() => setKycModalOpen(false)}
              className="w-full border-border rounded-xl"
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

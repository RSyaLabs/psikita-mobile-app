import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react-native";
import {
  Box, Button, ButtonText, Heading, HStack, Pressable, Progress,
  ProgressFilledTrack, ScrollView, Text, VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  usePsychometricInstruments, usePsychometricForm, useSubmitTriage,
  useMyVerificationStatus, useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { haptics } from "@/utils/haptics";
import type { PsychometricInstrumentDto } from "@/api/psychometrics.service";

const TRIAGE_CODE = "PHQ9";
type Stage = "selection" | "questions";

/**
 * The catalogue may contain many instruments. Submission to /triage is
 * currently supported only for PHQ9 by SubmitTriageHandler; no local scoring.
 */
export default function TriageScreen() {
  const router = useRouter();
  const { guest, mode } = useLocalSearchParams<{ guest?: string; mode?: string }>();
  const isGuest = guest === "true";
  const isConsultation = mode === "consultation";
  const [stage, setStage] = useState<Stage>("selection");
  const [selectedCode, setSelectedCode] = useState(TRIAGE_CODE);
  const [selectedVersion, setSelectedVersion] = useState<number | undefined>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const instruments = usePsychometricInstruments("TRIAGE", !isGuest);
  const available = instruments.data ?? [];
  const selected = available.find((item) => item.code === selectedCode && item.version === selectedVersion);
  const formQuery = usePsychometricForm(stage === "questions" ? selectedCode : "", selectedVersion);
  const submit = useSubmitTriage();
  const { data: identity, refetch: refreshIdentity, isLoading: identityLoading } = useMyVerificationStatus();
  const startVerification = useStartDiditVerification();
  const verified = identity?.status === "VERIFIED" || identity?.status === "APPROVED";
  const questions = useMemo(
    () => [...(formQuery.data?.questions ?? [])].sort((a, b) => a.order - b.order),
    [formQuery.data?.questions],
  );
  const question = questions[questionIndex];
  const selectedAnswer = question ? answers[question.code] : undefined;
  const complete = questions.length > 0 && questions.every((item) => answers[item.code] !== undefined);
  const progress = questions.length ? Math.round(((questionIndex + 1) / questions.length) * 100) : 0;
  const busy = submit.isPending || isVerifying;

  const back = () => {
    haptics.light();
    setError(null);
    if (stage === "questions") {
      if (questionIndex > 0) setQuestionIndex(index => index - 1);
      else setStage("selection");
    } else {
      router.back();
    }
  };

  const chooseInstrument = (instrument: PsychometricInstrumentDto) => {
    if (instrument.code !== TRIAGE_CODE) return;
    setSelectedCode(instrument.code);
    setSelectedVersion(instrument.version);
    setAnswers({});
    setQuestionIndex(0);
    setError(null);
    setStage("questions");
    haptics.selection();
  };

  const verifyIdentity = async () => {
    if (busy) return;
    setIsVerifying(true);
    setError(null);
    try {
      const session = await startVerification.mutateAsync();
      await launchDiditVerification(session, {
        onApproved: () => { void refreshIdentity(); },
        onCompleted: () => { void refreshIdentity(); },
      });
      await refreshIdentity();
    } catch {
      setError("Verifikasi belum berhasil. Coba lagi.");
    } finally {
      setIsVerifying(false);
    }
  };

  const submitAnswers = async () => {
    if (!formQuery.data || selectedCode !== TRIAGE_CODE || !complete || busy) return;
    setError(null);
    if (!verified) {
      setError("Verifikasi identitas diperlukan untuk menyimpan hasil.");
      return;
    }
    try {
      const response = await submit.mutateAsync({
        questionnaireType: "PHQ_9",
        assessmentType: "SELF_ASSESSMENT",
        answers,
      });
      haptics.success();
      router.replace({
        pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
        params: { triageId: response.id, mode: isConsultation ? "consultation" : "assessment" },
      } as never);
    } catch {
      haptics.error();
      setError("Jawaban belum tersimpan. Periksa koneksi dan coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" className="flex-1 w-full max-w-[520px] self-center">
          <HStack className="items-center gap-3">
            <Pressable
              accessibilityRole="button" accessibilityLabel="Kembali"
              onPress={back} className="p-2 -ml-2"
            >
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">
              {isConsultation ? "Triase" : "Asesmen"}
            </Heading>
          </HStack>
          {isGuest ? (
            <VStack space="lg" className="flex-1 justify-center">
              <Heading size="xl" bold className="text-foreground">Masuk untuk memulai</Heading>
              <Text className="text-muted-foreground">Jawaban kesehatanmu hanya dikirim melalui akunmu.</Text>
              <Button onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as never)} className="h-12 rounded-xl">
                <ButtonText>Masuk</ButtonText>
              </Button>
            </VStack>
          ) : stage === "selection" ? (
            <VStack space="md" className="flex-1">
              <Heading size="lg" className="text-foreground">Pilih kuesioner</Heading>
              {instruments.isLoading ? (
                <Text className="text-muted-foreground">Memuat kuesioner...</Text>
              ) : instruments.isError ? (
                <VStack space="sm">
                  <Text className="text-destructive">Kuesioner belum dapat dimuat.</Text>
                  <Button variant="outline" onPress={() => void instruments.refetch()}><ButtonText>Coba Lagi</ButtonText></Button>
                </VStack>
              ) : available.length === 0 ? (
                <Text className="text-muted-foreground">Belum ada kuesioner yang tersedia.</Text>
              ) : (
                available.map(instrument => {
                  const enabled = instrument.code === TRIAGE_CODE;
                  return (
                    <Pressable
                      key={`${instrument.code}:${instrument.version}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !enabled }}
                      disabled={!enabled}
                      onPress={() => chooseInstrument(instrument)}
                      className={`bg-card rounded-xl border border-border p-4 ${enabled ? "active:border-primary" : "opacity-60"}`}
                    >
                      <HStack className="items-center gap-3">
                        <VStack space="xs" className="flex-1">
                          <Heading size="sm" className="text-foreground">{instrument.name}</Heading>
                          <Text size="xs" className="text-muted-foreground">
                            {enabled ? `Versi ${instrument.version}` : "Belum dapat dikirim sebagai triase"}
                          </Text>
                        </VStack>
                        {enabled ? <ArrowRight size={18} className="text-primary" /> : null}
                      </HStack>
                    </Pressable>
                  );
                })
              )}
            </VStack>
          ) : formQuery.isLoading ? (
            <Text className="text-muted-foreground">Memuat pertanyaan...</Text>
          ) : formQuery.isError || !formQuery.data || !question ? (
            <VStack space="sm">
              <Text className="text-destructive">Pertanyaan tidak tersedia.</Text>
              <Button variant="outline" onPress={() => void formQuery.refetch()}>
                <ButtonText>Coba Lagi</ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack space="lg" className="flex-1">
              <VStack space="sm">
                <HStack className="items-center justify-between">
                  <Text size="sm" className="text-muted-foreground">
                    {questionIndex + 1} dari {questions.length}
                  </Text>
                  <Text size="sm" className="text-muted-foreground">{progress}%</Text>
                </HStack>
                <Progress value={progress} className="w-full h-2 rounded-full bg-muted">
                  <ProgressFilledTrack className="bg-primary" />
                </Progress>
              </VStack>
              <Heading size="xl" className="text-foreground leading-snug">{question.text}</Heading>
              <VStack space="sm">
                {formQuery.data.responseOptions.map(option => {
                  const active = selectedAnswer === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={option.label}
                      accessibilityState={{ checked: active }}
                      onPress={() => {
                        setAnswers(current => ({ ...current, [question.code]: option.value }));
                        setError(null);
                        haptics.selection();
                      }}
                      className={`min-h-14 rounded-xl border p-4 flex-row items-center gap-3 ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <Box className={`w-6 h-6 rounded-full border items-center justify-center ${active ? "bg-primary border-primary" : "border-border"}`}>
                        {active ? <Check size={15} color="#FFFFFF" /> : null}
                      </Box>
                      <Text className="text-foreground flex-1">{option.label}</Text>
                    </Pressable>
                  );
                })}
              </VStack>
              {error ? <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text> : null}
              {questionIndex === questions.length - 1 && !verified ? (
                <VStack space="sm">
                  <HStack className="items-center gap-2">
                    <ShieldCheck size={18} className="text-primary" />
                    <Text className="text-sm text-foreground">Verifikasi identitas diperlukan</Text>
                  </HStack>
                  <Button
                    variant="outline"
                    isDisabled={busy || identityLoading}
                    onPress={() => void verifyIdentity()}
                    className="h-12 rounded-xl"
                  >
                    <ButtonText>{isVerifying ? "Memverifikasi..." : "Verifikasi Identitas"}</ButtonText>
                  </Button>
                </VStack>
              ) : null}
              <Box className="flex-1" />
              <Button
                onPress={() => {
                  if (questionIndex < questions.length - 1) {
                    if (selectedAnswer === undefined) return;
                    setQuestionIndex(index => index + 1);
                  } else {
                    void submitAnswers();
                  }
                }}
                isDisabled={selectedAnswer === undefined || busy || (questionIndex === questions.length - 1 && !complete)}
                className="h-[52px] rounded-xl"
              >
                <ButtonText>
                  {submit.isPending ? "Menyimpan..." : questionIndex < questions.length - 1 ? "Lanjut" : "Lihat Hasil"}
                </ButtonText>
                {!submit.isPending && questionIndex < questions.length - 1 ? <ArrowRight size={18} color="#FFFFFF" /> : null}
              </Button>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

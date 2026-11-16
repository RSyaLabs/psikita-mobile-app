import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react-native";
import {
  Box, Button, ButtonText, Card, Heading, HStack, Pressable,
  Progress, ProgressFilledTrack, ScrollView, Text, VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useAnswerConsultationAssessment,
  useConsultationAssessments,
  usePsychometricForm,
} from "@/hooks/useApiQueries";

export default function ConsultationAssessmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId?: string; assessmentId?: string }>();
  const consultationId = typeof params.consultationId === "string" ? params.consultationId : "";
  const assessmentId = typeof params.assessmentId === "string" ? params.assessmentId : "";
  const consultation = useActiveConsultation(consultationId || undefined);
  const context = consultation.context;
  const list = useConsultationAssessments(context?.consultationId, context?.status === "ACTIVE");
  const assignment = list.data?.find(item => item.id === assessmentId);
  const active = Boolean(context && context.status === "ACTIVE" && assignment?.status === "ASSIGNED");
  const form = usePsychometricForm(active ? assignment?.typeCode ?? "" : "", assignment?.typeVersion);
  const submit = useAnswerConsultationAssessment();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const questions = useMemo(() => [...(form.data?.questions ?? [])].sort((a, b) => a.order - b.order), [form.data?.questions]);
  const question = questions[index];
  const choice = question ? answers[question.code] : undefined;
  const complete = questions.length > 0 && questions.every(q => answers[q.code] !== undefined);
  const goBack = () => {
    if (index > 0 && !done) {
      setIndex(value => value - 1);
      return;
    }
    router.replace({ pathname: ROUTES.PATIENT.CHAT_ROOM, params: { consultationId } } as never);
  };
  const save = async () => {
    if (!active || !context || !assignment || !complete || submit.isPending || !form.data) return;
    const validOptions = new Set(form.data.responseOptions.map(option => option.value));
    if (questions.some(q => !validOptions.has(answers[q.code]))) return;
    setError("");
    try {
      await submit.mutateAsync({
        consultationId: context.consultationId,
        assessmentId: assignment.id,
        answers: Object.fromEntries(questions.map(q => [q.code, answers[q.code]])),
      });
      setDone(true);
      setAnswers({});
    } catch {
      setError("Jawaban belum tersimpan. Periksa koneksi dan coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 }} keyboardShouldPersistTaps="handled">
        <VStack space="lg" className="max-w-[520px] w-full self-center flex-1">
          <HStack className="items-center gap-3">
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={goBack} className="p-2 -ml-2">
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">Asesmen Konsultasi</Heading>
          </HStack>
          {done || assignment?.status === "COMPLETED" ? (
            <VStack space="lg" className="items-center pt-12">
              <CheckCircle2 size={42} className="text-primary" />
              <Heading size="lg" className="text-foreground">Jawaban tersimpan</Heading>
              <Text className="text-muted-foreground text-center">Hasil akan ditinjau oleh praktisi.</Text>
              <Button onPress={goBack} className="w-full h-12 rounded-xl"><ButtonText>Kembali ke Chat</ButtonText></Button>
            </VStack>
          ) : assignment?.status === "CANCELLED" || assignment?.status === "DECLINED" ? (
            <Text className="text-muted-foreground">
              {assignment.status === "DECLINED" ? "Asesmen ini telah Anda tolak." : "Asesmen ini sudah dibatalkan."}
            </Text>
          ) : list.isLoading || form.isLoading ? (
            <Text className="text-muted-foreground">Memuat asesmen...</Text>
          ) : list.isError || !assignment ? (
            <Card className="p-4 border border-border bg-card rounded-xl">
              <Text className="text-muted-foreground">Asesmen tidak tersedia untuk sesi ini.</Text>
              <Button variant="outline" onPress={() => void list.refetch()}><ButtonText>Coba Lagi</ButtonText></Button>
            </Card>
          ) : !active || form.isError || !question ? (
            <Card className="p-4 border border-border bg-card rounded-xl">
              <Text className="text-muted-foreground">Asesmen tidak dapat dikerjakan saat ini.</Text>
              {form.isError ? <Button variant="outline" onPress={() => void form.refetch()}><ButtonText>Coba Lagi</ButtonText></Button> : null}
            </Card>
          ) : (
            <VStack space="lg" className="flex-1">
              <VStack space="sm">
                <HStack className="justify-between items-center">
                  <Text size="sm" className="text-muted-foreground">{index + 1} dari {questions.length}</Text>
                  <Text size="sm" className="text-muted-foreground">{Math.round(((index + 1) / questions.length) * 100)}%</Text>
                </HStack>
                <Progress value={Math.round(((index + 1) / questions.length) * 100)} className="w-full h-2 rounded-full bg-muted">
                  <ProgressFilledTrack className="bg-primary" />
                </Progress>
              </VStack>
              <Heading size="xl" className="text-foreground">{question.text}</Heading>
              <VStack space="sm">
                {form.data!.responseOptions.map(option => {
                  const checked = choice === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked }}
                      onPress={() => { setAnswers(current => ({ ...current, [question.code]: option.value })); setError(""); }}
                      className={`flex-row gap-3 items-center p-4 min-h-14 rounded-xl border ${checked ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <Box className={`w-6 h-6 rounded-full border items-center justify-center ${checked ? "border-primary bg-primary" : "border-border"}`}>
                        {checked ? <Check size={15} color="#FFFFFF" /> : null}
                      </Box>
                      <Text className="text-foreground flex-1">{option.label}</Text>
                    </Pressable>
                  );
                })}
              </VStack>
              {error ? <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text> : null}
              <Box className="flex-1" />
              <Button
                className="h-12 rounded-xl"
                isDisabled={choice === undefined || submit.isPending || (index === questions.length - 1 && !complete)}
                onPress={() => {
                  if (index < questions.length - 1) setIndex(v => v + 1);
                  else void save();
                }}
              >
                <ButtonText>{submit.isPending ? "Menyimpan..." : index < questions.length - 1 ? "Lanjut" : "Kirim Jawaban"}</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

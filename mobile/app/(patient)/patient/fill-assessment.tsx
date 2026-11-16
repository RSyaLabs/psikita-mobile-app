import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react-native";
import { Box, Button, ButtonText, Heading, HStack, Pressable, Progress, ProgressFilledTrack, ScrollView, Text, VStack } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { usePatientAssessment, usePsychometricForm, useSubmitPatientAssessment, useCancelPatientAssessment } from "@/hooks/useApiQueries";

export default function FillAssessmentScreen() {
  const router = useRouter();
  const { assessmentId: rawId } = useLocalSearchParams<{ assessmentId?: string }>();
  const id = typeof rawId === "string" ? rawId : "";
  const assessment = usePatientAssessment(id);
  const record = assessment.data;
  const form = usePsychometricForm(record?.status === "DRAFT" ? record.typeCode : "", record?.typeVersion);
  const submit = useSubmitPatientAssessment();
  const cancel = useCancelPatientAssessment();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const questions = useMemo(() => [...(form.data?.questions ?? [])].sort((a, b) => a.order - b.order), [form.data?.questions]);
  const question = questions[index];
  const selected = question ? answers[question.code] : undefined;
  const canSubmit = questions.length > 0 && questions.every(q => answers[q.code] !== undefined);
  const back = () => index > 0 && record?.status === "DRAFT"
    ? setIndex(n => n - 1)
    : router.replace(ROUTES.PATIENT.MY_ASSESSMENTS as never);
  const send = async () => {
    if (record?.status !== "DRAFT" || !canSubmit || submit.isPending || !form.data) return;
    setError("");
    try {
      await submit.mutateAsync({ id: record.id, answers: Object.fromEntries(questions.map(q => [q.code, answers[q.code]])) });
      setAnswers({});
      await assessment.refetch();
    } catch { setError("Jawaban belum tersimpan. Coba kembali."); }
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 }} keyboardShouldPersistTaps="handled">
        <VStack space="lg" className="w-full max-w-[520px] self-center flex-1">
          <HStack className="items-center gap-3">
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={back} className="p-2 -ml-2">
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" className="text-foreground">Asesmen Mandiri</Heading>
          </HStack>
          {assessment.isLoading || form.isLoading ? <Text className="text-muted-foreground">Memuat asesmen...</Text> : null}
          {record?.status === "COMPLETED" ? (
            <VStack space="md" className="items-center pt-10">
              <CheckCircle2 size={42} className="text-primary" />
              <Heading size="lg" className="text-foreground">Selesai</Heading>
              <Text className="text-muted-foreground">Jawaban tersimpan. Informasi risiko akan ditinjau secara klinis.</Text>
              <Button onPress={back}><ButtonText>Ke Riwayat</ButtonText></Button>
            </VStack>
          ) : record?.status === "CANCELLED" ? <Text className="text-muted-foreground">Asesmen dibatalkan.</Text>
            : assessment.isError || form.isError || !record || !question ?
            <VStack space="sm">
              <Text className="text-muted-foreground">Asesmen belum dapat dimuat.</Text>
              <Button variant="outline" onPress={() => void assessment.refetch()}><ButtonText>Coba Lagi</ButtonText></Button>
            </VStack> : (
            <VStack space="lg" className="flex-1">
              <VStack space="xs">
                <Text size="sm" className="text-muted-foreground">{index + 1} dari {questions.length}</Text>
                <Progress value={Math.round((index + 1) * 100 / questions.length)} className="h-2 bg-muted">
                  <ProgressFilledTrack className="bg-primary" />
                </Progress>
              </VStack>
              <Heading size="lg" className="text-foreground">{question.text}</Heading>
              <VStack space="sm">
                {form.data!.responseOptions.map(option => {
                  const checked = option.value === selected;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked }}
                      onPress={() => setAnswers(previous => ({ ...previous, [question.code]: option.value }))}
                      className={`p-4 rounded-xl border flex-row items-center gap-3 ${checked ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                    >
                      <Box className={`h-6 w-6 rounded-full border items-center justify-center ${checked ? "bg-primary border-primary" : "border-border"}`}>{checked ? <Check size={15} color="#FFFFFF" /> : null}</Box>
                      <Text className="text-foreground flex-1">{option.label}</Text>
                    </Pressable>
                  );
                })}
              </VStack>
              {error ? <Text accessibilityRole="alert" className="text-destructive">{error}</Text> : null}
              <Box className="flex-1" />
              <Button
                className="h-12 rounded-xl"
                isDisabled={selected === undefined || submit.isPending || (index === questions.length - 1 && !canSubmit)}
                onPress={() => index < questions.length - 1 ? setIndex(n => n + 1) : void send()}
              >
                <ButtonText>{submit.isPending ? "Mengirim..." : index < questions.length - 1 ? "Lanjut" : "Selesaikan"}</ButtonText>
              </Button>
              <Pressable
                accessibilityRole="button"
                disabled={cancel.isPending}
                onPress={() => void cancel.mutateAsync(record.id).then(() => router.replace(ROUTES.PATIENT.MY_ASSESSMENTS as never)).catch(() => setError("Tidak dapat membatalkan."))}
                className="items-center py-3"
              ><Text className="text-muted-foreground">Batalkan asesmen</Text></Pressable>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

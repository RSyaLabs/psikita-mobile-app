import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, FileText, ShieldAlert } from "lucide-react-native";
import {
  Box, Button, ButtonSpinner, ButtonText, Card, Heading, HStack,
  Pressable, ScrollView, Text, Textarea, TextareaInput, VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation, useClinicalDiagnosis, useConsultationNotes,
  useCreateSoapNote, useDiagnosisCodes, useFinalizeConsultationNote,
  useFinishConsultation, useSaveClinicalDiagnosis, useSubmitClinicalResult,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";

type ClinicalDecision = boolean | null;

function DecisionField(props: {
  label: string;
  value: ClinicalDecision;
  onChange: (value: boolean) => void;
}) {
  return (
    <VStack space="xs">
      <Text className="font-semibold text-foreground">{props.label}</Text>
      <HStack space="sm">
        {([true, false] as const).map((value) => (
          <Pressable
            key={String(value)}
            accessibilityRole="radio"
            accessibilityLabel={value ? "Ya" : "Tidak"}
            accessibilityState={{ checked: props.value === value }}
            onPress={() => props.onChange(value)}
            className={`flex-1 py-3 items-center rounded-xl border ${props.value === value ? "bg-primary/10 border-primary" : "bg-card border-border"}`}
          >
            <Text className="text-foreground">{value ? "Ya" : "Tidak"}</Text>
          </Pressable>
        ))}
      </HStack>
    </VStack>
  );
}

function ClinicalTextField(props: {
  title: string;
  value: string;
  update: (s: string) => void;
  editable: boolean;
}) {
  return (
    <VStack space="xs">
      <Text className="font-semibold text-foreground">{props.title}</Text>
      <Textarea className="rounded-xl bg-muted border border-border">
        <TextareaInput value={props.value} onChangeText={props.update} editable={props.editable} />
      </Textarea>
    </VStack>
  );
}

/** A clinician-owned sequence; no diagnosis, care, or follow-up decision is automated. */
export default function DiagnosisScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId?: string }>();
  const id = typeof params.consultationId === "string" ? params.consultationId : "";
  const consultation = useActiveConsultation(id);
  const context = consultation.context;
  const detail = consultation.data;
  const diagnosis = useClinicalDiagnosis(id);
  const notes = useConsultationNotes(id);
  const codes = useDiagnosisCodes({ system: "ICD10" });
  const createSoap = useCreateSoapNote();
  const finalizeSoap = useFinalizeConsultationNote();
  const saveDiagnosis = useSaveClinicalDiagnosis();
  const finish = useFinishConsultation();
  const submitResult = useSubmitClinicalResult();

  const [selectedCode, setSelectedCode] = useState("");
  const [needsPrescription, setNeedsPrescription] = useState<ClinicalDecision>(null);
  const [needsReferral, setNeedsReferral] = useState<ClinicalDecision>(null);
  const [referralPriority, setReferralPriority] = useState<ClinicalDecision>(null);
  const initializedDiagnosis = useRef<string | null>(null);
  useEffect(() => {
    const saved = diagnosis.data;
    if (!saved || initializedDiagnosis.current === saved.id) return;
    initializedDiagnosis.current = saved.id;
    setSelectedCode(saved.code ?? "");
    setNeedsPrescription(saved.needsPrescription);
    setNeedsReferral(saved.needsReferral);
    setReferralPriority(saved.referralPriority);
  }, [diagnosis.data]);

  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [advice, setAdvice] = useState("");
  const [followUp, setFollowUp] = useState<ClinicalDecision>(null);
  const [followUpDays, setFollowUpDays] = useState("7");
  const [followUpMinutes, setFollowUpMinutes] = useState<30 | 60>(30);
  const [followUpReason, setFollowUpReason] = useState("");
  const [error, setError] = useState("");

  const latestDraft = notes.data?.find((note) => note.contentType === "soap" && note.status === "DRAFT");
  const hasFinalSoap = Boolean(notes.data?.some((note) => note.contentType === "soap" && note.status === "COMPLETED"));
  const isFinished = detail?.status === "FINISHED";
  const resultSubmitted = detail?.resultStatus === "RESULT_SUBMITTED";
  const selectedDiagnosis = codes.data?.find((item) => item.code === selectedCode);
  const diagnosisSaved = Boolean(
    diagnosis.data &&
    diagnosis.data.system === "ICD10" &&
    diagnosis.data.code === selectedCode &&
    diagnosis.data.needsPrescription === needsPrescription &&
    diagnosis.data.needsReferral === needsReferral &&
    diagnosis.data.referralPriority === (needsReferral ? referralPriority : false),
  );
  const diagnosticDecisionsReady =
    Boolean(selectedDiagnosis) &&
    needsPrescription !== null &&
    needsReferral !== null &&
    (!needsReferral || referralPriority !== null);
  const soapReady = [subjective, objective, assessment, plan].every((value) => value.trim().length > 0);
  const busy = saveDiagnosis.isPending || createSoap.isPending || finalizeSoap.isPending ||
    finish.isPending || submitResult.isPending;
  const canWrite = Boolean(context && context.status === "ACTIVE" && !busy);
  const clinicalReady = Boolean(diagnosis.data && diagnosisSaved && hasFinalSoap);
  const noFollowUpValid = followUp === false && followUpReason.trim().length >= 10;
  const days = Number(followUpDays);
  const yesFollowUpValid = followUp === true && Number.isInteger(days) && days >= 1 && days <= 60;
  const canSubmit = Boolean(
    isFinished && !resultSubmitted && clinicalReady && !busy && advice.trim().length >= 5 &&
    (noFollowUpValid || yesFollowUpValid),
  );

  const storeDiagnosis = async () => {
    if (!canWrite || !diagnosticDecisionsReady || !selectedDiagnosis) return;
    setError("");
    try {
      await saveDiagnosis.mutateAsync({
        consultationId: context!.consultationId,
        update: Boolean(diagnosis.data),
        input: {
          code: selectedDiagnosis.code,
          system: "ICD10",
          label: selectedDiagnosis.label,
          isManual: false,
          needsPrescription: needsPrescription!,
          needsReferral: needsReferral!,
          referralPriority: needsReferral ? referralPriority! : false,
        },
      });
      await diagnosis.refetch();
      haptics.success();
    } catch {
      setError("Diagnosis belum tersimpan. Pastikan kode serta otorisasi klinis masih berlaku.");
      haptics.error();
    }
  };

  const storeSoap = async () => {
    if (!canWrite || !soapReady) return;
    setError("");
    try {
      await createSoap.mutateAsync({
        context: context!,
        dto: {
          subjective: subjective.trim(),
          objective: objective.trim(),
          assessment: assessment.trim(),
          plan: plan.trim(),
        },
      });
      await notes.refetch();
      haptics.success();
    } catch {
      setError("Draft SOAP belum berhasil tersimpan.");
      haptics.error();
    }
  };

  const signSoap = async () => {
    if (!canWrite || !latestDraft) return;
    setError("");
    try {
      await finalizeSoap.mutateAsync({
        consultationId: id,
        noteId: latestDraft.id,
        version: latestDraft.version,
      });
      await notes.refetch();
      haptics.success();
    } catch {
      setError("SOAP belum dapat difinalisasi. Tinjau ulang isi catatan sebelum mengesahkan.");
      haptics.error();
    }
  };

  const finishSession = async () => {
    if (!canWrite || !clinicalReady) return;
    setError("");
    try {
      await finish.mutateAsync(context!);
      await consultation.refetch();
      haptics.success();
    } catch {
      setError("Sesi belum dapat diakhiri. Periksa status konsultasi di server.");
      haptics.error();
    }
  };

  const submitClinicalResult = async () => {
    if (!canSubmit) return;
    setError("");
    try {
      await submitResult.mutateAsync({
        consultationId: id,
        input: {
          patientFacingAdvice: advice.trim(),
          followUp: followUp
            ? {
                required: true,
                windowDays: days,
                durationMinutes: followUpMinutes,
                ...(followUpReason.trim().length >= 10 ? { reason: followUpReason.trim() } : {}),
              }
            : { required: false, reason: followUpReason.trim() },
        },
      });
      await consultation.refetch();
      haptics.success();
    } catch {
      setError("Hasil klinis belum dapat disahkan. Server dapat mensyaratkan resep, rujukan, atau pengakuan alert CRITICAL sebelum pengesahan.");
      haptics.error();
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingHorizontal: 18, paddingVertical: 20, paddingBottom: 80}}>
        <VStack space="lg" className="w-full max-w-[600px] self-center">
          <HStack className="items-center gap-3">
            <FileText size={22} color="#4A3B6B" />
            <Heading level={1} size="lg" className="text-foreground">Catatan & hasil konsultasi</Heading>
          </HStack>
          <Text className="text-muted-foreground">
            Diagnosis, SOAP, serta keputusan follow-up hanya dapat ditetapkan oleh praktisi yang ditugaskan. Setiap langkah harus dikonfirmasi server.
          </Text>
          {!id || consultation.isError || !context ? (
            <Card className="p-4 bg-card border border-border rounded-2xl">
              <Text className="text-destructive">Konteks konsultasi belum tersedia atau tidak dapat diverifikasi.</Text>
              <Button variant="outline" onPress={() => void consultation.refetch()}><ButtonText>Periksa ulang</ButtonText></Button>
            </Card>
          ) : null}
          {diagnosis.isError || notes.isError ? (
            <Card className="p-4 bg-card border border-border rounded-2xl">
              <Text className="text-destructive">Data klinis gagal dimuat. Pengesahan ditahan.</Text>
              <Button variant="outline" onPress={() => { void diagnosis.refetch(); void notes.refetch(); }}>
                <ButtonText>Muat ulang</ButtonText>
              </Button>
            </Card>
          ) : null}

          <Card className="p-4 bg-card border border-border rounded-2xl">
            <VStack space="md">
              <Text className="font-bold text-foreground">1. Diagnosis klinis</Text>
              <Text size="xs" className="text-muted-foreground">Kode dipilih dari katalog server, bukan disimpulkan dari skor asesmen.</Text>
              {codes.isLoading ? <Text className="text-muted-foreground">Memuat katalog ICD-10...</Text> : null}
              {codes.isError ? (
                <Button variant="outline" onPress={() => void codes.refetch()}><ButtonText>Ulangi katalog</ButtonText></Button>
              ) : null}
              <HStack space="xs" className="flex-wrap">
                {(codes.data ?? []).map((item) => (
                  <Pressable
                    key={item.code}
                    disabled={isFinished || busy}
                    accessibilityRole="button"
                    accessibilityState={{selected: selectedCode === item.code}}
                    onPress={() => setSelectedCode(item.code)}
                    className={`rounded-xl px-3 py-2 border ${selectedCode === item.code ? "bg-primary border-primary" : "bg-muted border-border"}`}
                  >
                    <Text className={selectedCode === item.code ? "text-primary-foreground" : "text-foreground"}>{item.code}</Text>
                  </Pressable>
                ))}
              </HStack>
              {selectedDiagnosis ? <Text size="sm" className="text-foreground">{selectedDiagnosis.label}</Text> : null}
              <DecisionField label="Perlu resep?" value={needsPrescription} onChange={setNeedsPrescription} />
              <DecisionField label="Perlu rujukan?" value={needsReferral} onChange={setNeedsReferral} />
              {needsReferral ? <DecisionField label="Rujukan prioritas?" value={referralPriority} onChange={setReferralPriority} /> : null}
              <Button
                isDisabled={!canWrite || !diagnosticDecisionsReady || diagnosis.isError || diagnosis.isLoading || !codes.data?.length || diagnosisSaved}
                onPress={() => void storeDiagnosis()}
              >
                <ButtonText>{saveDiagnosis.isPending ? "Menyimpan..." : diagnosisSaved ? "Diagnosis tersimpan" : "Simpan diagnosis ke server"}</ButtonText>
              </Button>
            </VStack>
          </Card>

          <Card className="p-4 bg-card border border-border rounded-2xl">
            <VStack space="md">
              <Text className="font-bold text-foreground">2. SOAP & pengesahan catatan</Text>
              {hasFinalSoap ? <Text className="text-foreground">SOAP telah difinalisasi di server.</Text> : null}
              {!isFinished && !hasFinalSoap ? (
                <>
                  <ClinicalTextField title="Subjective" value={subjective} update={setSubjective} editable={!isFinished && !busy} />
                  <ClinicalTextField title="Objective" value={objective} update={setObjective} editable={!isFinished && !busy} />
                  <ClinicalTextField title="Assessment" value={assessment} update={setAssessment} editable={!isFinished && !busy} />
                  <ClinicalTextField title="Plan" value={plan} update={setPlan} editable={!isFinished && !busy} />
                  <Button isDisabled={!canWrite || !soapReady} onPress={() => void storeSoap()}>
                    <ButtonText>{createSoap.isPending ? "Menyimpan..." : "Simpan draft SOAP"}</ButtonText>
                  </Button>
                  {latestDraft ? (
                    <Button variant="outline" isDisabled={!canWrite} onPress={() => void signSoap()}>
                      <ButtonText>{finalizeSoap.isPending ? "Memfinalisasi..." : "Tinjau dan finalisasi SOAP tersimpan"}</ButtonText>
                    </Button>
                  ) : null}
                  {latestDraft ? <Text size="xs" className="text-muted-foreground">Draft tersimpan sebagai rekam klinis; finalisasi adalah aksi terpisah dan tidak dapat dibatalkan.</Text> : null}
                </>
              ) : null}
            </VStack>
          </Card>

          <Card className="p-4 bg-card border border-border rounded-2xl">
            <VStack space="sm">
              <Text className="font-bold text-foreground">3. Akhiri sesi</Text>
              <Text className="text-muted-foreground">
                Sesi hanya dapat diakhiri setelah diagnosis dan SOAP final tersedia. Ini belum menandai seluruh perjalanan perawatan selesai.
              </Text>
              <Button
                variant="outline"
                isDisabled={!canWrite || !clinicalReady}
                onPress={() => void finishSession()}
              >
                <ButtonText>{isFinished ? "Sesi selesai" : finish.isPending ? "Mengakhiri..." : "Akhiri sesi secara eksplisit"}</ButtonText>
              </Button>
            </VStack>
          </Card>

          {isFinished ? (
            <Card className="p-4 bg-card border border-border rounded-2xl">
              <VStack space="md">
                <Text className="font-bold text-foreground">4. Sahkan hasil & putuskan follow-up</Text>
                {resultSubmitted ? (
                  <HStack className="items-center gap-2">
                    <CheckCircle2 size={18} color="#276749" />
                    <Text className="text-foreground">Hasil klinis sudah disahkan server.</Text>
                  </HStack>
                ) : (
                  <>
                    <ClinicalTextField title="Nasihat yang boleh dibaca pasien" value={advice} update={setAdvice} editable={!busy && !resultSubmitted} />
                    <DecisionField label="Apakah follow-up diperlukan?" value={followUp} onChange={setFollowUp} />
                    {followUp === true ? (
                      <>
                        <Text size="sm" className="text-foreground">Rekomendasi waktu follow-up</Text>
                        <HStack space="xs" className="flex-wrap">
                          {([7, 14, 30] as const).map((value) => (
                            <Pressable
                              key={value}
                              onPress={() => setFollowUpDays(String(value))}
                              className={`rounded-xl px-4 py-2 border ${followUpDays === String(value) ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                            >
                              <Text>{value} hari</Text>
                            </Pressable>
                          ))}
                        </HStack>
                        <DecisionField label="Durasi tindak lanjut 60 menit?" value={followUpMinutes === 60} onChange={(value) => setFollowUpMinutes(value ? 60 : 30)} />
                      </>
                    ) : null}
                    <ClinicalTextField title={followUp === false ? "Alasan tidak memerlukan follow-up (minimal 10 karakter)" : "Alasan klinis (opsional, minimal 10 karakter jika diisi)"} value={followUpReason} update={setFollowUpReason} editable={!busy && !resultSubmitted} />
                    <HStack space="sm" className="items-center">
                      <ShieldAlert size={18} color="#B45309" />
                      <Text size="xs" className="text-muted-foreground flex-1">
                        Alert keselamatan, resep, dan rujukan tetap diperiksa oleh server sebelum finalisasi.
                      </Text>
                    </HStack>
                    <Button isDisabled={!canSubmit} onPress={() => void submitClinicalResult()}>
                      <ButtonText>{submitResult.isPending ? "Mengesahkan..." : "Sahkan hasil konsultasi"}</ButtonText>
                    </Button>
                  </>
                )}
              </VStack>
            </Card>
          ) : null}

          {error ? <Text accessibilityRole="alert" className="text-destructive">{error}</Text> : null}
          <Button variant="outline" onPress={() => router.replace(ROUTES.PRACTITIONER.HISTORY as never)}>
            <ButtonText>Kembali ke riwayat konsultasi</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileText, Save, ShieldAlert } from "lucide-react-native";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Card,
  HStack,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from "@/components/ui";
import { CLINICAL_CONSTANTS, getIcd10Description, ROUTES } from "@/constants";
import { isDemoMode } from "@/config/demoMode";
import {
  BackendIntegrationBanner,
  DataSourceBanner,
  UnavailableState,
} from "@/components/common";
import {
  useActiveConsultation,
  useCreateSoapNote,
  useFinishConsultation,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";

/**
 * Reviewer-only fixture for exploring the SOAP form. It is never a patient
 * record: the save button stays disabled while these exact strings are still in
 * the form, so simulation content cannot reach the server as a real note.
 */
const DEMO_DRAFT = {
  icd10: "F41.1",
  subjective:
    "Pasien mengeluhkan rasa cemas berlebih dan gelisah saat menghadapi beban kerja harian.",
  objective:
    "Afek cemas, kontak mata baik, tanda vital stabil (TD 120/80 mmHg, N 78x/m).",
  assessment:
    "Generalized Anxiety Disorder (GAD) derajat sedang, respon emosional adaptif.",
  plan: "Edukasi teknik relaksasi napas 4-7-8, sleep hygiene reguler, kontrol evaluasi 2 minggu.",
} as const;

export default function DiagnosisScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  // Single gate for demo-only affordances. The raw env flag is never read in
  // this screen: isDemoMode() already covers both flags.
  const demoMode = isDemoMode();
  // Route value only. No invented consultation id: without one the form stays
  // empty and unsavable instead of looking like a real patient record.
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const soapMutation = useCreateSoapNote();
  const finishMutation = useFinishConsultation();
  // The fixture only seeds a form the reviewer opened on purpose, by deep-linking
  // a real consultation id. Without that id the fields stay empty so nothing
  // here can be mistaken for clinical data coming from the server.
  const seedDemoDraft = Boolean(demoMode && consultationId);
  const [selectedIcd, setSelectedIcd] = useState(
    seedDemoDraft ? DEMO_DRAFT.icd10 : "",
  );
  const [subjective, setSubjective] = useState(
    seedDemoDraft ? DEMO_DRAFT.subjective : "",
  );
  const [objective, setObjective] = useState(
    seedDemoDraft ? DEMO_DRAFT.objective : "",
  );
  const [assessment, setAssessment] = useState(
    seedDemoDraft ? DEMO_DRAFT.assessment : "",
  );
  const [plan, setPlan] = useState(seedDemoDraft ? DEMO_DRAFT.plan : "");
  const [saved, setSaved] = useState(false);
  const soapConfirmed = saved && soapMutation.isSuccess;
  // True while every field still holds the untouched simulation fixture. Saving
  // is blocked until the practitioner replaces it with their own wording.
  const isDemoDraft =
    selectedIcd === DEMO_DRAFT.icd10 &&
    subjective === DEMO_DRAFT.subjective &&
    objective === DEMO_DRAFT.objective &&
    assessment === DEMO_DRAFT.assessment &&
    plan === DEMO_DRAFT.plan;

  const selectedDescription = getIcd10Description(selectedIcd);
  const canSave = Boolean(
    context &&
    !isDemoDraft &&
    selectedIcd &&
    selectedDescription &&
    subjective.trim() &&
    objective.trim() &&
    assessment.trim() &&
    plan.trim(),
  );

  const handleSave = () => {
    if (!canSave || !context || !selectedDescription) {
      haptics.error();
      return;
    }

    soapMutation.mutate(
      {
        context,
        dto: {
          subjective,
          objective,
          assessment: `${selectedIcd} — ${selectedDescription}\n${assessment}`,
          plan,
          icd10Code: selectedIcd,
          icd10Description: selectedDescription,
        },
      },
      {
        onSuccess: () => {
          setSaved(true);
          haptics.success();
        },
        onError: () => haptics.error(),
      },
    );
  };

  const handleFinish = () => {
    if (!context || finishMutation.isPending) {
      haptics.error();
      return;
    }
    finishMutation.mutate(context, {
      onSuccess: () => {
        router.push({
          pathname: ROUTES.PRACTITIONER.HISTORY,
          params: { consultationId: context.consultationId },
        } as never);
      },
      onError: () => haptics.error(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HStack space="sm" className="items-center mb-4">
          <Text size="lg" bold className="text-foreground">
            Diagnosis dan SOAP
          </Text>
          {context && (
            <Badge
              variant="outline"
              className="bg-muted border-border rounded-full"
            >
              <BadgeText className="text-[10px] text-foreground">
                {context.status}
              </BadgeText>
            </Badge>
          )}
        </HStack>

        {demoMode && (
          <DataSourceBanner
            source="demo"
            label="Mode demo"
            description="Isi formulir di bawah adalah contoh simulasi untuk penelusuran UI, bukan rekam medis pasien. Simpan tetap dinonaktifkan selama isian contoh itu belum diganti."
            className="mb-3"
          />
        )}

        {!context && (
          <BackendIntegrationBanner
            endpoint="POST /notes/consultation/:id/soap"
            title="Pratinjau Antarmuka QA • SOAP & Diagnosis"
            description="Konteks konsultasi belum tersedia dari respons server. Antarmuka formulir diagnosis ICD-10 dan input SOAP ditampilkan lengkap untuk evaluasi QA."
            className="mb-3"
          />
        )}

        {!consultationId && (
          <UnavailableState
            label="Formulir clinical belum bisa diisi"
            description="Tidak ada consultationId dari route, jadi tidak ada konteks server untuk diisi maupun disimpan. Buka layar ini dari daftar konsultasi agar ID diteruskan oleh server, atau telusuri lewat deep-link pada mode demo."
            className="mb-3"
          />
        )}

        <VStack space="sm">
          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            <Text size="sm" bold className="text-foreground">
              Kode ICD-10
            </Text>
            <HStack space="xs" className="items-center flex-wrap">
              {CLINICAL_CONSTANTS.ICD_10_CODES.map((item) => (
                <Pressable
                  key={item.code}
                  onPress={() => {
                    setSelectedIcd(item.code);
                    setSaved(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedIcd === item.code }}
                  className={`px-3 py-2 rounded-full border ${
                    selectedIcd === item.code
                      ? "bg-primary border-primary"
                      : "bg-muted border-border"
                  }`}
                >
                  <Text
                    size="xs"
                    bold
                    className={
                      selectedIcd === item.code
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }
                  >
                    {item.code}
                  </Text>
                </Pressable>
              ))}
            </HStack>
            <Text size="xs" className="text-muted-foreground">
              {selectedDescription ||
                "Pilih kode yang dikenal; kode yang tidak dikenal tetap unknown."}
            </Text>
          </Card>

          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            {[
              ["Subjective", subjective, setSubjective],
              ["Objective", objective, setObjective],
              ["Assessment", assessment, setAssessment],
              ["Plan", plan, setPlan],
            ].map(([label, value, setter]) => (
              <VStack key={label as string} space="xs">
                <Text size="xs" bold className="text-foreground">
                  {label as string}
                </Text>
                <Textarea className="bg-muted rounded-xl border-0">
                  <TextareaInput
                    value={value as string}
                    onChangeText={(value) => {
                      (setter as (value: string) => void)(value);
                      setSaved(false);
                    }}
                    placeholder="Masukkan catatan klinis"
                    className="text-sm text-foreground"
                  />
                </Textarea>
              </VStack>
            ))}
          </Card>

          <Card className="bg-muted rounded-2xl p-4 border border-border gap-2">
            <HStack space="xs" className="items-center">
              <FileText size={15} className="text-secondary" />
              <Text size="xs" bold className="text-foreground">
                Status SOAP
              </Text>
            </HStack>
            <Text size="xs" className="text-muted-foreground">
              {isDemoDraft
                ? "Isian masih contoh simulasi. Ganti seluruh isian contoh agar tidak tersimpan sebagai catatan pasien."
                : soapConfirmed
                  ? "SOAP terkonfirmasi server. Finish masih memerlukan aksi eksplisit."
                  : "Belum ada SOAP yang terkonfirmasi server."}
            </Text>
          </Card>

          {/*
           * isDisabled is a real state here, not a permanent one: save is
           * blocked while the simulation draft is untouched, so a reviewer
           * meets this disabled exactly when they most need to read why.
           * Gluestack's 0.4 fade drops the label to 1.51:1, so the surface is
           * dimmed instead of the text.
           */}
          <Button
            isDisabled={!canSave || soapMutation.isPending}
            onPress={handleSave}
            className="w-full rounded-xl bg-muted border border-border !opacity-100"
          >
            {soapMutation.isPending ? (
              <ButtonSpinner />
            ) : (
              <ButtonIcon as={Save} className="text-muted-foreground" />
            )}
            <ButtonText className="text-muted-foreground">
              Simpan SOAP
            </ButtonText>
          </Button>
          <Button
            variant="outline"
            isDisabled={!soapConfirmed || finishMutation.isPending}
            onPress={handleFinish}
            className="w-full rounded-xl border-border bg-muted !opacity-100"
          >
            {finishMutation.isPending ? (
              <ButtonSpinner />
            ) : (
              <ButtonText className="text-foreground">
                Akhiri sesi secara eksplisit
              </ButtonText>
            )}
          </Button>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

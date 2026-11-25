import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from "@/components/ui";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";
import { CLINICAL_CONSTANTS, getIcd10Description } from "@/constants/clinical";

export type PrescriptionOption = "none" | "referral" | "prescription";

export interface ClinicalDecisionViewProps {
  initialDiagnosis?: string;
  initialPrescriptionOption?: PrescriptionOption;
  onSave: (data: { diagnosis: string; prescriptionOption: PrescriptionOption }) => void;
  onCancel: () => void;
}

const PRESCRIPTION_OPTIONS: Array<{ id: PrescriptionOption; label: string }> = [
  { id: "none", label: "Tidak diperlukan" },
  { id: "referral", label: "Rujukan ke profesional lain" },
  { id: "prescription", label: "Resep dari dokter terkait" },
];

export function ClinicalDecisionView({
  initialDiagnosis = "F41.1 Generalized Anxiety Disorder dengan insomnia sekunder",
  initialPrescriptionOption = "none",
  onSave,
  onCancel,
}: ClinicalDecisionViewProps) {
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [prescriptionOption, setPrescriptionOption] =
    useState<PrescriptionOption>(initialPrescriptionOption);

  const handleSelectIcd = (code: string) => {
    const desc = getIcd10Description(code);
    if (desc) {
      setDiagnosis(`${code} ${desc}`);
    }
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onCancel}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Keputusan klinis
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notice */}
        <Box className="border border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-foreground leading-relaxed">
            Isi sesuai kewenangan profesimu. Bagian ini tidak otomatis terlihat oleh pasien.
          </Text>
        </Box>

        {/* Diagnosis Asesmen Profesional */}
        <VStack space="xs" className="gap-1.5">
          <Heading size="sm" bold className="text-foreground">
            Diagnosis / asesmen profesional{" "}
            <Text size="sm" className="text-muted-foreground font-normal">
              (wajib)
            </Text>
          </Heading>

          {/* Quick ICD-10 Chips */}
          <HStack space="xs" className="flex-wrap gap-1.5 my-1">
            {CLINICAL_CONSTANTS.ICD_10_CODES.map((item) => (
              <Pressable
                key={item.code}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => handleSelectIcd(item.code)}
                className="px-2.5 py-1 rounded-full border border-border bg-muted/50 active:bg-muted"
              >
                <Text size="sm" bold className="text-foreground">
                  {item.code}
                </Text>
              </Pressable>
            ))}
          </HStack>

          <Textarea className="rounded-xl border border-border bg-card p-3 min-h-[110px]">
            <TextareaInput
              placeholder="Tulis asesmen klinis dan temuan sesi"
              value={diagnosis}
              onChangeText={setDiagnosis}
              className="text-foreground text-sm leading-relaxed"
            />
          </Textarea>
        </VStack>

        {/* Resep / Rujukan */}
        <VStack space="xs" className="gap-2">
          <Heading size="sm" bold className="text-foreground">
            Resep / rujukan
          </Heading>

          <VStack space="sm" className="gap-2">
            {PRESCRIPTION_OPTIONS.map((opt) => {
              const isSelected = prescriptionOption === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={opt.label}
                  onPress={() => setPrescriptionOption(opt.id)}
                  className={`flex-row items-center p-3.5 rounded-2xl min-h-[58px] border-2 gap-3 ${
                    isSelected
                      ? "border-foreground bg-muted"
                      : "border-border bg-card"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 size={22} color="#262130" />
                  ) : (
                    <Circle size={22} color="#75618E" />
                  )}
                  <Text size="sm" bold={isSelected} className="text-foreground flex-1">
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>

        {/* Clinical Record Notice */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Diagnosis dan tindak lanjut klinis tercatat aman sesuai standar klasifikasi ICD-10.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSave({ diagnosis, prescriptionOption })}
        >
          <ButtonText className="text-background font-semibold">
            Simpan
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onCancel}
        >
          <ButtonText className="text-foreground font-semibold">
            Batal
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

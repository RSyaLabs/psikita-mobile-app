import React from "react";
import type { PractitionerType } from "@/constants/enums";
import {
  Brain,
  Stethoscope,
  CheckCircle2,
  ArrowRight,
} from "lucide-react-native";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface RegisterStepRoleProps {
  practitionerType: PractitionerType;
  onSelectType: (type: PractitionerType) => void;
  fullName: string;
  onChangeFullName: (val: string) => void;
  nik: string;
  onChangeNik: (val: string) => void;
  phone: string;
  onChangePhone: (val: string) => void;
  almamater: string;
  onChangeAlmamater: (val: string) => void;
  selectedSpecialty: string;
  onSelectSpecialty: (val: string) => void;
  onNext: () => void;
}

const SPECIALTIES = [
  "Psikologi Klinis Dewasa",
  "Anak & Remaja",
  "Trauma & PTSD",
  "Adiksi & Ketergantungan",
  "Neuropsikiatri & Mood Disorder",
];

export function RegisterStepRole({
  practitionerType,
  onSelectType,
  fullName,
  onChangeFullName,
  nik,
  onChangeNik,
  phone,
  onChangePhone,
  almamater,
  onChangeAlmamater,
  selectedSpecialty,
  onSelectSpecialty,
  onNext,
}: RegisterStepRoleProps) {
  const isNikValid = nik.trim().length === 16;

  return (
    <VStack space="lg">
      {/* Header info */}
      <VStack space="xs">
        <Heading size="lg" className="font-bold text-foreground">
          Pilih Jenis Praktik
        </Heading>
        <Text size="xs" className="text-muted-foreground">
          Kredensial diverifikasi secara ketat sesuai regulasi Kemenkes RI.
        </Text>
      </VStack>

      {/* Segmented Role Selector */}
      <HStack space="sm">
        <Pressable
          onPress={() => onSelectType("PSYCHOLOGIST")}
          accessibilityRole="button"
          accessibilityLabel="Pilih jenis Psikolog Klinis"
          className={`flex-1 p-3.5 rounded-2xl border ${
            practitionerType === "PSYCHOLOGIST"
              ? "bg-primary/10 border-primary"
              : "bg-card border-border active:bg-muted/50"
          }`}
        >
          <HStack space="xs" className="items-center justify-between mb-1">
            <Brain
              size={20}
              className={
                practitionerType === "PSYCHOLOGIST"
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            />
            {practitionerType === "PSYCHOLOGIST" && (
              <CheckCircle2 size={16} className="text-primary" />
            )}
          </HStack>
          <Text
            size="xs"
            className={`font-bold ${
              practitionerType === "PSYCHOLOGIST"
                ? "text-primary"
                : "text-foreground"
            }`}
          >
            Psikolog Klinis
          </Text>
          <Text size="xs" className="text-muted-foreground text-[10px] mt-0.5">
            Konseling, tes psikologi & psikoterapi
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSelectType("PSYCHIATRIST")}
          accessibilityRole="button"
          accessibilityLabel="Pilih jenis Psikiater"
          className={`flex-1 p-3.5 rounded-2xl border ${
            practitionerType === "PSYCHIATRIST"
              ? "bg-primary/10 border-primary"
              : "bg-card border-border active:bg-muted/50"
          }`}
        >
          <HStack space="xs" className="items-center justify-between mb-1">
            <Stethoscope
              size={20}
              className={
                practitionerType === "PSYCHIATRIST"
                  ? "text-primary"
                  : "text-muted-foreground"
              }
            />
            {practitionerType === "PSYCHIATRIST" && (
              <CheckCircle2 size={16} className="text-primary" />
            )}
          </HStack>
          <Text
            size="xs"
            className={`font-bold ${
              practitionerType === "PSYCHIATRIST"
                ? "text-primary"
                : "text-foreground"
            }`}
          >
            Psikiater (Sp.KJ)
          </Text>
          <Text size="xs" className="text-muted-foreground text-[10px] mt-0.5">
            Diagnosa medis & wewenang resep obat
          </Text>
        </Pressable>
      </HStack>

      {/* Form Inputs */}
      <VStack
        space="md"
        className="bg-card p-4 rounded-3xl border border-border"
      >
        {/* Nama Lengkap & Gelar */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              Nama Lengkap & Gelar Profesi
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-background rounded-xl px-3.5 h-12 border-border">
            <InputField
              placeholder={
                practitionerType === "PSYCHIATRIST"
                  ? "cth: dr. Nadia Putri, Sp.KJ"
                  : "cth: Ahmad Fauzi, M.Psi., Psikolog"
              }
              value={fullName}
              onChangeText={onChangeFullName}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        {/* NIK KTP (16 Digit) */}
        <FormControl>
          <HStack space="xs" className="items-center justify-between mb-1">
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              Nomor Induk Kependudukan (NIK)
            </FormControlLabelText>
            <Text
              size="xs"
              className={`text-[10px] font-bold ${
                isNikValid ? "text-secondary" : "text-muted-foreground"
              }`}
            >
              {nik.length}/16 Digit
            </Text>
          </HStack>
          <Input
            className={`bg-background rounded-xl px-3.5 h-12 ${isNikValid ? "border-secondary" : "border-border"}`}
          >
            <InputField
              placeholder="3171xxxxxxxxxxxx (16 digit sesuai e-KTP)"
              keyboardType="number-pad"
              maxLength={16}
              value={nik}
              onChangeText={onChangeNik}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        {/* No WhatsApp */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              No. WhatsApp Aktif
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-background rounded-xl px-3.5 h-12 border-border">
            <InputField
              placeholder="cth: 081234567890"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={onChangePhone}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        {/* Almamater / Asosiasi */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              Almamater Pendidikan Profesi
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-background rounded-xl px-3.5 h-12 border-border">
            <InputField
              placeholder="cth: Fakultas Psikologi / Kedokteran UI"
              value={almamater}
              onChangeText={onChangeAlmamater}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        {/* Pilihan Spesialisasi Chips */}
        <VStack space="xs">
          <Text size="xs" className="text-xs font-semibold text-foreground">
            Fokus Spesialisasi
          </Text>
          <HStack space="xs" className="flex-wrap gap-1.5">
            {SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialty === spec;
              return (
                <Pressable
                  key={spec}
                  onPress={() => {
                    haptics.selection();
                    onSelectSpecialty(spec);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "bg-muted/60 border-border active:bg-muted"
                  }`}
                >
                  <Text
                    size="xs"
                    className={`text-[11px] font-semibold ${
                      isSelected ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {spec}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </VStack>

      {/* Next Button */}
      <Button
        size="default"
        onPress={() => {
          haptics.medium();
          onNext();
        }}
        accessibilityRole="button"
        accessibilityLabel="Lanjut ke Legalitas STR dan SIP"
        className="w-full h-13 bg-primary rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90"
      >
        <ButtonText className="text-primary-foreground font-semibold text-sm">
          Lanjut ke Legalitas STR & SIP
        </ButtonText>
        <ButtonIcon as={ArrowRight} className="text-primary-foreground" />
      </Button>
    </VStack>
  );
}

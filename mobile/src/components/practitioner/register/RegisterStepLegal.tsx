import React from "react";
import type { PractitionerType } from "@/constants/enums";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Upload,
  ArrowRight,
} from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ButtonSpinner,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { practitionerRegisterSchema } from "@/utils/validation";

export interface RegisterStepLegalProps {
  practitionerType: PractitionerType;
  strNumber: string;
  onChangeStrNumber: (val: string) => void;
  sippNumber: string;
  onChangeSippNumber: (val: string) => void;
  docsUploaded: string | null;
  onOpenDocsModal: () => void;
  agreedToEthic: boolean;
  onToggleEthic: () => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function RegisterStepLegal({
  practitionerType,
  strNumber,
  onChangeStrNumber,
  sippNumber,
  onChangeSippNumber,
  docsUploaded,
  onOpenDocsModal,
  agreedToEthic,
  onToggleEthic,
  isSubmitting,
  onSubmit,
  onBack,
}: RegisterStepLegalProps) {
  // Gate only on the credentials the backend actually receives.
  // practitionerRegisterSchema owns the rule; it encodes the same minimum
  // lengths the admin verification pass checks.
  //
  // documentsUploaded and agreedToEthic are deliberately NOT blocking:
  // CreatePractitionerDto (types/api.ts:413) has no document or attestation
  // field, and UploadDocsModal's picker is disabled with zero call sites for
  // onSelectDocs, so requiring them made this wizard impossible to complete
  // while the backend received nothing either way. Revisit once the DTO
  // carries them.
  const credentialsComplete =
    practitionerRegisterSchema.shape.strNumber.safeParse(strNumber).success &&
    practitionerRegisterSchema.shape.sippNumber.safeParse(sippNumber).success;

  return (
    <VStack space="lg">
      {/* Header info */}
      <VStack space="xs">
        <Heading size="lg" className="font-bold text-foreground">
          Kredensial & Berkas Legalitas
        </Heading>
        <Text size="xs" className="text-muted-foreground">
          {practitionerType === "PSYCHIATRIST"
            ? "STR KKI dan SIP Dokter Spesialis Jiwa aktif dari Dinkes."
            : "STR KTKI dan SIPP dari Dinkes/HIMPSI."}
        </Text>
      </VStack>

      {/* Form Inputs for STR & SIP */}
      <VStack
        space="md"
        className="bg-card p-4 rounded-3xl border border-border"
      >
        {/* Nomor STR */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              Nomor STR Aktif (
              {practitionerType === "PSYCHIATRIST" ? "KKI" : "KTKI Kemenkes"})
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-background rounded-xl px-3.5 h-12 border-border">
            <InputField
              placeholder="cth: 1234567890123456"
              value={strNumber}
              onChangeText={onChangeStrNumber}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
          <Text size="xs" className="text-muted-foreground text-[10px] mt-1">
            Nomor registrasi nasional yang tercatat di portal Kemenkes Satu
            Sehat SDMK.
          </Text>
        </FormControl>

        {/* Nomor SIP / SIPP */}
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-semibold text-foreground">
              {practitionerType === "PSYCHIATRIST"
                ? "Nomor SIP Dokter (Dinas Kesehatan)"
                : "Nomor SIPP (Surat Izin Praktik Psikologi)"}
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="bg-background rounded-xl px-3.5 h-12 border-border">
            <InputField
              placeholder={
                practitionerType === "PSYCHIATRIST"
                  ? "cth: 503/SIP-DOK/DINKES/2024"
                  : "cth: 503/092/SIPP/DINKES/2024"
              }
              value={sippNumber}
              onChangeText={onChangeSippNumber}
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        {/* Compact Unified Upload Dropzone */}
        <VStack space="xs">
          <Text size="xs" className="text-xs font-semibold text-foreground">
            Berkas Bukti Fisik (PDF Scan STR & SIP)
          </Text>
          <Pressable
            onPress={() => {
              haptics.medium();
              onOpenDocsModal();
            }}
            accessibilityRole="button"
            accessibilityLabel="Unggah berkas STR dan SIP"
            className={`rounded-2xl p-4 border border-dashed items-center justify-center gap-1.5 active:bg-muted/50 ${
              docsUploaded
                ? "bg-secondary/10 border-secondary"
                : "bg-background border-border"
            }`}
          >
            {docsUploaded ? (
              <>
                <FileCheck size={24} className="text-secondary" />
                <Text
                  size="xs"
                  className="font-bold text-secondary text-center"
                >
                  {docsUploaded}
                </Text>
                <Text size="xs" className="text-muted-foreground text-[10px]">
                  Berkas terverifikasi siap kirim • Ketuk untuk ubah
                </Text>
              </>
            ) : (
              <>
                <Upload size={22} className="text-muted-foreground" />
                <Text size="xs" className="font-semibold text-foreground">
                  Pilih Berkas STR & SIP (PDF)
                </Text>
                <Text
                  size="xs"
                  className="text-muted-foreground text-[10px] text-center"
                >
                  PDF/Foto scan resmi • Maksimal 5 MB per berkas
                </Text>
              </>
            )}
          </Pressable>
        </VStack>

        {/* Ethical & Security Checkbox */}
        <Pressable
          onPress={() => {
            haptics.selection();
            onToggleEthic();
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreedToEthic }}
          accessibilityLabel="Setuju pada syarat etika dan ketentuan UU Kesehatan RI"
          className="flex-row items-start gap-2.5 p-2 rounded-xl active:bg-muted/40"
        >
          <Box
            className={`w-5 h-5 rounded-md items-center justify-center mt-0.5 border ${
              agreedToEthic
                ? "bg-primary border-primary"
                : "bg-background border-border"
            }`}
          >
            {agreedToEthic && (
              <CheckCircle2 size={14} className="text-primary-foreground" />
            )}
          </Box>
          <Text
            size="xs"
            className="flex-1 text-foreground text-[11px] leading-relaxed"
          >
            Saya menyatakan bahwa seluruh data STR, SIP, dan kualifikasi profesi
            adalah benar, sah, dan dapat dipertanggungjawabkan secara hukum
            sesuai UU Kesehatan RI No. 17/2023.
          </Text>
        </Pressable>
      </VStack>

      {/* Anti-Abuse Sandbox Notice */}
      <Card className="bg-primary/5 rounded-2xl p-3 border border-primary/20">
        <HStack space="sm" className="items-start">
          <ShieldCheck size={18} className="text-primary mt-0.5" />
          <VStack space="xs" className="flex-1">
            <Text size="xs" className="font-bold text-primary">
              Pencegahan Praktik Ilegal & Zero-Trust
            </Text>
            <Text
              size="xs"
              className="text-muted-foreground text-[10px] leading-relaxed"
            >
              Akun baru otomatis berstatus{" "}
              <Text size="xs" className="font-bold text-foreground text-[10px]">
                PENDING & INACTIVE
              </Text>
              . Praktisi belum dapat menerima pasien sampai NIK & STR lolos
              verifikasi manual Tim Medis PsiKita.
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* Submit & Back Action Buttons */}
      <VStack space="sm">
        <Button
          size="default"
          isDisabled={isSubmitting || !credentialsComplete}
          onPress={onSubmit}
          accessibilityRole="button"
          accessibilityLabel="Kirim permohonan verifikasi akun praktisi"
          className="w-full h-13 bg-primary rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90"
        >
          {isSubmitting ? (
            <ButtonSpinner />
          ) : (
            <>
              <ButtonText className="text-primary-foreground font-semibold text-sm">
                Kirim Dokumen untuk Verifikasi
              </ButtonText>
              <ButtonIcon as={ArrowRight} className="text-primary-foreground" />
            </>
          )}
        </Button>

        <Button
          size="default"
          variant="outline"
          onPress={() => {
            haptics.selection();
            onBack();
          }}
          className="w-full h-11 rounded-2xl border-border bg-card"
        >
          <ButtonText className="text-xs font-semibold text-muted-foreground">
            Kembali ke Langkah 1
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}

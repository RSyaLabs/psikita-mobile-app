import React, { useState } from "react";
import type { PractitionerType } from "@/constants/enums";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { safeNavigateBack } from "@/utils/navigation";
import { HelpCircle } from "lucide-react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Badge,
  BadgeText,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { AppHeader } from "@/components/common";
import { UploadDocsModal } from "@/components/modals";
import {
  RegisterStepRole,
  RegisterStepLegal,
} from "@/components/practitioner/register";
import { ROUTES } from "@/constants";
import { useRegisterPractitioner } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { practitionerRegisterSchema } from "@/utils/validation";

export default function PractitionerRegisterScreen() {
  const router = useRouter();
  const toast = useToast();
  const registerMutation = useRegisterPractitioner();

  // Wizard Step: 1 = Identitas & Profesi, 2 = Legalitas Kemenkes
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [practitionerType, setPractitionerType] = useState<
    PractitionerType
  >("PSYCHOLOGIST");
  const [fullName, setFullName] = useState("");
  const [selectedGelar, setSelectedGelar] = useState("M.Psi., Psikolog");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [almamater, setAlmamater] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    "Psikologi Klinis Dewasa",
  );

  // Step 2 Fields
  const [strNumber, setStrNumber] = useState("");
  const [sippNumber, setSippNumber] = useState("");
  const [docsUploaded, setDocsUploaded] = useState<string | null>(null);
  const [agreedToEthic, setAgreedToEthic] = useState(false);

  // Modals
  const [showDocsModal, setShowDocsModal] = useState(false);

  const handleSelectType = (type: PractitionerType) => {
    haptics.selection();
    setPractitionerType(type);
    if (type === "PSYCHOLOGIST") {
      setSelectedGelar("M.Psi., Psikolog");
    } else {
      setSelectedGelar("dr. ..., Sp.KJ");
      setSelectedSpecialty("Neuropsikiatri & Mood Disorder");
    }
  };

  const handleNextStep1 = () => {
    // haptics.error() is a no-op on web, so a blocked step must also
    // surface visible text or the user gets a live button that does nothing.
    if (!fullName.trim() || !nik.trim() || !phone.trim()) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Lengkapi data identitas</ToastTitle>
            <ToastDescription>
              Nama lengkap, NIK 16 digit, dan nomor telepon wajib diisi sebelum
              melanjutkan.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }
    if (nik.trim().length !== 16) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>NIK tidak valid</ToastTitle>
            <ToastDescription>
              NIK harus 16 digit sesuai e-KTP.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    haptics.medium();
    const finalFee = practitionerType === "PSYCHIATRIST" ? 200000 : 150000;

    // Never substitute placeholder identity or licence values. A missing
    // credential must block the submission, not become a syntactically
    // valid fake that passes format-only backend validation. The minimum
    // lengths are owned by practitionerRegisterSchema.
    const credentials = practitionerRegisterSchema.shape;
    if (
      !credentials.strNumber.safeParse(strNumber).success ||
      !credentials.sippNumber.safeParse(sippNumber).success
    ) {
      haptics.error();
      return;
    }

    registerMutation.mutate(
      {
        fullName: fullName.trim(),
        title: selectedGelar,
        type: practitionerType,
        strNumber: strNumber.trim(),
        sippNumber: sippNumber.trim(),
        specialization: selectedSpecialty,
        nik: nik.trim(),
        phone: phone.trim(),
        ...(almamater.trim() ? { almamater: almamater.trim() } : {}),
        consultationFee: finalFee,
      },
      {
        onSuccess: () => {
          haptics.success();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Pengajuan Verifikasi Terkirim</ToastTitle>
                <ToastDescription>
                  Data STR & SIP Anda sedang ditinjau oleh Admin Kemenkes
                  PsiKita (&lt; 24 jam).
                </ToastDescription>
              </Toast>
            ),
          });
          router.push(ROUTES.PRACTITIONER.DASHBOARD);
        },
        onError: () => {
          haptics.error();
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        title="Registrasi Praktisi"
        fallbackRoute={ROUTES.AUTH.LOGIN}
        onBack={() => {
          if (step === 2) {
            setStep(1);
          } else {
            safeNavigateBack(router, ROUTES.AUTH.LOGIN);
          }
        }}
        rightAction={<HelpCircle size={18} className="text-muted-foreground" />}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleek Step Progress Indicator */}
        <VStack space="xs" className="mb-5">
          <HStack space="xs" className="items-center justify-between">
            <Text
              size="xs"
              className="font-bold text-foreground tracking-wide uppercase text-[11px]"
            >
              {step === 1
                ? "Langkah 1/2 • Identitas & Profesi"
                : "Langkah 2/2 • Legalitas Kemenkes"}
            </Text>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-2 py-0.5 rounded-full"
            >
              <BadgeText className="text-[10px] font-bold text-primary">
                {practitionerType === "PSYCHOLOGIST"
                  ? "Psikolog Klinis"
                  : "Dokter Psikiater"}
              </BadgeText>
            </Badge>
          </HStack>

          {/* Minimal 2-segment progress line */}
          <HStack space="xs" className="items-center mt-1">
            <Box
              className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`}
            />
            <Box
              className={`flex-1 h-1.5 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`}
            />
          </HStack>
        </VStack>

        {/* STEP 1: Identitas & Profesi */}
        {step === 1 && (
          <RegisterStepRole
            practitionerType={practitionerType}
            onSelectType={handleSelectType}
            fullName={fullName}
            onChangeFullName={setFullName}
            nik={nik}
            onChangeNik={setNik}
            phone={phone}
            onChangePhone={setPhone}
            almamater={almamater}
            onChangeAlmamater={setAlmamater}
            selectedSpecialty={selectedSpecialty}
            onSelectSpecialty={setSelectedSpecialty}
            onNext={handleNextStep1}
          />
        )}

        {/* STEP 2: Legalitas & Berkas Kemenkes */}
        {step === 2 && (
          <RegisterStepLegal
            practitionerType={practitionerType}
            strNumber={strNumber}
            onChangeStrNumber={setStrNumber}
            sippNumber={sippNumber}
            onChangeSippNumber={setSippNumber}
            docsUploaded={docsUploaded}
            onOpenDocsModal={() => setShowDocsModal(true)}
            agreedToEthic={agreedToEthic}
            onToggleEthic={() => setAgreedToEthic(!agreedToEthic)}
            isSubmitting={registerMutation.isPending}
            onSubmit={handleSubmit}
            onBack={() => setStep(1)}
          />
        )}
      </ScrollView>

      {/* Upload Docs Modal */}
      <UploadDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
        onSelectDocs={(d) => setDocsUploaded(d)}
      />
    </SafeAreaView>
  );
}

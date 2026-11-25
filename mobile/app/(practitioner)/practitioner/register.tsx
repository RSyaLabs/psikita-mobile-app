import React, { useState, useEffect } from "react";
import type { PractitionerType } from "@/constants/enums";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import {
  useRegisterPractitioner,
  useMyVerificationStatus,
} from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";
import { haptics } from "@/utils/haptics";
import { practitionerRegisterSchema } from "@/utils/validation";

export default function PractitionerRegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string }>();
  const toast = useToast();
  const registerMutation = useRegisterPractitioner();

  const { data: kycStatus } = useMyVerificationStatus();
  const isVerified =
    kycStatus?.status === "VERIFIED" || kycStatus?.status === "APPROVED";
  const verifiedIdentity = kycStatus?.identity;

  const resolveStep = (raw?: string): 1 | 2 =>
    raw === "2" || raw === "3" ? 2 : 1;

  // Wizard Step: 1 = Identitas & Profesi, 2 = Legalitas Kemenkes
  const [step, setStep] = useState<1 | 2>(() => resolveStep(params.step));

  useEffect(() => {
    if (params.step) {
      setStep(resolveStep(params.step));
    }
  }, [params.step]);

  // Form Fields
  const [practitionerType, setPractitionerType] = useState<
    PractitionerType
  >("PSYCHOLOGIST");
  const [fullName, setFullName] = useState("");
  const [selectedGelar, setSelectedGelar] = useState("M.Psi., Psikolog");
  const [nik, setNik] = useState("");
  const [phone, setPhone] = useState("");
  const [almamater, setAlmamater] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("FEMALE");
  const [npwp, setNpwp] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    "Psikologi Klinis Dewasa",
  );

  useEffect(() => {
    if (verifiedIdentity?.nik && !nik) {
      setNik(verifiedIdentity.nik);
    }
    if (verifiedIdentity?.fullName && !fullName) {
      setFullName(verifiedIdentity.fullName);
    }
  }, [verifiedIdentity, nik, fullName]);

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
    const cleanNpwp = npwp.replace(/[^\d]/g, "");
    if (!birthDate.trim() || !/^\d{4}-\d{2}-\d{2}/.test(birthDate.trim())) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Tanggal lahir tidak valid</ToastTitle>
            <ToastDescription>
              Masukkan tanggal lahir dengan format YYYY-MM-DD (contoh: 1990-05-14).
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }
    if (cleanNpwp.length < 15) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>NPWP wajib diisi</ToastTitle>
            <ToastDescription>
              Masukkan minimal 15 digit nomor NPWP aktif Anda.
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

    const credentials = practitionerRegisterSchema.shape;
    if (
      !credentials.strNumber.safeParse(strNumber).success ||
      !credentials.sippNumber.safeParse(sippNumber).success
    ) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Nomor STR / SIP tidak valid</ToastTitle>
            <ToastDescription>
              Pastikan nomor STR dan SIP/SIPP diisi lengkap sesuai format resmi.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    if (!agreedToEthic) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Persetujuan Diperlukan</ToastTitle>
            <ToastDescription>
              Centang pernyataan kebenaran data dan etika profesi terlebih dahulu.
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "Praktisi";
    const lastName = nameParts.slice(1).join(" ") || firstName;
    const cleanBirthDate = birthDate.trim().includes("T")
      ? birthDate.trim()
      : `${birthDate.trim()}T00:00:00.000Z`;
    const cleanNpwp = npwp.replace(/[^\d]/g, "");

    registerMutation.mutate(
      {
        fullName: fullName.trim(),
        fullNameWithTitle: fullName.trim(),
        firstName,
        lastName,
        birthDate: cleanBirthDate,
        gender,
        title: selectedGelar,
        type: practitionerType,
        strNumber: strNumber.trim(),
        sippNumber: sippNumber.trim(),
        ...(practitionerType === "PSYCHIATRIST"
          ? { sipNumber: sippNumber.trim() }
          : {}),
        specialization: selectedSpecialty,
        nik: nik.trim(),
        taxIdentificationNumber: cleanNpwp,
        phone: phone.trim(),
        ...(almamater.trim() ? { almamater: almamater.trim() } : {}),
        educationHistory: [
          {
            institution: almamater.trim() || "Universitas Indonesia",
            degree: practitionerType === "PSYCHIATRIST" ? "Sp.KJ" : "S2 Profesi",
            major: selectedSpecialty,
            graduationYear: 2020,
          },
        ],
        practiceExperiences: [
          {
            facilityName: "Praktik Klinis Mandiri",
            position:
              practitionerType === "PSYCHIATRIST"
                ? "Dokter Spesialis Kedokteran Jiwa"
                : "Psikolog Klinis",
            startDate: "2021-01-01T00:00:00.000Z",
          },
        ],
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
                  SeraPhany (&lt; 24 jam).
                </ToastDescription>
              </Toast>
            ),
          });
          router.push(ROUTES.PRACTITIONER.DASHBOARD);
        },
        onError: (err: unknown) => {
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="error">
                <ToastTitle>Pendaftaran Praktisi Gagal</ToastTitle>
                <ToastDescription>
                  {err instanceof ApiError
                    ? err.message
                    : "Periksa kembali kelengkapan data pendaftaran Anda."}
                </ToastDescription>
              </Toast>
            ),
          });
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
              size="sm"
              className="font-bold text-foreground tracking-wide uppercase text-sm"
            >
              {step === 1
                ? "Langkah 1/2 • Identitas & Profesi"
                : "Langkah 2/2 • Legalitas Kemenkes"}
            </Text>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-2.5 py-0.5 rounded-full"
            >
              <BadgeText className="text-sm font-bold text-primary">
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
            birthDate={birthDate}
            onChangeBirthDate={setBirthDate}
            gender={gender}
            onChangeGender={setGender}
            npwp={npwp}
            onChangeNpwp={setNpwp}
            onNext={handleNextStep1}
            isVerifiedDidit={isVerified}
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

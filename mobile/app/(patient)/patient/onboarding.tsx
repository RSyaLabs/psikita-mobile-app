import React, { useState } from "react";
import { Linking, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  CreditCard,
  ArrowRight,
  LogOut,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Card,
  Badge,
  BadgeText,
  ScrollView,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { AppHeader } from "@/components/common";
import { AppIcon } from "@/components/common/AppIcon";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import {
  useMyVerificationStatus,
  useStartDiditVerification,
  useCreatePatientProfile,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

export default function PatientOnboardingScreen() {
  const router = useRouter();
  const toast = useToast();
  const { signOut } = useAuth();

  const {
    data: kycStatus,
    isLoading: isKycLoading,
    refetch: refetchKyc,
    isRefetching: isKycRefetching,
  } = useMyVerificationStatus();

  const startKycMutation = useStartDiditVerification();
  const createProfileMutation = useCreatePatientProfile();

  const isVerified =
    kycStatus?.status === "VERIFIED" || kycStatus?.status === "APPROVED";
  const verifiedIdentity = kycStatus?.identity;

  // Form Fields
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bpjsNumber, setBpjsNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartDidit = async () => {
    haptics.selection();
    try {
      const session = await startKycMutation.mutateAsync();
      if (session?.url) {
        await Linking.openURL(session.url);
      }
    } catch (err: unknown) {
      haptics.error();
      const message =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi Didit KYC. Silakan coba lagi.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Kendala Memulai Verifikasi</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  const handleRefreshStatus = async () => {
    haptics.light();
    await refetchKyc();
  };

  const handleSubmitProfile = async () => {
    setErrorMsg(null);
    haptics.medium();

    if (!isVerified || !verifiedIdentity?.nik) {
      setErrorMsg("Verifikasi identitas Didit KYC diperlukan terlebih dahulu.");
      haptics.error();
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMsg("Nomor telepon aktif wajib diisi.");
      haptics.error();
      return;
    }

    if (!address.trim()) {
      setErrorMsg("Alamat domisili lengkap wajib diisi.");
      haptics.error();
      return;
    }

    const firstName =
      verifiedIdentity.firstName ||
      verifiedIdentity.fullName?.split(" ")[0] ||
      "Pasien";
    const lastName =
      verifiedIdentity.lastName ||
      verifiedIdentity.fullName?.split(" ").slice(1).join(" ") ||
      "SeraPhany";
    const birthDate = verifiedIdentity.birthDate || "1995-01-01";
    const generatedMRN = `RM-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    try {
      await createProfileMutation.mutateAsync({
        firstName,
        lastName,
        fullName: verifiedIdentity.fullName || `${firstName} ${lastName}`,
        birthDate,
        gender,
        nik: verifiedIdentity.nik,
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        medicalRecordNumber: generatedMRN,
        healthCoverageType: "BPJS",
        healthInsuranceId: bpjsNumber.trim() || verifiedIdentity.nik,
        bpjsNumber: bpjsNumber.trim() || undefined,
      });

      haptics.success();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="success">
            <ToastTitle>Profil Pasien Berhasil Dibuat</ToastTitle>
            <ToastDescription>
              Selamat datang di SeraPhany. Rekam medis Anda telah aktif.
            </ToastDescription>
          </Toast>
        ),
      });

      router.replace(ROUTES.PATIENT.DASHBOARD);
    } catch (err: unknown) {
      haptics.error();
      const message =
        err instanceof Error
          ? err.message
          : "Gagal membuat profil pasien. Silakan coba lagi.";
      setErrorMsg(message);
    }
  };

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
    router.replace(ROUTES.AUTH.LOGIN);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        title="Pendaftaran Profil Pasien"
        fallbackRoute={ROUTES.AUTH.LOGIN}
        onBack={handleSignOut}
        rightAction={
          <Pressable
            onPress={handleSignOut}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="flex-row items-center p-1"
          >
            <AppIcon icon={LogOut} size={18} tone="muted" />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Badge */}
        <VStack space="xs" className="mb-4">
          <HStack space="xs" className="items-center justify-between">
            <Text size="sm" className="font-bold text-foreground tracking-wide uppercase">
              {isVerified
                ? "Langkah 2/2 • Kelengkapan Profil Pasien"
                : "Langkah 1/2 • Verifikasi Identitas (Didit KYC)"}
            </Text>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-2.5 py-0.5 rounded-full"
            >
              <BadgeText className="text-primary font-bold text-sm">
                {isVerified ? "Siap Didaftarkan" : "Wajib Kemenkes"}
              </BadgeText>
            </Badge>
          </HStack>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Sesuai regulasi Permenkes No. 24/2022, pembukaan berkas rekam medis
            elektronik pasien memerlukan validasi identitas terverifikasi.
          </Text>
        </VStack>

        {/* KYC Verification Card */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-5">
          <VStack space="sm">
            <HStack space="md" className="items-center justify-between">
              <HStack space="sm" className="items-center flex-1">
                <Box
                  className={`w-10 h-10 rounded-xl items-center justify-center ${
                    isVerified ? "bg-emerald-500/10" : "bg-amber-500/10"
                  }`}
                >
                  <AppIcon
                    icon={isVerified ? ShieldCheck : ShieldAlert}
                    size={22}
                    color={isVerified ? "#10B981" : "#F59E0B"}
                  />
                </Box>
                <VStack space="xs" className="flex-1">
                  <Text size="sm" className="font-bold text-foreground">
                    Status Verifikasi Didit KYC
                  </Text>
                  <Text size="sm" className="text-muted-foreground">
                    {isVerified
                      ? "Identitas e-KTP Terverifikasi"
                      : kycStatus?.status === "PENDING"
                        ? "Sedang diverifikasi oleh Didit..."
                        : "Belum diverifikasi"}
                  </Text>
                </VStack>
              </HStack>
              <Badge
                variant="outline"
                className={`px-2.5 py-0.5 rounded-full ${
                  isVerified
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-amber-500/30 bg-amber-500/10"
                }`}
              >
                <BadgeText
                  className={`text-sm font-bold ${
                    isVerified ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {isVerified ? "TERVERIFIKASI" : "BELUM LENGKAP"}
                </BadgeText>
              </Badge>
            </HStack>

            {!isVerified && (
              <VStack space="sm" className="pt-2">
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Lakukan verifikasi foto e-KTP dan biometrik wajah melalui
                  layanan aman Didit KYC.
                </Text>
                <Button
                  size="lg"
                  onPress={handleStartDidit}
                  disabled={startKycMutation.isPending}
                  className="w-full h-12 rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center"
                >
                  {startKycMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <HStack space="xs" className="items-center">
                      <ButtonText className="text-primary-foreground font-bold text-base">
                        Mulai Verifikasi Didit KYC
                      </ButtonText>
                      <ButtonIcon as={ExternalLink} className="text-primary-foreground ml-1" />
                    </HStack>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onPress={handleRefreshStatus}
                  disabled={isKycRefetching}
                  className="w-full h-11 rounded-xl border border-border bg-card flex-row items-center justify-center"
                >
                  {isKycRefetching ? (
                    <ActivityIndicator size="small" color="#4A3B6B" />
                  ) : (
                    <HStack space="xs" className="items-center">
                      <ButtonIcon as={RefreshCw} className="text-foreground mr-1" />
                      <ButtonText className="text-foreground font-semibold text-sm">
                        Cek Status Verifikasi
                      </ButtonText>
                    </HStack>
                  )}
                </Button>
              </VStack>
            )}
          </VStack>
        </Card>

        {/* Patient Profile Form (Active when verified) */}
        {isVerified && (
          <VStack space="md">
            <Card className="bg-card rounded-2xl p-4 border border-border">
              <VStack space="sm">
                <HStack space="xs" className="items-center mb-1">
                  <AppIcon icon={Lock} size={16} tone="primary" />
                  <Text size="sm" className="font-bold text-foreground">
                    Data Terverifikasi (Kemenkes / Didit)
                  </Text>
                </HStack>

                {/* NIK Readonly */}
                <Box className="bg-muted/40 p-3 rounded-xl border border-border/60">
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Nomor Induk Kependudukan (NIK)
                  </Text>
                  <Text size="sm" className="font-bold text-foreground mt-0.5">
                    {verifiedIdentity?.nik || "-"}
                  </Text>
                </Box>

                {/* Nama Lengkap Readonly */}
                <Box className="bg-muted/40 p-3 rounded-xl border border-border/60">
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Nama Lengkap
                  </Text>
                  <Text size="sm" className="font-bold text-foreground mt-0.5">
                    {verifiedIdentity?.fullName ||
                      `${verifiedIdentity?.firstName || ""} ${
                        verifiedIdentity?.lastName || ""
                      }`.trim() ||
                      "-"}
                  </Text>
                </Box>

                {/* Tanggal Lahir Readonly */}
                <Box className="bg-muted/40 p-3 rounded-xl border border-border/60">
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Tanggal Lahir
                  </Text>
                  <Text size="sm" className="font-bold text-foreground mt-0.5">
                    {verifiedIdentity?.birthDate || "-"}
                  </Text>
                </Box>
              </VStack>
            </Card>

            {/* Editable Profile Details */}
            <Card className="bg-card rounded-2xl p-4 border border-border">
              <VStack space="md">
                <Text size="sm" className="font-bold text-foreground">
                  Lengkapi Data Rekam Medis
                </Text>

                {/* Jenis Kelamin */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground">
                      Jenis Kelamin
                    </FormControlLabelText>
                  </FormControlLabel>
                  <HStack space="sm" className="pt-1">
                    <Pressable
                      onPress={() => {
                        haptics.selection();
                        setGender("MALE");
                      }}
                      className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center ${
                        gender === "MALE"
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text
                        size="sm"
                        className={`font-bold ${
                          gender === "MALE" ? "text-primary" : "text-foreground"
                        }`}
                      >
                        Laki-laki
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        haptics.selection();
                        setGender("FEMALE");
                      }}
                      className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center ${
                        gender === "FEMALE"
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border"
                      }`}
                    >
                      <Text
                        size="sm"
                        className={`font-bold ${
                          gender === "FEMALE" ? "text-primary" : "text-foreground"
                        }`}
                      >
                        Perempuan
                      </Text>
                    </Pressable>
                  </HStack>
                </FormControl>

                {/* Nomor Telepon */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground">
                      Nomor Telepon / WhatsApp
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="rounded-xl border-border bg-background h-11">
                    <InputField
                      placeholder="081234567890"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      className="text-sm font-medium text-foreground"
                    />
                  </Input>
                </FormControl>

                {/* Alamat Lengkap */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground">
                      Alamat Domisili Lengkap
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="rounded-xl border-border bg-background h-11">
                    <InputField
                      placeholder="Jl. Merdeka No. 1, Jakarta"
                      value={address}
                      onChangeText={setAddress}
                      className="text-sm font-medium text-foreground"
                    />
                  </Input>
                </FormControl>

                {/* Nomor BPJS (Opsional) */}
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground">
                      Nomor BPJS Kesehatan (Opsional)
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="rounded-xl border-border bg-background h-11">
                    <InputField
                      placeholder="000123456789 (opsional)"
                      value={bpjsNumber}
                      onChangeText={setBpjsNumber}
                      keyboardType="number-pad"
                      className="text-sm font-medium text-foreground"
                    />
                  </Input>
                </FormControl>

                {errorMsg && (
                  <Box className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
                    <Text size="sm" className="text-destructive font-medium">
                      {errorMsg}
                    </Text>
                  </Box>
                )}

                <Button
                  size="lg"
                  onPress={handleSubmitProfile}
                  disabled={createProfileMutation.isPending}
                  className="w-full h-12 rounded-xl bg-primary active:opacity-90 mt-2 flex-row items-center justify-center"
                >
                  {createProfileMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <HStack space="xs" className="items-center">
                      <ButtonText className="text-primary-foreground font-bold text-base">
                        Simpan & Masuk ke Dashboard
                      </ButtonText>
                      <ButtonIcon as={ArrowRight} className="text-primary-foreground ml-1" />
                    </HStack>
                  )}
                </Button>
              </VStack>
            </Card>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

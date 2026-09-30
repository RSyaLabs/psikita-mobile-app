import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  FlaskConical,
  ShieldCheck,
} from "lucide-react-native";
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
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { getCapability } from "@/config/capabilities";
import { isDemoMode } from "@/config/demoMode";
import {
  DataSourceBanner,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import {
  useCheckBpjsEligibility,
  usePatientProfile,
  useValidatedServerPaymentContext,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";

export default function PaymentBpjsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId?: string }>();
  // Single demo gate; the raw env flag is never read in this screen.
  const demoMode = isDemoMode();
  // Route value only. No invented consultation id.
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const paymentContextQuery = useValidatedServerPaymentContext(consultationId);
  const serverContext = paymentContextQuery?.context;
  const isContextLoading = paymentContextQuery?.isLoading ?? false;
  const isContextFetching = paymentContextQuery?.isFetching ?? false;
  const isContextSuccess =
    paymentContextQuery?.isSuccess ?? Boolean(serverContext);
  const isContextError = paymentContextQuery?.isError ?? false;
  const refetchContext = paymentContextQuery?.refetch;
  const {
    data: patientProfile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    isSuccess: isProfileSuccess,
    isError: isProfileError,
    refetch: refetchProfile,
  } = usePatientProfile();
  const serverBillingOrderId = serverContext?.billingOrderId;
  const isProfileReady = isProfileSuccess ?? Boolean(patientProfile);
  const memberNumber = patientProfile?.bpjsNumber?.trim() || undefined;
  const eligibilityMutation = useCheckBpjsEligibility();

  const bpjsCapability = getCapability("bpjsEligibility");
  const canRequestEligibility =
    bpjsCapability === "live" &&
    !demoMode &&
    Boolean(serverBillingOrderId && memberNumber) &&
    isContextSuccess &&
    isProfileReady &&
    !isContextFetching &&
    !isProfileFetching &&
    !isContextError &&
    !isProfileError;
  const isSubmitting = eligibilityMutation.isPending;
  // A demo run is never a BPJS verification. Outside demo mode the CTA needs
  // the server acceptance; in demo mode it only opens the chat room so a
  // reviewer can trace the flow, and it is labelled as a simulation.
  const canConfirmBpjs =
    Boolean(consultationId) &&
    !isSubmitting &&
    (demoMode || eligibilityMutation.isSuccess);
  const isDemoSource = demoMode;
  const prerequisitesLoading =
    isContextLoading ||
    isContextFetching ||
    isProfileLoading ||
    isProfileFetching;
  const prerequisitesError = isContextError || isProfileError;
  const requestUnavailable =
    !isDemoSource &&
    (bpjsCapability === "unavailable" ||
      (!prerequisitesLoading && !prerequisitesError && !canRequestEligibility));

  const handleRetry = () => {
    if (
      !canRequestEligibility ||
      !serverContext ||
      !serverBillingOrderId ||
      !memberNumber
    ) {
      haptics.error();
      return;
    }

    eligibilityMutation.mutate({
      context: serverContext,
      memberNumber,
    });
  };

  const handlePrerequisiteRetry = () => {
    if (isContextError) refetchContext?.();
    if (isProfileError) refetchProfile?.();
  };

  const handleConfirmBpjs = () => {
    if (!canConfirmBpjs || !consultationId) {
      haptics.error();
      return;
    }
    // Nothing here records a verification. In demo mode this is a traced jump
    // to the chat room; outside it the server already accepted the request.
    if (demoMode) haptics.medium();
    else haptics.success();
    router.push({
      pathname: ROUTES.PATIENT.CHAT_ROOM,
      params: { consultationId },
    });
  };

  const eligibilityLabel = demoMode
    ? "Simulasi: BPJS tidak diverifikasi"
    : eligibilityMutation.isError
      ? "Validasi gagal"
      : eligibilityMutation.isSuccess
        ? "Permintaan diterima; detail manfaat belum tersedia"
        : eligibilityMutation.isPending
          ? "Memvalidasi..."
          : isProfileLoading ||
              isProfileFetching ||
              isContextLoading ||
              isContextFetching
            ? "Memuat data dari server..."
            : "Status eligibility belum tersedia";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PATIENT.CHECKOUT);
          }}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          className="p-1 -ml-1 active:opacity-70"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <VStack space="xs">
          <Heading level={1} size="md" bold className="text-foreground">
            Validasi BPJS
          </Heading>
          <Text size="xs" className="text-muted-foreground">
            Status manfaat belum tersedia
          </Text>
        </VStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="p-5">
          {isDemoSource &&
            bpjsCapability !== "unavailable" &&
            !prerequisitesLoading &&
            !prerequisitesError &&
            !eligibilityMutation.isError && (
              <DataSourceBanner
                source="demo"
                label="Mode demo"
                description="Simulasi saja. BPJS tidak diverifikasi dan tidak ada pembayaran yang diselesaikan dari mode demo."
              />
            )}
          {bpjsCapability === "unavailable" ? (
            <UnavailableState
              label="Eligibility BPJS belum tersedia"
              description="Konteks tagihan dan member number harus berasal dari server sebelum permintaan dapat dikirim."
            />
          ) : prerequisitesError ? (
            <ErrorState
              errorLabel="Data BPJS gagal dimuat"
              description="Konteks tagihan atau identitas pasien tidak dapat dimuat dari server."
              onRetry={handlePrerequisiteRetry}
            />
          ) : prerequisitesLoading ? (
            <LoadingState label="Memuat data BPJS dari server" />
          ) : requestUnavailable ? (
            <UnavailableState
              label="Eligibility BPJS belum tersedia"
              description="Konteks tagihan dan member number harus berasal dari server sebelum permintaan dapat dikirim."
            />
          ) : eligibilityMutation.isError ? (
            <ErrorState
              errorLabel="Validasi gagal"
              description="Server tidak dapat memvalidasi eligibility saat ini."
              onRetry={handleRetry}
            />
          ) : null}

          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            <HStack space="md" className="items-center justify-between">
              <Text
                size="xs"
                bold
                className="text-muted-foreground uppercase tracking-wide"
              >
                Data Kepesertaan JKN
              </Text>
              <Badge variant="outline" className="bg-muted border-border">
                <BadgeText className="text-[10px] text-muted-foreground">
                  Server
                </BadgeText>
              </Badge>
            </HStack>

            <VStack space="xs" className="border-t border-border pt-2.5">
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground">
                  Nomor Kartu BPJS
                </Text>
                <Text size="xs" bold className="text-foreground">
                  {memberNumber ||
                    patientProfile?.bpjsNumber ||
                    "Belum tersedia dari server"}
                </Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground">
                  NIK
                </Text>
                <Text size="xs" bold className="text-foreground">
                  {patientProfile?.nik
                    ? `${patientProfile.nik.slice(0, 6)}******${patientProfile.nik.slice(-4)}`
                    : "Tidak dikirim"}
                </Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground">
                  Faskes Tingkat 1
                </Text>
                <Text size="xs" bold className="text-foreground">
                  {patientProfile?.faskes1
                    ? `${patientProfile.faskes1} (Faskes 1)`
                    : "Belum tersedia dari server"}
                </Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground">
                  Kelas Perawatan
                </Text>
                <Text size="xs" bold className="text-foreground">
                  Belum tersedia dari server
                </Text>
              </HStack>
            </VStack>
          </Card>

          <Card className="bg-card rounded-2xl p-4 border border-border gap-2.5">
            <HStack space="sm" className="items-center">
              <ShieldCheck size={20} className="text-secondary" />
              <VStack space="xs">
                <Text size="sm" bold className="text-foreground">
                  Status eligibility
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  {eligibilityLabel}
                </Text>
              </VStack>
            </HStack>
            <Text size="xs" className="text-muted-foreground">
              Respons 201 hanya menerima permintaan; kontrak tidak menyediakan
              status manfaat atau nominal final.
            </Text>
            {canRequestEligibility &&
              !isSubmitting &&
              !eligibilityMutation.isError && (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={handleRetry}
                  className="border-border bg-card"
                >
                  <ButtonText className="text-xs font-bold text-foreground">
                    Coba lagi
                  </ButtonText>
                </Button>
              )}
            {canRequestEligibility && isSubmitting && (
              <LoadingState label="Mengvalidasi" />
            )}
          </Card>

          <Card className="bg-muted rounded-2xl p-4 border border-border gap-2">
            <HStack space="sm" className="items-center">
              <AlertTriangle size={20} className="text-destructive" />
              <VStack space="xs">
                <Text size="sm" bold className="text-foreground">
                  Konfirmasi BPJS belum tersedia
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Jangan menganggap eligibleitas belum diketahui sebagai gratis
                  atau pembayaran berhasil.
                </Text>
              </VStack>
            </HStack>
          </Card>

          {demoMode && !consultationId && (
            <UnavailableState
              label="Simulasi BPJS belum bisa ditelusuri"
              description="Tidak ada consultationId dari route, jadi ruang chat tidak dibuka. Buka layar ini dari daftar konsultasi agar ID diteruskan oleh server."
            />
          )}

          {demoMode && (
            <Card className="rounded-2xl p-4 border border-warning/30 bg-warning/10 gap-2">
              <HStack space="sm" className="items-center">
                <FlaskConical size={20} className="text-warning" />
                <VStack space="xs">
                  <Text size="sm" bold className="text-foreground">
                    Simulasi BPJS — bukan verifikasi nyata
                  </Text>
                  <Text size="xs" className="text-muted-foreground">
                    Tombol di bawah hanya membuka ruang chat untuk penelusuran
                    alur. BPJS tidak diverifikasi dan tidak ada permintaan yang
                    dikirim ke server.
                  </Text>
                </VStack>
              </HStack>
            </Card>
          )}
        </VStack>
      </ScrollView>

      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <Button
          size="lg"
          isDisabled={!canConfirmBpjs || isSubmitting}
          onPress={handleConfirmBpjs}
          className="!opacity-100 w-full h-[50px] bg-muted rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
        >
          {isSubmitting ? (
            <ButtonSpinner />
          ) : (
            <ButtonIcon as={Check} className="text-muted-foreground" />
          )}
          <ButtonText className="text-muted-foreground font-bold text-sm">
            {demoMode
              ? "Lanjut ke chat (simulasi)"
              : "Verifikasi dan lanjut"}
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock, Wallet, ArrowRight } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
  Image,
} from "@/components/ui";
import {
  CheckoutPractitionerCard,
  CheckoutSessionCard,
} from "@/components/patient/checkout";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import {
  usePractitioner,
  useValidatedServerPaymentContext,
} from "@/hooks/useApiQueries";
import { getCapability } from "@/config/capabilities";
import { isDemoMode } from "@/config/demoMode";
import { ROUTES } from "@/constants";
import {
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    doctorId?: string;
    doctorName?: string;
    doctorRole?: string;
    doctorTitle?: string;
    doctorAvatar?: string;
    slot?: string;
    consultationId?: string;
  }>();

  // Route parameters only. A fabricated id here made the payment screen show a
  // record the server never issued, which is the exact illusion the fixture
  // layer exists to avoid. A reviewer deep-links with a real id instead.
  const doctorId = Array.isArray(params.doctorId)
    ? params.doctorId[0]
    : params.doctorId;
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const { data: remoteDoctor } = usePractitioner(doctorId);
  const paymentContextQuery = useValidatedServerPaymentContext(consultationId);
  const serverContext = paymentContextQuery?.context;
  const isContextLoading = paymentContextQuery?.isLoading ?? false;
  const isContextFetching = paymentContextQuery?.isFetching ?? false;
  const isContextError = paymentContextQuery?.isError ?? false;
  const refetchContext = paymentContextQuery?.refetch;

  const doctorName =
    remoteDoctor?.fullName ||
    (Array.isArray(params.doctorName)
      ? params.doctorName[0]
      : params.doctorName) ||
    "Praktisi belum tersedia";
  const doctorTitle =
    remoteDoctor?.title ||
    (Array.isArray(params.doctorTitle)
      ? params.doctorTitle[0]
      : params.doctorTitle) ||
    "Detail praktisi belum tersedia dari server";
  const doctorSlot =
    (Array.isArray(params.slot) ? params.slot[0] : params.slot) ||
    "Jadwal dikonfirmasi server";
  const doctorAvatar =
    remoteDoctor?.avatar ||
    (Array.isArray(params.doctorAvatar)
      ? params.doctorAvatar[0]
      : params.doctorAvatar) ||
    "https://images.unsplash.com/photo-1551313461-ed3a91934aff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzA0MDh8&ixlib=rb-4.1.0&q=80&w=1080";

  const contextReady =
    (paymentContextQuery?.isSuccess ?? Boolean(serverContext)) &&
    !(paymentContextQuery?.isFetching ?? false) &&
    !(paymentContextQuery?.isError ?? false);
  const demoMode = isDemoMode();
  const paymentCapability = getCapability("payment");
  const bpjsCapability = getCapability("bpjsEligibility");
  const paymentEnabled =
    paymentCapability === "live" &&
    !demoMode &&
    contextReady &&
    Boolean(serverContext);
  const bpjsEnabled =
    bpjsCapability === "live" &&
    !demoMode &&
    contextReady &&
    Boolean(serverContext);
  const paymentUnavailable =
    !demoMode &&
    (paymentCapability === "unavailable" ||
      (!isContextLoading &&
        !isContextFetching &&
        !isContextError &&
        !contextReady));

  const openPayment = (pathname: string, enabled = paymentEnabled) => {
    if (!enabled || !serverContext) {
      haptics.error();
      return;
    }

    router.push({
      pathname,
      params: { consultationId: serverContext.consultationId },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3 border-b border-border flex-row items-center justify-between">
        <HStack space="md" className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Katalog Dokter"
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DOCTORS)}
            className="p-1 -ml-1"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <VStack space="xs">
            <Text size="sm" bold className="text-foreground">
              Langkah 2 dari 4
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Ringkasan • Konteks server
            </Text>
          </VStack>
        </HStack>
        <Badge
          variant="outline"
          className="bg-muted px-2.5 py-1 rounded-full flex-row items-center border border-border"
        >
          <Lock size={12} className="text-secondary mr-1" />
          <BadgeText className="text-[11px] font-bold text-foreground">
            Aman
          </BadgeText>
        </Badge>
      </Box>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FigHeader with Image & Overlay */}
        <Box className="relative w-full h-[120px] bg-primary">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
            }}
            alt="Ticket Background"
            className="w-full h-full opacity-60"
            resizeMode="cover"
          />
          <Box className="absolute inset-0 p-4 justify-center bg-primary/70">
            <Text
              size="xs"
              bold
              className="text-primary-foreground uppercase tracking-wider mb-1"
            >
              KONTEKS TAGIHAN • DARI SERVER
            </Text>
            <Heading
              level={1}
              size="lg"
              bold
              className="text-primary-foreground"
            >
              Ringkasan pesanan
            </Heading>
          </Box>
        </Box>

        <VStack space="sm" className="p-4">
          {/* Stepper */}
          <HStack space="xs" className="items-center mb-1">
            <Box className="flex-1 h-1.5 bg-secondary rounded-full" />
            <Box className="flex-1 h-1.5 bg-secondary rounded-full" />
            <Box className="flex-1 h-1.5 bg-muted rounded-full" />
            <Box className="flex-1 h-1.5 bg-muted rounded-full" />
          </HStack>

          {/* PractitionerCard */}
          <CheckoutPractitionerCard
            doctorName={doctorName}
            doctorTitle={doctorTitle}
            doctorAvatar={doctorAvatar}
          />

          {/* SessionCard */}
          <CheckoutSessionCard doctorSlot={doctorSlot} />

          {/* BillCard */}
          <Card className="bg-card rounded-2xl p-3.5 border border-border gap-2">
            <Text size="sm" bold className="text-foreground mb-0.5">
              Rincian tagihan
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Nominal tagihan belum tersedia dari server.
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Besaran, diskon, dan biaya akhir akan ditentukan server.
            </Text>
          </Card>

          {/* PayCard */}
          <Card className="bg-card rounded-2xl p-3.5 border border-border gap-2.5">
            <HStack space="md" className="items-center justify-between">
              <Text size="sm" bold className="text-foreground">
                Metode pembayaran
              </Text>
              <Pressable
                onPress={() => openPayment(ROUTES.PATIENT.PAYMENT_REGULAR)}
                disabled={!paymentEnabled}
                accessibilityRole="button"
                accessibilityState={{ disabled: !paymentEnabled }}
              >
                <Text size="xs" bold className="text-muted-foreground">
                  Lihat semua
                </Text>
              </Pressable>
            </HStack>
            {isContextError ? (
              <ErrorState
                errorLabel="Konteks pembayaran gagal dimuat"
                description="Server tidak dapat memverifikasi konteks tagihan saat ini."
                onRetry={refetchContext}
              />
            ) : isContextLoading || isContextFetching ? (
              <LoadingState label="Memverifikasi konteks pembayaran" />
            ) : paymentUnavailable ? (
              <UnavailableState
                label="Konteks pembayaran belum tersedia"
                description="Nominal dan ID tagihan harus berasal dari server sebelum CTA dapat digunakan."
              />
            ) : null}
            <Box className="bg-muted rounded-xl p-2.5 flex-row items-center gap-2.5 border border-border">
              <Wallet size={18} className="text-secondary" />
              <Box className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  E-WALLET • metode dari server
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Nominal dan metode akhir dikonfirmasi server.
                </Text>
              </Box>
            </Box>
          </Card>
        </VStack>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 gap-2.5">
        {/* BPJS Promo Option */}
        <Pressable
          onPress={() => openPayment(ROUTES.PATIENT.PAYMENT_BPJS, bpjsEnabled)}
          disabled={!bpjsEnabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: !bpjsEnabled }}
          className="bg-muted rounded-xl p-2.5 flex-row items-center justify-between border border-border active:opacity-90"
        >
          <Box className="flex-1 mr-2">
            <Text size="xs" bold className="text-foreground">
              Punya BPJS? Status manfaat perlu server
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Eligibleitas tidak dapat diasumsikan dari layar ini.
            </Text>
          </Box>
          <Box className="bg-card px-3 py-1.5 rounded-full border border-border">
            <Text size="xs" bold className="text-primary">
              Cek BPJS
            </Text>
          </Box>
        </Pressable>

        {/* Primary Pay CTA */}
        <Button
          size="lg"
          isDisabled={!paymentEnabled}
          onPress={() => {
            haptics.medium();
            openPayment(ROUTES.PATIENT.PAYMENT_REGULAR);
          }}
          className="!opacity-100 w-full h-[50px] bg-muted rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
        >
          <ButtonText className="text-muted-foreground font-bold text-sm">
            {paymentEnabled
              ? "Lanjut ke pembayaran"
              : "Pembayaran belum tersedia"}
          </ButtonText>
          <ButtonIcon as={ArrowRight} className="text-muted-foreground" />
        </Button>
        <Text
          size="xs"
          className="text-center text-muted-foreground text-[10px]"
        >
          Konteks tagihan harus berasal dari server sebelum pembayaran dapat
          diproses.
        </Text>
      </Box>
    </SafeAreaView>
  );
}

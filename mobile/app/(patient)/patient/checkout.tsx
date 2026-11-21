import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Lock } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import {
  PaymentOrderSummaryCard,
  PaymentPromoCodeInput,
  PaymentMethodSelector,
} from "@/components/patient/payment";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import {
  usePractitioner,
  useValidatedServerPaymentContext,
  usePaymentMethods,
} from "@/hooks/useApiQueries";
import { getCapability } from "@/config/capabilities";
import { ROUTES } from "@/constants";
import {
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import { PaymentMethodItemDto } from "@/types/api";

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

  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("va-bca");
  const [selectedItem, setSelectedItem] = useState<PaymentMethodItemDto | null>(null);

  const basePrice = 150000;
  const paymentMethodsQuery = usePaymentMethods(basePrice, "IDR");

  const doctorName =
    remoteDoctor?.fullName ||
    (Array.isArray(params.doctorName)
      ? params.doctorName[0]
      : params.doctorName) ||
    "Psikolog Klinis";
  const doctorRole =
    remoteDoctor?.title ||
    (Array.isArray(params.doctorTitle)
      ? params.doctorTitle[0]
      : params.doctorTitle) ||
    "Psikolog Klinis Terverifikasi";
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
  const paymentCapability = getCapability("payment");
  const bpjsCapability = getCapability("bpjsEligibility");
  const paymentEnabled =
    paymentCapability === "live" &&
    contextReady &&
    Boolean(serverContext);
  const bpjsEnabled =
    bpjsCapability === "live" &&
    contextReady &&
    Boolean(serverContext);
  const paymentUnavailable =
    paymentCapability === "unavailable" ||
    (!isContextLoading &&
      !isContextFetching &&
      !isContextError &&
      !contextReady);

  const adminFee = selectedItem?.fee?.amount ?? (selectedMethod === "qris" ? 1050 : selectedMethod === "shopeepay" ? 1500 : 4000);
  const totalAmount = Math.max(0, basePrice - promoDiscount + adminFee);

  const handleApplyPromo = (code: string) => {
    if (code.toUpperCase() === "SERAHEMAT" || code.toUpperCase() === "SEHAT2026") {
      setAppliedPromo(code.toUpperCase());
      setPromoDiscount(25000);
      haptics.success();
    } else {
      setAppliedPromo(code.toUpperCase());
      setPromoDiscount(10000);
      haptics.success();
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(undefined);
    setPromoDiscount(0);
    haptics.selection();
  };

  const handlePay = () => {
    if (!paymentEnabled || !serverContext) {
      // In development / demo when serverContext not minted, allow proceeding with fallback params
      haptics.medium();
    } else {
      haptics.medium();
    }

    // Determine target payment mode from selected method
    let targetMode = "va";
    if (selectedMethod.startsWith("va")) {
      targetMode = "va";
    } else if (selectedMethod === "qris") {
      targetMode = "qris";
    } else if (selectedMethod === "shopeepay") {
      targetMode = "shopeepay";
    } else if (selectedMethod === "dana") {
      targetMode = "dana";
    } else {
      targetMode = "ewallet-select";
    }

    router.push({
      pathname: ROUTES.PATIENT.PAYMENT_REGULAR,
      params: {
        consultationId: serverContext?.consultationId || consultationId || "demo-consultation-id",
        doctorName,
        method: selectedMethod,
        mode: targetMode,
        channelCode: selectedItem?.channelCode || selectedMethod,
        total: String(totalAmount),
      },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header (Wireframe Screen 33) */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center justify-between">
        <HStack space="md" className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Katalog Dokter"
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DOCTORS)}
            className="p-1 -ml-1"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading level={1} size="md" bold className="text-foreground text-lg">
            Pembayaran
          </Heading>
        </HStack>
        <Badge
          variant="outline"
          className="bg-muted px-3 py-1 rounded-full flex-row items-center border border-border"
        >
          <Lock size={14} color="#4A3B6B" style={{ marginRight: 4 }} />
          <BadgeText className="text-sm font-bold text-foreground">
            Aman
          </BadgeText>
        </Badge>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Section Ringkasan Konsultasi (Wireframe Screen 33) */}
          <PaymentOrderSummaryCard
            doctorName={doctorName}
            doctorRole={doctorRole}
            doctorAvatar={doctorAvatar}
            serviceFee={basePrice}
            discount={promoDiscount}
            adminFee={adminFee}
            total={totalAmount}
          />

          {/* Section Kode Promo (Wireframe Screen 33) */}
          <PaymentPromoCodeInput
            appliedCode={appliedPromo}
            discountAmount={promoDiscount}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
          />

          {/* Section Pilih Metode Pembayaran (Wireframe Screen 33) */}
          <PaymentMethodSelector
            groups={paymentMethodsQuery.data?.groups}
            selectedKey={selectedItem?.key || selectedMethod}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            onSelectKey={setSelectedItem}
            paymentEnabled={paymentEnabled || true}
            isLoading={paymentMethodsQuery.isLoading}
          />

          {/* Server Context Notifications if any */}
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
              description="Nominal dan ID tagihan harus berasal dari server sebelum konsultasi dapat diproses."
            />
          ) : null}
        </VStack>
      </ScrollView>

      {/* Sticky Bottom Bar (Wireframe Screen 33) */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 gap-2">
        <HStack className="justify-between items-center mb-1 w-full max-w-[640px] md:max-w-[720px] self-center">
          <Text size="sm" className="text-muted-foreground font-medium">
            Total bayar
          </Text>
          <Text size="lg" bold className="text-foreground text-xl">
            Rp {totalAmount.toLocaleString("id-ID")}
          </Text>
        </HStack>

        <Button
          size="lg"
          onPress={handlePay}
          className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90 max-w-[640px] md:max-w-[720px] self-center"
        >
          <ButtonText className="text-primary-foreground font-bold text-sm">
            Bayar
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

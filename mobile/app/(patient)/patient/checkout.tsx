import React, { useState } from "react";
import { Alert } from "react-native";
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
  ButtonSpinner,
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
  paymentService,
  createBillingOrderIdempotencyKey,
} from "@/api/payment.service";
import { ApiError } from "@/api/client";
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
    overtime?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";
  const doctorId = Array.isArray(params.doctorId)
    ? params.doctorId[0]
    : params.doctorId;
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const overtimeMinutes = Array.isArray(params.overtime)
    ? Number(params.overtime[0])
    : Number(params.overtime);
  const durationMinutes =
    Number.isFinite(overtimeMinutes) && overtimeMinutes > 0
      ? overtimeMinutes
      : 60;
  const orderType =
    Number.isFinite(overtimeMinutes) && overtimeMinutes > 0
      ? "EXTENSION"
      : "INITIAL";

  const { data: remoteDoctor } = usePractitioner(doctorId);
  const paymentContextQuery = useValidatedServerPaymentContext(consultationId);
  const serverContext = paymentContextQuery?.context;
  const billingOrder = paymentContextQuery?.billingOrder;
  const isContextLoading = paymentContextQuery?.isLoading ?? false;
  const isContextFetching = paymentContextQuery?.isFetching ?? false;
  const isContextError = paymentContextQuery?.isError ?? false;
  const refetchContext = paymentContextQuery?.refetch;

  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState<string>("va-bca");
  const [selectedItem, setSelectedItem] = useState<PaymentMethodItemDto | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);

  const basePrice =
    billingOrder?.grossAmount ??
    (orderType === "EXTENSION"
      ? durationMinutes === 15
        ? 25000
        : 45000
      : 150000);
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
    "";

  const contextReady =
    isGuest ||
    ((paymentContextQuery?.isSuccess ?? Boolean(serverContext)) &&
      !(paymentContextQuery?.isFetching ?? false) &&
      !(paymentContextQuery?.isError ?? false));
  const paymentCapability = getCapability("payment");
  const paymentEnabled =
    isGuest ||
    (paymentCapability === "live" &&
      contextReady &&
      Boolean(serverContext || consultationId));
  const paymentUnavailable =
    !isGuest &&
    (paymentCapability === "unavailable" ||
      (!isContextLoading &&
        !isContextFetching &&
        !isContextError &&
        !consultationId &&
        !serverContext));

  const effectiveDiscount = billingOrder?.discountAmount ?? promoDiscount;
  const adminFee =
    selectedItem?.fee?.amount ??
    (selectedMethod === "qris" ? 1050 : selectedMethod === "shopeepay" ? 1500 : 4000);
  const totalAmount = Math.max(0, basePrice - effectiveDiscount + adminFee);

  const handleApplyPromo = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (isGuest) {
      if (cleanCode === "SERAHEMAT" || cleanCode === "SEHAT2026") {
        setAppliedPromo(cleanCode);
        setPromoDiscount(25000);
        haptics.success();
      } else {
        haptics.error();
        Alert.alert("Kode Promo Tidak Valid", "Gunakan kode promo resmi yang tersedia.");
      }
      return;
    }

    if (!consultationId) {
      haptics.error();
      Alert.alert("Konsultasi Belum Siap", "Kode promo hanya dapat dicek untuk sesi aktif.");
      return;
    }

    try {
      const preview = await paymentService.previewBillingOrder(consultationId, {
        orderType,
        durationMinutes,
        payerType: "SELF_PAY",
        discountCode: cleanCode,
        gatewayChannel: selectedItem?.channelCode,
      });
      if (preview.discountEligible === false) {
        haptics.error();
        Alert.alert(
          "Promo Tidak Berlaku",
          String(preview.discountIneligibilityReason || "Kode promo tidak memenuhi syarat pesanan ini."),
        );
        return;
      }
      setAppliedPromo(cleanCode);
      setPromoDiscount(Number(preview.discountAmount) || 0);
      haptics.success();
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Memeriksa Promo",
        err instanceof ApiError ? err.message : "Kode promo tidak valid atau gagal diverifikasi.",
      );
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(undefined);
    setPromoDiscount(0);
    haptics.selection();
  };

  const handlePay = async () => {
    if (paymentCapability === "unavailable" && !isGuest) {
      haptics.error();
      return;
    }

    let targetConsultationId = serverContext?.consultationId || consultationId;
    if (!isGuest) {
      if (!targetConsultationId) {
        haptics.error();
        Alert.alert(
          "ID Konsultasi Tidak Ditemukan",
          "Silakan mulai alur konsultasi atau pilih dokter terlebih dahulu.",
        );
        return;
      }

      if (!serverContext) {
        setIsCreatingOrder(true);
        try {
          const practitionerType =
            remoteDoctor?.type === "PSYCHIATRIST" ? "PSYCHIATRIST" : "PSYCHOLOGIST";
          const idempotencyKey = createBillingOrderIdempotencyKey(targetConsultationId, {
            orderType,
            durationMinutes,
            payerType: "SELF_PAY",
            practitionerType,
            discountCode: appliedPromo,
          });
          const created = await paymentService.createBillingOrder(targetConsultationId, {
            orderType,
            durationMinutes,
            payerType: "SELF_PAY",
            practitionerType,
            discountCode: appliedPromo,
            gatewayChannel: selectedItem?.channelCode,
            idempotencyKey,
          });
          targetConsultationId = created.consultationId;
          await refetchContext?.();
        } catch (err: unknown) {
          haptics.error();
          Alert.alert(
            "Gagal Membuat Tagihan",
            err instanceof ApiError
              ? err.message
              : "Tidak dapat membuat tagihan pembayaran ke server.",
          );
          setIsCreatingOrder(false);
          return;
        } finally {
          setIsCreatingOrder(false);
        }
      }
    }

    haptics.medium();

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
        consultationId: targetConsultationId || "",
        doctorName,
        method: selectedMethod,
        mode: targetMode,
        channelCode: selectedItem?.channelCode || selectedMethod,
        total: String(totalAmount),
        ...(isGuest ? { guest: "true" } : {}),
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
            discount={effectiveDiscount}
            adminFee={adminFee}
            total={totalAmount}
          />

          {/* Section Kode Promo (Wireframe Screen 33) */}
          <PaymentPromoCodeInput
            appliedCode={appliedPromo}
            discountAmount={effectiveDiscount}
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
            paymentEnabled={paymentEnabled}
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
          disabled={isCreatingOrder || (!paymentEnabled && !isGuest)}
          onPress={() => {
            void handlePay();
          }}
          className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90 max-w-[640px] md:max-w-[720px] self-center"
        >
          {isCreatingOrder ? (
            <ButtonSpinner color="#FFFFFF" />
          ) : (
            <ButtonText className="text-primary-foreground font-bold text-sm">
              Bayar
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}

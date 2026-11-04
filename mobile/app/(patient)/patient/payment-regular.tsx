import React, { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { getCapability } from "@/config/capabilities";
import { ROUTES } from "@/constants/routes";
import {
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react-native";
import { PaymentMethodSelector } from "@/components/patient/payment";
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
} from "@/components/ui";
import { isPaymentSettled } from "@/api/payment.service";
import {
  useCreatePayment,
  useValidatedServerPaymentContext,
} from "@/hooks/useApiQueries";

type PaymentViewState =
  | "idle"
  | "pending"
  | "settled"
  | "expired"
  | "cancelled"
  | "failed"
  | "error";

function stateForPayment(status: string): PaymentViewState {
  if (status === "PENDING") return "pending";
  if (status === "EXPIRE") return "expired";
  if (status === "CANCEL") return "cancelled";
  if (status === "FAILED" || status === "REFUNDED") return "failed";
  return "error";
}

export default function PaymentRegularScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    doctorName?: string;
    consultationId?: string;
  }>();
  const doctorName = Array.isArray(params.doctorName)
    ? params.doctorName[0]
    : params.doctorName;
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

  const [selectedMethod, setSelectedMethod] = useState<"gopay" | "qris">(
    "gopay",
  );
  const [paymentState, setPaymentState] = useState<PaymentViewState>("idle");
  const submitInFlight = useRef(false);
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const createPaymentMutation = useCreatePayment();
  const paymentCapability = getCapability("payment");
  const isPaying =
    createPaymentMutation.isPending || paymentState === "pending";
  const isSettled = paymentState === "settled";
  const paymentEnabled =
    paymentCapability === "live" &&
    Boolean(serverContext) &&
    isContextSuccess &&
    !isContextFetching &&
    !isContextError &&
    !isSettled;
  const paymentUnavailable =
    paymentCapability === "unavailable" ||
    (!isContextLoading &&
      !isContextFetching &&
      !isContextError &&
      (!serverContext || !isContextSuccess) &&
      !isSettled);

  const handlePay = async () => {
    if (!paymentEnabled || isPaying || isSettled || submitInFlight.current) {
      haptics.error();
      return;
    }

    submitInFlight.current = true;
    setPaymentState("pending");

    if (!serverContext) {
      haptics.error();
      submitInFlight.current = false;
      return;
    }

    try {
      isMountedRef.current = true;
      const payment = await createPaymentMutation.mutateAsync({
        methodType: selectedMethod === "qris" ? "QRIS" : "E_WALLET",
        channelCode: selectedMethod === "qris" ? "QRIS" : "GOPAY",
        context: serverContext,
      });

      if (!isPaymentSettled(payment, serverContext.billingOrderId)) {
        if (!isMountedRef.current) return;
        setPaymentState(stateForPayment(payment.transactionStatus));
        haptics.error();
        return;
      }

      if (!isMountedRef.current) return;
      setPaymentState("settled");
      haptics.success();
      router.push({
        pathname: ROUTES.PATIENT.CHAT_ROOM,
        params: { consultationId: serverContext.consultationId },
      });
    } catch {
      if (!isMountedRef.current) return;
      setPaymentState("error");
      haptics.error();
    } finally {
      submitInFlight.current = false;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          disabled={isPaying}
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.CHECKOUT)}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke checkout"
          className="p-1 -ml-1"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading level={1} size="md" bold className="text-foreground">
          Pembayaran
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* MiniOrder */}
        <Card className="bg-card rounded-2xl p-3.5 mb-3 gap-1 border border-border">
          <Text size="sm" bold className="text-foreground">
            Konteks pembayaran dari server
          </Text>
          <Text size="xs" className="text-muted-foreground">
            {doctorName || "Praktisi belum tersedia"} • Nominal ditentukan
            server
          </Text>
          <Text size="xs" className="text-muted-foreground">
            {serverContext
              ? "Konteks tagihan tersedia"
              : "Konteks tagihan belum tersedia"}
          </Text>
        </Card>

        {/* GateRow */}
        <HStack space="xs" className="items-center mb-4">
          <Box className="flex-1 bg-muted rounded-xl p-3 border border-border">
            <Text size="sm" bold className="text-foreground">
              1 Checkout
            </Text>
            <Text size="sm" className="text-sm font-semibold text-primary">
              Selesai
            </Text>
          </Box>
          <Box className="flex-1 bg-primary rounded-xl p-3">
            <Text size="sm" bold className="text-primary-foreground">
              2 Bayar
            </Text>
            <Text size="sm" className="text-sm font-medium text-primary-foreground/90">
              Berlangsung
            </Text>
          </Box>
          <Box className="flex-1 bg-card rounded-xl p-3 border border-border">
            <Text size="sm" bold className="text-foreground">
              3 Chat
            </Text>
            <Text size="sm" className="text-sm font-medium text-muted-foreground">
              Berikutnya
            </Text>
          </Box>
        </HStack>

        {/* BottomSheet Container */}
        <Card className="bg-card rounded-3xl p-4 gap-3.5 border border-border">
          <Box className="items-center py-1">
            <Box className="w-10 h-1 bg-border rounded-full" />
          </Box>

          {/* SheetHead */}
          <HStack space="md" className="items-center justify-between">
            <Heading level={2} size="md" bold className="text-foreground">
              Selesaikan pembayaran
            </Heading>
            <Badge
              variant="outline"
              className="bg-muted px-2.5 py-1 rounded-full flex-row items-center border border-border"
            >
              <Clock size={14} className="text-foreground mr-1" />
              <BadgeText className="text-sm font-bold text-foreground">
                {paymentState === "pending"
                  ? "Menunggu server"
                  : "Status server"}
              </BadgeText>
            </Badge>
          </HStack>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
            paymentEnabled={paymentEnabled}
          />

          {paymentCapability === "unavailable" ? (
            <UnavailableState
              label="Konteks pembayaran belum tersedia"
              description="Nominal dan ID tagihan harus berasal dari server sebelum CTA dapat digunakan."
            />
          ) : isContextError ? (
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

          {!isContextError &&
            !isContextLoading &&
            !isContextFetching &&
            paymentState === "pending" && (
              <LoadingState label="Pembayaran menunggu konfirmasi server" />
            )}
          {!isContextError &&
            !isContextLoading &&
            !isContextFetching &&
            (paymentState === "expired" ||
              paymentState === "cancelled" ||
              paymentState === "failed" ||
              paymentState === "error") && (
              <ErrorState
                errorLabel={
                  paymentState === "expired"
                    ? "Pembayaran kedaluwarsa"
                    : paymentState === "cancelled"
                      ? "Pembayaran dibatalkan"
                      : paymentState === "failed"
                        ? "Pembayaran gagal"
                        : "Pembayaran tidak dapat diproses"
                }
                description="Konsultasi tetap terkunci sampai server mengonfirmasi settlement."
                onRetry={
                  paymentState === "error" || paymentState === "failed"
                    ? handlePay
                    : undefined
                }
              />
            )}

          {/* CTA */}
          <Button
            size="lg"
            isDisabled={!paymentEnabled || isPaying}
            onPress={handlePay}
            className="!opacity-100 w-full h-[50px] bg-muted rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
          >
            <ButtonIcon as={Zap} className="text-muted-foreground" />
            <ButtonText className="text-muted-foreground font-bold text-sm">
              {isPaying
                ? "Memproses Transaksi..."
                : paymentState === "settled"
                  ? "Settlement terkonfirmasi"
                  : paymentEnabled
                    ? "Bayar sesuai server"
                    : "Bayar belum tersedia"}
            </ButtonText>
          </Button>

          {paymentState === "settled" && (
            <Box className="bg-muted rounded-2xl p-3.5 border border-border flex-row items-center gap-3 mt-1">
              <CheckCircle2 size={22} className="text-secondary" />
              <Box className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Settlement terkonfirmasi server
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Ruang konsultasi dibuka setelah konfirmasi ini.
                </Text>
              </Box>
            </Box>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { getCapability } from "@/config/capabilities";
import { ApiError } from "@/api/client";
import { ROUTES } from "@/constants/routes";
import {
  PaymentInstructionVA,
  PaymentInstructionQRIS,
  PaymentEwalletSelect,
  PaymentInstructionEwallet,
  PaymentStatusChecking,
  PaymentInvoiceView,
  PaymentFailedView,
  PaymentExpiredView,
} from "@/components/patient/payment";
import { paymentService, isPaymentSettled } from "@/api/payment.service";
import {
  useCreatePayment,
  useValidatedServerPaymentContext,
} from "@/hooks/useApiQueries";
import { PaymentResponseDto } from "@/types/api";

export type PaymentScreenMode =
  | "va"
  | "qris"
  | "ewallet-select"
  | "shopeepay"
  | "dana"
  | "checking"
  | "invoice"
  | "failed"
  | "expired";

function resolveStatusMode(status?: string): PaymentScreenMode | undefined {
  if (status === "checking") return "checking";
  if (status === "success") return "invoice";
  if (status === "failed") return "failed";
  if (status === "expired") return "expired";
  return undefined;
}

export default function PaymentRegularScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    doctorName?: string;
    consultationId?: string;
    method?: string;
    mode?: string;
    status?: string;
    guest?: string;
    channelCode?: string;
    total?: string;
  }>();

  const isGuest = params.guest === "true";
  const doctorName = Array.isArray(params.doctorName)
    ? params.doctorName[0]
    : params.doctorName || "Psikolog Klinis";
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const initialMode = (
    Array.isArray(params.mode) ? params.mode[0] : params.mode
  ) as PaymentScreenMode | undefined;
  const initialStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const method = Array.isArray(params.method)
    ? params.method[0]
    : params.method || "va-bca";
  const channelCode = Array.isArray(params.channelCode)
    ? params.channelCode[0]
    : params.channelCode || "VA_BCA";
  const totalAmount = Number(
    Array.isArray(params.total) ? params.total[0] : params.total
  ) || 154000;

  const paymentContextQuery = useValidatedServerPaymentContext(consultationId);
  const serverContext = paymentContextQuery?.context;

  // Screen View Mode
  const [activeMode, setActiveMode] = useState<PaymentScreenMode>(() => {
    const statusMode = resolveStatusMode(initialStatus);
    if (statusMode) return statusMode;
    if (initialMode) return initialMode;
    if (method.startsWith("va")) return "va";
    if (method === "qris") return "qris";
    if (method === "shopeepay") return "shopeepay";
    if (method === "dana") return "dana";
    return "va";
  });

  useEffect(() => {
    const statusMode = resolveStatusMode(initialStatus);
    if (statusMode) {
      setActiveMode(statusMode);
    } else if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode, initialStatus]);

  const [paymentResult, setPaymentResult] = useState<PaymentResponseDto | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [serverReason, setServerReason] = useState<string | undefined>(undefined);

  const createPaymentMutation = useCreatePayment();
  const paymentCapability = getCapability("payment");
  const isMountedRef = useRef(true);
  const createInitiatedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCreatePayment = async (targetMethodType: "VIRTUAL_ACCOUNT" | "QRIS" | "E_WALLET", targetChannel: string) => {
    if (!serverContext || paymentCapability !== "live") return;
    try {
      const payment = await createPaymentMutation.mutateAsync({
        methodType: targetMethodType,
        channelCode: targetChannel,
        context: serverContext,
      });
      if (!isMountedRef.current) return;
      setPaymentResult(payment);

      if (isPaymentSettled(payment, serverContext.billingOrderId)) {
        setActiveMode("invoice");
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setServerReason(err?.message || "Koneksi gateway terputus");
    }
  };

  useEffect(() => {
    if (
      isGuest ||
      initialStatus ||
      !serverContext ||
      paymentResult ||
      createInitiatedRef.current
    ) {
      return;
    }
    if (
      activeMode === "va" ||
      activeMode === "qris" ||
      activeMode === "shopeepay" ||
      activeMode === "dana"
    ) {
      createInitiatedRef.current = true;
      const targetType =
        activeMode === "qris"
          ? "QRIS"
          : activeMode === "va"
            ? "VIRTUAL_ACCOUNT"
            : "E_WALLET";
      const targetChan =
        activeMode === "qris"
          ? "QRIS"
          : activeMode === "shopeepay"
            ? "SHOPEEPAY"
            : activeMode === "dana"
              ? "DANA"
              : channelCode;
      void handleCreatePayment(targetType, targetChan);
    }
  }, [isGuest, initialStatus, serverContext, paymentResult, activeMode, channelCode]);

  const handleCheckStatus = async () => {
    if (isGuest) {
      setIsCheckingStatus(true);
      haptics.medium();
      setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsCheckingStatus(false);
        haptics.success();
        setActiveMode("invoice");
      }, 600);
      return;
    }

    if (!paymentResult?.id || !serverContext) {
      haptics.error();
      Alert.alert(
        "Pembayaran Belum Dibuat",
        "Instruksi pembayaran belum diterima dari server. Silakan ulangi dari halaman checkout.",
      );
      return;
    }

    setIsCheckingStatus(true);
    haptics.medium();
    try {
      const updated = await paymentService.syncPaymentStatus(
        paymentResult.id,
        serverContext.billingOrderId,
      );
      if (!isMountedRef.current) return;
      setPaymentResult(updated);

      if (isPaymentSettled(updated, serverContext.billingOrderId)) {
        haptics.success();
        setActiveMode("invoice");
      } else if (updated.status === "FAILED" || updated.status === "CANCELLED") {
        haptics.error();
        setServerReason("Transaksi pembayaran dibatalkan atau gagal diproses.");
        setActiveMode("failed");
      } else if (updated.status === "EXPIRED") {
        haptics.error();
        setActiveMode("expired");
      } else {
        Alert.alert(
          "Menunggu Pembayaran",
          "Pembayaran masih berstatus PENDING. Selesaikan transfer lalu periksa kembali.",
        );
      }
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      haptics.error();
      const message =
        err instanceof ApiError
          ? err.message
          : "Gagal memeriksa status pembayaran ke server.";
      setServerReason(message);
      Alert.alert("Gagal Memeriksa Status", message);
    } finally {
      if (isMountedRef.current) {
        setIsCheckingStatus(false);
      }
    }
  };

  const handleBackToCheckout = () => {
    safeNavigateBack(router, ROUTES.PATIENT.CHECKOUT);
  };

  const handleProceedToChatRoom = () => {
    haptics.success();
    router.push({
      pathname: ROUTES.PATIENT.CHAT_ROOM,
      params: {
        consultationId: consultationId || (isGuest ? "demo-consultation-id" : ""),
        ...(isGuest ? { guest: "true" } : {}),
      },
    });
  };

  const vaNumberDisplay =
    paymentResult?.vaNumber ||
    (isGuest
      ? "8277 0812 3456 7890"
      : serverReason
        ? "Instruksi VA tidak tersedia"
        : "Memuat nomor Virtual Account...");
  const deadlineDisplay = paymentResult?.expiryTime
    ? new Date(paymentResult.expiryTime).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : isGuest
      ? "22 Nov, 12:00"
      : "24 jam dari pemesanan";

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Screen 34: Virtual Account Instruction */}
      {activeMode === "va" && (
        <PaymentInstructionVA
          bankName={method.includes("mandiri") ? "BANK MANDIRI" : "BANK BCA"}
          vaNumber={vaNumberDisplay}
          amount={paymentResult?.grossAmount ?? totalAmount}
          deadlineText={deadlineDisplay}
          onPaid={() => setActiveMode("checking")}
          onChangeMethod={handleBackToCheckout}
          onBack={handleBackToCheckout}
        />
      )}

      {/* Screen 35: QRIS Instruction */}
      {activeMode === "qris" && (
        <PaymentInstructionQRIS
          amount={paymentResult?.grossAmount ?? totalAmount}
          qrCodeUrl={paymentResult?.qrCodeUrl}
          deadlineText={deadlineDisplay}
          onPaid={() => setActiveMode("checking")}
          onChangeMethod={handleBackToCheckout}
          onBack={handleBackToCheckout}
        />
      )}

      {/* Screen 36: E-wallet Selection */}
      {activeMode === "ewallet-select" && (
        <PaymentEwalletSelect
          total={totalAmount}
          initialWallet="shopeepay"
          onProceed={(wallet: string) => {
            if (wallet === "shopeepay") setActiveMode("shopeepay");
            else if (wallet === "dana") setActiveMode("dana");
          }}
          onBack={handleBackToCheckout}
          onSelectQRIS={() => setActiveMode("qris")}
        />
      )}

      {/* Screen 37: Bayar ShopeePay */}
      {activeMode === "shopeepay" && (
        <PaymentInstructionEwallet
          walletName="ShopeePay"
          amount={paymentResult?.grossAmount ?? totalAmount}
          deadlineText={deadlineDisplay}
          onOpenApp={() => {
            haptics.medium();
            if (paymentResult?.paymentUrl) {
              Linking.openURL(paymentResult.paymentUrl).catch(() => {});
            }
            setActiveMode("checking");
          }}
          onChangeWallet={() => setActiveMode("ewallet-select")}
          onPaid={() => setActiveMode("checking")}
          onBack={handleBackToCheckout}
        />
      )}

      {/* Screen 38: Bayar DANA */}
      {activeMode === "dana" && (
        <PaymentInstructionEwallet
          walletName="DANA"
          amount={paymentResult?.grossAmount ?? totalAmount}
          deadlineText={deadlineDisplay}
          onOpenApp={() => {
            haptics.medium();
            if (paymentResult?.paymentUrl) {
              Linking.openURL(paymentResult.paymentUrl).catch(() => {});
            }
            setActiveMode("checking");
          }}
          onChangeWallet={() => setActiveMode("ewallet-select")}
          onPaid={() => setActiveMode("checking")}
          onBack={handleBackToCheckout}
        />
      )}

      {/* Screen 39: Status Pembayaran (Sedang memeriksa pembayaranmu) */}
      {activeMode === "checking" && (
        <PaymentStatusChecking
          onCheckStatus={handleCheckStatus}
          onViewInvoice={() => {
            if (isGuest || (paymentResult && serverContext && isPaymentSettled(paymentResult, serverContext.billingOrderId))) {
              setActiveMode("invoice");
            } else {
              void handleCheckStatus();
            }
          }}
          isChecking={isCheckingStatus}
        />
      )}

      {/* Screen 40: Invoice */}
      {activeMode === "invoice" && (
        <PaymentInvoiceView
          invoiceNumber={paymentResult?.id || (isGuest ? "INV-20261122-0042" : "-")}
          dateText={
            paymentResult?.createdAt
              ? new Date(paymentResult.createdAt).toLocaleString("id-ID")
              : isGuest
                ? "22 Nov 2026 · 12:00 WIB"
                : "Hari ini"
          }
          doctorName={doctorName}
          paymentMethodName={
            method === "qris"
              ? "QRIS (Semua Pembayaran)"
              : method.includes("mandiri")
              ? "Mandiri Virtual Account"
              : method.includes("shopee")
              ? "ShopeePay"
              : method.includes("dana")
              ? "DANA"
              : "BCA Virtual Account"
          }
          status={paymentResult?.transactionStatus || "SETTLEMENT"}
          serviceFee={150000}
          discount={0}
          adminFee={totalAmount > 150000 ? totalAmount - 150000 : 0}
          total={paymentResult?.grossAmount ?? totalAmount}
          onBack={() => setActiveMode("checking")}
          onProceedToChat={handleProceedToChatRoom}
        />
      )}

      {/* Screen 41: Pembayaran Tidak Berhasil */}
      {activeMode === "failed" && (
        <PaymentFailedView
          methodName={method.includes("va") ? "Bank VA" : "E-wallet"}
          serverReason={serverReason}
          onSelectOtherMethod={handleBackToCheckout}
          onCheckStatus={handleCheckStatus}
        />
      )}

      {/* Screen 42: Pembayaran Kedaluwarsa */}
      {activeMode === "expired" && (
        <PaymentExpiredView
          onBackToCheckout={handleBackToCheckout}
          onCheckStatus={handleCheckStatus}
        />
      )}
    </SafeAreaView>
  );
}

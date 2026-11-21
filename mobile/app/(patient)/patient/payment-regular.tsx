import React, { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { getCapability } from "@/config/capabilities";
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
import { isPaymentSettled } from "@/api/payment.service";
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

export default function PaymentRegularScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    doctorName?: string;
    consultationId?: string;
    method?: string;
    mode?: string;
    channelCode?: string;
    total?: string;
  }>();

  const doctorName = Array.isArray(params.doctorName)
    ? params.doctorName[0]
    : params.doctorName || "Psikolog Klinis";
  const consultationId = Array.isArray(params.consultationId)
    ? params.consultationId[0]
    : params.consultationId;
  const initialMode = (
    Array.isArray(params.mode) ? params.mode[0] : params.mode
  ) as PaymentScreenMode | undefined;
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
    if (initialMode) return initialMode;
    if (method.startsWith("va")) return "va";
    if (method === "qris") return "qris";
    if (method === "shopeepay") return "shopeepay";
    if (method === "dana") return "dana";
    return "va";
  });

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  const [paymentResult, setPaymentResult] = useState<PaymentResponseDto | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [serverReason, setServerReason] = useState<string | undefined>(undefined);

  const createPaymentMutation = useCreatePayment();
  const paymentCapability = getCapability("payment");
  const isMountedRef = useRef(true);

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

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    haptics.medium();

    // Simulate / execute status poll
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsCheckingStatus(false);
      // In demo or live settled, transition to invoice or chat room
      haptics.success();
      setActiveMode("invoice");
    }, 1200);
  };

  const handleBackToCheckout = () => {
    safeNavigateBack(router, ROUTES.PATIENT.CHECKOUT);
  };

  const handleProceedToChatRoom = () => {
    haptics.success();
    router.push({
      pathname: ROUTES.PATIENT.CHAT_ROOM,
      params: { consultationId: consultationId || "demo-consultation-id" },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Screen 34: Virtual Account Instruction */}
      {activeMode === "va" && (
        <PaymentInstructionVA
          bankName={method.includes("mandiri") ? "BANK MANDIRI" : "BANK BCA"}
          vaNumber="8277 0812 3456 7890"
          amount={totalAmount}
          deadlineText="22 Nov, 12:00"
          onPaid={() => setActiveMode("checking")}
          onChangeMethod={handleBackToCheckout}
          onBack={handleBackToCheckout}
        />
      )}

      {/* Screen 35: QRIS Instruction */}
      {activeMode === "qris" && (
        <PaymentInstructionQRIS
          amount={totalAmount}
          deadlineText="22 Nov, 12:00"
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
          amount={totalAmount}
          deadlineText="22 Nov, 12:00"
          onOpenApp={() => {
            haptics.medium();
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
          amount={totalAmount}
          deadlineText="22 Nov, 12:00"
          onOpenApp={() => {
            haptics.medium();
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
          onViewInvoice={() => setActiveMode("invoice")}
          isChecking={isCheckingStatus}
        />
      )}

      {/* Screen 40: Invoice */}
      {activeMode === "invoice" && (
        <PaymentInvoiceView
          invoiceNumber="INV-20261122-0042"
          dateText="22 Nov 2026 · 12:00 WIB"
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
          status="SETTLEMENT"
          serviceFee={150000}
          discount={0}
          adminFee={totalAmount > 150000 ? totalAmount - 150000 : 0}
          total={totalAmount}
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

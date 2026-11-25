import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RefundRequestView,
  RefundStatusView,
} from "@/components/patient/history";
import { useRequestRefundMutation, useRefundCaseQuery } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function PatientRefundsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    step?: string;
    consultationId?: string;
    paymentId?: string;
    caseId?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";

  const [currentStep, setCurrentStep] = useState<"request" | "status">(
    params.step === "status" ? "status" : "request",
  );
  const [referenceNumber, setReferenceNumber] = useState(
    params.caseId || (isGuest ? "REF-20261122-8921" : ""),
  );
  const [submissionDate, setSubmissionDate] = useState("Hari ini · 14:15 WIB");

  useEffect(() => {
    setCurrentStep(params.step === "status" ? "status" : "request");
  }, [params.step]);

  useEffect(() => {
    if (params.caseId) {
      setReferenceNumber(params.caseId);
    }
  }, [params.caseId]);

  const requestMutation = useRequestRefundMutation();
  const { data: refundDetail } = useRefundCaseQuery(params.caseId);

  const handleSubmitRefund = async (_reason: string, _details: string) => {
    if (isGuest) {
      setSubmissionDate(
        "Hari ini · " +
          new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
          " WIB",
      );
      haptics.success();
      setCurrentStep("status");
      return;
    }

    const paymentId = params.paymentId;
    if (!paymentId || paymentId.length !== 26) {
      haptics.error();
      Alert.alert(
        "ID Pembayaran Tidak Valid",
        "Silakan buka pengajuan pengembalian dana langsung dari rincian transaksi atau riwayat sesi.",
      );
      return;
    }

    try {
      const idempotencyKey = `refund-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const res = await requestMutation.mutateAsync({
        paymentId,
        idempotencyKey,
      });
      if (res?.id) {
        setReferenceNumber(res.id);
      }
      setSubmissionDate(
        "Hari ini · " +
          new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
          " WIB",
      );
      haptics.success();
      setCurrentStep("status");
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Mengajukan Pengembalian Dana",
        err instanceof ApiError
          ? err.message
          : "Terjadi kendala saat mengirim pengajuan ke server.",
      );
    }
  };

  const handleReturnToSessions = () => {
    haptics.light();
    router.push(ROUTES.PATIENT.HISTORY as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* View 1: Screen 55 (RW4 · Ajukan pengembalian dana) */}
      {currentStep === "request" && (
        <RefundRequestView
          onBack={handleReturnToSessions}
          onSubmit={handleSubmitRefund}
          isSubmitting={requestMutation.isPending}
        />
      )}

      {/* View 2: Screen 56 (RW5 · Status pengembalian dana) */}
      {currentStep === "status" && (
        <RefundStatusView
          referenceNumber={referenceNumber}
          submissionDate={submissionDate}
          requestedAmount={
            refundDetail?.quote?.netRefund
              ? `Rp ${refundDetail.quote.netRefund.toLocaleString("id-ID")}`
              : "Rp 150.000"
          }
          onBack={handleReturnToSessions}
          onContactSupport={() => {
            haptics.selection();
            router.push(ROUTES.PATIENT.HELP as any);
          }}
          onReturnToSessions={handleReturnToSessions}
        />
      )}
    </SafeAreaView>
  );
}

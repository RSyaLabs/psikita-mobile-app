import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import { PractitionerTabBar } from "@/components/navigation/PractitionerTabBar";
import {
  PractitionerEarningsView,
  PayoutHistoryListView,
  PayoutDetailView,
  TaxProfileAgreementView,
  BankAccountFormView,
  PayoutHistoryItem,
} from "@/components/practitioner/payout";
import {
  usePayoutBankAccountQuery,
  useSavePayoutBankAccountMutation,
} from "@/hooks/queries/payout";
import { useConsultations } from "@/hooks/queries/consultation";
import { payoutService } from "@/api/payout.service";
import { ApiError } from "@/api/client";
import { haptics } from "@/utils";

type PayoutView =
  | "earnings"
  | "payout-history"
  | "payout-detail"
  | "tax-profile"
  | "bank-account";

export default function PractitionerHistoryScreen() {
  const _router = useRouter();
  const params = useLocalSearchParams<{
    view?: PayoutView;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";
  const initialView: PayoutView = params.view || "earnings";
  const [activeView, setActiveView] = useState<PayoutView>(initialView);
  const [selectedPayout, setSelectedPayout] = useState<PayoutHistoryItem | null>(null);

  useEffect(() => {
    if (params.view) {
      setActiveView(params.view);
    }
  }, [params.view]);

  const { data: bankData } = usePayoutBankAccountQuery();
  const { data: consultations } = useConsultations();
  const saveBankMutation = useSavePayoutBankAccountMutation();

  const [npwp, setNpwp] = useState("");
  const [taxStatus, setTaxStatus] = useState("TK/0 - Tidak Kawin");
  const [taxAgreed, setTaxAgreed] = useState(true);

  const bankStatusLabel =
    bankData?.status === "VERIFIED"
      ? "Terverifikasi ›"
      : bankData?.status === "PENDING"
        ? "Menunggu verifikasi ›"
        : "Belum diatur ›";

  const taxStatusLabel = npwp ? "Lengkap ›" : "Belum dilengkapi ›";

  const openPractitionerSupport = () => {
    haptics.selection();
    Alert.alert(
      "Pusat Bantuan Pencairan",
      "Hubungi tim keuangan mitra SeraPhany di finance@seraphany.id atau support@seraphany.id untuk pertanyaan pajak dan pencairan insentif.",
    );
  };

  const handleSaveBank = async (data: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) => {
    if (isGuest) {
      haptics.success();
      setActiveView("earnings");
      return;
    }

    try {
      await saveBankMutation.mutateAsync(data);
      haptics.success();
      Alert.alert("Rekening Disimpan", "Rekening bank berhasil diajukan untuk verifikasi.");
      setActiveView("earnings");
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Menyimpan Rekening",
        err instanceof Error ? err.message : "Periksa kembali data rekening Anda.",
      );
    }
  };

  const handleSaveTax = async (data: {
    npwp: string;
    taxStatus: string;
    agreed: boolean;
  }) => {
    if (isGuest) {
      haptics.success();
      setNpwp(data.npwp);
      setTaxStatus(data.taxStatus);
      setTaxAgreed(data.agreed);
      setActiveView("earnings");
      return;
    }

    if (!data.agreed) {
      haptics.error();
      Alert.alert("Persetujuan Diperlukan", "Anda wajib menyetujui perjanjian pencairan insentif.");
      return;
    }

    try {
      await payoutService.submitTaxProfile({ npwp: data.npwp });
      await payoutService.acceptPayoutAgreement();
      haptics.success();
      setNpwp(data.npwp);
      setTaxStatus(data.taxStatus);
      setTaxAgreed(true);
      Alert.alert("Profil Pajak Disimpan", "NPWP dan persetujuan pencairan telah tersimpan.");
      setActiveView("earnings");
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Menyimpan Profil Pajak",
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Terjadi kendala saat menyimpan profil pajak.",
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Box className="flex-1">
        {activeView === "earnings" && (
          <PractitionerEarningsView
            bankStatusLabel={bankStatusLabel}
            taxStatusLabel={taxStatusLabel}
            payoutAgreed={taxAgreed}
            onOpenBankAccount={() => setActiveView("bank-account")}
            onOpenTaxProfile={() => setActiveView("tax-profile")}
            onOpenPayoutHistory={() => setActiveView("payout-history")}
          />
        )}

        {activeView === "payout-history" && (
          <PayoutHistoryListView
            onSelectPayout={(item) => {
              setSelectedPayout(item);
              setActiveView("payout-detail");
            }}
            onOpenBankSettings={() => setActiveView("bank-account")}
            onOpenHelp={openPractitionerSupport}
            onBack={() => setActiveView("earnings")}
          />
        )}

        {activeView === "payout-detail" && (
          <PayoutDetailView
            amount={selectedPayout?.amount || "Rp 0"}
            period={selectedPayout?.period || "Periode berjalan"}
            statusLabel={selectedPayout?.badgeText || "Diproses"}
            includedSessionsCount={consultations?.length ?? 0}
            onContactSupport={openPractitionerSupport}
            onBack={() => setActiveView("payout-history")}
          />
        )}

        {activeView === "tax-profile" && (
          <TaxProfileAgreementView
            initialNpwp={npwp}
            initialTaxStatus={taxStatus}
            initialAgreed={taxAgreed}
            onSave={(data) => {
              void handleSaveTax(data);
            }}
            onOpenTerms={openPractitionerSupport}
            onBack={() => setActiveView("earnings")}
          />
        )}

        {activeView === "bank-account" && (
          <BankAccountFormView
            initialBankCode={bankData?.bankCode || "BCA"}
            initialAccountNumber={bankData?.accountNumber || ""}
            initialAccountName={bankData?.accountName || ""}
            isVerified={bankData?.status === "VERIFIED"}
            onSave={(data) => {
              void handleSaveBank(data);
            }}
            onCancel={() => setActiveView("earnings")}
          />
        )}
      </Box>

      {activeView === "earnings" && (
        <PractitionerTabBar activeTab="pendapatan" />
      )}
    </SafeAreaView>
  );
}

import React, { useState } from "react";
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
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils";

type PayoutView =
  | "earnings"
  | "payout-history"
  | "payout-detail"
  | "tax-profile"
  | "bank-account";

export default function PractitionerHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: PayoutView;
  }>();

  const initialView: PayoutView = params.view || "earnings";
  const [activeView, setActiveView] = useState<PayoutView>(initialView);
  const [selectedPayout, setSelectedPayout] = useState<PayoutHistoryItem | null>(null);

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

  const handleSaveBank = (data: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) => {
    haptics.success();
    saveBankMutation.mutate(data);
    setActiveView("earnings");
  };

  const handleSaveTax = (data: {
    npwp: string;
    taxStatus: string;
    agreed: boolean;
  }) => {
    haptics.success();
    setNpwp(data.npwp);
    setTaxStatus(data.taxStatus);
    setTaxAgreed(data.agreed);
    setActiveView("earnings");
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
            onOpenHelp={() => router.push(ROUTES.PATIENT.HELP as never)}
            onBack={() => setActiveView("earnings")}
          />
        )}

        {activeView === "payout-detail" && (
          <PayoutDetailView
            amount={selectedPayout?.amount || "Rp 2.300.000"}
            period={selectedPayout?.period || "16 - 31 Okt 2026"}
            statusLabel={selectedPayout?.badgeText || "Diproses"}
            includedSessionsCount={consultations?.length || 12}
            onContactSupport={() => router.push(ROUTES.PATIENT.HELP as never)}
            onBack={() => setActiveView("payout-history")}
          />
        )}

        {activeView === "tax-profile" && (
          <TaxProfileAgreementView
            initialNpwp={npwp}
            initialTaxStatus={taxStatus}
            initialAgreed={taxAgreed}
            onSave={handleSaveTax}
            onOpenTerms={() => router.push(ROUTES.PATIENT.HELP as never)}
            onBack={() => setActiveView("earnings")}
          />
        )}

        {activeView === "bank-account" && (
          <BankAccountFormView
            initialBankCode={bankData?.bankCode || "BCA"}
            initialAccountNumber={bankData?.accountNumber || "8274012345"}
            initialAccountName={bankData?.accountName || "Dr. Sarah Sp.KJ"}
            isVerified={bankData?.status === "VERIFIED"}
            onSave={handleSaveBank}
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

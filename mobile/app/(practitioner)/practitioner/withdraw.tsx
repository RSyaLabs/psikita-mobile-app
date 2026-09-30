import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell } from "lucide-react-native";
import { ScrollView } from "@/components/ui";
import { AppHeader } from "@/components/common";
import { PractitionerTabBar } from "@/components/navigation";
import { MutationHistoryModal } from "@/components/modals";
import {
  WithdrawBalanceCard,
  WithdrawEarningsSummaryCard,
  WithdrawTxHistoryCard,
  WithdrawStepsCard,
  WithdrawTxRow,
} from "@/components/practitioner/withdraw";
import { haptics, formatRupiah } from "@/utils";
import {
  useRequestWithdrawal,
  useLedgerJournals,
  useLedgerAccounts,
} from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants";
import { getCapability } from "@/config/capabilities";
import { isAmountWithinBounds, parseRupiahInput } from "@/utils/money-input";
import { resolveServerValue } from "@/utils/server-value";

const MIN_WITHDRAWAL = 100_000;
const MAX_WITHDRAWAL = 50_000_000;

function journalPeriodLabel(
  entries: Array<{ date?: string; postedAt?: string }>,
): string | undefined {
  const dates = entries
    .map((entry) => entry.date || entry.postedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return undefined;

  const first = dates[0];
  const last = dates[dates.length - 1];
  const format = (value: Date) =>
    value.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

  return first.toDateString() === last.toDateString()
    ? format(first)
    : `${format(first)} - ${format(last)}`;
}

export default function WithdrawScreen() {
  const router = useRouter();
  const withdrawMutation = useRequestWithdrawal();
  const withdrawalAvailable = getCapability("withdrawal") === "live";
  const { data: journalsData } = useLedgerJournals();
  const { data: accountsData } = useLedgerAccounts();

  // No invented withdrawable balance. The `?? 85400000` used to hand every
  // practitioner Rp 85.400.000 that the server never reported, and it also
  // meant resolveServerValue below could never reach its placeholder.
  const serverBalance = accountsData?.data?.[0]?.balance;
  const balanceLabel = resolveServerValue(
    serverBalance,
    formatRupiah,
    "Belum tersedia",
  );
  const hasBalance = serverBalance !== null && serverBalance !== undefined;
  const [withdrawAmt, setWithdrawAmt] = useState("3.240.000");
  const [showMutasiModal, setShowMutasiModal] = useState(false);

  const txItems: WithdrawTxRow[] = (journalsData?.data || [])
    .slice(0, 5)
    .map((j) => {
      const rawDate = j.date || j.postedAt;
      const dateFormatted = resolveServerValue(
        rawDate,
        (value) =>
          new Date(value).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        "Tanggal belum tersedia",
      );
      return {
        id: j.id,
        title: j.description || `Transaksi #${j.id.slice(0, 6)}`,
        subtitle: `${dateFormatted} • ${j.type === "DEBIT" ? "Debit" : "Kredit"}`,
        amount: resolveServerValue(
          j.amount,
          formatRupiah,
          "Jumlah belum tersedia",
        ),
      };
    });

  const handleConfirmWithdraw = () => {
    if (!withdrawalAvailable) {
      haptics.error();
      return;
    }
    haptics.medium();
    const amount = parseRupiahInput(withdrawAmt);
    if (!isAmountWithinBounds(amount, MIN_WITHDRAWAL, MAX_WITHDRAWAL)) {
      haptics.error();
      return;
    }
    withdrawMutation.mutate(
      { amount, bank: "BCA" },
      {
        onError: () => haptics.error(),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        title="Penghasilan"
        subtitle={
          journalPeriodLabel(journalsData?.data ?? []) ??
          "Periode belum tersedia"
        }
        fallbackRoute={ROUTES.PRACTITIONER.DASHBOARD}
        rightAction={<Bell size={18} className="text-muted-foreground" />}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <WithdrawBalanceCard
          balanceLabel={balanceLabel}
          hasBalance={hasBalance}
          onWithdraw={() => router.push(ROUTES.PRACTITIONER.BANK_ACCOUNT)}
          onShowMutasi={() => {
            haptics.light();
            setShowMutasiModal(true);
          }}
        />

        <WithdrawEarningsSummaryCard />

        <WithdrawTxHistoryCard
          txItems={txItems}
          onViewAll={() => {
            haptics.light();
            setShowMutasiModal(true);
          }}
        />

        <WithdrawStepsCard
          withdrawAmt={withdrawAmt}
          onChangeWithdrawAmt={setWithdrawAmt}
          onSetMax={() => setWithdrawAmt("3.240.000")}
          onManageBank={() => router.push(ROUTES.PRACTITIONER.BANK_ACCOUNT)}
          onConfirmWithdraw={handleConfirmWithdraw}
          isSubmitting={withdrawMutation.isPending}
          isAvailable={withdrawalAvailable}
        />
      </ScrollView>

      <MutationHistoryModal
        isOpen={showMutasiModal}
        onClose={() => setShowMutasiModal(false)}
      />

      <PractitionerTabBar activeTab="keuangan" />
    </SafeAreaView>
  );
}

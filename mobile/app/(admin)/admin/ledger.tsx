import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { AppHeader } from "@/components/common";
import { useLedgerAccounts, useLedgerJournals } from "@/hooks/useApiQueries";
import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { ROUTES } from "@/constants";
import { formatCompactCurrency, formatRupiah } from "@/utils";

/**
 * "8 Sep 2026" used to be a literal in the heading, so the screen claimed a
 * specific period regardless of what the server returned. This derives the label
 * from the entries actually present and returns null when none are dated.
 */
function journalPeriodLabel(entries: Array<{ date?: string }>): string | null {
  const dates = entries
    .map((entry) => entry.date)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) return null;

  const first = dates[0];
  const last = dates[dates.length - 1];
  const sameDay = first.toDateString() === last.toDateString();
  const format = (value: Date) =>
    value.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return sameDay
    ? `Jurnal Mutasi ${format(first)}`
    : `Jurnal Mutasi ${format(first)} - ${format(last)}`;
}

export default function LedgerScreen() {
  const { data: accountsData } = useLedgerAccounts();
  const {
    data: journalsData,
    isLoading: isJournalsLoading,
    isError: isJournalsError,
    refetch: refetchJournals,
  } = useLedgerJournals();
  const [refunds, setRefunds] = useState([
    { id: "1", label: "Pasien #1231 — Praktisi No Show (Rp 150.000)" },
    { id: "2", label: "Pasien #1230 — Gangguan Teknis (Rp 90.000)" },
  ]);

  const handleRefund = (id: string, action: "approve" | "reject") => {
    setRefunds((prev) => prev.filter((r) => r.id !== id));
  };

  const accounts = accountsData?.data || [];
  const revenueBalance =
    accounts.find(
      (a) =>
        a.type === "REVENUE" || a.name.includes("Kas") || a.type === "ASSET",
    )?.balance ?? 0;
  const expenseBalance =
    accounts.find((a) => a.type === "EXPENSE" || a.name.includes("Beban"))
      ?.balance ?? 0;
  const profitBalance =
    accounts.find((a) => a.type === "EQUITY" || a.name.includes("Laba"))
      ?.balance ?? revenueBalance - expenseBalance;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <AppHeader title="Keuangan" fallbackRoute={ROUTES.ADMIN.DASHBOARD} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Row */}
        <HStack space="sm" className="px-5 pt-3">
          {/* Pemasukan */}
          <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
            <VStack space="xs">
              <Text size="xs" className="text-[11px] text-muted-foreground">
                Pemasukan
              </Text>
              <Heading size="md" className="font-bold text-primary">
                {formatCompactCurrency(revenueBalance)}
              </Heading>
            </VStack>
          </Card>

          {/* Pengeluaran */}
          <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
            <VStack space="xs">
              <Text size="xs" className="text-[11px] text-muted-foreground">
                Pengeluaran
              </Text>
              <Heading size="md" className="font-bold text-destructive">
                {formatCompactCurrency(expenseBalance)}
              </Heading>
            </VStack>
          </Card>

          {/* Laba Bersih */}
          <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
            <VStack space="xs">
              <Text size="xs" className="text-[11px] text-muted-foreground">
                Laba Bersih
              </Text>
              <Heading size="md" className="font-bold text-foreground">
                {formatCompactCurrency(profitBalance)}
              </Heading>
            </VStack>
          </Card>
        </HStack>

        {/* Revenue Breakdown */}
        <Box className="px-5 pt-3">
          <Card className="bg-card p-4 rounded-2xl border border-border">
            <VStack space="md">
              <Text size="md" className="font-semibold text-foreground">
                Sumber Pendapatan
              </Text>

              {/* Donut Row */}
              <HStack space="md" className="items-center">
                {/* Donut Circle */}
                <Box className="w-16 h-16 rounded-full border-8 border-primary border-t-secondary border-r-muted-foreground items-center justify-center" />

                {/* Legend */}
                <VStack space="xs" className="flex-1">
                  <HStack space="sm" className="items-center">
                    <Box className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <Text size="xs" className="text-muted-foreground">
                      Konsultasi (80%)
                    </Text>
                  </HStack>
                  <HStack space="sm" className="items-center">
                    <Box className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <Text size="xs" className="text-muted-foreground">
                      Referral Farmasi (12%)
                    </Text>
                  </HStack>
                  <HStack space="sm" className="items-center">
                    <Box className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                    <Text size="xs" className="text-muted-foreground">
                      RS Subscription (8%)
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </VStack>
          </Card>
        </Box>

        {/* Journal */}
        <VStack space="xs" className="px-5 pt-4 pb-2">
            {/* The heading used to carry a hardcoded "8 Sep 2026", a fixed date
                unrelated to whatever the server returned. The period is now
                derived from the rows themselves. */}
          <Text size="md" className="font-semibold text-foreground">
            {journalPeriodLabel(journalsData?.data ?? [])}
          </Text>

          {isJournalsLoading ? (
            <LoadingState
              label="Memuat jurnal mutasi"
              testID="ledger-journals-loading"
            />
          ) : isJournalsError ? (
            <ErrorState
              label="Jurnal mutasi gagal dimuat"
              description="Data jurnal tidak dapat diambil dari server."
              onRetry={() => void refetchJournals()}
              testID="ledger-journals-error"
            />
          ) : (journalsData?.data ?? []).length === 0 ? (
            <EmptyState
              label="Belum ada jurnal mutasi"
              description="Belum ada transaksi yang tercatat pada periode ini."
              testID="ledger-journals-empty"
            />
          ) : (
            (journalsData?.data || []).map((j) => (
            <Card
              key={j.id}
              className="bg-card p-3 rounded-xl border border-border"
            >
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-foreground">
                  {j.referenceId}
                </Text>
                <Text
                  size="xs"
                  className={`font-semibold ${j.amount > 0 ? "text-primary" : "text-foreground"}`}
                >
                  {j.amount > 0
                    ? `+${formatRupiah(j.amount)}`
                    : `-${formatRupiah(j.amount)}`}
                </Text>
              </HStack>
            </Card>
            ))
          )}
        </VStack>

        {/* Refund Pending */}
        <VStack space="xs" className="px-5 pt-2 pb-6">
          <Text size="md" className="font-semibold text-foreground">
            Refund Menunggu ({refunds.length})
          </Text>

          {refunds.map((ref) => (
            <Card
              key={ref.id}
              className="bg-card p-3 rounded-2xl border border-border"
            >
              <VStack space="sm">
                <Text size="xs" className="font-semibold text-foreground">
                  {ref.label}
                </Text>

                <HStack space="sm" className="items-center">
                  <Button
                    size="sm"
                    onPress={() => handleRefund(ref.id, "approve")}
                    className="bg-primary px-3 py-1.5 rounded-[6px] active:opacity-90 h-auto"
                  >
                    <ButtonText className="text-xs font-semibold text-primary-foreground">
                      Setujui Refund
                    </ButtonText>
                  </Button>

                  <Pressable
                    onPress={() => handleRefund(ref.id, "reject")}
                    className="px-3 py-1.5 rounded-[6px] active:bg-muted/50"
                  >
                    <Text
                      size="xs"
                      className="font-semibold text-muted-foreground"
                    >
                      Tolak Refund
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            </Card>
          ))}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

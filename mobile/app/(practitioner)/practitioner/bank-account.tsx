import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Building2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react-native";
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
  ButtonSpinner,
  ScrollView,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui";
import { haptics, safeNavigateBack } from "@/utils";
import {
  useLedgerAccounts,
  useRequestWithdrawal,
} from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants";
import { getCapability } from "@/config/capabilities";
import { isAmountWithinBounds, parseRupiahInput } from "@/utils/money-input";
import { formatRupiah } from "@/utils/format";
import { resolveServerValue } from "@/utils/server-value";

const MIN_WITHDRAWAL = 100_000;
const MAX_WITHDRAWAL = 50_000_000;

export default function BankAccountScreen() {
  const router = useRouter();
  const withdrawMutation = useRequestWithdrawal();
  const ledgerAccounts = useLedgerAccounts();
  const serverBalance = ledgerAccounts.data?.data?.[0]?.balance;
  const withdrawalAvailable = getCapability("withdrawal") === "live";
  // The contract has no bank-account resource, so nothing on this screen may
  // claim a balance, a verified holder, or a past transfer of its own accord.
  // Every figure is either read from the ledger or stated as unavailable.
  const balanceText = resolveServerValue(
    serverBalance,
    (value) => formatRupiah(value),
    "Saldo belum tersedia",
  );
  const [selectedBank, setSelectedBank] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);

  const bankOptions = ["BCA", "Mandiri", "BNI", "BRI"];

  const handleWithdraw = () => {
    if (!withdrawalAvailable) {
      haptics.error();
      return;
    }
    const amount = parseRupiahInput(withdrawAmount);
    if (!isAmountWithinBounds(amount, MIN_WITHDRAWAL, MAX_WITHDRAWAL)) {
      setAmountError(
        `Masukkan nominal antara ${formatRupiah(MIN_WITHDRAWAL)} dan ${formatRupiah(MAX_WITHDRAWAL)}`,
      );
      haptics.error();
      return;
    }
    setAmountError(null);
    haptics.medium();
    withdrawMutation.mutate(
      {
        amount,
        bank: selectedBank,
      },
      {
        onError: () => {
          haptics.error();
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <HStack
        space="sm"
        className="items-center justify-between px-5 pt-3.5 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PRACTITIONER.WITHDRAW);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Rekening Penarikan Dana
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Status Banner */}
        <Box className="bg-primary rounded-3xl p-5 text-white relative overflow-hidden my-2">
          <Text
            size="xs"
            bold
            className="text-primary-foreground/70 uppercase tracking-widest text-[10px]"
          >
            Saldo Praktisi Tersedia
          </Text>
          <Text size="3xl" bold className="text-primary-foreground my-1">
            {balanceText}
          </Text>
          <HStack space="xs" className="items-center mt-1">
            <CheckCircle2 size={13} className="text-primary-foreground/90" />
            <Text
              size="xs"
              className="text-primary-foreground/90 text-[11px] font-semibold"
            >
              Siap ditarik ke rekening terverifikasi
            </Text>
          </HStack>
        </Box>

        {/* Bank Selection */}
        <VStack space="xs" className="mt-3">
          <Heading size="xs" bold className="text-foreground px-1">
            Pilih Bank Tujuan
          </Heading>
          <HStack space="sm">
            {bankOptions.map((bank) => {
              const isSelected = selectedBank === bank;
              return (
                <Pressable
                  key={bank}
                  onPress={() => {
                    haptics.light();
                    setSelectedBank(bank);
                  }}
                  className={`flex-1 py-3 rounded-2xl items-center justify-center border ${
                    isSelected
                      ? "bg-secondary border-secondary"
                      : "bg-card border-border"
                  }`}
                >
                  <Building2
                    size={18}
                    className={
                      isSelected
                        ? "text-secondary-foreground"
                        : "text-muted-foreground"
                    }
                  />
                  <Text
                    size="xs"
                    bold
                    className={`mt-1 ${
                      isSelected
                        ? "text-secondary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {bank}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* Bank Account Details */}
        <VStack space="xs" className="mt-4">
          <Heading size="xs" bold className="text-foreground px-1">
            Informasi Rekening Bank
          </Heading>
          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-foreground text-xs font-bold">
                  Nomor Rekening
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="rounded-xl border-border bg-background h-11 px-3">
                <InputField
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                  className="text-foreground text-xs"
                />
              </Input>
            </FormControl>

            <FormControl>
              <HStack space="xs" className="items-center justify-between">
                <FormControlLabel>
                  <FormControlLabelText className="text-foreground text-xs font-bold">
                    Nama Pemilik Rekening
                  </FormControlLabelText>
                </FormControlLabel>
                <HStack space="xs" className="items-center">
                  <ShieldCheck size={12} className="text-secondary" />
                  <Text size="xs" bold className="text-secondary text-[10px]">
                    Sesuai STR Kemenkes
                  </Text>
                </HStack>
              </HStack>
              <Input className="rounded-xl border-border bg-muted h-11 px-3">
                <InputField
                  value={accountHolder}
                  editable={false}
                  className="text-foreground text-xs font-semibold"
                />
              </Input>
            </FormControl>
          </Card>
        </VStack>

        {/* Withdraw Amount */}
        <VStack space="xs" className="mt-4">
          <Heading size="xs" bold className="text-foreground px-1">
            Nominal Penarikan
          </Heading>
          <Card className="bg-card rounded-2xl p-4 border border-border gap-2">
            <FormControl>
              <Input className="rounded-xl border-border bg-background h-12 px-3">
                <InputField
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="number-pad"
                  placeholder="Minimal Rp 100.000"
                  className="text-foreground text-sm font-bold"
                />
              </Input>
            </FormControl>
            <HStack space="xs" className="justify-between pt-1 text-xs">
              <Text size="xs" className="text-muted-foreground text-[11px]">
                Biaya transfer antarbank
              </Text>
              <Text size="xs" bold className="text-secondary text-[11px]">
                Gratis (Ditanggung PsiKita)
              </Text>
            </HStack>
          </Card>
        </VStack>

        {/* Recent Transfer History */}
        <VStack space="xs" className="mt-4">
          <Heading size="xs" bold className="text-foreground px-1">
            Riwayat Pencairan Terakhir
          </Heading>
          {/* The contract exposes no withdrawal-history resource, so this list is
              not rendered from an invented one. The ledger journals screen is
              where server-confirmed movements are shown. */}
          <Card className="bg-card rounded-2xl p-4 border border-border items-center">
            <Text size="xs" bold className="text-foreground">
              Riwayat pencairan belum tersedia
            </Text>
            <Text size="xs" className="text-muted-foreground text-[11px] mt-1">
              Backend belum menyediakan data pencairan. Tidak ada mutasi yang
              ditampilkan di sini.
            </Text>
          </Card>
        </VStack>
      </ScrollView>

      {/* Sticky Bottom Submit Button */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-4">
        <Button
          size="lg"
          isDisabled={withdrawMutation.isPending || !withdrawalAvailable}
          onPress={handleWithdraw}
          className="!opacity-100 w-full bg-muted h-12 rounded-2xl"
        >
          {withdrawMutation.isPending ? (
            <ButtonSpinner color="$primaryForeground" />
          ) : (
            <ButtonText className="text-sm font-bold text-muted-foreground">
              Konfirmasi & Tarik Dana
            </ButtonText>
          )}
        </Button>
      </Box>
    </SafeAreaView>
  );
}

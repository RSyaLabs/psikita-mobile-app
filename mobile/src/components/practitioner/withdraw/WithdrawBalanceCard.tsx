import React from "react";
import { Wallet, ArrowDownCircle, FileText } from "lucide-react-native";
import {
  Card,
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Button,
  ButtonText,
  ButtonIcon,
  Pressable,
} from "@/components/ui";

interface WithdrawBalanceCardProps {
  balanceLabel: string;
  hasBalance: boolean;
  onWithdraw: () => void;
  onShowMutasi: () => void;
}

export function WithdrawBalanceCard({
  balanceLabel,
  hasBalance,
  onWithdraw,
  onShowMutasi,
}: WithdrawBalanceCardProps) {
  return (
    <Card className="bg-primary rounded-3xl p-4 mb-3 border-0">
      <VStack space="sm">
        <HStack space="xs" className="items-center">
          <Wallet size={14} className="text-primary-foreground" />
          <Text
            size="xs"
            className="text-[10px] font-semibold text-primary-foreground"
          >
            Saldo aktif
            {hasBalance ? "" : " · belum ada data"}
          </Text>
        </HStack>

        <Heading size="2xl" className="font-bold text-primary-foreground">
          {balanceLabel}
        </Heading>
        <Text size="xs" className="text-primary-foreground/70">
          {hasBalance
            ? "Penarikan berikutnya: gratis"
            : "Saldo belum dapat dimuat dari server"}
        </Text>

        <HStack space="sm" className="items-center pt-2">
          <Button
            onPress={onWithdraw}
            accessibilityRole="button"
            accessibilityLabel="Tarik dana saldo aktif"
            className="flex-1 h-10 bg-primary-foreground rounded-xl flex-row items-center justify-center gap-1.5 active:opacity-90"
          >
            <ButtonIcon as={ArrowDownCircle} className="text-primary" />
            <ButtonText className="text-xs font-bold text-primary">
              Tarik dana
            </ButtonText>
          </Button>
          <Pressable
            onPress={onShowMutasi}
            accessibilityRole="button"
            accessibilityLabel="Lihat mutasi pendapatan"
            className="flex-1 h-10 bg-primary-foreground/15 rounded-xl flex-row items-center justify-center gap-1.5 active:bg-primary-foreground/20"
          >
            <FileText size={15} className="text-primary-foreground" />
            <Text
              size="xs"
              className="font-semibold text-primary-foreground"
            >
              Lihat mutasi
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </Card>
  );
}

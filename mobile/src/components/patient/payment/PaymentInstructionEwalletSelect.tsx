import React, { useState } from "react";
import { ArrowLeft, Wallet } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PaymentEwalletSelectProps {
  total?: number;
  initialWallet?: "shopeepay" | "dana" | string;
  onProceed: (wallet: "shopeepay" | "dana" | string) => void;
  onBack: () => void;
  onSelectQRIS: () => void;
}

export function PaymentEwalletSelect({
  total = 151500,
  initialWallet = "shopeepay",
  onProceed,
  onBack,
  onSelectQRIS,
}: PaymentEwalletSelectProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>(initialWallet);

  const wallets = [
    {
      id: "shopeepay",
      name: "ShopeePay",
      desc: "Dibuka di aplikasi Shopee",
      available: true,
    },
    {
      id: "dana",
      name: "DANA",
      desc: "Dibuka di aplikasi DANA",
      available: true,
    },
    {
      id: "other",
      name: "E-wallet Lain",
      desc: "Sedang tidak tersedia",
      available: false,
    },
  ];

  const handleSelect = (id: string, available: boolean) => {
    if (!available) return;
    haptics.selection();
    setSelectedWallet(id);
  };

  const handleProceed = () => {
    haptics.medium();
    onProceed(selectedWallet);
  };

  const activeWalletName =
    selectedWallet === "shopeepay"
      ? "ShopeePay"
      : selectedWallet === "dana"
      ? "DANA"
      : "E-wallet";

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke pembayaran"
          className="p-1 -ml-1"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading level={1} size="md" bold className="text-foreground text-lg">
          Pilih e-wallet
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="w-full max-w-[640px] md:max-w-[720px] self-center">
          {/* Info Card */}
          <Box className="border border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground leading-relaxed font-medium">
              Kamu akan diarahkan ke aplikasi e-wallet untuk menyetujui pembayaran. Daftar e-wallet diambil dari server.
            </Text>
          </Box>

          {/* E-wallet list */}
          <VStack space="xs">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider ml-1 mb-1 font-semibold"
            >
              E-WALLET
            </Text>

            {wallets.map((wallet) => {
              const isSelected = selectedWallet === wallet.id;
              return (
                <Pressable
                  key={wallet.id}
                  disabled={!wallet.available}
                  onPress={() => handleSelect(wallet.id, wallet.available)}
                  accessibilityRole="radio"
                  accessibilityLabel={wallet.name}
                  accessibilityState={{
                    checked: isSelected,
                    disabled: !wallet.available,
                  }}
                  className={`p-4 rounded-xl border flex-row items-center justify-between active:opacity-90 mb-1.5 ${
                    isSelected
                      ? "bg-card border-2 border-foreground"
                      : "bg-card border border-border"
                  } ${!wallet.available ? "opacity-60 bg-muted/30" : ""}`}
                >
                  <HStack space="md" className="items-center flex-1 mr-2">
                    <Wallet size={20} color="#4A3B6B" />
                    <VStack space="xs">
                      <Text size="sm" bold className="text-foreground">
                        {wallet.name}
                      </Text>
                      <Text size="sm" className="text-muted-foreground font-medium">
                        {wallet.desc}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box
                    className={`w-6 h-6 rounded-full border items-center justify-center ${
                      isSelected
                        ? "border-foreground bg-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Box className="w-2.5 h-2.5 rounded-full bg-card" />
                    )}
                  </Box>
                </Pressable>
              );
            })}
          </VStack>

          {/* Fallback Notice */}
          <Pressable
            onPress={() => {
              haptics.selection();
              onSelectQRIS();
            }}
            accessibilityRole="button"
            accessibilityLabel="Pilih QRIS di halaman sebelumnya"
            className="border border-dashed border-border rounded-xl p-3.5 bg-card active:opacity-80"
          >
            <Text size="sm" className="text-foreground leading-relaxed">
              Tidak punya aplikasinya di ponsel ini?{" "}
              <Text size="sm" bold className="text-primary font-bold">
                Pilih QRIS
              </Text>{" "}
              di halaman sebelumnya.
            </Text>
          </Pressable>
        </VStack>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 gap-2">
        <HStack className="justify-between items-center mb-1 w-full max-w-[640px] md:max-w-[720px] self-center">
          <Text size="sm" className="text-muted-foreground font-medium">
            Total bayar
          </Text>
          <Text size="lg" bold className="text-foreground text-xl">
            Rp {total.toLocaleString("id-ID")}
          </Text>
        </HStack>

        <Button
          size="lg"
          onPress={handleProceed}
          className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center active:opacity-90 max-w-[640px] md:max-w-[720px] self-center"
        >
          <ButtonText className="text-primary-foreground font-bold text-sm">
            Lanjut dengan {activeWalletName}
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}

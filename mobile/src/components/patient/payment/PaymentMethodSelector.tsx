import React from "react";
import { ShieldCheck, Wallet, QrCode, Building2, CreditCard } from "lucide-react-native";
import {
  Box,
  Text,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
} from "@/components/ui";
import { PaymentMethodGroupDto, PaymentMethodItemDto } from "@/types/api";

export interface PaymentMethodSelectorProps {
  groups?: PaymentMethodGroupDto[];
  selectedKey?: string;
  selectedMethod?: "gopay" | "qris" | "shopeepay" | "dana" | "va-bca" | "va-mandiri" | string;
  onSelectMethod?: (method: string) => void;
  onSelectKey?: (method: PaymentMethodItemDto) => void;
  paymentEnabled: boolean;
  isLoading?: boolean;
}

function getMethodIcon(type: string) {
  switch (type) {
    case "VIRTUAL_ACCOUNT":
      return <Building2 size={20} color="#4A3B6B" />;
    case "QRIS":
      return <QrCode size={20} color="#4A3B6B" />;
    case "E_WALLET":
      return <Wallet size={20} color="#4A3B6B" />;
    case "CREDIT_CARD":
      return <CreditCard size={20} color="#4A3B6B" />;
    default:
      return <Wallet size={20} color="#4A3B6B" />;
  }
}

export function PaymentMethodSelector({
  groups,
  selectedKey,
  selectedMethod,
  onSelectMethod,
  onSelectKey,
  paymentEnabled,
  isLoading,
}: PaymentMethodSelectorProps) {
  const currentKey = selectedKey || selectedMethod;

  // Canonical Wireframe Fallback Groups (Screens 33, 34, 35, 36)
  const defaultGroups: PaymentMethodGroupDto[] = [
    {
      groupName: "VIRTUAL ACCOUNT",
      methodType: "VIRTUAL_ACCOUNT",
      methods: [
        {
          key: "va-bca",
          name: "BCA Virtual Account",
          methodType: "VIRTUAL_ACCOUNT",
          channelCode: "VA_BCA",
          available: true,
          providerVerified: true,
          fee: { amount: 4000, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 154000, currency: "IDR" },
        },
        {
          key: "va-mandiri",
          name: "Mandiri Virtual Account",
          methodType: "VIRTUAL_ACCOUNT",
          channelCode: "VA_MANDIRI",
          available: true,
          providerVerified: true,
          fee: { amount: 4000, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 154000, currency: "IDR" },
        },
      ],
    },
    {
      groupName: "QRIS",
      methodType: "QRIS",
      methods: [
        {
          key: "qris",
          name: "QRIS (Semua Pembayaran)",
          methodType: "QRIS",
          channelCode: "QRIS",
          available: true,
          providerVerified: true,
          fee: { amount: 1050, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 151050, currency: "IDR" },
        },
      ],
    },
    {
      groupName: "E-WALLET",
      methodType: "E_WALLET",
      methods: [
        {
          key: "shopeepay",
          name: "ShopeePay",
          methodType: "E_WALLET",
          channelCode: "SHOPEEPAY",
          available: true,
          providerVerified: true,
          fee: { amount: 1500, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 151500, currency: "IDR" },
        },
        {
          key: "dana",
          name: "DANA",
          methodType: "E_WALLET",
          channelCode: "DANA",
          available: true,
          providerVerified: true,
          fee: { amount: 0, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 150000, currency: "IDR" },
        },
        {
          key: "other-ewallet",
          name: "E-wallet Lain",
          methodType: "E_WALLET",
          channelCode: "OTHER",
          available: false,
          providerVerified: false,
          fee: { amount: 0, currency: "IDR" },
          feeBearer: "PATIENT",
          totalPayable: { amount: 150000, currency: "IDR" },
          disabledReason: "Tidak tersedia sekarang",
        },
      ],
    },
  ];

  const activeGroups = groups && groups.length > 0 ? groups : defaultGroups;

  return (
    <VStack space="md">
      {/* Category header */}
      <HStack space="md" className="items-center justify-between">
        <Text
          size="sm"
          bold
          className="text-foreground uppercase tracking-wider text-base"
        >
          Pilih metode pembayaran
        </Text>
        <HStack space="xs" className="items-center">
          <Text size="sm" className="text-muted-foreground font-medium">
            Duitku • Pembayaran Aman
          </Text>
          <ShieldCheck size={18} color="#75618E" />
        </HStack>
      </HStack>

      {isLoading ? (
        <Box className="p-4 rounded-xl border border-border bg-card">
          <Text size="sm" className="text-muted-foreground">
            Memuat katalog metode pembayaran resmi...
          </Text>
        </Box>
      ) : (
        activeGroups.map((group) => (
          <VStack key={group.groupName} space="xs" className="mb-2">
            <Text
              size="sm"
              bold
              className="text-muted-foreground uppercase tracking-wider ml-1 mb-1 font-semibold"
            >
              {group.groupName}
            </Text>

            {group.methods.map((method) => {
              const isSelected =
                currentKey === method.key ||
                currentKey?.toLowerCase() === method.channelCode?.toLowerCase();
              const isItemDisabled = !paymentEnabled || !method.available;

              return (
                <Pressable
                  key={method.key}
                  accessibilityRole="radio"
                  accessibilityLabel={method.name}
                  accessibilityState={{
                    checked: isSelected,
                    disabled: isItemDisabled,
                  }}
                  disabled={isItemDisabled}
                  onPress={() => {
                    onSelectKey?.(method);
                    onSelectMethod?.(method.key as any);
                  }}
                  className={`p-4 rounded-xl border flex-row items-center justify-between active:opacity-90 mb-1.5 ${
                    isSelected
                      ? "bg-card border-2 border-foreground"
                      : "bg-card border border-border"
                  } ${!method.available ? "opacity-60 bg-muted/30" : ""}`}
                >
                  <HStack space="md" className="items-center flex-1 mr-2">
                    {getMethodIcon(method.methodType)}
                    <VStack space="xs" className="flex-1">
                      <HStack space="xs" className="items-center">
                        <Text size="sm" bold className="text-foreground">
                          {method.name}
                        </Text>
                        {!method.available && (
                          <Badge
                            variant="outline"
                            className="bg-muted border-border px-2 py-0.5 rounded-full"
                          >
                            <BadgeText className="text-sm text-muted-foreground font-medium">
                              {method.disabledReason || "Tidak tersedia sekarang"}
                            </BadgeText>
                          </Badge>
                        )}
                      </HStack>
                      <Text
                        size="sm"
                        className="text-muted-foreground font-medium"
                      >
                        {method.fee.amount > 0
                          ? `Biaya layanan Rp ${method.fee.amount.toLocaleString("id-ID")}`
                          : "Termasuk dalam harga"}
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
        ))
      )}

      {/* Wireframe Disclaimer */}
      <Text size="sm" className="text-muted-foreground leading-relaxed px-1">
        Metode, ketersediaan, dan biaya diambil dari server. Nominal akhir dikunci saat pesanan dibuat.
      </Text>
    </VStack>
  );
}

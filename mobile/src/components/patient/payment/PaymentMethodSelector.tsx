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
  selectedMethod?: "gopay" | "qris" | string;
  onSelectMethod?: (method: "gopay" | "qris" | string) => void;
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

  // Fallback default mock/static groups if server catalog is loading or empty
  const activeGroups: PaymentMethodGroupDto[] =
    groups && groups.length > 0
      ? groups
      : [
          {
            groupName: "E-Wallet",
            methodType: "E_WALLET",
            methods: [
              {
                key: "gopay",
                name: "GoPay / E-Wallet",
                methodType: "E_WALLET",
                channelCode: "GOPAY",
                available: true,
                providerVerified: true,
                fee: { amount: 0, currency: "IDR" },
                feeBearer: "PATIENT",
                totalPayable: { amount: 50000, currency: "IDR" },
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
                fee: { amount: 0, currency: "IDR" },
                feeBearer: "PATIENT",
                totalPayable: { amount: 50000, currency: "IDR" },
              },
            ],
          },
        ];

  return (
    <VStack space="sm">
      <HStack space="md" className="items-center justify-between">
        <Text
          size="xs"
          bold
          className="text-muted-foreground uppercase tracking-wider"
        >
          Duitku • Pembayaran Aman
        </Text>
        <ShieldCheck size={16} className="text-secondary" />
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
            <Text size="xs" bold className="text-muted-foreground ml-1">
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
                  className={`p-3.5 rounded-xl border flex-row items-center justify-between active:opacity-90 mb-1 ${
                    isSelected
                      ? "bg-muted border-primary"
                      : "bg-card border-border"
                  } ${!method.available ? "opacity-60" : ""}`}
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
                            <BadgeText className="text-xs text-muted-foreground">
                              {method.disabledReason || "Tidak aktif"}
                            </BadgeText>
                          </Badge>
                        )}
                      </HStack>
                      <Text
                        size="xs"
                        className="text-muted-foreground font-medium"
                      >
                        {method.fee.amount > 0
                          ? `Biaya: Rp ${method.fee.amount.toLocaleString("id-ID")}`
                          : "Bebas Biaya Admin"}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box
                    className={`w-5 h-5 rounded-full border items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <Box className="w-2 h-2 rounded-full bg-primary-foreground" />
                    )}
                  </Box>
                </Pressable>
              );
            })}
          </VStack>
        ))
      )}
    </VStack>
  );
}

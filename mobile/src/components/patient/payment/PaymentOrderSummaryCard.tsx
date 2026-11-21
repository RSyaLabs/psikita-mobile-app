import React from "react";
import { Box, Text, VStack, HStack, Avatar, AvatarImage, AvatarFallbackText } from "@/components/ui";
import { getInitials } from "@/utils/format";

export interface PaymentOrderSummaryCardProps {
  doctorName?: string;
  doctorRole?: string;
  doctorAvatar?: string;
  serviceFee?: number;
  discount?: number;
  adminFee?: number;
  total?: number;
}

export function PaymentOrderSummaryCard({
  doctorName = "Psikolog Klinis",
  doctorRole = "Psikolog Klinis Terverifikasi",
  doctorAvatar,
  serviceFee = 150000,
  discount = 0,
  adminFee = 0,
  total,
}: PaymentOrderSummaryCardProps) {
  const calculatedTotal =
    total !== undefined ? total : Math.max(0, serviceFee - discount + adminFee);

  return (
    <Box className="border border-border bg-card rounded-2xl p-4 gap-3">
      {/* Practitioner Row */}
      <HStack space="md" className="items-center">
        {doctorAvatar ? (
          <Avatar size="md">
            <AvatarImage source={{ uri: doctorAvatar }} />
            <AvatarFallbackText>{getInitials(doctorName)}</AvatarFallbackText>
          </Avatar>
        ) : null}
        <VStack space="xs" className="flex-1">
          <Text size="sm" bold className="text-foreground text-base">
            Konsultasi dengan {doctorName}
          </Text>
          <Text size="sm" className="text-muted-foreground">
            {doctorRole}
          </Text>
        </VStack>
      </HStack>

      {/* Bill Breakdown */}
      <VStack space="xs" className="pt-1">
        <HStack className="justify-between items-center py-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Biaya layanan
          </Text>
          <Text size="sm" className="text-foreground font-semibold">
            {serviceFee > 0 ? `Rp ${serviceFee.toLocaleString("id-ID")}` : "Rp —"}
          </Text>
        </HStack>

        <HStack className="justify-between items-center py-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Diskon
          </Text>
          <Text
            size="sm"
            className={discount > 0 ? "text-primary font-bold" : "text-foreground font-semibold"}
          >
            {discount > 0 ? `-Rp ${discount.toLocaleString("id-ID")}` : "Rp —"}
          </Text>
        </HStack>

        <HStack className="justify-between items-center py-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Biaya pembayaran
          </Text>
          <Text size="sm" className="text-foreground font-semibold">
            {adminFee > 0 ? `Rp ${adminFee.toLocaleString("id-ID")}` : "Rp —"}
          </Text>
        </HStack>

        {/* Total Divider */}
        <Box className="border-t border-dashed border-border pt-3 mt-1">
          <HStack className="justify-between items-center">
            <Text size="sm" bold className="text-foreground text-base">
              Total
            </Text>
            <Text size="sm" bold className="text-foreground text-lg">
              {calculatedTotal > 0
                ? `Rp ${calculatedTotal.toLocaleString("id-ID")}`
                : "Rp —"}
            </Text>
          </HStack>
        </Box>
      </VStack>

      {/* Wireframe Caption */}
      <Text size="sm" className="text-muted-foreground leading-relaxed pt-1">
        Semua nilai dihitung server dan bisa diperbarui sebelum kamu membayar.
      </Text>
    </Box>
  );
}

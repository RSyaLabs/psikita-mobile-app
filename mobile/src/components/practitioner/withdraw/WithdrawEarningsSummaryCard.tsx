import React from "react";
import { Card, VStack, Text } from "@/components/ui";

interface WithdrawEarningsSummaryCardProps {
  description?: string;
}

export function WithdrawEarningsSummaryCard({
  description = "Rincian pendapatan bulanan, biaya platform, dan PPh 21 tersinkronisasi otomatis dengan riwayat sesi praktisi.",
}: WithdrawEarningsSummaryCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3">
      <VStack space="xs">
        <Text size="sm" className="font-bold text-foreground mb-1">
          Ringkasan pendapatan
        </Text>
        <Text size="xs" className="text-muted-foreground leading-relaxed">
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

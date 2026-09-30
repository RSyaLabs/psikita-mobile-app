import React from "react";
import { CreditCard, QrCode } from "lucide-react-native";
import { Card, HStack, VStack, Box, Text } from "@/components/ui";

interface ReferralSatuSehatCardProps {
  bpjsBridgeStatus?: string;
  satuSehatId?: string;
}

export function ReferralSatuSehatCard({
  bpjsBridgeStatus = "Tersambung P-Care / V-Claim",
  satuSehatId = "SS-REF-2026-99120",
}: ReferralSatuSehatCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-4 mb-3.5 border border-border">
      <HStack space="md" className="items-center justify-between">
        <HStack space="sm" className="items-center flex-1 mr-2">
          <Box className="w-9 h-9 rounded-xl bg-primary/10 items-center justify-center">
            <CreditCard size={18} className="text-primary" />
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="xs" bold className="text-foreground">
              SatuSehat & BPJS Integrasi
            </Text>
            <Text size="xs" className="text-muted-foreground text-[10px]">
              {bpjsBridgeStatus} • {satuSehatId}
            </Text>
          </VStack>
        </HStack>
        <Box className="w-8 h-8 rounded-xl bg-muted items-center justify-center border border-border">
          <QrCode size={18} className="text-foreground" />
        </Box>
      </HStack>
    </Card>
  );
}

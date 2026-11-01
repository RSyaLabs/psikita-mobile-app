import React from "react";
import { CreditCard, QrCode } from "lucide-react-native";
import { Card, HStack, VStack, Box, Text } from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";

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
          <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
            <AppIcon icon={CreditCard} size={20} tone="primary" />
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground">
              SatuSehat & BPJS Integrasi
            </Text>
            <Text size="sm" className="text-muted-foreground font-medium">
              {bpjsBridgeStatus} • {satuSehatId}
            </Text>
          </VStack>
        </HStack>
        <Box className="w-9 h-9 rounded-xl bg-muted items-center justify-center border border-border">
          <AppIcon icon={QrCode} size={20} tone="foreground" />
        </Box>
      </HStack>
    </Card>
  );
}

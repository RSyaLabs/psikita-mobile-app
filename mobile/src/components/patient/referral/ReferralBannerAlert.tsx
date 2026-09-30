import React from "react";
import { AlertTriangle } from "lucide-react-native";
import { Card, HStack, VStack, Text } from "@/components/ui";

interface ReferralBannerAlertProps {
  title?: string;
  description?: string;
}

export function ReferralBannerAlert({
  title = "Perlu pemeriksaan lanjutan",
  description = "Praktisi merekomendasikan evaluasi menyeluruh di fasilitas kesehatan rujukan tingkat lanjut (FKRTL).",
}: ReferralBannerAlertProps) {
  return (
    <Card className="bg-muted rounded-2xl p-3.5 mb-3.5 border border-border">
      <HStack space="md" className="items-center">
        <AlertTriangle size={20} className="text-foreground" />
        <VStack space="xs" className="flex-1">
          <Text size="xs" bold className="text-foreground">
            {title}
          </Text>
          <Text size="xs" className="text-muted-foreground text-[11px]">
            {description}
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

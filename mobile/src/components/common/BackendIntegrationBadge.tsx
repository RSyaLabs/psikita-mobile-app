import React from "react";
import { Server, AlertTriangle } from "lucide-react-native";
import {
  Badge,
  BadgeIcon,
  BadgeText,
  Card,
  HStack,
  Heading,
  Text,
  VStack,
} from "@/components/ui";

export interface BackendIntegrationBadgeProps {
  endpoint?: string;
  badgeText?: string;
  className?: string;
  testID?: string;
}

export function BackendIntegrationBadge({
  endpoint,
  badgeText = "Tahap Integrasi Backend",
  className = "",
  testID,
}: BackendIntegrationBadgeProps) {
  return (
    <Badge
      testID={testID}
      variant="outline"
      className={`border-warning/40 bg-warning/10 rounded-full px-2.5 py-1 ${className}`}
    >
      <BadgeIcon as={AlertTriangle} className="text-warning mr-1" />
      <BadgeText className="text-[10px] font-semibold text-warning tracking-wide">
        {endpoint ? `${badgeText} • ${endpoint}` : badgeText}
      </BadgeText>
    </Badge>
  );
}

export interface BackendIntegrationBannerProps {
  endpoint?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  className?: string;
  testID?: string;
}

export function BackendIntegrationBanner({
  endpoint,
  badgeText = "Tahap Integrasi Backend",
  title = "Pratinjau Antarmuka QA",
  description = "Fitur langsung dari server belum tersedia. Antarmuka ditampilkan lengkap untuk evaluasi alur tim QA dan spesifikasi endpoint tim backend.",
  className = "",
  testID,
}: BackendIntegrationBannerProps) {
  return (
    <Card
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={`${badgeText}: ${title}`}
      accessibilityHint={description}
      className={`bg-warning/10 border border-warning/30 rounded-2xl p-4 gap-2.5 ${className}`}
    >
      <HStack space="sm" className="items-center justify-between">
        <Badge
          variant="outline"
          className="border-warning/50 bg-card rounded-full px-2 py-0.5"
        >
          <BadgeIcon as={AlertTriangle} className="text-warning mr-1" />
          <BadgeText className="text-[10px] font-bold text-warning">
            {badgeText}
          </BadgeText>
        </Badge>
        {endpoint ? (
          <HStack space="xs" className="items-center bg-card px-2 py-0.5 rounded-md border border-warning/30">
            <Server size={11} className="text-muted-foreground" />
            <Text size="xs" bold className="text-muted-foreground text-[10px]">
              {endpoint}
            </Text>
          </HStack>
        ) : null}
      </HStack>

      <VStack space="xs">
        <Heading size="xs" bold className="text-foreground">
          {title}
        </Heading>
        <Text size="xs" className="text-muted-foreground leading-relaxed">
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

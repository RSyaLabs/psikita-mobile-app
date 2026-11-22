import React from "react";
import { AlertTriangle } from "lucide-react-native";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui";

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
      className={`border-warning/40 bg-warning/10 rounded-full px-3 py-1 ${className}`}
    >
      <BadgeIcon as={AlertTriangle} color="#D97706" style={{ marginRight: 4 }} />
      <BadgeText className="text-sm font-semibold text-warning tracking-wide">
        {endpoint ? `${badgeText} • ${endpoint}` : badgeText}
      </BadgeText>
    </Badge>
  );
}

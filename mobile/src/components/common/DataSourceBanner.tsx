import React from "react";
import { Box, Text } from "@/components/ui";

export type DataSource = "demo" | "live";

export interface DataSourceBannerProps {
  source: DataSource;
  label?: string;
  description?: string;
  testID?: string;
  className?: string;
}

export function DataSourceBanner({
  source,
  label = "Sumber data demo",
  description,
  testID,
  className = "",
}: DataSourceBannerProps) {
  if (source !== "demo") return null;

  return (
    <Box
      testID={testID}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityLiveRegion="polite"
      className={`rounded-lg border border-warning/30 bg-warning/10 p-3.5 ${className}`}
    >
      <Text size="sm" bold className="text-foreground">
        {label}
      </Text>
      {description ? (
        <Text size="xs" className="mt-1 text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </Box>
  );
}

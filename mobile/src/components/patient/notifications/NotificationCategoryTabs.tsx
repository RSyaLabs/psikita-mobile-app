import React from "react";
import { HStack, Pressable, Text } from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface NotificationCategoryTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function NotificationCategoryTabs({
  tabs,
  activeTab,
  onTabChange,
}: NotificationCategoryTabsProps) {
  return (
    <HStack space="xs" className="w-full">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => {
              haptics.light();
              onTabChange(tab);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Filter notifikasi ${tab}`}
            className={`flex-1 py-2 rounded-xl items-center justify-center border ${
              isSelected
                ? "bg-primary border-primary"
                : "bg-card border-border"
            }`}
          >
            <Text
              size="xs"
              className={`font-semibold text-[11px] ${
                isSelected
                  ? "text-primary-foreground font-bold"
                  : "text-muted-foreground"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}

import React from "react";
import { ScrollView, HStack, Pressable, Text } from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface DoctorFilterChipsProps {
  filters: string[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function DoctorFilterChips({
  filters,
  selectedFilter,
  onSelectFilter,
}: DoctorFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2.5 px-5 bg-background border-b border-border/50 max-h-14"
      contentContainerStyle={{ gap: 8, paddingRight: 40 }}
    >
      <HStack space="xs" className="items-center">
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => {
                haptics.light();
                onSelectFilter(filter);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${filter}`}
              className={`px-3.5 py-1.5 rounded-full border ${
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
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </ScrollView>
  );
}

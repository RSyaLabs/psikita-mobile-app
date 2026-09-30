import React from "react";
import { Search } from "lucide-react-native";
import {
  Box,
  Text,
  HStack,
  Pressable,
  Input,
  InputField,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface PractitionerHistorySearchFilterProps {
  search: string;
  onSearchChange: (text: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: string[];
}

export function PractitionerHistorySearchFilter({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  tabs,
}: PractitionerHistorySearchFilterProps) {
  return (
    <Box className="px-5 pt-3 pb-2 bg-background border-b border-border">
      {/* Search Input */}
      <Box className="bg-card rounded-2xl border border-border px-3.5 py-1 flex-row items-center mb-3">
        <Search size={16} className="text-muted-foreground mr-2.5" />
        <Input className="flex-1 border-0 h-9 bg-transparent px-0">
          <InputField
            value={search}
            onChangeText={onSearchChange}
            placeholder="Cari nama pasien, diagnosa, atau no sesi..."
            className="text-xs text-foreground p-0"
          />
        </Input>
      </Box>

      {/* Filter Tabs */}
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
              accessibilityLabel={`Filter sesi ${tab}`}
              className={`flex-1 py-2 rounded-xl items-center justify-center border ${
                isSelected
                  ? "bg-primary border-primary"
                  : "bg-card border-border"
              }`}
            >
              <Text
                size="xs"
                className={`font-semibold ${
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
    </Box>
  );
}

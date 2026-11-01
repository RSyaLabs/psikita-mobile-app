import React from "react";
import { Search, SlidersHorizontal } from "lucide-react-native";
import {
  Box,
  HStack,
  Pressable,
  Input,
  InputField,
} from "@/components/ui";

interface DoctorSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onOpenFilter: () => void;
  hasActiveFilters?: boolean;
}

export function DoctorSearchHeader({
  searchQuery,
  onSearchChange,
  onOpenFilter,
  hasActiveFilters = false,
}: DoctorSearchHeaderProps) {
  return (
    <Box className="px-5 pt-3 pb-2 bg-background border-b border-border/50">
      <HStack space="sm" className="items-center">
        <Box className="flex-1 bg-card rounded-2xl border border-border px-3.5 py-1 flex-row items-center">
          <Search size={18} color="#4B4656" style={{ marginRight: 8 }} />
          <Input className="flex-1 border-0 h-10 bg-transparent px-0">
            <InputField
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Cari dokter, spesialisasi, atau topik..."
              className="text-sm font-medium text-foreground p-0"
            />
          </Input>
        </Box>
        <Pressable
          onPress={onOpenFilter}
          accessibilityRole="button"
          accessibilityLabel="Buka filter dokter"
          className={`w-11 h-11 rounded-2xl border items-center justify-center active:bg-muted ${
            hasActiveFilters
              ? "bg-primary/15 border-primary"
              : "bg-card border-border"
          }`}
        >
          <SlidersHorizontal
            size={18}
            color={hasActiveFilters ? "#4A3B6B" : "#4B4656"}
          />
        </Pressable>
      </HStack>
    </Box>
  );
}

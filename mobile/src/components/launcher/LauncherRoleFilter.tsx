import React from "react";
import { ScrollView } from "react-native";
import { Pressable, Text } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export type RoleFilterKey = "all" | "patient" | "practitioner" | "admin" | "auth";

interface LauncherRoleFilterProps {
  selectedRole: RoleFilterKey;
  onSelectRole: (role: RoleFilterKey) => void;
  roleCounts: Record<string, number>;
}

export function LauncherRoleFilter({
  selectedRole,
  onSelectRole,
  roleCounts,
}: LauncherRoleFilterProps) {
  const tabs: Array<{ id: RoleFilterKey; label: string }> = [
    { id: "all", label: `Semua (${roleCounts.all || 0})` },
    { id: "patient", label: `Pasien (${roleCounts.patient || 0})` },
    { id: "practitioner", label: `Praktisi (${roleCounts.practitioner || 0})` },
    { id: "admin", label: `Admin (${roleCounts.admin || 0})` },
    { id: "auth", label: `Auth (${roleCounts.auth || 0})` },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingBottom: 12 }}
      className="mb-2"
    >
      {tabs.map((tab) => {
        const isSelected = selectedRole === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => {
              haptics.selection();
              onSelectRole(tab.id);
            }}
            className={`px-3 py-1.5 rounded-full border ${
              isSelected
                ? "bg-primary border-primary"
                : "bg-card border-border active:bg-muted"
            }`}
          >
            <Text
              size="xs"
              className={`text-[11px] font-bold ${
                isSelected
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

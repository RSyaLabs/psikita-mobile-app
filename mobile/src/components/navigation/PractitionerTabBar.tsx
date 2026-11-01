import React from "react";
import { useRouter } from "expo-router";
import { LayoutDashboard, Calendar, User } from "lucide-react-native";
import { HStack, Text, Pressable } from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";
import { PractitionerTab } from "@/types";
import { ROUTES } from "@/constants";

export interface PractitionerTabBarProps {
  activeTab: PractitionerTab;
}

export function PractitionerTabBar({ activeTab }: PractitionerTabBarProps) {
  const router = useRouter();

  const tabs = [
    {
      id: "beranda" as PractitionerTab,
      label: "Beranda",
      route: ROUTES.PRACTITIONER.DASHBOARD,
      icon: (active: boolean) => (
        <AppIcon
          icon={LayoutDashboard}
          size={22}
          tone={active ? "primary" : "muted"}
        />
      ),
    },
    {
      id: "sesi" as PractitionerTab,
      label: "Sesi",
      route: ROUTES.PRACTITIONER.HISTORY,
      icon: (active: boolean) => (
        <AppIcon
          icon={Calendar}
          size={22}
          tone={active ? "primary" : "muted"}
        />
      ),
    },
    {
      id: "profil" as PractitionerTab,
      label: "Profil",
      route: ROUTES.PRACTITIONER.PROFILE,
      icon: (active: boolean) => (
        <AppIcon
          icon={User}
          size={22}
          tone={active ? "primary" : "muted"}
        />
      ),
    },
  ];

  return (
    <HStack
      space="xs"
      accessibilityRole="tablist"
      className="absolute bottom-4 left-4 right-4 bg-card rounded-[24px] p-2 border border-border items-center justify-around z-50 shadow-md"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => router.push(tab.route)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Tab ${tab.label}`}
            className={`flex-1 py-2 items-center justify-center rounded-[16px] ${
              isActive ? "bg-muted" : "bg-transparent"
            }`}
          >
            {tab.icon(isActive)}
            <Text
              size="sm"
              className={`text-sm mt-1 ${
                isActive
                  ? "font-bold text-primary"
                  : "font-medium text-muted-foreground"
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}

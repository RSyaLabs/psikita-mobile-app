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

const PRACTITIONER_TABS = [
  {
    id: "beranda" as PractitionerTab,
    label: "Beranda",
    route: ROUTES.PRACTITIONER.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: "sesi" as PractitionerTab,
    label: "Sesi",
    route: ROUTES.PRACTITIONER.HISTORY,
    icon: Calendar,
  },
  {
    id: "profil" as PractitionerTab,
    label: "Profil",
    route: ROUTES.PRACTITIONER.PROFILE,
    icon: User,
  },
] as const;

export const PractitionerTabBar = React.memo(function PractitionerTabBar({
  activeTab,
}: PractitionerTabBarProps) {
  const router = useRouter();

  return (
    <HStack
      space="xs"
      accessibilityRole="tablist"
      className="absolute bottom-4 left-4 right-4 bg-card rounded-[24px] p-2 border border-border items-center justify-around z-50 shadow-md"
    >
      {PRACTITIONER_TABS.map((tab) => {
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
            <AppIcon
              icon={tab.icon}
              size={22}
              tone={isActive ? "primary" : "muted"}
            />
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
});

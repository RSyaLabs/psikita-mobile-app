import React from "react";
import { useRouter } from "expo-router";
import { LayoutDashboard, Calendar, Wallet, User } from "lucide-react-native";
import { HStack, Text, Pressable } from "@/components/ui";
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
        <LayoutDashboard
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "sesi" as PractitionerTab,
      label: "Sesi",
      route: ROUTES.PRACTITIONER.HISTORY,
      icon: (active: boolean) => (
        <Calendar
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "keuangan" as PractitionerTab,
      label: "Keuangan",
      route: ROUTES.PRACTITIONER.WITHDRAW,
      icon: (active: boolean) => (
        <Wallet
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "profil" as PractitionerTab,
      label: "Profil",
      route: ROUTES.PRACTITIONER.PROFILE,
      icon: (active: boolean) => (
        <User
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
  ];

  return (
    <HStack
      space="xs"
      accessibilityRole="tablist"
      className="absolute bottom-4 left-5 right-5 bg-card rounded-[24px] p-2.5 border border-border items-center justify-around z-50"
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
            className={`flex-1 py-1.5 items-center justify-center rounded-[12px] ${
              isActive ? "bg-muted" : "bg-transparent"
            }`}
          >
            {tab.icon(isActive)}
            <Text
              size="xs"
              className={`text-[10px] ${
                isActive
                  ? "font-bold text-foreground"
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

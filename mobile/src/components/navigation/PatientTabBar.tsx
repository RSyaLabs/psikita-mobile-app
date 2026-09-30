import React from "react";
import { useRouter } from "expo-router";
import { Home, Calendar, BookOpen, User } from "lucide-react-native";
import { HStack, Text, Pressable } from "@/components/ui";
import { PatientTab } from "@/types";
import { ROUTES } from "@/constants";

export interface PatientTabBarProps {
  activeTab: PatientTab;
}

export function PatientTabBar({ activeTab }: PatientTabBarProps) {
  const router = useRouter();

  const tabs = [
    {
      id: "beranda" as PatientTab,
      label: "Beranda",
      route: ROUTES.PATIENT.DASHBOARD,
      icon: (active: boolean) => (
        <Home
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "sesi" as PatientTab,
      label: "Sesi",
      route: ROUTES.PATIENT.HISTORY,
      icon: (active: boolean) => (
        <Calendar
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "jurnal" as PatientTab,
      label: "Jurnal",
      route: ROUTES.PATIENT.ARTICLES,
      icon: (active: boolean) => (
        <BookOpen
          size={18}
          className={active ? "text-primary" : "text-muted-foreground"}
        />
      ),
    },
    {
      id: "akun" as PatientTab,
      label: "Akun",
      route: ROUTES.PATIENT.PROFILE,
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
      className="absolute bottom-4 left-5 right-5 bg-card rounded-[22px] p-2.5 border border-border items-center justify-around z-50"
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

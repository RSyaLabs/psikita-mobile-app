import React from "react";
import { useRouter } from "expo-router";
import { Home, Calendar, BookOpen, User } from "lucide-react-native";
import { HStack, Text, Pressable } from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";
import { PatientTab } from "@/types";
import { ROUTES } from "@/constants";

export interface PatientTabBarProps {
  activeTab: PatientTab;
}

const PATIENT_TABS = [
  {
    id: "beranda" as PatientTab,
    label: "Beranda",
    route: ROUTES.PATIENT.DASHBOARD,
    icon: Home,
  },
  {
    id: "sesi" as PatientTab,
    label: "Sesi",
    route: ROUTES.PATIENT.HISTORY,
    icon: Calendar,
  },
  {
    id: "edukasi" as PatientTab,
    label: "Edukasi",
    route: ROUTES.PATIENT.COURSES,
    icon: BookOpen,
  },
  {
    id: "akun" as PatientTab,
    label: "Akun",
    route: ROUTES.PATIENT.PROFILE,
    icon: User,
  },
] as const;

export const PatientTabBar = React.memo(function PatientTabBar({
  activeTab,
}: PatientTabBarProps) {
  const router = useRouter();

  return (
    <HStack
      space="xs"
      accessibilityRole="tablist"
      className="absolute bottom-4 left-4 right-4 bg-card rounded-[24px] p-2 border border-border items-center justify-around z-50 shadow-md"
    >
      {PATIENT_TABS.map((tab) => {
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

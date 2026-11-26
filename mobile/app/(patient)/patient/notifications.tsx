import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  NotificationListView,
  NotificationSettingsView,
  NotificationItem,
} from "@/components/patient/notifications";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";

export default function NotificationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: "list" | "settings";
    guest?: string;
  }>();

  const [currentView, setCurrentView] = useState<"list" | "settings">(
    params.view === "settings" ? "settings" : "list"
  );

  const handleBack = () => {
    if (currentView === "settings") {
      setCurrentView("list");
    } else {
      safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
    }
  };

  const handleSelectNotification = (item: NotificationItem) => {
    if (item.route) {
      router.push({
        pathname: item.route as any,
        params: params.guest === "true" ? { guest: "true" } : undefined,
      });
    }
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#FAF8F5]">
      {currentView === "list" ? (
        <NotificationListView
          items={params.guest === "true" ? undefined : []}
          onBack={handleBack}
          onOpenSettings={() => setCurrentView("settings")}
          onSelectNotification={handleSelectNotification}
        />
      ) : (
        <NotificationSettingsView
          onBack={handleBack}
        />
      )}
    </SafeAreaView>
  );
}

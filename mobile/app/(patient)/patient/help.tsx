import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { HelpCenterView } from "@/components/patient/notifications";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";

export default function HelpCenterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    guest?: string;
  }>();

  const handleBack = () => {
    safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
  };

  const handleEmergencyCrisis = () => {
    router.push({
      pathname: ROUTES.PATIENT.COMMUNITY as any,
      params: {
        tab: "krisis",
        guest: params.guest === "true" ? "true" : undefined,
      },
    });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-[#FAF8F5]">
      <HelpCenterView
        onBack={handleBack}
        onEmergencyCrisis={handleEmergencyCrisis}
      />
    </SafeAreaView>
  );
}

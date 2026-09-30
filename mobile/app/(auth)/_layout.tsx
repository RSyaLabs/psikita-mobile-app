import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout() {
  const router = useRouter();
  const { status, homeRoute } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      router.replace(homeRoute as any);
    }
  }, [status, homeRoute, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sage.DEFAULT },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

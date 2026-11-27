import React, { useEffect } from "react";
import { Stack, useRouter, useGlobalSearchParams } from "expo-router";
import { colors } from "@/theme/colors";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout() {
  const router = useRouter();
  const { status, homeRoute } = useAuth();
  const params = useGlobalSearchParams<{ triageId?: string; redirect?: string }>();

  useEffect(() => {
    if (status === "authenticated" && homeRoute && !params.triageId && !params.redirect) {
      router.replace(homeRoute as any);
    }
  }, [status, homeRoute, params.triageId, params.redirect, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sage.DEFAULT },
        animation: "slide_from_right",
        freezeOnBlur: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}

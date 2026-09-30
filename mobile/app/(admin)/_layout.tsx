import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { AuthLoadingState } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function AdminLayout() {
  const router = useRouter();
  const { status, user, hasRole, homeRoute } = useAuth();
  const redirectRoute =
    status === "loading"
      ? null
      : status === "unauthenticated" || !user
        ? ROUTES.AUTH.LOGIN
        : !hasRole("admin")
          ? (homeRoute ?? ROUTES.AUTH.LOGIN)
          : null;

  useEffect(() => {
    if (redirectRoute) {
      router.replace(redirectRoute as any);
    }
  }, [redirectRoute, router]);

  if (status === "loading" || redirectRoute) {
    return <AuthLoadingState />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sage.DEFAULT },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="admin/dashboard" />
      <Stack.Screen name="admin/verification" />
      <Stack.Screen name="admin/ledger" />
      <Stack.Screen name="admin/settings" />
    </Stack>
  );
}

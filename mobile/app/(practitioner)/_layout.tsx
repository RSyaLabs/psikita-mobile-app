import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { colors } from "@/theme/colors";
import { AuthLoadingState } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function PractitionerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { status, user, hasRole, homeRoute } = useAuth();
  const isPublicRegistration = segments[segments.length - 1] === "register";
  const redirectRoute = isPublicRegistration
    ? null
    : status === "loading"
      ? null
      : status === "unauthenticated" || !user
        ? ROUTES.AUTH.LOGIN
        : !hasRole("practitioner")
          ? (homeRoute ?? ROUTES.AUTH.LOGIN)
          : null;

  useEffect(() => {
    if (redirectRoute) {
      router.replace(redirectRoute as any);
    }
  }, [redirectRoute, router]);

  if (!isPublicRegistration && (status === "loading" || redirectRoute)) {
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
      <Stack.Screen name="practitioner/register" />
      <Stack.Screen name="practitioner/dashboard" />
      <Stack.Screen name="practitioner/war-room" />
      <Stack.Screen name="practitioner/chat" />
      <Stack.Screen name="practitioner/diagnosis" />
      <Stack.Screen name="practitioner/withdraw" />
      <Stack.Screen name="practitioner/bank-account" />
      <Stack.Screen name="practitioner/history" />
      <Stack.Screen name="practitioner/profile" />
    </Stack>
  );
}

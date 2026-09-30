import React, { useEffect } from "react";
import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useSegments,
} from "expo-router";
import { colors } from "@/theme/colors";
import { AuthLoadingState } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";

export default function PatientLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { guest } = useLocalSearchParams<{ guest?: string }>();
  const { status, user, hasRole, homeRoute } = useAuth();
  const leafSegment = segments[segments.length - 1];
  const isPublicGuestRoute =
    guest === "true" &&
    (leafSegment === "triage" || leafSegment === "assessment-result");
  const redirectRoute = isPublicGuestRoute
    ? null
    : status === "loading"
      ? null
      : status === "unauthenticated" || !user
        ? ROUTES.AUTH.LOGIN
        : !hasRole("patient")
          ? (homeRoute ?? ROUTES.AUTH.LOGIN)
          : null;

  useEffect(() => {
    if (redirectRoute) {
      router.replace(redirectRoute as any);
    }
  }, [redirectRoute, router]);

  if (!isPublicGuestRoute && (status === "loading" || redirectRoute)) {
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
      <Stack.Screen name="patient/dashboard" />
      <Stack.Screen name="patient/triage" />
      <Stack.Screen name="patient/matching" />
      <Stack.Screen name="patient/checkout" />
      <Stack.Screen name="patient/payment-regular" />
      <Stack.Screen name="patient/payment-bpjs" />
      <Stack.Screen name="patient/chat-room" />
      <Stack.Screen name="patient/overtime-modal" />
      <Stack.Screen name="patient/rating" />
      <Stack.Screen name="patient/history" />
      <Stack.Screen name="patient/articles" />
      <Stack.Screen name="patient/article-detail" />
      <Stack.Screen name="patient/assessment-result" />
      <Stack.Screen name="patient/doctors" />
      <Stack.Screen name="patient/doctor-detail" />
      <Stack.Screen name="patient/edit-profile" />
      <Stack.Screen name="patient/notifications" />
      <Stack.Screen name="patient/profile" />
      <Stack.Screen name="patient/prescription" />
      <Stack.Screen name="patient/referral" />
      <Stack.Screen name="patient/session-summary" />
      <Stack.Screen name="patient/video-call" />
    </Stack>
  );
}

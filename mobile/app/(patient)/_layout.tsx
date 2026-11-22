import React, { useEffect } from "react";
import {
  Stack,
  useGlobalSearchParams,
  useRouter,
  useSegments,
} from "expo-router";
import { colors } from "@/theme/colors";
import { AuthLoadingState } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { usePatientProfile } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function PatientLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { guest, preview } = useGlobalSearchParams<{
    guest?: string;
    preview?: string;
  }>();
  const { status, user, hasRole, homeRoute } = useAuth();
  const leafSegment = segments[segments.length - 1];

  const isPublicGuestRoute =
    (guest === "true" || preview === "true" || Boolean(__DEV__)) &&
    (leafSegment === "dashboard" ||
      leafSegment === "profile" ||
      leafSegment === "edit-profile" ||
      leafSegment === "triage" ||
      leafSegment === "assessment-result" ||
      leafSegment === "checkout" ||
      leafSegment === "payment-regular" ||
      leafSegment === "payment-bpjs" ||
      leafSegment === "chat-room" ||
      leafSegment === "overtime-modal" ||
      leafSegment === "session-summary" ||
      leafSegment === "follow-ups" ||
      leafSegment === "history" ||
      leafSegment === "refunds" ||
      leafSegment === "community" ||
      leafSegment === "community-detail" ||
      (leafSegment as string) === "self-screening" ||
      (leafSegment as string) === "notifications" ||
      (leafSegment as string) === "help" ||
      (leafSegment as string) === "security");

  const isPublicPreview = isPublicGuestRoute;

  const {
    data: patientProfile,
    isError: isProfileError,
    error: profileError,
  } = usePatientProfile();

  const isProfileNotFound =
    isProfileError &&
    profileError instanceof ApiError &&
    profileError.statusCode === 404;

  const authRedirectRoute = isPublicPreview
    ? null
    : status === "loading"
      ? null
      : status === "unauthenticated" || !user
        ? ROUTES.AUTH.LOGIN
        : !hasRole("patient")
          ? (homeRoute ?? ROUTES.AUTH.LOGIN)
          : null;

  const onboardingRedirectRoute =
    !isPublicPreview && status === "authenticated" && hasRole("patient")
      ? patientProfile && leafSegment === "onboarding"
        ? ROUTES.PATIENT.DASHBOARD
        : null
      : null;

  const redirectRoute = authRedirectRoute ?? onboardingRedirectRoute;

  useEffect(() => {
    if (redirectRoute) {
      router.replace(redirectRoute as any);
    }
  }, [redirectRoute, router]);

  if (!isPublicPreview && (status === "loading" || redirectRoute)) {
    return <AuthLoadingState />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.sage.DEFAULT },
        animation: "slide_from_right",
        freezeOnBlur: false,
      }}
    >
      <Stack.Screen name="patient/onboarding" />
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
      <Stack.Screen name="patient/assessment-result" />
      <Stack.Screen name="patient/doctors" />
      <Stack.Screen name="patient/doctor-detail" />
      <Stack.Screen name="patient/edit-profile" />
      <Stack.Screen name="patient/profile" />
      <Stack.Screen name="patient/prescription" />
      <Stack.Screen name="patient/referral" />
      <Stack.Screen name="patient/session-summary" />
      <Stack.Screen name="patient/video-call" />
      <Stack.Screen name="patient/community" />
      <Stack.Screen name="patient/community-detail" />
      <Stack.Screen name="patient/follow-ups" />
      <Stack.Screen name="patient/self-screening" />
      <Stack.Screen name="patient/notifications" />
      <Stack.Screen name="patient/help" />
      <Stack.Screen name="patient/security" />
    </Stack>
  );
}

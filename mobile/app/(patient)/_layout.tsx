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
  const { guest } = useGlobalSearchParams<{ guest?: string }>();
  const { status, user, hasRole, homeRoute } = useAuth();
  const leafSegment = segments[segments.length - 1];
  const isPublicGuestRoute =
    guest === "true" &&
    (leafSegment === "triage" || leafSegment === "assessment-result");

  const {
    data: patientProfile,
    isError: isProfileError,
    error: profileError,
  } = usePatientProfile();

  const isProfileNotFound =
    isProfileError &&
    profileError instanceof ApiError &&
    profileError.statusCode === 404;

  const authRedirectRoute = isPublicGuestRoute
    ? null
    : status === "loading"
      ? null
      : status === "unauthenticated" || !user
        ? ROUTES.AUTH.LOGIN
        : !hasRole("patient")
          ? (homeRoute ?? ROUTES.AUTH.LOGIN)
          : null;

  const onboardingRedirectRoute =
    !isPublicGuestRoute && status === "authenticated" && hasRole("patient")
      ? isProfileNotFound && leafSegment !== "onboarding"
        ? ROUTES.PATIENT.ONBOARDING
        : patientProfile && leafSegment === "onboarding"
          ? ROUTES.PATIENT.DASHBOARD
          : null
      : null;

  const redirectRoute = authRedirectRoute ?? onboardingRedirectRoute;

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
      <Stack.Screen name="patient/courses" />
      <Stack.Screen name="patient/course-detail" />
      <Stack.Screen name="patient/community" />
      <Stack.Screen name="patient/community-detail" />
      <Stack.Screen name="patient/follow-ups" />
    </Stack>
  );
}

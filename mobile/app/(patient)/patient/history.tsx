import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import {
  SessionListView,
  SessionDetailView,
  UpcomingScheduleView,
  type SessionItem,
} from "@/components/patient/history";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import { usePatientConsultations } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function HistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; consultationId?: string }>();
  
  // Navigation view mode: "list" (RW1) | "detail" (RW2) | "upcoming" (RW3)
  const initialView =
    params.step === "detail" ? "detail" : params.step === "upcoming" ? "upcoming" : "list";
  const [currentView, setCurrentView] = useState<"list" | "detail" | "upcoming">(initialView);
  const [activeTab, setActiveTab] = useState<"berlangsung" | "selesai">("berlangsung");
  const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);

  const consultations = usePatientConsultations();
  const sessionData = consultations.data ?? [];

  // Map API consultations to SessionItem if available
  const mappedSessions: SessionItem[] = sessionData.map((s) => ({
    id: s.id,
    practitionerName: s.practitionerName || "dr. Alivia Zahra, Sp.KJ",
    practitionerSpecialization: s.practitionerSpecialization || "Psikiater Klinis Dewasa",
    date: s.createdAt ? new Date(s.createdAt).toLocaleDateString("id-ID") : "18 Nov 2026",
    status: (s.status as any) || "FINISHED",
    format: "Chat",
    resultAvailable: s.status === "FINISHED",
    followUpAvailable: true,
  }));

  const activeSessionItem = mappedSessions.find(
    (s) => s.status === "ACTIVE" || s.status === "WAITING",
  );
  const completedSessionsList = mappedSessions.filter(
    (s) => s.status === "FINISHED",
  );

  const handleSelectSession = (session: SessionItem) => {
    haptics.selection();
    setSelectedSession(session);
    setCurrentView("detail");
  };

  const handleViewStatus = (session?: SessionItem | null) => {
    haptics.medium();
    if (session?.status === "WAITING") {
      router.push(ROUTES.PATIENT.MATCHING as never);
    } else {
      router.push({
        pathname: ROUTES.PATIENT.CHAT_ROOM,
        params: { consultationId: session?.id || "active-session" },
      } as never);
    }
  };

  const handleViewUpcoming = () => {
    haptics.selection();
    setCurrentView("upcoming");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* View 1: Screen 52 (RW1 · Sesi: daftar) */}
      {currentView === "list" && (
        <Box className="flex-1">
          <SessionListView
            activeTab={activeTab}
            onTabChange={setActiveTab}
            activeSession={activeSessionItem}
            completedSessions={completedSessionsList}
            onSelectSession={handleSelectSession}
            onViewStatus={handleViewStatus}
            onViewUpcomingSchedule={handleViewUpcoming}
          />
          <PatientTabBar activeTab="sesi" />
        </Box>
      )}

      {/* View 2: Screen 53 (RW2 · Detail sesi) */}
      {currentView === "detail" && (
        <SessionDetailView
          session={selectedSession}
          onBack={() => {
            haptics.light();
            setCurrentView("list");
          }}
          onViewResults={() => {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.SESSION_SUMMARY,
              params: {
                consultationId: selectedSession?.id || "detail-session",
              },
            } as never);
          }}
          onScheduleFollowUp={() => {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.FOLLOW_UPS,
              params: { step: "picker" },
            } as never);
          }}
          onRequestRefund={() => {
            haptics.light();
            router.push({
              pathname: ROUTES.PATIENT.REFUNDS,
              params: {
                step: "request",
                consultationId: selectedSession?.id || "detail-session",
              },
            } as never);
          }}
        />
      )}

      {/* View 3: Screen 54 (RW3 · Jadwal mendatang & ubah jadwal) */}
      {currentView === "upcoming" && (
        <UpcomingScheduleView
          onBack={() => {
            haptics.light();
            setCurrentView("list");
          }}
          onEnterSession={() => {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.CHAT_ROOM,
              params: { consultationId: "upcoming-confirmed" },
            } as never);
          }}
          onReschedule={() => {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.FOLLOW_UPS,
              params: { step: "picker" },
            } as never);
          }}
          onPayPendingSession={() => {
            haptics.medium();
            router.push({
              pathname: ROUTES.PATIENT.PAYMENT_REGULAR,
              params: { consultationId: "pending-order" },
            } as never);
          }}
          onContactSupport={() => {
            haptics.selection();
            router.push(ROUTES.PATIENT.HELP as any);
          }}
        />
      )}
    </SafeAreaView>
  );
}

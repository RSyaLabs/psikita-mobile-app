import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import { PractitionerTabBar } from "@/components/navigation/PractitionerTabBar";
import {
  PractitionerSessionLobbyView,
  PractitionerLiveRoomView,
  PatientContextView,
  RequestAssessmentView,
  AssessmentAnswersView,
  SessionNotesView,
  SessionDisconnectedView,
  EndSessionConfirmView,
} from "@/components/practitioner/session";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils";

type SessionView =
  | "lobby"
  | "room"
  | "context"
  | "request-assessment"
  | "assessment-answers"
  | "notes"
  | "disconnected"
  | "end-session";

export default function PractitionerChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    view?: SessionView;
    consultationId?: string;
  }>();

  const initialView: SessionView =
    params.view || (params.consultationId ? "room" : "lobby");
  const [activeView, setActiveView] = useState<SessionView>(initialView);
  const [consultationId, setConsultationId] = useState<string>(
    params.consultationId || "active-consultation-siti",
  );

  const handleEnterSession = (id: string) => {
    haptics.light();
    setConsultationId(id);
    setActiveView("room");
  };

  const handleCompleteResult = (id: string) => {
    haptics.light();
    router.push({
      pathname: ROUTES.PRACTITIONER.DIAGNOSIS,
      params: { consultationId: id },
    } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <Box className="flex-1">
        {activeView === "lobby" && (
          <PractitionerSessionLobbyView
            onEnterSession={handleEnterSession}
            onCompleteResult={handleCompleteResult}
            onViewPendingPayment={handleEnterSession}
          />
        )}

        {activeView === "room" && (
          <PractitionerLiveRoomView
            onBack={() => setActiveView("lobby")}
            onOpenContext={() => setActiveView("context")}
            onOpenRequestAssessment={() => setActiveView("request-assessment")}
            onOpenNotes={() => setActiveView("notes")}
            onViewAssessmentAnswers={() => setActiveView("assessment-answers")}
            onEndSession={() => setActiveView("end-session")}
          />
        )}

        {activeView === "context" && (
          <PatientContextView onBack={() => setActiveView("room")} />
        )}

        {activeView === "request-assessment" && (
          <RequestAssessmentView
            onSendAssessment={() => {
              haptics.success();
              setActiveView("room");
            }}
            onCancel={() => setActiveView("room")}
          />
        )}

        {activeView === "assessment-answers" && (
          <AssessmentAnswersView
            onTransferToNotes={() => setActiveView("notes")}
            onBack={() => setActiveView("room")}
          />
        )}

        {activeView === "notes" && (
          <SessionNotesView
            onSaveAndClose={() => {
              haptics.light();
              setActiveView("room");
            }}
          />
        )}

        {activeView === "disconnected" && (
          <SessionDisconnectedView
            onReconnect={() => setActiveView("room")}
            onBack={() => setActiveView("lobby")}
          />
        )}

        {activeView === "end-session" && (
          <EndSessionConfirmView
            onConfirmEndAndFillResults={() => {
              haptics.success();
              router.push({
                pathname: ROUTES.PRACTITIONER.DIAGNOSIS,
                params: { consultationId },
              } as never);
            }}
            onResumeSession={() => setActiveView("room")}
          />
        )}
      </Box>

      {activeView === "lobby" && (
        <PractitionerTabBar activeTab="sesi" />
      )}
    </SafeAreaView>
  );
}

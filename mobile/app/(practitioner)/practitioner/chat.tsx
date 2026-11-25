import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
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
import {
  useConsultations,
  useActiveConsultation,
  useConsultationNotes,
  useCreateSoapNote,
} from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";
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
    id?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";
  const paramId = params.consultationId || params.id;
  const initialView: SessionView =
    params.view || (paramId ? "room" : "lobby");
  const [activeView, setActiveView] = useState<SessionView>(initialView);
  const [consultationId, setConsultationId] = useState<string>(
    paramId || (isGuest ? "active-consultation-siti" : ""),
  );

  useEffect(() => {
    if (params.view) {
      setActiveView(params.view);
    } else if (paramId) {
      setActiveView("room");
    }
  }, [params.view, paramId]);

  useEffect(() => {
    if (paramId) {
      setConsultationId(paramId);
    }
  }, [paramId]);

  const consultationsQuery = useConsultations();
  const activeConsultationId =
    consultationId || consultationsQuery.data?.[0]?.id || "";
  const activeConsultation = useActiveConsultation(activeConsultationId || undefined);
  const notesQuery = useConsultationNotes(activeConsultationId);
  const soapMutation = useCreateSoapNote();

  const currentPatientName =
    consultationsQuery.data?.find((c) => c.id === activeConsultationId)?.patientName ||
    (isGuest ? "Siti Rahma" : "Pasien Sesi");

  const handleEnterSession = (id: string) => {
    haptics.light();
    setConsultationId(id);
    setActiveView("room");
  };

  const handleCompleteResult = (id: string) => {
    haptics.light();
    router.push({
      pathname: ROUTES.PRACTITIONER.DIAGNOSIS,
      params: { consultationId: id || activeConsultationId },
    } as never);
  };

  const handleSaveNotes = async (notesText: string) => {
    if (isGuest) {
      haptics.light();
      setActiveView("room");
      return;
    }

    const context = activeConsultation.context;
    if (!context) {
      haptics.error();
      Alert.alert("Sesi Belum Aktif", "Pilih sesi aktif sebelum menyimpan catatan klinis.");
      return;
    }

    try {
      await soapMutation.mutateAsync({
        context,
        dto: {
          subjective: notesText.trim() || "Catatan sesi berlangsung",
          objective: "Observasi klinis dalam sesi",
          assessment: "Dalam evaluasi",
          plan: "Tindak lanjut sesuai rencana sesi",
        },
      });
      haptics.success();
      setActiveView("room");
    } catch (err: unknown) {
      haptics.error();
      Alert.alert(
        "Gagal Menyimpan Catatan",
        err instanceof ApiError
          ? err.message
          : "Catatan klinis belum tersimpan ke server.",
      );
    }
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
            patientName={currentPatientName}
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
              if (!isGuest && !activeConsultation.context) {
                haptics.error();
                Alert.alert("Sesi Belum Aktif", "Pilih konsultasi aktif untuk mengirim asesmen.");
                return;
              }
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
            initialNotes={notesQuery.data?.[0]?.soap?.subjective || ""}
            onSaveAndClose={(notesText) => {
              void handleSaveNotes(notesText);
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
                params: {
                  consultationId: activeConsultationId,
                  ...(isGuest ? { guest: "true" } : {}),
                },
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

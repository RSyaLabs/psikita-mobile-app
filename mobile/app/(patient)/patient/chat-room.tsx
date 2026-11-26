import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import {
  Box,
  Heading,
  Text,
  HStack,
  Card,
  Button,
  ButtonText,
  ButtonSpinner,
  ScrollView,
} from "@/components/ui";
import {
  ChatHeaderBar,
  ChatMessageBubble,
  ChatMessageItem,
  ChatAssessmentPromptCard,
  ChatInputBar,
  InSessionAssessmentModal,
  SessionOvertimeSheet,
} from "@/components/patient/chat";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useFinishConsultation,
  useRoomMessages,
  usePractitioner,
} from "@/hooks/useApiQueries";
import { haptics, safeNavigateBack, formatMessageTime } from "@/utils";

export default function ChatRoomScreen() {
  const router = useRouter();
  const {
    consultationId: routeConsultationId,
    mode,
    guest,
  } = useLocalSearchParams<{
    consultationId?: string;
    mode?: string;
    guest?: string;
  }>();

  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;

  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const messagesQuery = useRoomMessages(context?.roomId, context?.status);
  const finishMutation = useFinishConsultation();

  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const finishInFlightRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // In-session sub-screens state
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(mode === "assessment");
  const [isAssessmentCompleted, setIsAssessmentCompleted] = useState(false);
  const [isOvertimeOpen, setIsOvertimeOpen] = useState(mode === "overtime");

  // Local message state for immediate user interactivity
  const [localMessages, setLocalMessages] = useState<ChatMessageItem[]>([]);
  const isGuest = guest === "true";

  const practitioner = usePractitioner(context?.practitionerId);
  const practitionerName = practitioner.data?.fullName || "Psikolog Sesi";

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
  };

  const handleSendMessage = (text: string) => {
    if (!isGuest) {
      haptics.error();
      Alert.alert(
        "Layanan Chat Real-Time Belum Tersambung",
        "Koneksi pesan langsung sedang disiapkan. Gunakan sesi video atau segarkan percakapan secara berkala.",
      );
      return;
    }
    const newMessage: ChatMessageItem = {
      id: "msg-" + Date.now(),
      senderRole: "PATIENT",
      content: text,
      statusLabel: "Terkirim",
      timestamp: formatMessageTime(new Date().toISOString()),
    };
    setLocalMessages((prev) => [...prev, newMessage]);
  };

  const handleFinish = () => {
    if (!context) {
      setShowFinishDialog(false);
      router.push({
        pathname: ROUTES.PATIENT.SESSION_SUMMARY,
        params: { consultationId: consultationId || "" },
      } as any);
      return;
    }

    if (finishInFlightRef.current) return;
    finishInFlightRef.current = true;
    setIsFinishing(true);

    finishMutation.mutate(context, {
      onSuccess: () => {
        setShowFinishDialog(false);
        router.push({
          pathname: ROUTES.PATIENT.SESSION_SUMMARY,
          params: { consultationId: context.consultationId },
        } as any);
      },
      onSettled: () => {
        finishInFlightRef.current = false;
        setIsFinishing(false);
      },
      onError: () => haptics.error(),
    });
  };

  const serverMessages: ChatMessageItem[] =
    messagesQuery.data?.map((m) => ({
      id: m.id,
      senderRole: m.senderRole,
      content: m.content || "Pesan terenkripsi",
      timestamp: formatMessageTime(m.createdAt),
      statusLabel: m.senderRole === "PATIENT" ? "Terkirim" : undefined,
    })) || [];

  const displayMessages =
    serverMessages.length > 0
      ? [...serverMessages, ...localMessages]
      : [
          {
            id: "system-empty",
            senderRole: "SYSTEM" as const,
            content: "Belum ada riwayat pesan pada sesi konsultasi ini.",
          },
          ...localMessages,
        ];

  const remainingLabel = consultation.data?.durationMinutes
    ? `${consultation.data.durationMinutes}:00`
    : "--:--";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 max-w-[640px] md:max-w-[720px] self-center w-full"
      >
        {/* Screen 43: Canonical Chat Header */}
        <ChatHeaderBar
          practitionerName={practitionerName}
          timeRemaining={remainingLabel}
          onBack={handleBack}
          onOpenOvertime={() => setIsOvertimeOpen(true)}
          onVoiceCall={() => {
            haptics.selection();
            router.push(
              (context?.consultationId || consultationId
                ? {
                    pathname: ROUTES.PATIENT.VIDEO_CALL,
                    params: {
                      consultationId: context?.consultationId || consultationId,
                    },
                  }
                : ROUTES.PATIENT.VIDEO_CALL) as any,
            );
          }}
          onVideoCall={() => {
            haptics.selection();
            router.push(
              (context?.consultationId || consultationId
                ? {
                    pathname: ROUTES.PATIENT.VIDEO_CALL,
                    params: {
                      consultationId: context?.consultationId || consultationId,
                    },
                  }
                : ROUTES.PATIENT.VIDEO_CALL) as any,
            );
          }}
        />

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 14, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Messages list */}
          {displayMessages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}

          {/* Screen 43: In-Session Assessment prompt card */}
          <ChatAssessmentPromptCard
            isCompleted={isAssessmentCompleted}
            onOpenAssessment={() => setIsAssessmentOpen(true)}
          />

          {/* Quick End-Session Action */}
          <Box className="self-center mt-3 mb-2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowFinishDialog(true)}
              className="border-border rounded-xl px-4 active:bg-muted"
            >
              <ButtonText className="text-sm font-semibold text-muted-foreground">
                Akhiri sesi konsultasi
              </ButtonText>
            </Button>
          </Box>
        </ScrollView>

        {/* Screen 43: Canonical Chat Input Bar */}
        <ChatInputBar
          placeholder="Tulis pesan..."
          onSendMessage={handleSendMessage}
          onAttach={() => haptics.light()}
        />

        {/* Screen 44: In-Session Clinical Assessment Modal */}
        <InSessionAssessmentModal
          isOpen={isAssessmentOpen}
          practitionerName={practitionerName}
          onClose={() => setIsAssessmentOpen(false)}
          onSubmitAnswers={() => {
            setIsAssessmentCompleted(true);
            setIsAssessmentOpen(false);
            haptics.success();
          }}
        />

        {/* Screen 45: Perpanjang Sesi Sheet */}
        <SessionOvertimeSheet
          isOpen={isOvertimeOpen}
          timeRemaining="05:00"
          practitionerName={practitionerName}
          rate15Label="Rp 25.000"
          rate30Label="Rp 45.000"
          onClose={() => setIsOvertimeOpen(false)}
          onProceedToPayment={(minutes) => {
            setIsOvertimeOpen(false);
            router.push({
              pathname: ROUTES.PATIENT.CHECKOUT,
              params: {
                consultationId: consultationId || "",
                overtime: String(minutes),
                guest: guest || "true",
              },
            } as any);
          }}
          onEndSessionOnTime={() => {
            setIsOvertimeOpen(false);
            setShowFinishDialog(true);
          }}
        />

        {/* Confirmation Dialog: Akhiri Sesi? */}
        {showFinishDialog && (
          <Box className="absolute inset-0 bg-black/40 items-center justify-center p-5 z-50">
            <Card className="bg-card rounded-3xl p-5 border border-border w-full max-w-[420px]">
              <Heading size="md" bold className="text-foreground text-lg">
                Akhiri sesi?
              </Heading>
              <Text className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Sesi hanya ditandai selesai setelah server mengonfirmasi respons.
              </Text>
              <HStack space="sm" className="mt-5">
                <Button
                  variant="outline"
                  onPress={() => setShowFinishDialog(false)}
                  className="flex-1 rounded-xl h-11"
                >
                  <ButtonText className="text-sm font-semibold text-foreground">
                    Batal
                  </ButtonText>
                </Button>
                <Button
                  onPress={handleFinish}
                  isDisabled={isFinishing}
                  className="flex-1 rounded-xl h-11 bg-primary"
                >
                  {isFinishing ? (
                    <ButtonSpinner />
                  ) : (
                    <ButtonText className="text-sm font-semibold text-primary-foreground">
                      Konfirmasi
                    </ButtonText>
                  )}
                </Button>
              </HStack>
            </Card>
          </Box>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

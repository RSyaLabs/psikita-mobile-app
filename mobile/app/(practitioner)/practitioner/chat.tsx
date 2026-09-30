import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, FileText, Info, ShieldAlert } from "lucide-react-native";
import {
  Alert,
  AlertIcon,
  AlertText,
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { isDemoMode } from "@/config/demoMode";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useRoomMessages,
  useTriageAssessment,
} from "@/hooks/useApiQueries";
import { haptics, safeNavigateBack, formatMessageTime } from "@/utils";

export default function PractitionerChatScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  // Single gate for demo-only affordances. The raw env flag is never read in
  // this screen: isDemoMode() already covers both flags.
  const demoMode = isDemoMode();
  // Route value only. No invented consultation id: without one the screen says
  // so instead of opening a room for a consultation that does not exist.
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const messagesQuery = useRoomMessages(context?.roomId, context?.status);
  // The consultation context carries no triage id, so nothing is fetched rather
  // than guessing one. The summary card falls back to honest copy.
  const { data: triage } = useTriageAssessment();

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-card px-4 py-3 border-b border-border">
        <HStack space="md" className="items-center justify-between">
          <HStack space="sm" className="items-center flex-1">
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="p-1 -ml-1"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </Pressable>
            <VStack space="xs" className="flex-1">
              <Heading size="sm" bold className="text-foreground">
                Konsultasi
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                {context
                  ? `Status server: ${context.status}`
                  : "Konteks server belum tersedia"}
              </Text>
            </VStack>
          </HStack>
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {!context && (
          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            <HStack space="sm" className="items-center">
              <ShieldAlert size={18} className="text-destructive" />
              <Heading size="sm" bold className="text-foreground">
                Sesi belum tersedia
              </Heading>
            </HStack>
            <Text size="sm" className="text-muted-foreground">
              Practitioner chat membutuhkan consultation ID dan room ID dari
              respons server.
            </Text>
            {demoMode && (
              <Text size="sm" className="text-muted-foreground">
                Mode demo: tidak ada ID yang dikarang di layar ini. Telusuri
                alur lewat deep-link dengan consultation ID asli, misalnya{" "}
                {ROUTES.PRACTITIONER.CHAT}?consultationId=...
              </Text>
            )}
            {consultation.isError && (
              <Alert action="error">
                <AlertIcon />
                <AlertText>Detail konsultasi tidak dapat dimuat.</AlertText>
              </Alert>
            )}
          </Card>
        )}

        {context && (
          <VStack space="sm">
            <Card className="bg-muted rounded-2xl p-3 border border-border gap-1">
              <HStack space="xs" className="items-center">
                <Info size={14} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Ringkasan triase
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground">
                {triage?.notes
                  ? `${triage.notes} (Skor: ${triage.score}, Level: ${triage.level})`
                  : "Ringkasan klinis tambahan belum tersedia pada konteks konsultasi ini."}
              </Text>
            </Card>

            {messagesQuery.isLoading && (
              <Text size="sm" className="text-muted-foreground text-center">
                Memuat riwayat…
              </Text>
            )}
            {messagesQuery.isError && (
              <Alert action="error">
                <AlertIcon />
                <AlertText>Riwayat chat tidak dapat dimuat.</AlertText>
              </Alert>
            )}
            {!messagesQuery.isLoading &&
              !messagesQuery.isError &&
              messagesQuery.data?.length === 0 && (
                <Text size="sm" className="text-muted-foreground text-center">
                  Belum ada pesan yang dapat ditampilkan.
                </Text>
              )}
            {messagesQuery.data?.map((message) => (
              <Box
                key={message.id}
                className={`rounded-2xl p-3 border ${
                  message.senderRole === "SYSTEM" ||
                  message.senderRole === "UNKNOWN"
                    ? "bg-muted border-border"
                    : message.senderRole === "PRACTITIONER"
                      ? "bg-primary self-end"
                      : "bg-card border-border self-start"
                }`}
              >
                {message.senderRole === "SYSTEM" && (
                  <Text size="xs" bold className="text-foreground">
                    SYSTEM
                  </Text>
                )}
                <Text
                  size="xs"
                  className={
                    message.senderRole === "PRACTITIONER"
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }
                >
                  {message.content || "Pesan terenkripsi"}
                </Text>
                {/*
                 * Follows the same sender-dependent colour as the message text
                 * above it. It was unconditionally muted, which painted a
                 * light-surface foreground onto the sender's own dark bubble.
                 */}
                <Text
                  size="xs"
                  className={
                    message.senderRole === "PRACTITIONER"
                      ? "text-primary-foreground mt-1"
                      : "text-muted-foreground mt-1"
                  }
                >
                  {formatMessageTime(message.createdAt)}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>

      <Box className="p-4 border-t border-border bg-card gap-2">
        <Button
          variant="outline"
          isDisabled={!context}
          onPress={() => {
            if (!context) {
              haptics.error();
              return;
            }
            router.push({
              pathname: ROUTES.PRACTITIONER.DIAGNOSIS,
              params: { consultationId: context.consultationId },
            } as never);
          }}
          className="w-full rounded-xl border-border"
        >
          <FileText size={16} className="text-foreground" />
          <ButtonText className="text-foreground">
            Buka catatan klinis
          </ButtonText>
        </Button>
        {/*
         * Same disabled-treatment change as the PDF button on the session
         * summary: Gluestack fades the whole control to 0.4, which drags the
         * label toward the page behind it (measured 1.37:1) whichever foreground
         * is chosen. Dimming the surface rather than the label keeps an
         * unavailable action readable.
         */}
        <Button
          isDisabled
          className="w-full rounded-xl bg-muted border border-border !opacity-100"
          onPress={() => haptics.error()}
        >
          <ShieldAlert size={16} className="text-muted-foreground" />
          <ButtonText className="text-muted-foreground">
            Eskalasi krisis belum tersedia
          </ButtonText>
        </Button>
      </Box>
    </SafeAreaView>
  );
}

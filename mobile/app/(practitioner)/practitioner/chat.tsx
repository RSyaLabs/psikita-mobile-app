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
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useRoomMessages,
  useTriageAssessment,
  useConsultationAssessments,
  useConsultationPatientAssessments,
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
  // Route value only. No invented consultation id: without one the screen says
  // so instead of opening a room for a consultation that does not exist.
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const messagesQuery = useRoomMessages(context?.roomId, context?.status);
  const assessments = useConsultationAssessments(context?.consultationId, context?.status === "ACTIVE");
  const patientEvidence = useConsultationPatientAssessments(context?.consultationId);
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
              <ArrowLeft size={22} color="#262130" />
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

            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Heading size="sm" className="text-foreground">Asesmen konsultasi</Heading>
                {context.status === "ACTIVE" ? (
                  <Button
                    size="sm"
                    onPress={() => router.push({
                      pathname: ROUTES.PRACTITIONER.SEND_ASSESSMENT,
                      params: { consultationId: context.consultationId },
                    } as never)}
                    className="rounded-xl"
                  >
                    <ButtonText>Kirim Asesmen</ButtonText>
                  </Button>
                ) : null}
              </HStack>
              {assessments.isError ? (
                <Text className="text-sm text-destructive">Daftar asesmen belum tersedia.</Text>
              ) : null}
              {assessments.data?.map(item => (
                <Card key={item.id} className="rounded-xl bg-card border border-border p-4">
                  <HStack className="items-center justify-between">
                    <VStack space="xs" className="flex-1">
                      <Text className="font-semibold text-foreground">{item.typeCode} · v{item.typeVersion}</Text>
                      <Text size="xs" className="text-muted-foreground">
                        {item.status === "COMPLETED" ? "Selesai" : "Menunggu jawaban pasien"}
                      </Text>
                    </VStack>
                    {item.status === "COMPLETED" && item.totalScore !== null ? (
                      <Text className="font-bold text-foreground">Skor {item.totalScore}</Text>
                    ) : null}
                  </HStack>
                  {item.status === "COMPLETED" && item.hasRedFlags === true ? (
                    <Text className="text-sm font-semibold text-destructive">Perlu peninjauan keselamatan klinis</Text>
                  ) : null}
                </Card>
              ))}
            </VStack>
            <VStack space="sm">
              <Heading size="sm" className="text-foreground">Riwayat asesmen mandiri pasien</Heading>
              <Text size="xs" className="text-muted-foreground">
                Data pendukung untuk penilaian klinis; tidak menentukan Triage atau diagnosis secara otomatis.
              </Text>
              {patientEvidence.isError ? (
                <Text size="xs" className="text-muted-foreground">
                  Riwayat asesmen tidak tersedia untuk konsultasi ini.
                </Text>
              ) : null}
              {patientEvidence.data?.map(item => (
                <Card key={item.id} className="rounded-xl bg-card border border-border p-3">
                  <HStack className="items-center justify-between">
                    <VStack space="xs" className="flex-1">
                      <Text className="font-semibold text-foreground">{item.typeCode} · v{item.typeVersion}</Text>
                      <Text size="xs" className="text-muted-foreground">
                        {item.completedAt ? new Date(item.completedAt).toLocaleDateString("id-ID") : "Tanggal belum tersedia"}
                      </Text>
                    </VStack>
                    <Text className="text-foreground font-semibold">
                      {item.totalScore === null ? "Tanpa skor total" : `Skor ${item.totalScore}`}
                    </Text>
                  </HStack>
                  {item.hasRedFlags ? (
                    <Text className="text-destructive text-sm font-semibold mt-2">
                      Indikator risiko perlu ditinjau oleh praktisi sesuai protokol keselamatan.
                    </Text>
                  ) : null}
                </Card>
              ))}
              {!patientEvidence.isLoading && !patientEvidence.isError && patientEvidence.data?.length === 0 ? (
                <Text size="xs" className="text-muted-foreground">Belum ada asesmen mandiri yang selesai.</Text>
              ) : null}
            </VStack>
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

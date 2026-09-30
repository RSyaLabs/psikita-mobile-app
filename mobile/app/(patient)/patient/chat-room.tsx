import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Lock,
  MessageSquare,
  ShieldAlert,
} from "lucide-react-native";
import {
  Alert,
  AlertIcon,
  AlertText,
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonSpinner,
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
  useFinishConsultation,
  useRoomMessages,
} from "@/hooks/useApiQueries";
import { haptics, safeNavigateBack, formatMessageTime } from "@/utils";

export default function ChatRoomScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  // Route value only. No invented consultation id: substituting one would open
  // a room for a consultation the server never issued and make the screen look
  // like it had server data. A demo deep-link still works, it just has to carry
  // ?consultationId=... like any other entry point.
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const messagesQuery = useRoomMessages(context?.roomId, context?.status);
  const finishMutation = useFinishConsultation();
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  // Latch for the finish action, so a double tap cannot post twice.
  const finishInFlightRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(
      router,
      context ? ROUTES.PATIENT.CHAT_ROOM : ROUTES.PATIENT.DASHBOARD,
    );
  };

  const handleFinish = () => {
    if (!context) {
      haptics.error();
      return;
    }
    // Latch the submit so a second tap cannot fire a second request. The other
    // guarded writes in this app use the same shape (see payment-regular.tsx).
    if (finishInFlightRef.current) return;
    finishInFlightRef.current = true;
    setIsFinishing(true);
    finishMutation.mutate(context, {
      onSuccess: () => {
        setShowFinishDialog(false);
        router.push({
          pathname: ROUTES.PATIENT.RATING,
          params: { consultationId: context.consultationId },
        } as never);
      },
      onSettled: () => {
        finishInFlightRef.current = false;
        setIsFinishing(false);
      },
      onError: () => haptics.error(),
    });
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
                Ruang konsultasi
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                {context
                  ? `Status server: ${context.status}`
                  : "Konteks server belum tersedia"}
              </Text>
            </VStack>
          </HStack>
          {context && (
            <Badge
              variant="outline"
              className="bg-muted border-border rounded-full"
            >
              <BadgeText className="text-[10px] text-foreground">
                Read-only
              </BadgeText>
            </Badge>
          )}
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {!context && (
          <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
            <HStack space="sm" className="items-center">
              <ShieldAlert size={18} className="text-destructive" />
              <Heading size="sm" bold className="text-foreground">
                Chat belum tersedia
              </Heading>
            </HStack>
            <Text size="sm" className="text-muted-foreground">
              Room ID dan consultation ID harus berasal dari respons server.
              Route saja tidak cukup untuk mengaktifkan ruang chat.
            </Text>
            {!consultationId && (
              <Text size="sm" className="text-muted-foreground">
                Layar ini butuh consultationId dari navigasi. Buka dari daftar
                konsultasi agar ID diteruskan. Tanpa ID itu tidak ada permintaan
                ke server.
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
            <HStack space="xs" className="items-center justify-center py-2">
              <Lock size={12} className="text-muted-foreground" />
              <Text size="xs" className="text-muted-foreground">
                Riwayat terenkripsi • mode hanya baca
              </Text>
            </HStack>
            {messagesQuery.isLoading && (
              <Text size="sm" className="text-muted-foreground text-center">
                Memuat riwayat…
              </Text>
            )}
            {messagesQuery.isError && (
              <Alert action="error">
                <AlertIcon />
                <AlertText>Riwayat tidak dapat dimuat dari server.</AlertText>
              </Alert>
            )}
            {!messagesQuery.isLoading &&
              !messagesQuery.isError &&
              messagesQuery.data?.length === 0 && (
                <Text size="sm" className="text-muted-foreground text-center">
                  Belum ada pesan yang dapat ditampilkan.
                </Text>
              )}
            {messagesQuery.data?.map((message) => {
              if (message.senderRole === "SYSTEM") {
                return (
                  <Box
                    key={message.id}
                    className="bg-muted rounded-2xl p-3 border border-border"
                  >
                    <Text size="xs" bold className="text-foreground">
                      SYSTEM
                    </Text>
                    <Text size="xs" className="text-muted-foreground mt-1">
                      Event sistem terenkripsi tidak ditampilkan sebagai pesan
                      pasien/praktisi.
                    </Text>
                  </Box>
                );
              }
              return (
                <Box
                  key={message.id}
                  className={`rounded-2xl p-3 border ${
                    message.senderRole === "PRACTITIONER"
                      ? "bg-card border-border self-start"
                      : message.senderRole === "PATIENT"
                        ? "bg-secondary self-end"
                        : "bg-muted border-border"
                  }`}
                >
                  <Text
                    size="xs"
                    className={
                      message.senderRole === "PATIENT"
                        ? "text-secondary-foreground"
                        : "text-foreground"
                    }
                  >
                    {message.content || "Pesan terenkripsi"}
                  </Text>
                  {/*
                    * Same sender-dependent colour as the message text above. It was
                    * unconditionally muted, which put a light-surface foreground onto
                    * the patient's own dark bubble.
                    */}
                  <Text
                    size="xs"
                    className={
                      message.senderRole === "PATIENT"
                        ? "text-secondary-foreground mt-1"
                        : "text-muted-foreground mt-1"
                    }
                  >
                      {formatMessageTime(message.createdAt)}
                  </Text>
                </Box>
              );
            })}
          </VStack>
        )}
      </ScrollView>

      {context &&
        (context.status === "WAITING" || context.status === "ACTIVE") && (
          <Box className="p-4 border-t border-border bg-card">
            <Button
              size="lg"
              isDisabled={finishMutation.isPending}
              onPress={() => setShowFinishDialog(true)}
              className="w-full rounded-xl"
            >
              {finishMutation.isPending ? (
                <ButtonSpinner />
              ) : (
                <ButtonText>Akhiri sesi</ButtonText>
              )}
            </Button>
          </Box>
        )}

      {showFinishDialog && context && (
        <Box className="absolute inset-0 bg-black/40 items-center justify-center p-5">
          <Card className="bg-card rounded-3xl p-5 border border-border w-full">
            <Heading size="md" bold className="text-foreground">
              Akhiri sesi?
            </Heading>
            <Text size="sm" className="text-muted-foreground mt-2">
              Sesi hanya ditandai selesai setelah server mengonfirmasi respons.
            </Text>
            <HStack space="sm" className="mt-4">
              <Button
                variant="outline"
                onPress={() => setShowFinishDialog(false)}
                className="flex-1 rounded-xl"
              >
                <ButtonText>Batal</ButtonText>
              </Button>
              <Button
                onPress={handleFinish}
                isDisabled={isFinishing}
                className="flex-1 rounded-xl"
              >
                <ButtonText>
                  {isFinishing ? "Menyelesaikan..." : "Konfirmasi"}
                </ButtonText>
              </Button>
            </HStack>
          </Card>
        </Box>
      )}

      {!context && (
        <Box className="p-4 border-t border-border bg-card">
          <Button
            variant="outline"
            onPress={handleBack}
            className="w-full rounded-xl"
          >
            <MessageSquare size={16} className="text-foreground" />
            <ButtonText className="text-foreground">Kembali</ButtonText>
          </Button>
        </Box>
      )}
    </SafeAreaView>
  );
}

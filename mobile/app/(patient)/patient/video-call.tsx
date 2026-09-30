import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Video,
  VideoOff,
  SwitchCamera,
  MessageSquare,
  PhoneOff,
  ShieldCheck,
  Volume2,
} from "lucide-react-native";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Image,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { BackendIntegrationBadge } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { useActiveConsultation } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function VideoCallScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);

  const handleBack = () => {
    haptics.light();
    if (context) {
      router.push({
        pathname: ROUTES.PATIENT.CHAT_ROOM,
        params: { consultationId: context.consultationId },
      } as never);
      return;
    }
    safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
  };

  const handleEndCall = () => {
    setShowEndModal(false);
    haptics.heavy();
    router.replace(ROUTES.PATIENT.RATING as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Top Floating Control Bar */}
      <Box className="absolute top-4 left-4 right-4 z-20 flex-row items-center justify-between bg-primary/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-primary-foreground/20">
        <HStack space="xs" className="items-center">
          <Pressable
            onPress={handleBack}
            className="p-1 -ml-1 mr-2 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Kembali ke chat"
          >
            <ArrowLeft size={18} className="text-primary-foreground" />
          </Pressable>
          <Box className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <VStack space="xs">
            <Text size="xs" bold className="text-primary-foreground">
              Belum ada praktisi
            </Text>
            <HStack space="xs" className="items-center">
              <ShieldCheck size={11} className="text-secondary" />
              <Text
                size="xs"
                className="text-primary-foreground/70 text-[10px]"
              >
                Enkripsi Medis Aktif
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Box className="bg-primary/80 px-3 py-1.5 rounded-xl border border-primary-foreground/20">
          {/*
           * The panel is primary, so the label has to be the light foreground.
           * text-secondary is the dark brand green and disappeared against it.
           * The duration is not invented either. There is no call session to
           * read an elapsed time from, and a hardcoded "42:15" is a fabricated
           * clinical-looking value on a live screen.
           */}
          <Text size="xs" bold className="text-primary-foreground">
            Durasi belum tersedia
          </Text>
        </Box>
      </Box>

      {/* QA Integration Notice Bar */}
      <Box className="absolute top-20 left-4 right-4 z-20 items-center">
        <BackendIntegrationBadge
          endpoint="GET /consultations/:id/rtc-session"
          badgeText="Sesi belum tersedia • Pratinjau QA"
          className="bg-card/90"
        />
      </Box>

      {/* Main Remote Video Viewport (Doctor) */}
      <Box className="flex-1 relative overflow-hidden justify-center items-center">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&auto=format&fit=crop&q=80",
          }}
          alt="Video Feed Dokter"
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Remote Audio Indicator
            The overlay used to name "dr. Andi" while connected to nobody in
            particular, so it credited a specific person with a call that had no
            practitioner. The header above already states the honest state, so the
            indicator carries no name. */}
        <Box className="absolute bottom-28 left-5 bg-primary/85 px-3 py-1.5 rounded-xl flex-row items-center gap-2 border border-primary-foreground/20">
          <Volume2 size={14} className="text-secondary" />
          <Text size="xs" bold className="text-primary-foreground text-[11px]">
            Sesi video belum tersedia
          </Text>
        </Box>

        {/* Patient Floating Self View (PiP) */}
        <Box className="absolute top-28 right-4 w-28 h-40 bg-primary rounded-2xl overflow-hidden border-2 border-secondary z-20">
          {isVideoOn ? (
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
              }}
              alt="Video Pasien"
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Box className="w-full h-full items-center justify-center bg-primary">
              <VideoOff size={24} className="text-muted-foreground" />
              <Text
                size="xs"
                className="text-muted-foreground text-[10px] mt-1"
              >
                Kamera Mati
              </Text>
            </Box>
          )}
          <Box className="absolute bottom-1.5 left-1.5 bg-primary/80 px-1.5 py-0.5 rounded">
            <Text size="xs" bold className="text-primary-foreground text-[9px]">
              Anda
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Bottom Floating Control Bar */}
      <Box className="absolute bottom-6 left-4 right-4 z-20 bg-primary/95 backdrop-blur-md p-4 rounded-3xl border border-primary-foreground/20">
        <HStack space="md" className="items-center justify-between">
          {/* Mute Mic */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mute Mikrofon"
            onPress={() => {
              haptics.light();
              setIsMicOn(!isMicOn);
            }}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              isMicOn
                ? "bg-primary/80 border border-primary-foreground/20"
                : "bg-destructive"
            }`}
          >
            {isMicOn ? (
              <Mic size={20} className="text-primary-foreground" />
            ) : (
              <MicOff size={20} className="text-primary-foreground" />
            )}
          </Pressable>

          {/* Toggle Video */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle Video"
            onPress={() => {
              haptics.light();
              setIsVideoOn(!isVideoOn);
            }}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${
              isVideoOn
                ? "bg-primary/80 border border-primary-foreground/20"
                : "bg-destructive"
            }`}
          >
            {isVideoOn ? (
              <Video size={20} className="text-primary-foreground" />
            ) : (
              <VideoOff size={20} className="text-primary-foreground" />
            )}
          </Pressable>

          {/* Flip Camera */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Balik Kamera"
            onPress={() => haptics.light()}
            className="w-12 h-12 rounded-2xl bg-primary/80 border border-primary-foreground/20 items-center justify-center"
          >
            <SwitchCamera size={20} className="text-primary-foreground" />
          </Pressable>

          {/* Open Chat */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka Chat"
            onPress={() => {
              haptics.light();
              if (context) {
                router.push({
                  pathname: ROUTES.PATIENT.CHAT_ROOM,
                  params: { consultationId: context.consultationId },
                } as never);
              } else {
                router.push(ROUTES.PATIENT.CHAT_ROOM as never);
              }
            }}
            className="w-12 h-12 rounded-2xl bg-primary/80 border border-primary-foreground/20 items-center justify-center"
          >
            <MessageSquare size={20} className="text-primary-foreground" />
          </Pressable>

          {/* End Call Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Akhiri Panggilan"
            onPress={() => {
              haptics.medium();
              setShowEndModal(true);
            }}
            className="w-14 h-12 rounded-2xl bg-destructive items-center justify-center active:opacity-90"
          >
            <PhoneOff size={22} className="text-primary-foreground" />
          </Pressable>
        </HStack>
      </Box>

      {/* End Call Confirmation Dialog */}
      <AlertDialog isOpen={showEndModal} onClose={() => setShowEndModal(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card rounded-3xl border border-border p-5 max-w-sm mx-auto">
          <AlertDialogHeader>
            <Heading size="md" bold className="text-foreground">
              Akhiri Sesi Video?
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody className="my-2">
            <Text size="sm" className="text-muted-foreground leading-relaxed">
              Sisa waktu sesi Anda masih tersisa. Jika diakhiri, Anda akan
              diarahkan ke halaman penilaian sesi dan ringkasan medis.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="flex-row gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setShowEndModal(false)}
              className="flex-1 rounded-xl border-border"
            >
              <ButtonText className="text-foreground">
                Lanjutkan Sesi
              </ButtonText>
            </Button>
            <Button
              size="sm"
              onPress={handleEndCall}
              className="flex-1 rounded-xl bg-destructive"
            >
              <ButtonText className="text-white font-bold">Akhiri</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

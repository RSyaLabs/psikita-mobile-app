import React, { useState } from "react";
import { Alert } from "react-native";
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
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useActiveConsultation, useIceServers } from "@/hooks/useApiQueries";
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
  const { data: iceConfig, isLoading: isLoadingIce } = useIceServers(
    context?.roomId,
  );

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
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
    router.replace(
      (context?.consultationId
        ? {
            pathname: ROUTES.PATIENT.RATING,
            params: { consultationId: context.consultationId },
          }
        : ROUTES.PATIENT.RATING) as never,
    );
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
            <ArrowLeft size={22} color="#FFFFFF" />
          </Pressable>
          <Box className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <VStack space="xs">
            <Text size="sm" bold className="text-primary-foreground">
              {context ? "Praktisi Sesi Aktif" : "Menunggu Praktisi"}
            </Text>
            <HStack space="xs" className="items-center">
              <ShieldCheck size={14} color="#FFFFFF" />
              <Text
                size="sm"
                className="text-primary-foreground/90 font-medium text-sm"
              >
                Enkripsi Medis Aktif
              </Text>
            </HStack>
          </VStack>
        </HStack>

        <Box className="bg-primary/80 px-3 py-1.5 rounded-xl border border-primary-foreground/20">
          <Text size="sm" bold className="text-primary-foreground">
            {consultation.data?.durationMinutes ? `${consultation.data.durationMinutes} mnt` : "Sesi Video"}
          </Text>
        </Box>
      </Box>

      {/* Video Connection Status Pill */}
      <Box className="absolute top-20 left-4 right-4 z-20 items-center">
        <Badge
          variant="outline"
          className="border-primary-foreground/30 bg-card/90 rounded-full px-3 py-1"
        >
          <BadgeText className="text-sm font-semibold text-foreground">
            {iceConfig?.iceServers
              ? `Koneksi Video Aman (${iceConfig.iceServers.length} jalur)`
              : isLoadingIce
                ? "Menghubungkan Koneksi Video..."
                : "Sesi Video Terenkripsi"}
          </BadgeText>
        </Badge>
      </Box>

      {/* Main Remote Video Viewport (Doctor) */}
      <Box className="flex-1 relative overflow-hidden justify-center items-center bg-[#262130]">
        <VStack space="md" className="items-center px-6">
          <Box className="w-24 h-24 rounded-full bg-secondary/20 border-2 border-secondary/50 items-center justify-center">
            <Video size={40} color="#EAE5E0" />
          </Box>
          <Heading size="lg" bold className="text-white text-center">
            {context ? "Menunggu Aliran Video Praktisi" : "Ruang Video Siap"}
          </Heading>
          <Text size="sm" className="text-white/75 text-center max-w-xs">
            {iceConfig?.iceServers
              ? "Jalur panggilan video terenkripsi aktif dan siap terhubung."
              : "Menghubungkan jalur video langsung dengan praktisi Anda."}
          </Text>
        </VStack>

        <Box className="absolute bottom-28 left-5 bg-primary/85 px-3 py-1.5 rounded-xl flex-row items-center gap-2 border border-primary-foreground/20">
          <Volume2 size={16} color="#FFFFFF" />
          <Text size="sm" bold className="text-primary-foreground font-semibold">
            {iceConfig?.iceServers ? "Audio & ICE Server Siap" : "Menyiapkan audio sesi"}
          </Text>
        </Box>

        {/* Patient Floating Self View (PiP) */}
        <Box className="absolute top-28 right-4 w-28 h-40 bg-primary rounded-2xl overflow-hidden border-2 border-primary-foreground/30 z-20">
          {isVideoOn ? (
            <Box className="w-full h-full items-center justify-center bg-[#372B53]">
              <Video size={26} color="#EAE5E0" />
              <Text size="sm" className="text-primary-foreground/90 font-medium mt-1">
                Kamera Anda
              </Text>
            </Box>
          ) : (
            <Box className="w-full h-full items-center justify-center bg-primary">
              <VideoOff size={24} color="#CFC8D8" />
              <Text
                size="sm"
                className="text-primary-foreground/80 font-medium mt-1"
              >
                Kamera Mati
              </Text>
            </Box>
          )}
          <Box className="absolute bottom-1.5 left-1.5 bg-primary/80 px-2 py-0.5 rounded">
            <Text size="sm" bold className="text-primary-foreground">
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
            accessibilityLabel={
              isFrontCamera ? "Balik ke Kamera Belakang" : "Balik ke Kamera Depan"
            }
            onPress={() => {
              const nextIsFront = !isFrontCamera;
              setIsFrontCamera(nextIsFront);
              haptics.light();
              Alert.alert(
                "Kamera Native Belum Aktif",
                `Preferensi kamera dialihkan ke ${nextIsFront ? "depan" : "belakang"}. Streaming kamera langsung menunggu integrasi WebRTC SDK.`,
              );
            }}
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

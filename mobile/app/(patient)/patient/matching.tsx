import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Clock,
  ShieldAlert,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Star,
  ArrowRight,
  CheckCircle2,
  WifiOff,
} from "lucide-react-native";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
  Badge,
  BadgeText,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { activeConsultationContextFromResponse } from "@/clinical/activeConsultation";
import { ROUTES } from "@/constants/routes";
import {
  useCreateConsultation,
  useWaitingRoomStatus,
  useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { matchingService } from "@/api";
import { ApiError } from "@/api/client";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function MatchingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string; guest?: string }>();
  const toast = useToast();
  const isGuest = params.guest === "true";
  const waitingRoom = useWaitingRoomStatus();
  const createConsultation = useCreateConsultation();
  const startKycMutation = useStartDiditVerification();
  const [isKycLaunching, setIsKycLaunching] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const is403Forbidden =
    waitingRoom.error instanceof ApiError &&
    waitingRoom.error.statusCode === 403;
  const is404NotFound =
    waitingRoom.error instanceof ApiError &&
    waitingRoom.error.statusCode === 404;

  const handleCancelMatching = async () => {
    if (isGuest || !room?.matchingRequestId) {
      safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
      return;
    }
    setIsCancelling(true);
    haptics.medium();
    try {
      await matchingService.cancelMatchingRequest(room.matchingRequestId);
      haptics.success();
      safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
    } catch (err: unknown) {
      haptics.error();
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Gagal Membatalkan Pencarian</ToastTitle>
            <ToastDescription>
              {err instanceof ApiError
                ? err.message
                : "Terjadi kendala saat membatalkan antrean."}
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLaunchDidit = async () => {
    haptics.selection();
    setIsKycLaunching(true);
    try {
      const session = await startKycMutation.mutateAsync();
      await launchDiditVerification(session, {
        onApproved: () => {
          haptics.success();
          waitingRoom.refetch();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Verifikasi Berhasil</ToastTitle>
                <ToastDescription>
                  Identitas Anda telah terverifikasi. Menghubungkan ulang ke antrean pencarian psikolog...
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onCompleted: () => {
          waitingRoom.refetch();
        },
        onError: (err) => {
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="error">
                <ToastTitle>Kendala Verifikasi</ToastTitle>
                <ToastDescription>{err.message}</ToastDescription>
              </Toast>
            ),
          });
        },
      });
    } catch (err: unknown) {
      haptics.error();
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi verifikasi identitas.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Gagal Memulai</ToastTitle>
            <ToastDescription>{msg}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsKycLaunching(false);
    }
  };

  const room = waitingRoom.data;
  const showMatchedPreview = isGuest && params.state === "matched";
  const showOfflinePreview = isGuest && params.state === "offline";
  const isMatched = room?.status === "MATCHED" || showMatchedPreview;
  const canRequestConsultation = Boolean(
    !waitingRoom.isError &&
      isMatched &&
      room?.matchingRequestId &&
      room?.assignedDoctor?.id,
  );

  const handleCreateConsultation = () => {
    if (!canRequestConsultation || !room?.assignedDoctor?.id) {
      haptics.error();
      return;
    }

    createConsultation.mutate(
      {
        practitionerId: room.assignedDoctor.id,
        matchingRequestId: room.matchingRequestId,
      },
      {
        onSuccess: (response) => {
          const context = activeConsultationContextFromResponse(response);
          if (!context) {
            haptics.error();
            return;
          }
          haptics.success();
          router.push({
            pathname: ROUTES.PATIENT.CHECKOUT,
            params: {
              consultationId: context.consultationId,
              doctorId: room.assignedDoctor?.id,
              doctorName: room.assignedDoctor?.name,
            },
          } as never);
        },
        onError: () => haptics.error(),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="w-full max-w-[640px] md:max-w-[720px] self-center flex-1">
        {/* Top Header */}
        <Box className="px-5 pt-3.5 pb-2 border-b border-border/70 bg-card">
          <HStack space="sm" className="items-center justify-between">
            <Pressable
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke dashboard"
              className="w-10 h-10 rounded-xl border border-border/80 bg-card items-center justify-center active:bg-muted"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color="#262130" strokeWidth={2} />
            </Pressable>
            <Heading size="md" bold className="text-foreground">
              {isMatched ? "Psikolog Ditemukan" : "Mencari Psikolog"}
            </Heading>
            <Box className="w-10" />
          </HStack>
        </Box>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading State */}
          {waitingRoom.isLoading && !showMatchedPreview && !showOfflinePreview && !isGuest && (
            <VStack space="md" className="items-center py-10">
              <Box className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-3 border border-primary/20">
                <Clock size={36} color="#4A3B6B" />
              </Box>
              <Heading size="lg" bold className="text-foreground text-center">
                Memeriksa Antrean
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center px-4">
                Menghubungi server untuk memverifikasi ketersediaan psikolog online…
              </Text>
            </VStack>
          )}

          {/* Error State (Wireframe Screen 31: Koneksi Terputus / 403 KYC / 404 Belum Mengantre) */}
          {((waitingRoom.isError && !isGuest) || showOfflinePreview) && !showMatchedPreview && (
            <Card className="bg-card rounded-xl p-5 border border-border/80 shadow-xs gap-3 my-4">
              <HStack space="sm" className="items-center">
                {is403Forbidden ? (
                  <ShieldAlert size={22} color="#DC2626" />
                ) : is404NotFound && !showOfflinePreview ? (
                  <Clock size={22} color="#4A3B6B" />
                ) : (
                  <WifiOff size={22} color="#D97706" />
                )}
                <Heading size="sm" bold className="text-foreground">
                  {is403Forbidden
                    ? "Verifikasi Identitas Diperlukan"
                    : is404NotFound && !showOfflinePreview
                      ? "Belum Ada Pencarian Aktif"
                      : "Koneksi Terputus"}
                </Heading>
              </HStack>
              <Text size="sm" className="text-muted-foreground leading-relaxed">
                {is403Forbidden
                  ? "Layanan pencocokan psikolog memerlukan akun yang terverifikasi. Selesaikan verifikasi identitas e-KTP untuk masuk ke antrean."
                  : is404NotFound && !showOfflinePreview
                    ? "Kamu belum memiliki permintaan pencarian psikolog aktif di ruang tunggu. Mulai asesmen singkat untuk mencocokkan psikolog yang tepat."
                    : "Posisi antreanmu tetap aman. Tidak perlu mengirim ulang jawabanmu."}
              </Text>

              {!is403Forbidden && (!is404NotFound || showOfflinePreview) && (
                <VStack space="xs" className="my-1 bg-muted/60 p-3.5 rounded-xl border border-border/60">
                  <Text size="sm" bold className="text-foreground uppercase tracking-wider mb-1">
                    COBA PERIKSA:
                  </Text>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    • Wi-Fi atau data seluler aktif
                  </Text>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    • Mode pesawat dimatikan
                  </Text>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    • Sinyal cukup kuat
                  </Text>
                  <Text size="sm" className="text-muted-foreground mt-2 leading-normal">
                    Status terakhir: mencari psikolog. Diperbarui otomatis setelah tersambung.
                  </Text>
                </VStack>
              )}

              {is403Forbidden ? (
                <Button
                  size="sm"
                  onPress={handleLaunchDidit}
                  disabled={isKycLaunching}
                  className="mt-2 rounded-xl bg-primary py-2.5 h-11 flex-row items-center justify-center shadow-xs"
                >
                  {isKycLaunching ? (
                    <ButtonSpinner color="#FFFFFF" />
                  ) : (
                    <ButtonText className="text-primary-foreground font-bold text-sm">
                      Mulai Verifikasi Sekarang
                    </ButtonText>
                  )}
                </Button>
              ) : is404NotFound && !showOfflinePreview ? (
                <Button
                  size="sm"
                  onPress={() => router.push(ROUTES.PATIENT.TRIAGE as never)}
                  className="mt-2 rounded-xl bg-primary py-2.5 h-11 flex-row items-center justify-center shadow-xs"
                >
                  <ButtonText className="text-primary-foreground font-bold text-sm">
                    Mulai Triase Sekarang
                  </ButtonText>
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onPress={() => waitingRoom.refetch()}
                  className="mt-2 rounded-xl bg-primary h-11 flex-row items-center justify-center shadow-xs"
                >
                  <ButtonText className="text-primary-foreground font-bold text-sm">
                    Coba Sambungkan Sekarang
                  </ButtonText>
                </Button>
              )}
            </Card>
          )}

          {/* Searching / Waiting Room State (Wireframe Screen 29) */}
          {(isGuest || (!waitingRoom.isLoading && !waitingRoom.isError)) && !isMatched && !showOfflinePreview && (
            <VStack space="lg" className="items-center py-4">
              {/* Visual Pulse */}
              <Box className="w-36 h-36 rounded-full bg-primary/10 items-center justify-center border-4 border-primary/20 my-2">
                <Box className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center border-2 border-primary/30">
                  <Sparkles size={38} color="#4A3B6B" />
                </Box>
              </Box>

              <VStack space="xs" className="items-center px-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/30 rounded-lg px-3 py-1 mb-1.5"
                >
                  <BadgeText className="text-sm font-bold text-primary">
                    MENCARI PSIKOLOG
                  </BadgeText>
                </Badge>
                <Heading size="xl" bold className="text-foreground text-center">
                  Sedang Mencarikan Psikolog
                </Heading>
                <Text size="sm" className="text-muted-foreground text-center mt-1 leading-relaxed">
                  Posisi antreanmu aman. Kamu boleh menutup aplikasi, kami akan mengabari lewat notifikasi saat psikolog siap.
                </Text>
              </VStack>

              {/* Progress Stepper (Wireframe Screen 29) */}
              <Card className="w-full bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3 mt-1">
                <HStack space="sm" className="items-center">
                  <CheckCircle2 size={16} color="#16A34A" />
                  <Text size="sm" className="text-foreground font-semibold">
                    Jawaban diterima
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center">
                  <Box className="w-4 h-4 rounded-full bg-primary/20 items-center justify-center">
                    <Box className="w-2 h-2 rounded-full bg-primary" />
                  </Box>
                  <Text size="sm" className="text-primary font-bold">
                    Mencari psikolog • {room?.estimatedWaitSeconds ? `~${Math.max(1, Math.ceil(room.estimatedWaitSeconds / 60))} menit` : "~1-3 menit"}
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center">
                  <Box className="w-4 h-4 rounded-full border border-border/80" />
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Psikolog menerima kasus
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center">
                  <Box className="w-4 h-4 rounded-full border border-border/80" />
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Pembayaran
                  </Text>
                </HStack>
                <HStack space="sm" className="items-center">
                  <Box className="w-4 h-4 rounded-full border border-border/80" />
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Sesi dimulai
                  </Text>
                </HStack>
              </Card>

              {/* Status Queue Card */}
              <Card className="w-full bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
                <HStack space="md" className="items-center justify-between pb-2 border-b border-border/70">
                  <HStack space="sm" className="items-center">
                    <Clock size={18} color="#4A3B6B" />
                    <Text size="sm" className="text-foreground font-medium">
                      Estimasi Waktu Tunggu
                    </Text>
                  </HStack>
                  <Text size="sm" bold className="text-primary font-bold">
                    {room?.estimatedWaitSeconds !== undefined
                      ? `~${Math.max(1, Math.ceil(room.estimatedWaitSeconds / 60))} menit`
                      : "~1-3 menit"}
                  </Text>
                </HStack>

                <HStack space="md" className="items-center justify-between">
                  <HStack space="sm" className="items-center">
                    <UserCheck size={18} color="#4A3B6B" />
                    <Text size="sm" className="text-foreground font-medium">
                      Posisi Antrean
                    </Text>
                  </HStack>
                  <Badge
                    variant="outline"
                    className="bg-muted border-border/80 rounded-lg px-2.5 py-0.5"
                  >
                    <BadgeText className="text-sm font-bold text-foreground">
                      #{room?.position ?? 1} Prioritas
                    </BadgeText>
                  </Badge>
                </HStack>
              </Card>

              {/* Privacy Assurance */}
              <Card className="w-full bg-card rounded-xl p-3.5 border border-border/80 shadow-xs flex-row items-center gap-3">
                <ShieldCheck size={20} color="#4A3B6B" />
                <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-snug">
                  Identitas dan jawabanmu tersimpan privat sesuai etika kerahasiaan psikologi.
                </Text>
              </Card>

              {/* Cancel Action */}
              <Button
                variant="outline"
                size="lg"
                disabled={isCancelling}
                onPress={handleCancelMatching}
                className="w-full mt-3 rounded-xl border-border/80 bg-card h-12 flex-row items-center justify-center"
              >
                {isCancelling ? (
                  <ButtonSpinner color="#4A3B6B" />
                ) : (
                  <ButtonText className="text-foreground font-semibold text-sm">
                    Batalkan Pencarian
                  </ButtonText>
                )}
              </Button>
            </VStack>
          )}

          {/* Matched State (Wireframe Screen 32: Psikolog Ditemukan) */}
          {(showMatchedPreview || (!waitingRoom.isLoading && !waitingRoom.isError && isMatched)) && (
            <VStack space="lg" className="py-2">
              <Box className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 items-center justify-center self-center my-2">
                <UserCheck size={36} color="#059669" />
              </Box>

              <VStack space="xs" className="items-center text-center">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 border-emerald-200 rounded-lg px-3 py-1 mb-1"
                >
                  <BadgeText className="text-sm font-bold text-emerald-700">
                    PSIKOLOG DITEMUKAN
                  </BadgeText>
                </Badge>
                <Heading size="xl" bold className="text-foreground text-center">
                  Psikolog Siap Menemanimu
                </Heading>
                <Text size="sm" className="text-muted-foreground text-center px-2">
                  Satu langkah lagi: selesaikan pembayaran agar sesi konsultasi bisa segera dimulai.
                </Text>
              </VStack>

              {/* Doctor Profile Card (Wireframe Screen 32) */}
              <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
                <HStack space="md" className="items-center">
                  <Box className="w-14 h-14 rounded-xl bg-primary/10 items-center justify-center border border-primary/20">
                    <Text size="lg" bold className="text-primary font-bold">
                      {room?.assignedDoctor?.name
                        ? room.assignedDoctor.name.charAt(0)
                        : "P"}
                    </Text>
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Heading size="md" bold className="text-foreground">
                      {room?.assignedDoctor?.name || "Psikolog Mitra"}
                    </Heading>
                    <Text size="sm" className="text-muted-foreground font-medium">
                      {room?.assignedDoctor?.title || "Psikolog Klinis"}
                    </Text>
                    <HStack space="xs" className="items-center mt-0.5">
                      <Star size={14} color="#D97706" fill="#D97706" />
                      <Text size="sm" bold className="text-foreground font-semibold">
                        {room?.assignedDoctor?.rating?.toFixed(1) || "4.9"}
                      </Text>
                      <Text size="sm" className="text-muted-foreground font-medium">
                        • ✓ Kredensial terverifikasi
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Card>

              {/* Rincian Sesi Card (Wireframe Screen 32) */}
              <Card className="w-full bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-2.5">
                <Text size="sm" className="font-bold text-foreground uppercase tracking-wider">
                  RINCIAN SESI
                </Text>
                <HStack space="sm" className="justify-between items-center py-1 border-b border-border/50">
                  <Text size="sm" className="text-muted-foreground">
                    Layanan
                  </Text>
                  <Text size="sm" className="font-semibold text-foreground">
                    Konsultasi psikologi
                  </Text>
                </HStack>
                <HStack space="sm" className="justify-between items-center py-1 border-b border-border/50">
                  <Text size="sm" className="text-muted-foreground">
                    Format
                  </Text>
                  <Text size="sm" className="font-semibold text-foreground">
                    Chat Medis Privat
                  </Text>
                </HStack>
                <HStack space="sm" className="justify-between items-center py-1 border-b border-border/50">
                  <Text size="sm" className="text-muted-foreground">
                    Durasi
                  </Text>
                  <Text size="sm" className="font-semibold text-foreground">
                    45 Menit
                  </Text>
                </HStack>
                <HStack space="sm" className="justify-between items-center py-1">
                  <Text size="sm" className="text-muted-foreground">
                    Mulai
                  </Text>
                  <Text size="sm" className="font-semibold text-primary">
                    Setelah pembayaran
                  </Text>
                </HStack>
              </Card>

              {/* Primary Action Button */}
              <VStack space="xs" className="w-full mt-2">
                <Button
                  size="lg"
                  isDisabled={!canRequestConsultation || createConsultation.isPending}
                  onPress={handleCreateConsultation}
                  className="w-full rounded-xl bg-primary h-12 flex-row items-center justify-center active:opacity-90 shadow-xs"
                >
                  {createConsultation.isPending ? (
                    <ButtonSpinner />
                  ) : (
                    <>
                      <ButtonText className="text-white font-bold text-base mr-1">
                        Lanjut ke Pembayaran
                      </ButtonText>
                      <ButtonIcon as={ArrowRight} color="#FFFFFF" />
                    </>
                  )}
                </Button>
                <Text size="sm" className="text-muted-foreground text-center mt-1">
                  Belum ada biaya sampai kamu menyelesaikan pembayaran.
                </Text>
              </VStack>

              <Button
                variant="outline"
                size="lg"
                onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
                className="w-full rounded-xl border-border/80 bg-card h-12 flex-row items-center justify-center mt-1"
              >
                <ButtonText className="text-foreground font-semibold text-sm">
                  Kembali ke Beranda
                </ButtonText>
              </Button>
            </VStack>
          )}
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

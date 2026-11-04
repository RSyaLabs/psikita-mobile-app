import React from "react";
import { useRouter } from "expo-router";
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
} from "@/components/ui";
import { activeConsultationContextFromResponse } from "@/clinical/activeConsultation";
import { ROUTES } from "@/constants/routes";
import {
  useCreateConsultation,
  useWaitingRoomStatus,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function MatchingScreen() {
  const router = useRouter();
  const waitingRoom = useWaitingRoomStatus();
  const createConsultation = useCreateConsultation();
  const room = waitingRoom.data;
  const isMatched = room?.status === "MATCHED";
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
      {/* Top Header */}
      <Box className="px-5 pt-3.5 pb-2 border-b border-border bg-card">
        <HStack space="sm" className="items-center justify-between">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke dashboard"
            className="w-10 h-10 rounded-full border border-border bg-card items-center justify-center active:bg-muted"
          >
            <ArrowLeft size={20} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-foreground">
            {isMatched ? "Psikolog Ditemukan" : "Pencocokan Psikolog"}
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
        {waitingRoom.isLoading && (
          <VStack space="md" className="items-center py-10">
            <Box className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Clock size={36} color="#4A3B6B" />
            </Box>
            <Heading size="lg" bold className="text-foreground text-center">
              Memeriksa Antrean Siaga
            </Heading>
            <Text size="sm" className="text-muted-foreground text-center px-4">
              Menghubungi server untuk memverifikasi ketersediaan psikolog online…
            </Text>
          </VStack>
        )}

        {/* Error State */}
        {waitingRoom.isError && (
          <Card className="bg-card rounded-2xl p-5 border border-border gap-3 my-4">
            <HStack space="sm" className="items-center">
              <ShieldAlert size={22} color="#DC2626" />
              <Heading size="sm" bold className="text-foreground">
                Koneksi Antrean Terputus
              </Heading>
            </HStack>
            <Text size="sm" className="text-muted-foreground">
              Tidak dapat memuat status pencocokan dari server saat ini. Silakan
              coba beberapa saat lagi atau pilih psikolog dari direktori manual.
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => waitingRoom.refetch()}
              className="mt-2 rounded-xl border-border"
            >
              <ButtonText className="text-foreground font-semibold text-sm">
                Coba Hubungkan Ulang
              </ButtonText>
            </Button>
          </Card>
        )}

        {/* Searching / Waiting Room State */}
        {!waitingRoom.isLoading && !waitingRoom.isError && !isMatched && (
          <VStack space="lg" className="items-center py-4">
            {/* Visual Radar Pulse */}
            <Box className="w-36 h-36 rounded-full bg-primary/10 items-center justify-center border-4 border-primary/20 my-2">
              <Box className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center border-2 border-primary/30">
                <Sparkles size={38} color="#4A3B6B" />
              </Box>
            </Box>

            <VStack space="xs" className="items-center px-2">
              <Badge
                variant="outline"
                className="bg-primary/10 border-primary/30 rounded-full px-3 py-1 mb-1.5"
              >
                <BadgeText className="text-sm font-bold text-primary">
                  SISTEM RADAR AKTIF
                </BadgeText>
              </Badge>
              <Heading size="xl" bold className="text-foreground text-center">
                Mencari Psikolog Siaga
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center mt-1 leading-relaxed">
                Algoritma klinis kami sedang memetakan hasil triasemu ke psikolog
                yang memiliki keahlian paling tepat dan siap melayani saat ini.
              </Text>
            </VStack>

            {/* Status Queue Card */}
            <Card className="w-full bg-card rounded-2xl p-4 border border-border gap-3 mt-2">
              <HStack space="md" className="items-center justify-between pb-2 border-b border-border">
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
                  className="bg-muted border-border rounded-full px-2.5 py-0.5"
                >
                  <BadgeText className="text-sm font-bold text-foreground">
                    #{room?.position ?? 1} Prioritas
                  </BadgeText>
                </Badge>
              </HStack>
            </Card>

            {/* Privacy Assurance */}
            <Card className="w-full bg-muted/60 rounded-2xl p-3.5 border border-border flex-row items-center gap-3">
              <ShieldCheck size={20} color="#4A3B6B" />
              <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-snug">
                Identitas dan jawabanmu tersimpan aman sesuai etika kerahasiaan
                psikologi.
              </Text>
            </Card>

            {/* Cancel Action */}
            <Button
              variant="outline"
              size="lg"
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
              className="w-full mt-4 rounded-xl border-border bg-card h-12"
            >
              <ButtonText className="text-foreground font-semibold text-sm">
                Batalkan Pencarian
              </ButtonText>
            </Button>
          </VStack>
        )}

        {/* Matched State */}
        {!waitingRoom.isLoading && !waitingRoom.isError && isMatched && (
          <VStack space="lg" className="py-2">
            <Box className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 items-center justify-center self-center my-2">
              <UserCheck size={36} color="#059669" />
            </Box>

            <VStack space="xs" className="items-center text-center">
              <Badge
                variant="outline"
                className="bg-emerald-50 border-emerald-200 rounded-full px-3 py-1 mb-1"
              >
                <BadgeText className="text-sm font-bold text-emerald-700">
                  PSIKOLOG SIAP KONSULTASI
                </BadgeText>
              </Badge>
              <Heading size="xl" bold className="text-foreground text-center">
                Pencocokan Berhasil!
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center px-2">
                Psikolog klinis telah menerima kasusmu di Ruang Siaga dan siap
                memulai sesi pendampingan.
              </Text>
            </VStack>

            {/* Doctor Profile Card */}
            <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
              <HStack space="md" className="items-center">
                <Box className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
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
                    {room?.assignedDoctor?.title || "Psikolog Klinis Dewasa"}
                  </Text>
                  <HStack space="xs" className="items-center mt-0.5">
                    <Star size={14} color="#EAB308" fill="#EAB308" />
                    <Text size="sm" bold className="text-foreground font-semibold">
                      {room?.assignedDoctor?.rating?.toFixed(1) || "4.9"}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      • Terverifikasi STR/SIP
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </Card>

            {/* Primary Action Button */}
            <Button
              size="lg"
              isDisabled={!canRequestConsultation || createConsultation.isPending}
              onPress={handleCreateConsultation}
              className="w-full mt-2 rounded-xl bg-primary h-12 flex-row items-center justify-center active:opacity-90"
            >
              {createConsultation.isPending ? (
                <ButtonSpinner />
              ) : (
                <>
                  <ButtonText className="text-white font-bold text-base mr-1">
                    Lanjut ke Konsultasi & Pembayaran
                  </ButtonText>
                  <ButtonIcon as={ArrowRight} color="#FFFFFF" />
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
              className="w-full rounded-xl border-border bg-card h-12"
            >
              <ButtonText className="text-foreground font-semibold text-sm">
                Kembali ke Beranda
              </ButtonText>
            </Button>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

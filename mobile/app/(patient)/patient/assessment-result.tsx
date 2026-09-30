import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  ArrowRight,
  HeartPulse,
  Wind,
  BookOpen,
} from "lucide-react-native";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  Progress,
  ProgressFilledTrack,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { BackendIntegrationBanner } from "@/components/common";
import { useTriageAssessment } from "@/hooks/useApiQueries";
import {
  ASSESSMENT_UNAVAILABLE_MESSAGE,
  isAssessmentResult,
} from "@/clinical/assessment";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

function formatServerDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tanggal belum tersedia"
    : date.toLocaleDateString("id-ID");
}

export default function AssessmentResultScreen() {
  const router = useRouter();
  const { triageId, guest } = useLocalSearchParams<{
    triageId?: string;
    guest?: string;
  }>();
  const normalizedTriageId = Array.isArray(triageId) ? triageId[0] : triageId;
  const isGuest = guest === "true";
  // Route value only. No invented triage id: the hook is disabled without one
  // (it never calls the service with an empty id) and the screen below states
  // the missing id instead of scoring a session that never happened.
  const assessmentQuery = useTriageAssessment(
    isGuest ? undefined : normalizedTriageId,
  );
  const result = isAssessmentResult(assessmentQuery.data)
    ? assessmentQuery.data
    : undefined;

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
  };

  const handleAction = () => {
    haptics.medium();
    if (isGuest) {
      router.push(ROUTES.AUTH.LOGIN as never);
    } else {
      router.push(ROUTES.PATIENT.DOCTORS as never);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <HStack
        space="sm"
        className="items-center justify-between px-5 pt-3.5 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Hasil Asesmen
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {result ? (
          <VStack space="sm" className="mt-2">
            <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
              <HStack space="sm" className="items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-muted border-border rounded-full"
                >
                  <BadgeText className="text-[10px] text-foreground">
                    {result.assessmentType}
                  </BadgeText>
                </Badge>
                <Text size="xs" className="text-muted-foreground">
                  {formatServerDate(result.createdAt)}
                </Text>
              </HStack>
              <Heading size="xl" bold className="text-foreground">
                {result.score}
              </Heading>
              <Text size="sm" className="text-muted-foreground">
                Level server: {result.level} • {result.disposition}
              </Text>
              {result.hasRedFlags && (
                <Text size="xs" className="text-destructive">
                  Server menandai red flag. Tindakan berikutnya harus mengikuti
                  protokol layanan.
                </Text>
              )}
            </Card>
            <Card className="bg-muted rounded-2xl p-4 border border-border gap-2">
              <Text size="sm" bold className="text-foreground">
                Catatan server
              </Text>
              <Text size="sm" className="text-muted-foreground">
                {result.notes || "Catatan assessment belum tersedia."}
              </Text>
            </Card>
          </VStack>
        ) : !isGuest ? (
          <VStack space="sm" className="mt-2">
            <Card className="bg-card rounded-3xl p-5 border border-border gap-2">
              <Heading size="sm" bold className="text-foreground">
                Hasil asesmen belum tersedia
              </Heading>
              <Text size="sm" className="text-muted-foreground">
                {normalizedTriageId
                  ? ASSESSMENT_UNAVAILABLE_MESSAGE
                  : "Layar ini butuh triageId dari navigasi. Tanpa ID itu tidak ada permintaan ke server dan tidak ada skor yang bisa ditampilkan."}
              </Text>
            </Card>
          </VStack>
        ) : (
          <VStack space="md" className="mt-2">
            {/* QA Integration Banner */}
            <BackendIntegrationBanner
              endpoint="GET /triage/:id / Rekam Medis"
              title="Pratinjau Antarmuka QA • Hasil Asesmen"
              description="Hasil asesmen langsung dari server belum tersedia. Pratinjau tata letak aktif untuk evaluasi alur metrik oleh tim QA."
            />

            {/* Main Result Card */}
            <Box className="bg-primary rounded-3xl p-5 text-white relative overflow-hidden">
              <HStack space="xs" className="items-center justify-between mb-3">
                <Box className="bg-primary-foreground/20 px-3 py-1 rounded-full">
                  <Text size="xs" bold className="text-primary-foreground text-[10px] tracking-widest uppercase">
                    {isGuest ? "Skrining Mandiri" : "Pratinjau Asesmen Klinis"}
                  </Text>
                </Box>
                <Text size="xs" className="text-primary-foreground/70">
                  22 Sep 2026
                </Text>
              </HStack>

              <VStack space="xs" className="my-2">
                <Text size="3xl" bold className="text-primary-foreground">
                  10{" "}
                  <Text size="sm" className="text-primary-foreground/70 font-normal">
                    / 20
                  </Text>
                </Text>
                <Heading size="md" bold className="text-secondary-foreground mt-0.5">
                  Indikasi Gejala Kecemasan Situasional
                </Heading>
              </VStack>

              {/* Gauge Meter */}
              <VStack space="xs" className="my-3">
                <Progress value={50} className="w-full bg-primary-foreground/20 h-2.5 rounded-full overflow-hidden">
                  <ProgressFilledTrack className="bg-warning h-full rounded-full" />
                </Progress>
                <HStack space="xs" className="justify-between pt-1">
                  <Text size="xs" className="text-primary-foreground/60 text-[10px]">
                    Minimal (0-4)
                  </Text>
                  <Text size="xs" bold className="text-warning text-[10px]">
                    Sedang (5-14)
                  </Text>
                  <Text size="xs" className="text-primary-foreground/60 text-[10px]">
                    Berat (15-20)
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Clinical Meaning */}
            <VStack space="xs">
              <Heading size="xs" bold className="text-foreground px-1">
                Penjelasan Kondisi Anda
              </Heading>
              <Box className="bg-card rounded-2xl p-4 border border-border">
                <HStack space="xs" className="items-center mb-2">
                  <Box className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  <Text size="xs" bold className="text-foreground">
                    Evaluasi Non-Stigmatisasi
                  </Text>
                </HStack>
                <Text size="xs" className="text-muted-foreground leading-relaxed">
                  Skor evaluasi mengindikasikan beban stres psikologis dan gejala cemas situasional dalam 2 pekan terakhir. Kondisi ini adalah respon alami saat menghadapi tekanan dan dapat dipulihkan dengan panduan praktisi yang tepat.
                </Text>
              </Box>
            </VStack>

            {/* Recommended Steps */}
            <VStack space="xs">
              <Heading size="xs" bold className="text-foreground px-1">
                Langkah Pemulihan yang Dianjurkan
              </Heading>
              <VStack space="sm">
                <Pressable
                  onPress={handleAction}
                  className="bg-card rounded-2xl p-3.5 border border-border active:border-secondary flex-row items-center gap-3"
                >
                  <Box className="w-10 h-10 rounded-xl bg-secondary items-center justify-center">
                    <HeartPulse size={20} className="text-secondary-foreground" />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Heading size="xs" bold className="text-foreground">
                      Konsultasi 1-on-1 dengan Psikolog
                    </Heading>
                    <Text size="xs" className="text-muted-foreground text-[11px]">
                      Bahas pemicu kecemasan dan dapatkan panduan penanganan yang terarah.
                    </Text>
                  </VStack>
                </Pressable>

                <Box className="bg-card rounded-2xl p-3.5 border border-border flex-row items-center gap-3">
                  <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                    <Wind size={20} className="text-secondary" />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Heading size="xs" bold className="text-foreground">
                      Latihan Relaksasi Napas 4-7-8
                    </Heading>
                    <Text size="xs" className="text-muted-foreground text-[11px]">
                      Tarik napas 4 detik, tahan 7 detik, hembuskan 8 detik untuk menstabilkan detak jantung.
                    </Text>
                  </VStack>
                </Box>

                <Box className="bg-card rounded-2xl p-3.5 border border-border flex-row items-center gap-3">
                  <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
                    <BookOpen size={20} className="text-secondary" />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Heading size="xs" bold className="text-foreground">
                      Jurnal Perasaan Berkala
                    </Heading>
                    <Text size="xs" className="text-muted-foreground text-[11px]">
                      Catat pikiran pemicu rasa cemas untuk dipetakan pola perilakunya.
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </VStack>
          </VStack>
        )}
      </ScrollView>

      {/* Floating CTA */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-4">
        <Button
          size="lg"
          onPress={handleAction}
          className="w-full bg-secondary h-12 rounded-2xl"
        >
          <ButtonText className="text-sm font-bold text-secondary-foreground">
            {isGuest ? "Masuk Akun untuk Simpan & Konsultasi" : "Temukan Psikolog yang Cocok"}
          </ButtonText>
          <ButtonIcon as={ArrowRight} className="text-secondary-foreground" />
        </Button>
      </Box>
    </SafeAreaView>
  );
}

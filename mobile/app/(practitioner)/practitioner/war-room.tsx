import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  Clock,
  Radio,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from "lucide-react-native";
import {
  Alert,
  AlertIcon,
  AlertText,
  Badge,
  BadgeText,
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
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useClaimMatching, useMatchingOffers } from "@/hooks/useApiQueries";
import { consultationService } from "@/api/consultation.service";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

function formatAcuityBadge(acuity?: string) {
  const normalized = acuity?.toLowerCase() || "mild";
  if (normalized === "critical" || normalized === "severe") {
    return {
      label: "Urgensi Tinggi",
      bgClass: "bg-red-50",
      borderClass: "border-red-200",
      textClass: "text-red-700",
    };
  }
  if (normalized === "moderate") {
    return {
      label: "Urgensi Sedang",
      bgClass: "bg-amber-50",
      borderClass: "border-amber-200",
      textClass: "text-amber-800",
    };
  }
  return {
    label: "Urgensi Normal",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20",
    textClass: "text-primary",
  };
}

export default function WarRoomScreen() {
  const router = useRouter();
  const offersQuery = useMatchingOffers();
  const claimMutation = useClaimMatching();
  const [claimNotice, setClaimNotice] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const offers = offersQuery.data || [];

  const handleClaim = (matchingRequestId: string) => {
    setClaimNotice(null);
    setClaimingId(matchingRequestId);
    haptics.medium();

    claimMutation.mutate(matchingRequestId, {
      onSuccess: async (data) => {
        setClaimingId(null);
        haptics.success();

        // Check if consultation ID is available in matching response
        let consultationId =
          data.activeConsultation?.consultationId || data.consultationId;

        // If not directly in response, query recent consultations to find newly created session
        if (!consultationId) {
          try {
            const list = await consultationService.getConsultations();
            const matchedConsultation = list.find(
              (c) =>
                c.status === "WAITING" ||
                c.status === "ACTIVE",
            );
            if (matchedConsultation?.id) {
              consultationId = matchedConsultation.id;
            }
          } catch {
            // Non-blocking fallback
          }
        }

        if (consultationId) {
          router.push({
            pathname: ROUTES.PRACTITIONER.CHAT,
            params: { consultationId },
          } as never);
        } else {
          setClaimNotice(
            "Kasus berhasil diterima! Sesi konsultasi telah dibuat di server. Silakan buka menu Riwayat Sesi jika ruang chat belum terbuka otomatis.",
          );
        }
      },
      onError: (err: any) => {
        setClaimingId(null);
        haptics.error();
        const msg =
          err?.message ||
          "Gagal mengklaim kasus. Kemungkinan kasus sudah diterima praktisi lain atau Anda memiliki sesi tertunda.";
        setClaimNotice(msg);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3 border-b border-border">
        <HStack space="md" className="items-center justify-between">
          <Pressable
            onPress={() =>
              safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)
            }
            accessibilityRole="button"
            accessibilityLabel="Kembali ke dashboard"
            className="w-10 h-10 rounded-full border border-border bg-card items-center justify-center active:bg-muted"
          >
            <ArrowLeft size={20} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-foreground">
            Ruang Siaga (War Room)
          </Heading>
          <Badge
            variant="outline"
            className="bg-emerald-50 border-emerald-200 rounded-full px-2.5 py-0.5"
          >
            <BadgeText className="text-sm font-bold text-emerald-700">
              ● SIAGA ON
            </BadgeText>
          </Badge>
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md">
          {/* Notice Alert */}
          {claimNotice && (
            <Alert action="info" className="rounded-xl">
              <AlertIcon as={Bell} />
              <AlertText className="text-sm font-medium">
                {claimNotice}
              </AlertText>
            </Alert>
          )}

          {/* Loading */}
          {offersQuery.isLoading && (
            <Card className="bg-card rounded-2xl p-6 border border-border items-center justify-center gap-3">
              <Clock size={28} color="#4A3B6B" />
              <Text size="sm" className="text-muted-foreground font-medium">
                Memeriksa permintaan matching baru dari server…
              </Text>
            </Card>
          )}

          {/* Error */}
          {offersQuery.isError && (
            <Card className="bg-card rounded-2xl p-5 border border-border gap-3">
              <HStack space="sm" className="items-center">
                <ShieldAlert size={20} color="#DC2626" />
                <Heading size="sm" bold className="text-foreground">
                  Gagal Memuat Antrean
                </Heading>
              </HStack>
              <Text size="sm" className="text-muted-foreground">
                Koneksi ke sistem matching terputus. Pastikan perangkat Anda
                terhubung ke internet.
              </Text>
              <Button
                variant="outline"
                size="sm"
                onPress={() => offersQuery.refetch()}
                className="rounded-xl border-border mt-1"
              >
                <ButtonText className="text-foreground font-semibold text-sm">
                  Coba Lagi
                </ButtonText>
              </Button>
            </Card>
          )}

          {/* Empty State */}
          {!offersQuery.isLoading && !offersQuery.isError && offers.length === 0 && (
            <VStack space="md" className="items-center py-8">
              <Box className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 items-center justify-center mb-2">
                <Radio size={36} color="#4A3B6B" />
              </Box>
              <Heading size="lg" bold className="text-foreground text-center">
                Ruang Siaga Aktif
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center px-4 leading-relaxed">
                Saat ini belum ada kasus pasien mengantre yang membutuhkan
                respons cepat. Sistem akan otomatis menampilkan kasus baru
                begitu pasien selesai melakukan triase klinis.
              </Text>

              {/* Tips Card */}
              <Card className="w-full bg-muted/60 rounded-2xl p-4 border border-border mt-4 flex-row items-center gap-3">
                <ShieldCheck size={22} color="#4A3B6B" />
                <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-snug">
                  Pastikan toggle statusmu tetap Online di Dashboard agar
                  algoritma dapat meneruskan penawaran kasus kepadamu.
                </Text>
              </Card>
            </VStack>
          )}

          {/* Offers List */}
          {!offersQuery.isLoading && !offersQuery.isError && offers.length > 0 && (
            <VStack space="md">
              <HStack className="items-center justify-between px-1">
                <Text size="sm" bold className="text-foreground font-bold">
                  Kasus Menunggu Respons ({offers.length})
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  Pembaruan otomatis real-time
                </Text>
              </HStack>

              {offers.map((offer) => {
                const acuityInfo = formatAcuityBadge(offer.brief?.acuity);
                const isClaimingThis =
                  claimMutation.isPending &&
                  claimingId === offer.matchingRequestId;

                return (
                  <Card
                    key={offer.matchingRequestId}
                    className="bg-card rounded-2xl p-4 border border-border gap-3.5 shadow-sm"
                  >
                    {/* Card Top: Badges */}
                    <HStack space="sm" className="items-center justify-between">
                      <Badge
                        variant="outline"
                        className={`${acuityInfo.bgClass} ${acuityInfo.borderClass} rounded-full px-2.5 py-0.5`}
                      >
                        <BadgeText className={`text-sm font-bold ${acuityInfo.textClass}`}>
                          {acuityInfo.label}
                        </BadgeText>
                      </Badge>
                      <HStack space="xs" className="items-center">
                        <Clock size={14} color="#6B7280" />
                        <Text size="sm" className="text-muted-foreground">
                          {offer.deadlineAt
                            ? `Batas respons: ${new Date(offer.deadlineAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                            : "Respons cepat"}
                        </Text>
                      </HStack>
                    </HStack>

                    {/* Chief Complaint / Summary */}
                    <VStack space="xs">
                      <Text size="sm" bold className="text-foreground font-bold leading-snug">
                        {offer.brief?.chiefComplaint ||
                          offer.brief?.summaryText ||
                          "Pasien memerlukan sesi konsultasi klinis terarah"}
                      </Text>
                      {offer.brief?.triageScore !== undefined && (
                        <Text size="sm" className="text-muted-foreground">
                          Skor Triase Klinis: {offer.brief.triageScore} / 15
                        </Text>
                      )}
                    </VStack>

                    {/* Metadata Pill */}
                    <HStack space="sm" className="items-center bg-muted/60 p-2.5 rounded-xl">
                      <UserCheck size={16} color="#4A3B6B" />
                      <Text size="sm" className="text-muted-foreground flex-1 font-medium">
                        Kategori Kompetensi: {offer.requiredLevel ? offer.requiredLevel.toUpperCase().replace("_", " ") : "UMUM"}
                      </Text>
                    </HStack>

                    {/* Claim Button */}
                    <Button
                      size="lg"
                      isDisabled={claimMutation.isPending}
                      onPress={() => handleClaim(offer.matchingRequestId)}
                      className="w-full bg-primary rounded-xl h-12 flex-row items-center justify-center active:opacity-90 mt-1"
                    >
                      {isClaimingThis ? (
                        <ButtonSpinner />
                      ) : (
                        <>
                          <ButtonText className="text-white font-bold text-base mr-1">
                            Terima Kasus Ini
                          </ButtonText>
                          <ButtonIcon as={ArrowRight} color="#FFFFFF" />
                        </>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

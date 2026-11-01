import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
  Badge,
  BadgeText,
  Spinner,
} from "@/components/ui";
import { useMyFollowUps, useBookFollowUp } from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function FollowUpsScreen() {
  const router = useRouter();
  const { data: followUps, isLoading, isError } = useMyFollowUps();
  const bookFollowUpMutation = useBookFollowUp();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <HStack space="sm" className="items-center justify-between px-5 pt-3.5 pb-2 bg-card border-b border-border">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Sesi Kontrol & Lanjutan
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="bg-primary/10 rounded-2xl p-4 border border-primary/20 mb-4">
          <HStack space="xs" className="items-center mb-1">
            <CheckCircle2 size={18} color="#4A3B6B" />
            <Text size="sm" bold className="text-foreground font-bold">
              Pemantauan Klinis Berkelanjutan
            </Text>
          </HStack>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Daftar sesi kontrol yang direkomendasikan oleh psikolog untuk memantau progres terapi dan evaluasi kondisi mental Anda secara rutin.
          </Text>
        </Box>

        {isLoading ? (
          <Box className="py-20 items-center justify-center">
            <Spinner size="large" />
            <Text size="xs" className="text-muted-foreground mt-3">
              Memuat jadwal kontrol...
            </Text>
          </Box>
        ) : isError ? (
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Gagal memuat jadwal kontrol
            </Text>
          </Card>
        ) : (followUps ?? []).length === 0 ? (
          <Card className="p-8 items-center bg-card rounded-2xl border border-border">
            <Calendar size={36} className="text-muted-foreground/60 mb-2" />
            <Text size="sm" bold className="text-foreground text-center">
              Belum ada rekomendasi kontrol
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Rekomendasi sesi lanjutan akan muncul setelah sesi konseling selesai dan dokter menetapkan jadwal kontrol.
            </Text>
          </Card>
        ) : (
          <VStack space="sm">
            {(followUps ?? []).map((fu) => (
              <Card key={fu.id} className="bg-card rounded-2xl p-4 border border-border">
                <HStack space="xs" className="items-center justify-between mb-2">
                  <Badge
                    variant="solid"
                    action={fu.status === "SCHEDULED" ? "success" : "warning"}
                    className="rounded-full px-2.5 py-0.5"
                  >
                    <BadgeText className="text-xs font-bold text-white uppercase">
                      {fu.status === "SCHEDULED" ? "Terjadwal" : "Menunggu Booking"}
                    </BadgeText>
                  </Badge>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Interval: {fu.recommendedIntervalDays} hari
                  </Text>
                </HStack>

                <Heading size="sm" bold className="text-foreground mb-1">
                  {fu.reason || "Evaluasi Pemulihan & Rencana Terapi"}
                </Heading>

                {fu.notes && (
                  <Text size="sm" className="text-muted-foreground mt-1 mb-2 font-normal">
                    Catatan dokter: {fu.notes}
                  </Text>
                )}

                <HStack space="sm" className="items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <HStack space="xs" className="items-center">
                    <User size={16} color="#4B4656" />
                    <Text size="sm" className="text-sm text-muted-foreground font-medium">
                      {fu.practitionerName ?? "Psikolog SeraPhany"}
                    </Text>
                  </HStack>
                  {fu.status !== "SCHEDULED" && (
                    <Button
                      size="sm"
                      onPress={() => {
                        haptics.medium();
                        router.push(ROUTES.PATIENT.DOCTORS);
                      }}
                      className="bg-primary px-4 py-2 rounded-xl h-auto"
                    >
                      <ButtonText className="text-sm font-bold text-white">
                        Pilih Jadwal
                      </ButtonText>
                    </Button>
                  )}
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

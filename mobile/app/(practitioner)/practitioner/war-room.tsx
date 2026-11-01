import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, ShieldAlert } from "lucide-react-native";
import {
  Alert,
  AlertIcon,
  AlertText,
  Badge,
  BadgeText,
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
import { ROUTES } from "@/constants";
import { BackendIntegrationBanner } from "@/components/common";
import { useClaimMatching, useTriageQueue } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function WarRoomScreen() {
  const router = useRouter();
  const queue = useTriageQueue();
  const claimMutation = useClaimMatching();
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const activeQueueItem = queue.data?.[0];
  const canClaim = Boolean(activeQueueItem?.id);

  const handleClaim = () => {
    if (!activeQueueItem?.id) {
      haptics.error();
      return;
    }
    setClaimNotice(null);
    haptics.medium();
    claimMutation.mutate(activeQueueItem.id, {
      onSuccess: (data) => {
        const consultationId = data.activeConsultation?.consultationId;
        if (!consultationId) {
          setClaimNotice(
            "Klaim diproses, tetapi server tidak mengirim consultation ID untuk klaim ini. Ruang chat tidak dibuka karena tidak ada sesi yang terkonfirmasi.",
          );
          haptics.error();
          return;
        }
        haptics.success();
        router.push({
          pathname: ROUTES.PRACTITIONER.CHAT,
          params: { consultationId },
        } as never);
      },
      onError: () => haptics.error(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-card px-5 py-3 border-b border-border">
        <HStack space="md" className="items-center justify-between">
          <Pressable
            onPress={() =>
              safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)
            }
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="p-1 -ml-1"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Badge
            variant="outline"
            className="bg-muted border-border rounded-full"
          >
            <BadgeText className="text-xs text-foreground">
              Antrian server
            </BadgeText>
          </Badge>
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="sm">
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <HStack space="sm" className="items-center">
              <Bell size={19} className="text-secondary" />
              <Heading size="md" bold className="text-foreground">
                Permintaan matching
              </Heading>
            </HStack>
            {queue.isLoading && (
              <Text size="sm" className="text-muted-foreground">
                Memuat antrian dari server…
              </Text>
            )}
            {queue.isError && (
              <Alert action="error">
                <AlertIcon />
                <AlertText>
                  Antrian tidak dapat dimuat. Tidak ada permintaan yang
                  diasumsikan.
                </AlertText>
              </Alert>
            )}
            {!queue.isLoading && !queue.isError && queue.data?.length === 0 && (
              <Text size="sm" className="text-muted-foreground">
                Antrian kosong.
              </Text>
            )}
            {queue.data?.map((item) => (
              <Card
                key={item.id}
                className="bg-muted rounded-2xl p-3 border border-border gap-1"
              >
                <Text size="xs" bold className="text-foreground">
                  Permintaan triase
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Pasien: {item.patientId}
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Status server: {item.disposition} • Level: {item.level}
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Score server: {item.score}
                </Text>
              </Card>
            ))}
          </Card>

          <BackendIntegrationBanner
            endpoint="POST /matching/requests/:id/claim"
            title="Pratinjau Antarmuka QA • War Room Klaim"
            description="Respons antrian triase server belum menyediakan matching request ID tetap. Antarmuka ditampilkan lengkap untuk evaluasi tata letak alur klaim oleh tim QA."
          />

          <Button
            isDisabled={!canClaim || claimMutation.isPending}
            onPress={handleClaim}
            className={`w-full rounded-xl ${canClaim ? "bg-primary" : ""}`}
            accessibilityLabel={
              canClaim ? "Klaim antrean" : "Belum ada antrean untuk diklaim"
            }
          >
            <ButtonText
              className={
                canClaim
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }
            >
              {claimMutation.isPending
                ? "Mengklaim antrean..."
                : canClaim
                  ? "Klaim matching antrean"
                  : "Belum ada antrean untuk diklaim"}
            </ButtonText>
          </Button>

          {claimNotice && (
            <Alert action="error">
              <AlertIcon />
              <AlertText>{claimNotice}</AlertText>
            </Alert>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

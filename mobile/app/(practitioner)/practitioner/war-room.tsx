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
import { isDemoMode } from "@/config/demoMode";
import { ROUTES } from "@/constants";
import { BackendIntegrationBanner } from "@/components/common";
import { useClaimMatching, useTriageQueue } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function WarRoomScreen() {
  const router = useRouter();
  const queue = useTriageQueue();
  // Single gate for demo-only affordances. The raw env flag is never read in
  // this screen: isDemoMode() already covers both flags.
  const demoMode = isDemoMode();
  const claimMutation = useClaimMatching();
  // Set when a claim succeeded but there is no room to open, so the screen can
  // say so instead of navigating somewhere invented.
  const [claimNotice, setClaimNotice] = useState<string | null>(null);

  const handleClaim = () => {
    if (!demoMode) {
      haptics.error();
      return;
    }
    setClaimNotice(null);
    haptics.medium();
    claimMutation.mutate("dev-match-0001", {
      onSuccess: (data) => {
        // Server-issued id or nothing. Without one there is no room to open, so
        // the screen reports that instead of substituting a fixture id.
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
            <ArrowLeft size={20} className="text-foreground" />
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
            isDisabled={!demoMode || claimMutation.isPending}
            onPress={handleClaim}
            className={`w-full rounded-xl ${demoMode ? "bg-primary" : ""}`}
            accessibilityLabel={
              demoMode ? "Klaim antrean demo" : "Klaim antrean belum tersedia"
            }
          >
            <ButtonText
              className={
                demoMode
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }
            >
              {claimMutation.isPending
                ? "Mengklaim antrean..."
                : demoMode
                  ? "Klaim matching (Mode Mock Demo)"
                  : "Klaim matching belum tersedia"}
            </ButtonText>
          </Button>

          {claimNotice && (
            <Alert action="error">
              <AlertIcon />
              <AlertText>{claimNotice}</AlertText>
            </Alert>
          )}

          {!demoMode && (
            <HStack space="xs" className="items-center">
              <ShieldAlert size={14} className="text-muted-foreground" />
              <Text size="xs" className="text-muted-foreground">
                Klaim matching hanya tersedia di mode demo. Tanpa ID dari
                server, layar ini tidak membuka ruang chat apa pun.
              </Text>
            </HStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

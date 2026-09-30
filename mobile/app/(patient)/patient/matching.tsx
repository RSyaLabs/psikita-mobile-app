import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Clock, ShieldAlert } from "lucide-react-native";
import {
  Button,
  ButtonSpinner,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
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
    room.matchingRequestId &&
    room.assignedDoctor?.id,
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
            params: { consultationId: context.consultationId },
          } as never);
        },
        onError: () => haptics.error(),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <HStack space="sm" className="items-center mb-5">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke dashboard"
            className="p-1 -ml-1 active:opacity-70"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <Heading size="xl" bold className="text-foreground">
            Pencocokan
          </Heading>
        </HStack>

        {waitingRoom.isLoading && (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <HStack space="sm" className="items-center">
              <Clock size={20} className="text-secondary" />
              <Text size="sm" className="text-muted-foreground">
                Memuat status dari server…
              </Text>
            </HStack>
          </Card>
        )}

        {waitingRoom.isError && (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <HStack space="sm" className="items-center">
              <ShieldAlert size={20} className="text-destructive" />
              <Heading size="sm" bold className="text-foreground">
                Status tidak tersedia
              </Heading>
            </HStack>
            <Text size="sm" className="text-muted-foreground">
              Matching gagal dimuat. Posisi antrean dan akses checkout
              dinonaktifkan.
            </Text>
          </Card>
        )}

        {!waitingRoom.isLoading && !waitingRoom.isError && !room && (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <Text size="sm" className="text-muted-foreground">
              Status matching belum tersedia.
            </Text>
          </Card>
        )}

        {room && !waitingRoom.isError && !isMatched && (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <Heading size="md" bold className="text-foreground">
              Menunggu server
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Status: {room.status}. Posisi dan estimasi hanya ditampilkan jika
              tersedia dari server.
            </Text>
            {room.position !== undefined && (
              <Text size="xs" className="text-muted-foreground">
                Posisi: {room.position}
              </Text>
            )}
            {room.estimatedWaitSeconds !== undefined && (
              <Text size="xs" className="text-muted-foreground">
                Estimasi: {Math.ceil(room.estimatedWaitSeconds / 60)} menit
              </Text>
            )}
          </Card>
        )}

        {room && !waitingRoom.isError && isMatched && (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <Heading size="md" bold className="text-foreground">
              Practisi ditemukan
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              {room.assignedDoctor?.name ||
                "Detail praktisi belum tersedia dari server."}
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Konteks ruangan akan dibuat hanya setelah respons konsultasi
              server tervalidasi.
            </Text>
          </Card>
        )}

        <Button
          size="lg"
          isDisabled={!canRequestConsultation || createConsultation.isPending}
          onPress={handleCreateConsultation}
          className="!opacity-100 w-full mt-5 rounded-xl bg-muted border border-border"
        >
          {createConsultation.isPending ? (
            <ButtonSpinner />
          ) : (
            <ButtonText className="text-muted-foreground">
              {canRequestConsultation
                ? "Lanjut dengan konteks server"
                : "Checkout belum tersedia"}
            </ButtonText>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
          className="w-full mt-3 rounded-xl border-border bg-card"
        >
          <ButtonText className="text-foreground">Kembali</ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

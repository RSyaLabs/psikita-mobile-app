import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Star } from "lucide-react-native";
import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useSubmitFeedback,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

export default function RatingScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const feedbackMutation = useSubmitFeedback();
  const [star, setStar] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!context || context.status !== "FINISHED" || star < 1) {
      haptics.error();
      return;
    }
    feedbackMutation.mutate(
      { context, star: star, comment: comment },
      {
        onSuccess: () => {
          haptics.success();
          router.replace(ROUTES.PATIENT.HISTORY);
        },
        onError: () => haptics.error(),
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-primary px-5 py-4 flex-row items-center gap-3">
        <Pressable
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.HISTORY)}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          className="p-1 -ml-1"
        >
          <ArrowLeft size={20} className="text-primary-foreground" />
        </Pressable>
        <Heading size="md" bold className="text-primary-foreground">
          Ulasan sesi
        </Heading>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!context || context.status !== "FINISHED" ? (
          <Card className="bg-card rounded-3xl p-5 border border-border gap-3">
            <Heading size="md" bold className="text-foreground">
              Ulasan belum tersedia
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Ulasan hanya dapat dikirim setelah konteks konsultasi tervalidasi
              dan server mengonfirmasi status FINISHED.
            </Text>
            <Button
              variant="outline"
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.HISTORY)}
              className="rounded-xl"
            >
              <ButtonText className="text-foreground">Kembali</ButtonText>
            </Button>
          </Card>
        ) : (
          <VStack space="sm">
            <Card className="bg-card rounded-3xl p-5 border border-border gap-2">
              <Heading size="md" bold className="text-foreground">
                Bagaimana sesinya?
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                Data praktisi dan tanggal belum ditambahkan jika tidak tersedia
                dari server.
              </Text>
            </Card>
            <Card className="bg-card rounded-3xl p-5 border border-border gap-4">
              <HStack space="sm" className="items-center justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setStar(value)}
                    accessibilityRole="button"
                    accessibilityLabel={`${value} bintang`}
                  >
                    <Star
                      size={30}
                      className={
                        value <= star
                          ? "text-warning fill-warning"
                          : "text-muted-foreground"
                      }
                    />
                  </Pressable>
                ))}
              </HStack>
              <Textarea className="bg-muted rounded-xl border-0">
                <TextareaInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Ceritakan pengalaman Anda (opsional)"
                  className="text-sm text-foreground"
                />
              </Textarea>
              <Button
                size="lg"
                isDisabled={feedbackMutation.isPending || star < 1}
                onPress={handleSubmit}
                className="w-full rounded-xl"
              >
                {feedbackMutation.isPending ? (
                  <ButtonSpinner />
                ) : (
                  <ButtonText>Kirim ulasan</ButtonText>
                )}
              </Button>
            </Card>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

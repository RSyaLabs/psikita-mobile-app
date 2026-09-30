import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react-native";
import {
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
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
  ScrollView,
  Text,
  VStack,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { BackendIntegrationBanner } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

const TRIAGE_OPTIONS = [
  "Tidak pernah",
  "Beberapa hari",
  "Sering, hampir tiap minggu",
  "Hampir setiap hari",
];

export default function TriageScreen() {
  const router = useRouter();
  const toast = useToast();
  const { guest, mode } = useLocalSearchParams<{
    guest?: string;
    mode?: string;
  }>();
  const isGuest = guest === "true";
  const isAssessment = mode === "assessment" || isGuest;

  const [selectedOpt, setSelectedOpt] = useState("Sering, hampir tiap minggu");

  const handleBack = () => {
    haptics.light();
    safeNavigateBack(
      router,
      isGuest ? ROUTES.AUTH.LOGIN : ROUTES.PATIENT.DASHBOARD,
    );
  };

  const handleContinue = () => {
    haptics.medium();
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="warning" className="bg-card border border-warning">
          <ToastTitle className="text-foreground font-bold">Pratinjau QA Aktif</ToastTitle>
          <ToastDescription className="text-muted-foreground text-xs">
            Payload triase ({selectedOpt}) siap dikirim ke POST /triage/submit setelah endpoint backend diaktifkan.
          </ToastDescription>
        </Toast>
      ),
    });

    if (isAssessment) {
      router.push({
        pathname: ROUTES.PATIENT.ASSESSMENT_RESULT,
        params: { guest: isGuest ? "true" : "false" },
      } as never);
    } else {
      router.push(ROUTES.PATIENT.MATCHING as never);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <VStack space="xs" className="mb-4">
          <HStack space="sm" className="items-center mb-3">
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="p-1 -ml-1 active:opacity-70"
            >
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">
              {isAssessment ? "Asesmen" : "Triase Konsultasi"}
            </Heading>
          </HStack>

          {/* Integration Banner for QA & BE */}
          <BackendIntegrationBanner
            endpoint="POST /triage/submit"
            badgeText="Fitur belum tersedia"
            title="Pratinjau Antarmuka QA • Triase"
            description="Asesmen tidak tersedia dari endpoint server saat ini. Antarmuka ditampilkan lengkap untuk evaluasi alur tim QA dan penyesuaian payload tim backend."
            className="mb-3"
          />

          {/* Progress Row */}
          <HStack space="md" className="items-center justify-between mb-1.5">
            <Text size="xs" bold className="text-foreground">
              {isAssessment
                ? "Pertanyaan 3 dari 5 • Skrining Mandiri"
                : "Pertanyaan 3 dari 5 • Menuju Konsultasi"}
            </Text>
            <Text size="xs" className="text-muted-foreground font-medium">
              60%
            </Text>
          </HStack>
          <Progress value={60} className="w-full h-1.5 bg-muted rounded-full">
            <ProgressFilledTrack className="bg-secondary" />
          </Progress>
        </VStack>

        {/* Question Zone */}
        <Box className="mb-5">
          <Heading size="lg" bold className="text-foreground leading-snug">
            Dalam 2 minggu terakhir, seberapa sering kamu merasa cemas sampai susah tidur?
          </Heading>
        </Box>

        {/* Accessible Gluestack RadioGroup */}
        <RadioGroup
          value={selectedOpt}
          onChange={(val) => {
            haptics.selection();
            setSelectedOpt(val);
          }}
          className="mb-6 gap-3"
        >
          {TRIAGE_OPTIONS.map((opt) => {
            const isSelected = selectedOpt === opt;
            return (
              <Radio
                key={opt}
                value={opt}
                accessibilityRole="radio"
                accessibilityLabel={opt}
                accessibilityState={{ checked: isSelected }}
                className={`p-4 rounded-xl border flex-row items-center active:opacity-90 ${
                  isSelected
                    ? "bg-muted border-primary"
                    : "bg-card border-border"
                }`}
              >
                <RadioIndicator className="border-2 border-border bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary">
                  <RadioIcon />
                </RadioIndicator>
                <RadioLabel
                  className={`text-sm ml-3 flex-1 ${
                    isSelected
                      ? "font-semibold text-foreground"
                      : "font-normal text-foreground"
                  }`}
                >
                  {opt}
                </RadioLabel>
              </Radio>
            );
          })}
        </RadioGroup>

        {/* Navigation Action Buttons */}
        <HStack space="sm" className="items-center mt-auto mb-4">
          <Button
            variant="outline"
            size="lg"
            onPress={handleBack}
            className="h-[52px] px-6 rounded-xl bg-card border-border active:bg-muted flex-row items-center justify-center"
          >
            <ButtonIcon as={ArrowLeft} className="text-foreground mr-1" />
            <ButtonText className="text-foreground font-semibold text-base">
              Kembali
            </ButtonText>
          </Button>

          <Button
            size="lg"
            // No accessibilityLabel override. The button is fully enabled and
            // routes to matching, so announcing it as "Asesmen belum tersedia"
            // told a screen-reader user the opposite of what pressing it does.
            // WCAG 2.5.3 requires the accessible name to contain the visible
            // label, so the visible text is left to be the name.
            onPress={handleContinue}
            className="flex-1 h-[52px] bg-secondary rounded-xl active:opacity-90"
          >
            <ButtonText className="text-secondary-foreground font-semibold text-base">
              {isAssessment ? "Lihat Hasil Evaluasi" : "Cari Psikolog"}
            </ButtonText>
            <ButtonIcon as={ArrowRight} className="text-secondary-foreground" />
          </Button>
        </HStack>

        {/* Secure Note */}
        <Card className="bg-muted rounded-xl p-3 border border-border flex-row items-center gap-2.5">
          <Lock size={16} className="text-foreground" />
          <Text size="xs" className="text-foreground flex-1">
            Jawabanmu tersimpan secara privat. {isAssessment ? "Hasil evaluasi mandiri akan ditampilkan setelah ini." : "Hasil triase digunakan untuk menentukan psikolog yang sesuai."}
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

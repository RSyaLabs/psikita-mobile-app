import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react-native";
import {
  Box, Button, ButtonText, Card, HStack, Heading,
  Pressable, ScrollView, Text, VStack,
} from "@/components/ui";
import { useTriageAssessment, useMyVerificationStatus } from "@/hooks/useApiQueries";
import { isAssessmentResult } from "@/clinical/assessment";
import { ROUTES } from "@/constants/routes";

const LEVEL_LABEL: Record<"GREEN" | "YELLOW" | "RED", string> = {
  GREEN: "Rendah",
  YELLOW: "Perlu perhatian",
  RED: "Perlu penanganan segera",
};

export default function AssessmentResultScreen() {
  const router = useRouter();
  const { triageId, mode } = useLocalSearchParams<{
    triageId?: string | string[];
    mode?: string;
  }>();
  const id = typeof triageId === "string" ? triageId.trim() : "";
  const resultQuery = useTriageAssessment(id);
  const { data: kyc } = useMyVerificationStatus();
  const result = isAssessmentResult(resultQuery.data) ? resultQuery.data : undefined;
  const urgent = result?.hasRedFlags === true ||
    result?.level === "RED" || result?.disposition === "CRISIS";
  const canMatch = !!result && !urgent &&
    (kyc?.status === "VERIFIED" || kyc?.status === "APPROVED");

  const goBack = () => router.replace(ROUTES.PATIENT.DASHBOARD as never);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" className="w-full max-w-[520px] self-center flex-1">
          <HStack className="items-center gap-3">
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={goBack} className="p-2 -ml-2">
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">Hasil Skrining Awal</Heading>
          </HStack>
          {!id || resultQuery.isError ? (
            <VStack space="lg">
              <Heading size="lg" className="text-foreground">Hasil belum tersedia</Heading>
              <Text className="text-muted-foreground">Tidak ada hasil yang dapat dikonfirmasi.</Text>
              {id ? <Button variant="outline" onPress={() => void resultQuery.refetch()}><ButtonText>Coba Lagi</ButtonText></Button> : null}
              <Button onPress={goBack}><ButtonText>Kembali ke Beranda</ButtonText></Button>
            </VStack>
          ) : resultQuery.isLoading ? (
            <Text className="text-muted-foreground">Memuat hasil...</Text>
          ) : result ? (
            <VStack space="lg" className="flex-1">
              <Card className="rounded-2xl bg-card border border-border p-5">
                <VStack space="md">
                  <HStack className="items-center gap-2">
                    {urgent ? <ShieldAlert size={22} className="text-destructive" /> :
                      <CheckCircle2 size={22} className="text-primary" />}
                    <Text className="text-foreground font-semibold">
                      {urgent ? "Perlu tindak lanjut segera" : "Skrining tersimpan"}
                    </Text>
                  </HStack>
                  <Heading size="3xl" bold className="text-foreground">{result.score}</Heading>
                  <Text className="text-muted-foreground">Skor dari sistem</Text>
                  <Text className="text-foreground font-semibold">{LEVEL_LABEL[result.level]}</Text>
                </VStack>
              </Card>
              {urgent ? (
                <Card className="rounded-2xl border border-destructive bg-card p-5">
                  <VStack space="sm">
                    <Heading size="lg" className="text-foreground">Utamakan keselamatan</Heading>
                    <Text className="text-foreground">
                      Jika kamu dalam bahaya atau membutuhkan bantuan segera, hubungi layanan darurat setempat atau fasilitas kesehatan terdekat.
                    </Text>
                    <Text className="text-muted-foreground">
                      Hasil ini bukan diagnosis dan tidak menggantikan pemeriksaan profesional.
                    </Text>
                  </VStack>
                </Card>
              ) : (
                <Text className="text-muted-foreground">
                  Hasil skrining bukan diagnosis. Konsultasikan dengan praktisi untuk langkah berikutnya.
                </Text>
              )}
              {result.notes ? (
                <Card className="bg-card border border-border p-4 rounded-xl">
                  <Text className="text-foreground">{result.notes}</Text>
                </Card>
              ) : null}
              <Box className="flex-1" />
              {!urgent && mode === "consultation" && canMatch ? (
                <Button
                  className="h-12 rounded-xl"
                  onPress={() => router.push({
                    pathname: ROUTES.PATIENT.MATCHING,
                    params: { triageId: result.id },
                  } as never)}
                >
                  <ButtonText>Cari Praktisi</ButtonText>
                  <ArrowRight size={18} color="#FFFFFF" />
                </Button>
              ) : null}
              {!urgent && !canMatch && mode === "consultation" ? (
                <Text className="text-muted-foreground">
                  Verifikasi identitas diperlukan sebelum mencari praktisi.
                </Text>
              ) : null}
              <Button variant="outline" className="h-12 rounded-xl" onPress={goBack}>
                <ButtonText>Kembali ke Beranda</ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack space="md">
              <Heading size="lg">Hasil belum tersedia</Heading>
              <Button variant="outline" onPress={() => void resultQuery.refetch()}><ButtonText>Coba Lagi</ButtonText></Button>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

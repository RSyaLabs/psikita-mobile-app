import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ClipboardList, ChevronRight } from "lucide-react-native";
import { Box, Button, ButtonText, Card, Heading, HStack, Pressable, ScrollView, Text, VStack } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { useMyAssessments, usePsychometricInstruments, useStartPatientAssessment } from "@/hooks/useApiQueries";

export default function MyAssessmentsScreen() {
  const router = useRouter();
  const instruments = usePsychometricInstruments("ASSESSMENT");
  const assessments = useMyAssessments();
  const start = useStartPatientAssessment();
  const [error, setError] = useState("");
  const launch = async (typeCode: string, version: number) => {
    if (start.isPending) return;
    setError("");
    try {
      const a = await start.mutateAsync({ typeCode, version });
      router.push({ pathname: ROUTES.PATIENT.FILL_ASSESSMENT, params: { assessmentId: a.id } } as never);
    } catch {
      setError("Belum dapat memulai asesmen.");
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20, flexGrow: 1 }}>
        <VStack space="lg" className="w-full max-w-[520px] self-center">
          <HStack space="md" className="items-center">
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" className="text-foreground">Asesmen Mandiri</Heading>
          </HStack>
          <Heading size="md" className="text-foreground">Pilih kuesioner</Heading>
          {instruments.isError ? <Button variant="outline" onPress={() => void instruments.refetch()}><ButtonText>Coba Lagi</ButtonText></Button> : null}
          {instruments.isLoading ? <Text className="text-muted-foreground">Memuat instrumen...</Text> : null}
          {instruments.data?.map(item => (
            <Pressable
              key={`${item.code}-${item.version}`} accessibilityRole="button"
              onPress={() => void launch(item.code, item.version)}
              disabled={start.isPending}
              className="bg-card border border-border rounded-xl p-4"
            >
              <HStack space="md" className="items-center">
                <ClipboardList size={22} className="text-primary" />
                <VStack className="flex-1" space="xs">
                  <Text className="font-semibold text-foreground">{item.name}</Text>
                  <Text size="xs" className="text-muted-foreground">Versi {item.version}</Text>
                </VStack>
                <ChevronRight size={18} className="text-primary" />
              </HStack>
            </Pressable>
          ))}
          {error ? <Text accessibilityRole="alert" className="text-destructive">{error}</Text> : null}
          <Heading size="md" className="text-foreground pt-4">Riwayat</Heading>
          {assessments.isError ? <Button variant="outline" onPress={() => void assessments.refetch()}><ButtonText>Muat Ulang</ButtonText></Button> : null}
          {assessments.data?.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: ROUTES.PATIENT.FILL_ASSESSMENT, params: { assessmentId: item.id } } as never)}
              className="bg-card border border-border rounded-xl p-4"
            >
              <HStack className="items-center justify-between">
                <Text className="font-semibold text-foreground">{item.typeCode}</Text>
                <Text className="text-muted-foreground">{item.status === "DRAFT" ? "Lanjutkan" : item.status === "COMPLETED" ? "Selesai" : "Dibatalkan"}</Text>
              </HStack>
            </Pressable>
          ))}
          {!assessments.isLoading && assessments.data?.length === 0 ? <Text className="text-muted-foreground">Belum ada asesmen.</Text> : null}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

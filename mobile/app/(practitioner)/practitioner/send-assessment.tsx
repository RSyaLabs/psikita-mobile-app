import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ClipboardList, CheckCircle2 } from "lucide-react-native";
import {
  Box, Button, ButtonText, Card, Heading, HStack, Pressable,
  ScrollView, Text, VStack,
} from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import {
  useActiveConsultation,
  useAssignConsultationAssessment,
  usePsychometricInstruments,
} from "@/hooks/useApiQueries";
import type { PsychometricInstrumentDto } from "@/api/psychometrics.service";

type Preference = "all" | "stress" | "anxiety" | "depression";
const preferences: Array<{ key: Preference; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "anxiety", label: "Kecemasan" },
  { key: "depression", label: "Depresi" },
  { key: "stress", label: "Stres" },
];

export default function SendAssessmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId?: string }>();
  const id = typeof params.consultationId === "string" ? params.consultationId : "";
  const consultation = useActiveConsultation(id || undefined);
  const context = consultation.context;
  const catalog = usePsychometricInstruments("CONSULTATION", Boolean(context && context.status === "ACTIVE"));
  const assign = useAssignConsultationAssessment();
  const [preference, setPreference] = useState<Preference>("all");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const instruments = useMemo(() => {
    const all = catalog.data ?? [];
    return [...all].sort((left, right) => {
      const l = preference !== "all" && left.supportedDimensions.includes(preference) ? 1 : 0;
      const r = preference !== "all" && right.supportedDimensions.includes(preference) ? 1 : 0;
      return r - l || left.name.localeCompare(right.name);
    });
  }, [catalog.data, preference]);

  const send = async (instrument: PsychometricInstrumentDto) => {
    if (!context || context.status !== "ACTIVE" || assign.isPending) return;
    setError("");
    try {
      await assign.mutateAsync({
        consultationId: context.consultationId,
        typeCode: instrument.code,
        version: instrument.version,
      });
      setSent(true);
    } catch {
      setError("Kuesioner belum terkirim. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 }}>
        <VStack space="lg" className="max-w-[520px] w-full self-center">
          <HStack className="items-center gap-3">
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.back()} className="p-2 -ml-2">
              <ArrowLeft size={22} className="text-foreground" />
            </Pressable>
            <Heading size="xl" bold className="text-foreground">Kirim Asesmen</Heading>
          </HStack>
          {sent ? (
            <VStack space="lg" className="items-center pt-12">
              <CheckCircle2 size={44} className="text-primary" />
              <Heading size="lg" className="text-foreground">Asesmen dikirim</Heading>
              <Button onPress={() => router.replace({ pathname: ROUTES.PRACTITIONER.CHAT, params: { consultationId: id } } as never)} className="w-full rounded-xl h-12">
                <ButtonText>Kembali ke Chat</ButtonText>
              </Button>
            </VStack>
          ) : !context || context.status !== "ACTIVE" ? (
            <Card className="p-4 border border-border bg-card rounded-xl">
              <Text className="text-muted-foreground">Asesmen hanya dapat dikirim saat konsultasi aktif.</Text>
            </Card>
          ) : (
            <>
              <HStack className="flex-row flex-wrap gap-2">
                {preferences.map(item => (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    accessibilityState={{ selected: preference === item.key }}
                    onPress={() => setPreference(item.key)}
                    className={`rounded-full px-4 py-2 border ${preference === item.key ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                  >
                    <Text className={preference === item.key ? "text-primary font-semibold" : "text-foreground"}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
              {catalog.isLoading ? <Text className="text-muted-foreground">Memuat instrumen...</Text> : null}
              {catalog.isError ? (
                <Button variant="outline" onPress={() => void catalog.refetch()}><ButtonText>Coba Lagi</ButtonText></Button>
              ) : null}
              {instruments.map(instrument => (
                <Card key={`${instrument.code}:${instrument.version}`} className="p-4 border border-border bg-card rounded-xl">
                  <HStack space="md" className="items-center justify-between">
                    <ClipboardList size={24} className="text-primary" />
                    <VStack space="xs" className="flex-1">
                      <Heading size="sm" className="text-foreground">{instrument.name}</Heading>
                      <Text size="xs" className="text-muted-foreground">{instrument.code} · v{instrument.version}</Text>
                    </VStack>
                    <Button isDisabled={assign.isPending} onPress={() => void send(instrument)} className="rounded-xl">
                      <ButtonText>Kirim</ButtonText>
                    </Button>
                  </HStack>
                </Card>
              ))}
              {error ? <Text className="text-sm text-destructive" accessibilityRole="alert">{error}</Text> : null}
              {!catalog.isLoading && !catalog.isError && instruments.length === 0 ?
                <Text className="text-muted-foreground">Instrumen belum tersedia.</Text> : null}
            </>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

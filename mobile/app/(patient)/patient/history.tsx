import {
  HISTORY_TABS,
  consultationStatusLabel,
  matchesHistoryTab,
} from "@/clinical/activeConsultation";

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react-native";
import {
  Badge,
  BadgeText,
  Box,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import { useConsultations } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";

function formatDate(value: string | undefined): string {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Tanggal belum tersedia"
    : date.toLocaleDateString("id-ID");
}

function isCapabilityUnavailable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  return (
    record.statusCode === 501 ||
    record.error === "CAPABILITY_UNAVAILABLE" ||
    record.code === "CAPABILITY_UNAVAILABLE"
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const consultations = useConsultations();
  const sessions = consultations.data ?? [];
  const isPending = consultations.isLoading || consultations.isFetching;
  const capabilityUnavailable =
    consultations.isError && isCapabilityUnavailable(consultations.error);
  const tabs = HISTORY_TABS;
  const filteredSessions = sessions.filter((session) =>
    matchesHistoryTab(session.status, activeTab),
  );

  const openSession = (consultationId: string, status: string) => {
    const route =
      status === "FINISHED"
        ? ROUTES.PATIENT.SESSION_SUMMARY
        : ROUTES.PATIENT.CHAT_ROOM;
    router.push({ pathname: route, params: { consultationId } } as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
        <HStack space="sm" className="items-center">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="p-1 -ml-1"
          >
            <ArrowLeft size={22} className="text-primary-foreground" />
          </Pressable>
          <Heading level={1} size="lg" bold className="text-primary-foreground">
            Riwayat konsultasi
          </Heading>
        </HStack>
        <HStack space="xs" className="items-center mt-4">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`px-3 py-1.5 rounded-full ${active ? "bg-card" : "bg-primary-foreground/10"}`}
              >
                <Text
                  size="xs"
                  bold
                  className={
                    active ? "text-foreground" : "text-primary-foreground"
                  }
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <LoadingState label="Memuat riwayat" />
        ) : capabilityUnavailable ? (
          <UnavailableState
            label="Riwayat belum tersedia"
            description="Endpoint daftar konsultasi belum memiliki kontrak server yang terverifikasi."
          />
        ) : consultations.isError ? (
          <ErrorState
            errorLabel="Riwayat gagal dimuat"
            description="Server tidak dapat mengembalikan daftar konsultasi saat ini."
            onRetry={consultations.refetch}
          />
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            label="Belum ada riwayat"
            description="Belum ada sesi pada kategori ini."
          />
        ) : null}
        {!isPending &&
          !consultations.isError &&
          filteredSessions.length > 0 && (
            <VStack space="sm">
              {filteredSessions.map((session) => {
                const practitionerName =
                  session.practitionerName || "Konsultasi";
                const practitionerSpecialization =
                  session.practitionerSpecialization ||
                  "Detail praktisi belum tersedia dari server.";

                return (
                  <Card
                    key={session.id}
                    className="bg-card rounded-2xl p-4 border border-border gap-3"
                  >
                    <HStack space="sm" className="items-center justify-between">
                      <VStack space="xs" className="flex-1">
                        <Text size="sm" bold className="text-foreground">
                          {practitionerName}
                        </Text>
                        <Text size="xs" className="text-muted-foreground">
                          {practitionerSpecialization}
                        </Text>
                      </VStack>
                    <Badge
                      variant="outline"
                      className="bg-muted border-border rounded-full"
                    >
                      <BadgeText className="text-[10px] text-foreground">
                        {consultationStatusLabel(session.status)}
                      </BadgeText>
                    </Badge>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <Clock size={13} className="text-muted-foreground" />
                    <Text size="xs" className="text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </Text>
                  </HStack>
                  <Pressable
                    onPress={() => openSession(session.id, session.status)}
                    accessibilityRole="button"
                    accessibilityLabel="Buka sesi"
                    className="flex-row items-center gap-1"
                  >
                    <Text size="xs" bold className="text-primary">
                      {session.status === "FINISHED"
                        ? "Lihat ringkasan"
                        : "Buka sesi"}
                    </Text>
                    <ChevronRight size={14} className="text-primary" />
                  </Pressable>
                </Card>
                );
              })}
            </VStack>
          )}
      </ScrollView>
      <PatientTabBar activeTab="sesi" />
    </SafeAreaView>
  );
}

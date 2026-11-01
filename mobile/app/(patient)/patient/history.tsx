import {
  HISTORY_TABS,
  consultationStatusLabel,
  matchesHistoryTab,
} from "@/clinical/activeConsultation";

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Clock } from "lucide-react-native";
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
import { AppIcon } from "@/components/common/AppIcon";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import { usePatientConsultations } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";

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
  const consultations = usePatientConsultations();
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
      {/* Root Tab Header (No Back Button, Authentic Emblem) */}
      <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
        <HStack space="xs" className="items-center justify-between">
          <Heading level={1} size="lg" bold className="text-primary-foreground">
            Riwayat Konsultasi
          </Heading>
          <RNImage
            source={require("@/../assets/icon.png")}
            style={{ width: 30, height: 30, borderRadius: 8 }}
            resizeMode="cover"
          />
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
                className={`px-3.5 py-1.5 rounded-full ${active ? "bg-card" : "bg-primary-foreground/15"}`}
              >
                <Text
                  size="sm"
                  bold
                  className={
                    active ? "text-foreground font-bold" : "text-primary-foreground font-medium"
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
          paddingTop: 16,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <LoadingState message="Memuat riwayat konsultasi klinis..." />
        ) : capabilityUnavailable ? (
          <UnavailableState
            title="Riwayat konsultasi belum tersedia"
            description="Fitur riwayat sesi konsultasi sedang disiapkan oleh tim klinis."
          />
        ) : consultations.isError ? (
          <ErrorState
            title="Gagal memuat sesi"
            description="Periksa koneksi Anda dan coba lagi."
            onRetry={() => consultations.refetch()}
          />
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat konsultasi"
            description="Jadwal sesi dokter atau psikolog Anda akan tercatat di sini setelah Anda berkonsultasi."
            actionLabel="Cari Dokter Spesialis"
            onAction={() => router.push(ROUTES.PATIENT.DOCTORS)}
          />
        ) : (
          <VStack space="md">
            {filteredSessions.map((session) => {
              const practitionerName =
                session.practitionerName || "Praktisi SeraPhany";
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
                      <Text size="sm" className="text-muted-foreground font-medium">
                        {practitionerSpecialization}
                      </Text>
                    </VStack>
                    <Badge
                      variant="outline"
                      className="bg-muted border-border rounded-full px-3 py-1"
                    >
                      <BadgeText className="text-sm font-semibold text-foreground">
                        {consultationStatusLabel(session.status)}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <HStack space="xs" className="items-center">
                    <AppIcon icon={Clock} size={15} tone="muted" />
                    <Text size="sm" className="text-muted-foreground font-medium">
                      {formatDate(session.createdAt)}
                    </Text>
                  </HStack>

                  <Pressable
                    onPress={() => openSession(session.id, session.status)}
                    accessibilityRole="button"
                    accessibilityLabel="Buka sesi"
                    className="flex-row items-center gap-1.5 pt-1"
                  >
                    <Text size="sm" bold className="text-primary font-bold">
                      {session.status === "FINISHED"
                        ? "Lihat ringkasan"
                        : "Buka sesi"}
                    </Text>
                    <AppIcon icon={ChevronRight} size={16} tone="primary" />
                  </Pressable>
                </Card>
              );
            })}
          </VStack>
        )}
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="sesi" />
    </SafeAreaView>
  );
}

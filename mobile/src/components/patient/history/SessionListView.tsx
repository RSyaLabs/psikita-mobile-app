import React from "react";
import { View } from "react-native";
import { ChevronRight, Calendar, ArrowRight } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";

export interface SessionItem {
  id: string;
  practitionerName: string;
  practitionerSpecialization?: string;
  date: string;
  status: "ACTIVE" | "WAITING" | "FINISHED" | "CANCELLED";
  format?: string; // "Chat" | "Video"
  resultAvailable?: boolean;
  followUpAvailable?: boolean;
}

export interface SessionListViewProps {
  activeTab: "berlangsung" | "selesai";
  onTabChange: (tab: "berlangsung" | "selesai") => void;
  activeSession?: SessionItem | null;
  completedSessions?: SessionItem[];
  isGuest?: boolean;
  onSelectSession: (session: SessionItem) => void;
  onViewStatus: (session?: SessionItem | null) => void;
  onViewUpcomingSchedule: () => void;
}

export function SessionListView({
  activeTab,
  onTabChange,
  activeSession,
  completedSessions = [],
  isGuest = false,
  onSelectSession,
  onViewStatus,
  onViewUpcomingSchedule,
}: SessionListViewProps) {
  const defaultActiveSession: SessionItem | null = activeSession ?? null;
  const defaultCompletedSessions: SessionItem[] = completedSessions;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        gap: 18,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title Header (Wireframe RW1) */}
      <VStack space="xs" className="pt-2">
        <Heading size="2xl" bold className="text-foreground text-[26px] leading-tight">
          Sesi
        </Heading>
        <Text size="md" className="text-muted-foreground text-[15px]">
          Semua konsultasimu di satu tempat.
        </Text>
      </VStack>

      {/* Segmented Filter Pills */}
      <HStack space="sm" className="w-full">
        <Pressable
          testID="tab-berlangsung"
          onPress={() => onTabChange("berlangsung")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "berlangsung" }}
          className={`flex-1 items-center justify-center min-h-[44px] rounded-full border-2 ${
            activeTab === "berlangsung"
              ? "border-foreground bg-[#EEEEEE] font-bold"
              : "border-border bg-card"
          }`}
        >
          <Text
            size="sm"
            bold={activeTab === "berlangsung"}
            className={activeTab === "berlangsung" ? "text-foreground font-bold" : "text-muted-foreground"}
          >
            Berlangsung
          </Text>
        </Pressable>

        <Pressable
          testID="tab-selesai"
          onPress={() => onTabChange("selesai")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "selesai" }}
          className={`flex-1 items-center justify-center min-h-[44px] rounded-full border-2 ${
            activeTab === "selesai"
              ? "border-foreground bg-[#EEEEEE] font-bold"
              : "border-border bg-card"
          }`}
        >
          <Text
            size="sm"
            bold={activeTab === "selesai"}
            className={activeTab === "selesai" ? "text-foreground font-bold" : "text-muted-foreground"}
          >
            Selesai
          </Text>
        </Pressable>
      </HStack>

      {/* BERLANGSUNG SECTION */}
      {activeTab === "berlangsung" && (
        <VStack space="md">
          <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider font-bold">
            BERLANGSUNG
          </Text>

          {!defaultActiveSession ? (
            <Card className="border-[1.5px] border-border rounded-2xl p-4 bg-card gap-1.5">
              <Text size="md" bold className="text-foreground font-bold">
                Belum ada sesi berlangsung
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Sesi konsultasi aktif atau antrean pencocokan psikolog akan tampil di sini.
              </Text>
            </Card>
          ) : (
            <Card
              testID="active-consultation-card"
              className="border-[2.5px] border-foreground rounded-2xl p-4 bg-card gap-2.5"
            >
              <HStack space="sm" className="items-center justify-between">
                <Badge
                  variant="outline"
                  className="border-2 border-foreground rounded-full px-2.5 py-0.5 bg-card"
                >
                  <BadgeText className="text-foreground text-sm font-bold">
                    {defaultActiveSession.status === "WAITING" ? "Mencari psikolog" : "Sesi berjalan"}
                  </BadgeText>
                </Badge>
                <Text size="sm" className="text-muted-foreground">
                  Dimulai {defaultActiveSession.date}
                </Text>
              </HStack>

              <VStack space="xs">
                <Text size="md" bold className="text-foreground text-base font-bold">
                  {defaultActiveSession.status === "WAITING" ? "Konsultasi baru" : defaultActiveSession.practitionerName}
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  {defaultActiveSession.status === "WAITING"
                    ? "Posisi antreanmu aman."
                    : defaultActiveSession.practitionerSpecialization || "Sesi aktif di ruang konsultasi."}
                </Text>
              </VStack>

              <Button
                testID="btn-lihat-status"
                variant="outline"
                size="lg"
                onPress={() => onViewStatus(defaultActiveSession)}
                className="h-[52px] w-full rounded-xl border-[1.5px] border-foreground mt-1"
              >
                <ButtonText className="text-foreground text-base font-semibold">
                  Lihat Status
                </ButtonText>
              </Button>
            </Card>
          )}
        </VStack>
      )}

      {/* TERAKHIR SELESAI SECTION */}
      <VStack space="md">
        <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider font-bold">
          TERAKHIR SELESAI
        </Text>

        <Card className="border-[1.5px] border-border rounded-xl bg-card overflow-hidden">
          {defaultCompletedSessions.length === 0 ? (
            <Box className="p-4">
              <Text size="sm" className="text-muted-foreground">
                Belum ada riwayat sesi konsultasi yang selesai.
              </Text>
            </Box>
          ) : (
            defaultCompletedSessions.map((session, index) => {
              const hasDivider = index > 0;
              return (
                <Pressable
                  key={session.id}
                  testID={`session-item-${session.id}`}
                  onPress={() => onSelectSession(session)}
                  accessibilityRole="button"
                  accessibilityLabel={`Lihat detail sesi dengan ${session.practitionerName}`}
                  className={`flex-row items-center justify-between min-h-[68px] px-4 py-3 ${
                    hasDivider ? "border-t border-dashed border-border" : ""
                  }`}
                >
                  <VStack space="xs" className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground text-[15px] font-bold">
                      {session.practitionerName}
                    </Text>
                    <Text size="sm" className="text-muted-foreground text-sm">
                      {session.date} · {session.followUpAvailable ? "Tindak lanjut tersedia" : "Hasil tersedia"}
                    </Text>
                  </VStack>
                  <HStack space="xs" className="items-center">
                    <Text size="sm" bold className="text-foreground font-semibold">
                      Lihat
                    </Text>
                    <AppIcon icon={ChevronRight} size={16} tone="foreground" />
                  </HStack>
                </Pressable>
              );
            })
          )}
        </Card>
      </VStack>

      {/* Jadwal Mendatang Shortcut Card (Wireframe RW1) */}
      <Pressable
        testID="btn-jadwal-mendatang"
        onPress={onViewUpcomingSchedule}
        accessibilityRole="button"
        accessibilityLabel="Lihat jadwal mendatang"
        className="border-[1.5px] border-dashed border-muted-foreground/60 rounded-xl p-4 bg-card/60 flex-row items-center justify-between"
      >
        <Text size="sm" bold className="text-foreground font-semibold text-[15px]">
          Lihat jadwal mendatang ›
        </Text>
        <AppIcon icon={Calendar} size={18} tone="foreground" />
      </Pressable>
    </ScrollView>
  );
}

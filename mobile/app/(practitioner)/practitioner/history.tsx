import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ROUTES } from "@/constants/routes";
import { FileSpreadsheet } from "lucide-react-native";
import { Pressable } from "@/components/ui";
import {
  ShareHistoryModal,
  ScheduleFollowUpModal,
  ExportSuccessModal,
} from "@/components/modals";
import { AppHeader } from "@/components/common";
import { PractitionerTabBar } from "@/components/navigation";
import { SessionHistoryItem } from "@/components/practitioner/SessionHistoryCard";
import {
  PractitionerHistorySearchFilter,
  PractitionerHistoryList,
} from "@/components/practitioner/history";
import { haptics } from "@/utils/haptics";
import {
  useConsultations,
  usePractitionerProfile,
} from "@/hooks/useApiQueries";
import { HISTORY_TABS, matchesHistoryTab } from "@/clinical/activeConsultation";
import { getInitials } from "@/utils/format";
import { resolveServerValue } from "@/utils/server-value";
import type { ConsultationResponseDto } from "@/types/api";

const UNAVAILABLE = "Belum tersedia";

function isCapabilityUnavailable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const record = error as Record<string, unknown>;
  return (
    record.statusCode === 501 ||
    record.error === "CAPABILITY_UNAVAILABLE" ||
    record.code === "CAPABILITY_UNAVAILABLE"
  );
}

function toSessionHistoryItem(
  consultation: ConsultationResponseDto,
): SessionHistoryItem {
  const patientName =
    consultation.patientName ||
    `Pasien (${consultation.patientId.slice(0, 8)})`;
  const icdCode = consultation.icdCode || UNAVAILABLE;
  const note = consultation.note || UNAVAILABLE;
  const avatarUrl =
    consultation.patientAvatar ||
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80";

  let status: "Selesai" | "Batal" | "Berjalan" = "Berjalan";
  if (consultation.status === "FINISHED") {
    status = "Selesai";
  } else if (consultation.status === "CANCELLED") {
    status = "Batal";
  }

  // A clinical record that says "45 mnt" when the server sent no duration is a
  // fabricated note, not a placeholder, so the header drops the figure instead
  // of substituting one.
  const typeText = resolveServerValue(
    consultation.durationMinutes,
    (minutes) => `Konsultasi Video ${minutes} mnt`,
    "Konsultasi Video (durasi belum tersedia)",
  );

  return {
    id: consultation.id,
    patientName,
    avatarUrl,
    fallbackText: getInitials(patientName),
    typeText,
    icdCode,
    status,
    note,
  };
}

const TABS = Array.from(HISTORY_TABS);

export default function PractitionerHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<SessionHistoryItem | null>(null);

  const { data: profile } = usePractitionerProfile();
  const {
    data: consultations = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultations();

  const sessions: SessionHistoryItem[] =
    consultations.map(toSessionHistoryItem);

  const filteredSessions = sessions.filter((s) => {
    const rawConsultation = consultations.find((c) => c.id === s.id);
    const matchTab = rawConsultation
      ? matchesHistoryTab(rawConsultation.status, activeTab)
      : true;

    const matchSearch =
      search.trim() === "" ||
      s.patientName.toLowerCase().includes(search.toLowerCase()) ||
      s.icdCode.toLowerCase().includes(search.toLowerCase()) ||
      s.note.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    return matchTab && matchSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        title="Riwayat Sesi"
        subtitle={resolveServerValue(
          profile?.fullName,
          (value) => value,
          UNAVAILABLE,
        )}
        fallbackRoute={ROUTES.PRACTITIONER.DASHBOARD}
        rightAction={
          <Pressable
            onPress={() => {
              haptics.light();
              setShowExportModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Ekspor riwayat konsultasi"
            className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
          >
            <FileSpreadsheet size={16} className="text-secondary" />
          </Pressable>
        }
      />

      <PractitionerHistorySearchFilter
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={TABS}
      />

      <PractitionerHistoryList
        items={filteredSessions}
        onSelectSession={(session) => {
          haptics.medium();
          router.push({
            pathname: ROUTES.PRACTITIONER.DIAGNOSIS,
            params: { consultationId: session.id },
          });
        }}
        onScheduleFollowUp={(session) => {
          setSelectedSession(session);
          setShowScheduleModal(true);
        }}
        isLoading={isLoading}
        isUnavailable={isCapabilityUnavailable(error)}
        isError={isError}
        onRetry={() => refetch()}
        onResetFilter={() => {
          setActiveTab("Semua");
          setSearch("");
        }}
      />

      <ShareHistoryModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      <ScheduleFollowUpModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        patientName={selectedSession?.patientName || "Pasien"}
      />

      <ExportSuccessModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <PractitionerTabBar activeTab="sesi" />
    </SafeAreaView>
  );
}

import React from "react";
import { ScrollView, VStack } from "@/components/ui";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import {
  SessionHistoryCard,
  SessionHistoryItem,
} from "@/components/practitioner/SessionHistoryCard";

interface PractitionerHistoryListProps {
  items: SessionHistoryItem[];
  onSelectSession: (item: SessionHistoryItem) => void;
  onScheduleFollowUp: (item: SessionHistoryItem) => void;
  isLoading: boolean;
  isUnavailable: boolean;
  isError: boolean;
  onRetry: () => void;
  onResetFilter: () => void;
}

export function PractitionerHistoryList({
  items,
  onSelectSession,
  onScheduleFollowUp,
  isLoading,
  isUnavailable,
  isError,
  onRetry,
  onResetFilter,
}: PractitionerHistoryListProps) {
  if (isLoading) {
    return <LoadingState label="Memuat riwayat sesi konsultasi..." />;
  }

  if (isUnavailable) {
    return (
      <UnavailableState
        label="Riwayat Sesi Belum Tersedia"
        description="Fitur riwayat sesi praktisi belum didukung oleh server backend."
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        errorLabel="Gagal Memuat Riwayat"
        description="Terjadi kesalahan jaringan saat mengambil data sesi."
        onRetry={onRetry}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      {items.length === 0 ? (
        <EmptyState
          label="Tidak Ada Sesi"
          description="Tidak ditemukan riwayat konsultasi dengan filter ini."
          actionLabel="Tampilkan Semua"
          onAction={onResetFilter}
        />
      ) : (
        <VStack space="sm">
          {items.map((session) => (
            <SessionHistoryCard
              key={session.id}
              session={session}
              onViewMedicalRecord={() => onSelectSession(session)}
              onScheduleFollowUp={() => onScheduleFollowUp(session)}
            />
          ))}
        </VStack>
      )}
    </ScrollView>
  );
}

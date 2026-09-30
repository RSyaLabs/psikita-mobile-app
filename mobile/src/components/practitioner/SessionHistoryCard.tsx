import React from "react";
import {
  Card,
  VStack,
  HStack,
  Text,
  Badge,
  BadgeText,
  Pressable,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui";

export interface SessionHistoryItem {
  id: string;
  patientName: string;
  avatarUrl: string;
  fallbackText: string;
  typeText: string;
  icdCode: string;
  status: "Selesai" | "Batal" | "Berjalan";
  note: string;
  actionText?: string;
}

export interface SessionHistoryCardProps {
  session: SessionHistoryItem;
  onViewMedicalRecord: () => void;
  onScheduleFollowUp: () => void;
}

export function SessionHistoryCard({
  session,
  onViewMedicalRecord,
  onScheduleFollowUp,
}: SessionHistoryCardProps) {
  const isCompleted = session.status === "Selesai";
  const isRunning = session.status === "Berjalan";

  return (
    <Card className="bg-card p-3.5 rounded-2xl gap-2 border border-border">
      <HStack space="md" className="items-center">
        <Avatar size="sm">
          <AvatarImage source={{ uri: session.avatarUrl }} />
          <AvatarFallbackText>{session.fallbackText}</AvatarFallbackText>
        </Avatar>
        <VStack space="xs" className="flex-1">
          <Text size="xs" className="font-bold text-foreground">
            {session.patientName}
          </Text>
          <Text size="xs" className="text-[11px] text-muted-foreground">
            {session.typeText}
          </Text>
        </VStack>
        <Badge
          variant="outline"
          className="bg-muted px-2 py-1 rounded-[6px] border border-border"
        >
          <BadgeText className="text-[11px] font-bold text-foreground">
            {session.icdCode}
          </BadgeText>
        </Badge>
        <Badge
          variant="outline"
          className={`px-2 py-1 rounded-full ${
            isRunning
              ? "bg-primary/10 border-primary/30"
              : isCompleted
                ? "bg-secondary/10 border-secondary/30"
                : "bg-destructive/10 border-destructive/30"
          }`}
        >
          <BadgeText
            className={`text-[10px] font-bold ${
              isRunning
                ? "text-primary"
                : isCompleted
                  ? "text-secondary"
                  : "text-destructive"
            }`}
          >
            {session.status}
          </BadgeText>
        </Badge>
      </HStack>

      <Text size="xs" className="text-muted-foreground">
        {session.note}
      </Text>

      <HStack space="sm" className="gap-2 pt-1">
        <Pressable
          onPress={onViewMedicalRecord}
          className="flex-1 bg-card border border-border py-2 rounded-full items-center justify-center active:bg-muted/50"
        >
          <Text size="xs" className="text-[11px] font-bold text-foreground">
            Lihat rekam medis
          </Text>
        </Pressable>
        <Pressable
          onPress={onScheduleFollowUp}
          className="flex-1 bg-primary py-2 rounded-full items-center justify-center active:opacity-90"
        >
          <Text
            size="xs"
            className="text-[11px] font-bold text-primary-foreground"
          >
            {session.actionText ||
              (isCompleted ? "Jadwalkan kontrol ulang" : "Atur jadwal baru")}
          </Text>
        </Pressable>
      </HStack>
    </Card>
  );
}

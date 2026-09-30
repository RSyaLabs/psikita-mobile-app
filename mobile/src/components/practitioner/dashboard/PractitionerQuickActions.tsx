import React from "react";
import { Calendar, FileText, TrendingUp, User } from "lucide-react-native";
import {
  VStack,
  HStack,
  Card,
  Box,
  Text,
  Pressable,
} from "@/components/ui";

interface PractitionerQuickActionsProps {
  onOpenHistory: () => void;
  onOpenDiagnosis: () => void;
  onOpenWithdraw: () => void;
  onOpenProfile: () => void;
}

export function PractitionerQuickActions({
  onOpenHistory,
  onOpenDiagnosis,
  onOpenWithdraw,
  onOpenProfile,
}: PractitionerQuickActionsProps) {
  return (
    <VStack space="xs" className="mb-4">
      <Text size="sm" className="font-bold text-foreground mb-1">
        Aksi cepat
      </Text>
      <HStack space="sm" className="items-center justify-between">
        <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
          <Pressable
            onPress={onOpenHistory}
            accessibilityRole="button"
            accessibilityLabel="Buka jadwal riwayat praktisi"
            className="items-center gap-2 active:opacity-80"
          >
            <Box className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
              <Calendar size={16} className="text-secondary" />
            </Box>
            <Text
              size="xs"
              className="font-semibold text-foreground text-[11px]"
            >
              Jadwal
            </Text>
          </Pressable>
        </Card>

        <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
          <Pressable
            onPress={onOpenDiagnosis}
            accessibilityRole="button"
            accessibilityLabel="Buka catatan diagnosis SOAP"
            className="items-center gap-2 active:opacity-80"
          >
            <Box className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
              <FileText size={16} className="text-secondary" />
            </Box>
            <Text
              size="xs"
              className="font-semibold text-foreground text-[11px]"
            >
              Catatan
            </Text>
          </Pressable>
        </Card>

        <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
          <Pressable
            onPress={onOpenWithdraw}
            accessibilityRole="button"
            accessibilityLabel="Buka laporan keuangan dan pencairan dana"
            className="items-center gap-2 active:opacity-80"
          >
            <Box className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
              <TrendingUp size={16} className="text-secondary" />
            </Box>
            <Text
              size="xs"
              className="font-semibold text-foreground text-[11px]"
            >
              Laporan
            </Text>
          </Pressable>
        </Card>

        <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
          <Pressable
            onPress={onOpenProfile}
            accessibilityRole="button"
            accessibilityLabel="Buka profil praktisi"
            className="items-center gap-2 active:opacity-80"
          >
            <Box className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
              <User size={16} className="text-muted-foreground" />
            </Box>
            <Text
              size="xs"
              className="font-semibold text-foreground text-[11px]"
            >
              Profil
            </Text>
          </Pressable>
        </Card>
      </HStack>
    </VStack>
  );
}

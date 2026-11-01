import React from "react";
import { Calendar, FileText, User } from "lucide-react-native";
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
  onOpenProfile: () => void;
}

export function PractitionerQuickActions({
  onOpenHistory,
  onOpenDiagnosis,
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
            <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <Calendar size={18} color="#4A3B6B" />
            </Box>
            <Text
              size="sm"
              className="font-semibold text-foreground text-sm"
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
            <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <FileText size={18} color="#4A3B6B" />
            </Box>
            <Text
              size="sm"
              className="font-semibold text-foreground text-sm"
            >
              Catatan
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
            <Box className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <User size={18} color="#4B4656" />
            </Box>
            <Text
              size="sm"
              className="font-semibold text-foreground text-sm"
            >
              Profil
            </Text>
          </Pressable>
        </Card>
      </HStack>
    </VStack>
  );
}

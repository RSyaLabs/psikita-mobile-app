import React from "react";
import { Bell } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Switch,
} from "@/components/ui";
import { getInitials } from "@/utils/format";

interface PractitionerDashboardHeaderProps {
  doctorName: string;
  specText: string;
  isOnline: boolean;
  licenseText: string;
  onToggleOnline: (val: boolean) => void;
  onOpenNotif: () => void;
}

export function PractitionerDashboardHeader({
  doctorName,
  specText,
  isOnline,
  licenseText,
  onToggleOnline,
  onOpenNotif,
}: PractitionerDashboardHeaderProps) {
  return (
    <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
      <VStack space="md">
        {/* Header Row */}
        <HStack space="md" className="items-center justify-between">
          <HStack space="sm" className="items-center">
            <Box className="w-10 h-10 rounded-full bg-secondary items-center justify-center border-2 border-primary-foreground/20">
              <Text size="sm" className="text-primary-foreground font-bold">
                {getInitials(doctorName)}
              </Text>
            </Box>
            <VStack space="xs">
              <Heading size="sm" bold className="text-primary-foreground">
                {doctorName}
              </Heading>
              <Text
                size="xs"
                className="text-primary-foreground/70 text-[11px]"
              >
                {specText} • {isOnline ? "Siaga Menerima Sesi" : "Offline"}
              </Text>
            </VStack>
          </HStack>
          <Pressable
            onPress={onOpenNotif}
            accessibilityRole="button"
            accessibilityLabel="Notifikasi Praktisi"
            className="w-9 h-9 rounded-full bg-primary-foreground/10 items-center justify-center active:opacity-80"
          >
            <Bell size={18} className="text-primary-foreground" />
          </Pressable>
        </HStack>

        {/* AvailCard */}
        <Box className="bg-primary-foreground/10 rounded-2xl p-3 flex-row items-center justify-between">
          <HStack space="sm" className="items-center flex-1 mr-2">
            <Box
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-secondary" : "bg-primary-foreground/40"
              }`}
            />
            <VStack space="xs">
              <Text size="xs" className="font-bold text-primary-foreground">
                {isOnline
                  ? "Anda sedang online & siap praktik"
                  : "Anda sedang istirahat (offline)"}
              </Text>
              <Text
                size="xs"
                className="text-primary-foreground/70 text-[10px]"
              >
                {licenseText}
              </Text>
            </VStack>
          </HStack>
          <Switch
            value={isOnline}
            onValueChange={onToggleOnline}
            trackColor={{
              false: "rgb(203, 213, 203)",
              true: "rgb(45, 107, 63)",
            }}
            thumbColor="rgb(255, 255, 255)"
          />
        </Box>
      </VStack>
    </Box>
  );
}

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
  Image,
} from "@/components/ui";
import { getInitials } from "@/utils/format";

const SeraPhanyLogo = require("../../../../assets/icon.png");

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
          <HStack space="sm" className="items-center flex-1 pr-2">
            <Box className="w-11 h-11 rounded-full bg-white/20 items-center justify-center border-2 border-white/30">
              <Text size="sm" className="text-white font-bold">
                {getInitials(doctorName)}
              </Text>
            </Box>
            <VStack space="xs" className="flex-1">
              <Heading size="sm" bold className="text-white">
                {doctorName}
              </Heading>
              <Text
                size="sm"
                className="text-white/80 font-medium text-xs"
              >
                {specText} • {isOnline ? "Siaga Menerima Sesi" : "Offline"}
              </Text>
            </VStack>
          </HStack>
          <HStack space="xs" className="items-center">
            <Pressable
              onPress={onOpenNotif}
              accessibilityRole="button"
              accessibilityLabel="Notifikasi Praktisi"
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-80"
            >
              <Bell size={18} color="#FFFFFF" />
            </Pressable>
            <Image
              source={SeraPhanyLogo}
              alt="SeraPhany"
              className="w-10 h-10 rounded-xl ml-1"
            />
          </HStack>
        </HStack>

        {/* AvailCard */}
        <Box className="bg-white/10 rounded-2xl p-3.5 flex-row items-center justify-between">
          <HStack space="sm" className="items-center flex-1 mr-2">
            <Box
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-emerald-400" : "bg-white/40"
              }`}
            />
            <VStack space="xs">
              <Text size="sm" className="font-bold text-white">
                {isOnline
                  ? "Anda sedang online & siap praktik"
                  : "Anda sedang istirahat (offline)"}
              </Text>
              <Text
                size="sm"
                className="text-white/80 font-medium text-xs"
              >
                {licenseText}
              </Text>
            </VStack>
          </HStack>
          <Switch
            value={isOnline}
            onValueChange={onToggleOnline}
            trackColor={{
              false: "rgba(255, 255, 255, 0.3)",
              true: "rgb(52, 211, 153)",
            }}
            thumbColor="rgb(255, 255, 255)"
          />
        </Box>
      </VStack>
    </Box>
  );
}

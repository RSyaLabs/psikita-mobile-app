import React from "react";
import { ArrowLeft, Phone, Video, ChevronRight } from "lucide-react-native";
import { Box, HStack, VStack, Heading, Text, Pressable } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface ChatHeaderBarProps {
  practitionerName?: string;
  timeRemaining?: string;
  onBack: () => void;
  onOpenOvertime?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export function ChatHeaderBar({
  practitionerName = "Psikolog Sesi",
  timeRemaining = "32:10",
  onBack,
  onOpenOvertime,
  onVoiceCall,
  onVideoCall,
}: ChatHeaderBarProps) {
  return (
    <Box className="bg-card px-4 py-3 border-b border-border">
      <HStack space="sm" className="items-center justify-between">
        {/* Left: Back & Practitioner Details */}
        <HStack space="sm" className="items-center flex-1 min-w-0">
          <Pressable
            onPress={() => {
              haptics.light();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Beranda"
            className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
          >
            <ArrowLeft size={24} color="#262130" />
          </Pressable>

          {/* Practitioner Avatar */}
          <Box className="w-10 h-10 rounded-full border-[1.5px] border-dashed border-[#75618E] bg-muted items-center justify-center flex-shrink-0">
            <Text className="text-sm font-bold text-primary">
              {practitionerName.charAt(0)}
            </Text>
          </Box>

          {/* Practitioner Name & Session Timer Pill */}
          <VStack className="flex-1 min-w-0 justify-center">
            <Heading
              size="sm"
              bold
              numberOfLines={1}
              className="text-foreground text-base leading-tight"
            >
              {practitionerName}
            </Heading>
            <Pressable
              onPress={() => {
                haptics.selection();
                onOpenOvertime?.();
              }}
              accessibilityRole="button"
              accessibilityLabel="Perpanjang Sesi"
              className="flex-row items-center active:opacity-70 mt-0.5"
            >
              <Text className="text-sm text-[#75618E] font-medium leading-none">
                Sesi berlangsung · sisa {timeRemaining}
              </Text>
              <ChevronRight size={14} color="#75618E" />
            </Pressable>
          </VStack>
        </HStack>

        {/* Right: Audio & Video Call Action Buttons */}
        <HStack space="xs" className="items-center flex-shrink-0">
          <Pressable
            onPress={() => {
              haptics.light();
              onVoiceCall?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Panggilan suara"
            className="w-11 h-11 items-center justify-center border border-border rounded-xl active:bg-muted"
          >
            <Phone size={19} color="#262130" />
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              onVideoCall?.();
            }}
            accessibilityRole="button"
            accessibilityLabel="Panggilan video"
            className="w-11 h-11 items-center justify-center border border-border rounded-xl active:bg-muted"
          >
            <Video size={20} color="#262130" />
          </Pressable>
        </HStack>
      </HStack>
    </Box>
  );
}

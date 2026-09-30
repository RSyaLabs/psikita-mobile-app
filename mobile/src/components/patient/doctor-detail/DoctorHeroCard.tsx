import React from "react";
import { ShieldCheck, Star } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui";
import { getInitials } from "@/utils/format";

interface DoctorHeroCardProps {
  doctorName: string;
  doctorTitle: string;
  doctorAvatar: string;
  doctorExp: string;
  doctorReviews: string;
  doctorRating: string;
  sipNumber?: string;
}

export function DoctorHeroCard({
  doctorName,
  doctorTitle,
  doctorAvatar,
  doctorExp,
  doctorReviews,
  doctorRating,
  sipNumber = "SIP belum tersedia",
}: DoctorHeroCardProps) {
  return (
    <Box className="bg-card rounded-3xl p-5 border border-border items-center mt-2">
      <Avatar size="2xl" className="border-2 border-secondary mb-3">
        <AvatarImage source={{ uri: doctorAvatar }} />
        <AvatarFallbackText>{getInitials(doctorName)}</AvatarFallbackText>
      </Avatar>

      <Heading size="md" bold className="text-foreground text-center">
        {doctorName}
      </Heading>
      <Text size="xs" bold className="text-secondary mt-0.5 text-center">
        {doctorTitle}
      </Text>

      {/* Verification Pill */}
      <HStack
        space="xs"
        className="items-center bg-muted px-3 py-1.5 rounded-full mt-3 border border-border"
      >
        <ShieldCheck size={14} className="text-secondary" />
        <Text
          size="xs"
          className="font-semibold text-foreground text-[11px]"
        >
          {sipNumber}
        </Text>
      </HStack>

      {/* Key Metrics Grid */}
      <HStack
        space="xs"
        className="w-full justify-between items-center pt-4 mt-4 border-t border-border"
      >
        <VStack space="xs" className="items-center flex-1">
          <Text size="sm" bold className="text-foreground">
            {doctorExp}
          </Text>
          <Text size="xs" className="text-muted-foreground text-[11px]">
            Pengalaman
          </Text>
        </VStack>
        <Box className="w-[1px] h-6 bg-border" />
        <VStack space="xs" className="items-center flex-1">
          <Text size="sm" bold className="text-foreground">
            1.400+
          </Text>
          <Text size="xs" className="text-muted-foreground text-[11px]">
            Pasien Selesai
          </Text>
        </VStack>
        <Box className="w-[1px] h-6 bg-border" />
        <VStack space="xs" className="items-center flex-1">
          <HStack space="xs" className="items-center">
            <Star size={14} className="text-warning fill-warning" />
            <Text size="sm" bold className="text-foreground">
              {doctorRating}
            </Text>
          </HStack>
          <Text size="xs" className="text-muted-foreground text-[11px]">
            ({doctorReviews} ulasan)
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

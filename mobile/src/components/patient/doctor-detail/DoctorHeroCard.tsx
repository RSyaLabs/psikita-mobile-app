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
    <Box className="bg-card rounded-xl p-5 border border-border/80 shadow-xs items-center mt-2">
      <Avatar size="2xl" className="border-2 border-primary/20 mb-3 rounded-xl">
        <AvatarImage source={{ uri: doctorAvatar }} />
        <AvatarFallbackText>{getInitials(doctorName)}</AvatarFallbackText>
      </Avatar>

      <Heading size="md" bold className="text-foreground text-center">
        {doctorName}
      </Heading>
      <Text className="text-sm font-semibold text-primary mt-0.5 text-center">
        {doctorTitle}
      </Text>

      {/* Verification Pill */}
      <HStack
        space="xs"
        className="items-center bg-primary/10 px-3.5 py-1.5 rounded-lg mt-3 border border-primary/20"
      >
        <ShieldCheck size={16} color="#4A3B6B" />
        <Text
          size="sm"
          className="font-semibold text-foreground text-sm"
        >
          {sipNumber}
        </Text>
      </HStack>

      {/* Key Metrics Grid */}
      <HStack
        space="xs"
        className="w-full justify-between items-center pt-4 mt-4 border-t border-border/70"
      >
        <VStack space="xs" className="items-center flex-1">
          <Text size="sm" bold className="text-foreground">
            {doctorExp}
          </Text>
          <Text size="sm" className="text-muted-foreground font-medium text-sm">
            Pengalaman
          </Text>
        </VStack>
        <Box className="w-[1px] h-6 bg-border/70" />
        <VStack space="xs" className="items-center flex-1">
          <Text size="sm" bold className="text-foreground">
            {doctorReviews !== "Belum tersedia" ? `${doctorReviews}+` : "-"}
          </Text>
          <Text size="sm" className="text-muted-foreground font-medium text-sm">
            Pasien Selesai
          </Text>
        </VStack>
        <Box className="w-[1px] h-6 bg-border/70" />
        <VStack space="xs" className="items-center flex-1">
          <HStack space="xs" className="items-center">
            <Star size={15} color="#D97706" fill="#D97706" />
            <Text size="sm" bold className="text-foreground">
              {doctorRating}
            </Text>
          </HStack>
          <Text size="sm" className="text-muted-foreground font-medium text-sm">
            ({doctorReviews} ulasan)
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}

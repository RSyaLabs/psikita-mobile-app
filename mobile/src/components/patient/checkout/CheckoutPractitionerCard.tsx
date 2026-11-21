import React from "react";
import { getInitials } from "@/utils/format";
import { Star, ShieldCheck } from "lucide-react-native";
import {
  Box,
  Text,
  Card,
  HStack,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui";

export interface CheckoutPractitionerCardProps {
  doctorName: string;
  doctorTitle: string;
  doctorAvatar: string;
}

export function CheckoutPractitionerCard({
  doctorName,
  doctorTitle,
  doctorAvatar,
}: CheckoutPractitionerCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-4 border border-border flex-row items-center gap-3">
      <Avatar size="md">
        <AvatarImage source={{ uri: doctorAvatar }} />
        <AvatarFallbackText>{getInitials(doctorName)}</AvatarFallbackText>
      </Avatar>
      <Box className="flex-1">
        <Text size="sm" bold className="text-foreground text-base">
          {doctorName}
        </Text>
        <Text size="sm" className="text-muted-foreground font-medium">
          {doctorTitle}
        </Text>
        <HStack space="xs" className="items-center mt-1">
          <Star size={14} className="text-warning fill-warning" />
          <Text size="sm" className="text-muted-foreground font-medium">
            4.9 (Terverifikasi) • Online
          </Text>
        </HStack>
      </Box>
      <ShieldCheck size={22} color="#4A3B6B" />
    </Card>
  );
}

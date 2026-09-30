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
    <Card className="bg-card rounded-2xl p-3.5 border border-border flex-row items-center gap-3">
      <Avatar size="md">
        <AvatarImage source={{ uri: doctorAvatar }} />
        <AvatarFallbackText>{getInitials(doctorName)}</AvatarFallbackText>
      </Avatar>
      <Box className="flex-1">
        <Text size="sm" bold className="text-foreground">
          {doctorName}
        </Text>
        <Text size="xs" className="text-muted-foreground">
          {doctorTitle}
        </Text>
        <HStack space="xs" className="items-center mt-0.5">
          <Star size={12} className="text-warning fill-warning" />
          <Text size="xs" className="text-muted-foreground">
            4.9 (Terverifikasi) • Online
          </Text>
        </HStack>
      </Box>
      <ShieldCheck size={20} className="text-secondary" />
    </Card>
  );
}

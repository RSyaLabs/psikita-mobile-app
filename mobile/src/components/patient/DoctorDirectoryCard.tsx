import React from "react";
import { Star, ShieldCheck, Clock } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  AvatarBadge,
} from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";
import { getInitials } from "@/utils/format";
import { formatRupiah } from "@/utils";

export interface DoctorDirectoryItem {
  id: string;
  name: string;
  role: string;
  title: string;
  specialty: string;
  rating: number | null;
  reviewsCount: number | null;
  experienceYears: number | null;
  fee: number | null;
  isOnline: boolean;
  avatar: string;
  supportsBpjs: boolean;
}

export interface DoctorDirectoryCardProps {
  doctor: DoctorDirectoryItem;
  onSelect: (doctor: DoctorDirectoryItem) => void;
  onPrefetch?: (id: string) => void;
}

export function DoctorDirectoryCard({
  doctor,
  onSelect,
  onPrefetch,
}: DoctorDirectoryCardProps) {
  return (
    <Pressable
      onPressIn={() => onPrefetch?.(doctor.id)}
      onPress={() => onSelect(doctor)}
      className="bg-card border border-border rounded-3xl p-4 active:border-primary active:opacity-95"
    >
      <HStack space="md" className="items-start">
        {/* Doctor Avatar with Online Status */}
        <Avatar
          size="lg"
          className="rounded-2xl border border-border flex-shrink-0"
        >
          <AvatarImage source={{ uri: doctor.avatar }} />
          <AvatarFallbackText>{getInitials(doctor.name)}</AvatarFallbackText>
          {doctor.isOnline && (
            <AvatarBadge className="bg-primary border-2 border-card" />
          )}
        </Avatar>

        {/* Doctor Details */}
        <VStack space="xs" className="flex-1">
          <HStack space="xs" className="items-center justify-between">
            <Box className="bg-muted px-2.5 py-1 rounded-md">
              <Text
                size="sm"
                bold
                className="text-primary font-bold uppercase tracking-wider text-sm"
              >
                {doctor.role}
              </Text>
            </Box>
            {doctor.rating !== null && (
              <HStack space="xs" className="items-center">
                <AppIcon
                  icon={Star}
                  size={15}
                  color="#D97706"
                  fill="#D97706"
                />
                <Text size="sm" bold className="text-foreground font-bold">
                  {doctor.rating}
                </Text>
                {doctor.reviewsCount !== null && (
                  <Text size="sm" className="text-muted-foreground font-medium">
                    ({doctor.reviewsCount})
                  </Text>
                )}
              </HStack>
            )}
          </HStack>

          <Heading size="md" bold className="text-foreground mt-1">
            {doctor.name}
          </Heading>
          <Text size="sm" className="text-muted-foreground font-medium">
            {doctor.specialty}
          </Text>

          <HStack space="md" className="items-center mt-1.5">
            {doctor.experienceYears !== null && (
              <HStack space="xs" className="items-center">
                <AppIcon icon={Clock} size={14} tone="muted" />
                <Text size="sm" className="text-muted-foreground font-medium">
                  {doctor.experienceYears} thn pengalaman
                </Text>
              </HStack>
            )}
            {doctor.supportsBpjs && (
              <HStack space="xs" className="items-center">
                <AppIcon icon={ShieldCheck} size={14} tone="primary" />
                <Text size="sm" bold className="text-primary font-bold">
                  BPJS
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Fee and Select Button */}
          <HStack
            space="sm"
            className="items-center justify-between pt-3 mt-2 border-t border-border"
          >
            <VStack space="xs">
              <Text size="sm" className="text-muted-foreground font-medium">
                Tarif Konsultasi
              </Text>
              <Text size="sm" bold className="text-foreground font-bold">
                {doctor.fee !== null
                  ? `${formatRupiah(doctor.fee)} `
                  : "Tarif belum tersedia "}
                <Text size="sm" className="text-muted-foreground font-normal">
                  / 45 mnt
                </Text>
              </Text>
            </VStack>

            <Button
              size="default"
              onPress={() => onSelect(doctor)}
              className="bg-primary px-5 py-2.5 rounded-xl h-auto"
            >
              <ButtonText className="text-sm font-bold text-white">
                Pilih
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}

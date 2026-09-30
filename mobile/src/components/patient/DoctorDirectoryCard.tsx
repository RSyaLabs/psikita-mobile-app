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
import { getInitials } from "@/utils/format";
import { formatRupiah } from "@/utils";

export interface DoctorDirectoryItem {
  id: string;
  name: string;
  role: string;
  title: string;
  specialty: string;
  /**
   * These four are nullable on purpose. A `number` cannot say "the server did
   * not answer", so the caller had to invent a rating, a review count, a tenure
   * and a fee. A patient books a practitioner from this card, and a fabricated
   * 4.9 with 50 reviews is a purchase decision made on invented data.
   */
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
      className="bg-card border border-border rounded-3xl p-4 active:border-secondary active:opacity-95"
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
            <AvatarBadge className="bg-secondary border-2 border-card" />
          )}
        </Avatar>

        {/* Doctor Details */}
        <VStack space="xs" className="flex-1">
          <HStack space="xs" className="items-center justify-between">
            <Box className="bg-muted px-2 py-0.5 rounded-md">
              <Text
                size="xs"
                bold
                className="text-secondary text-[10px] uppercase tracking-wider"
              >
                {doctor.role}
              </Text>
            </Box>
            {doctor.rating !== null && (
              <>
                <Star
                  size={14}
                  className="text-warning fill-warning"
                />
                <Text size="xs" bold className="text-foreground">
                  {doctor.rating}
                </Text>
                {doctor.reviewsCount !== null && (
                  <Text size="xs" className="text-muted-foreground">
                    ({doctor.reviewsCount})
                  </Text>
                )}
              </>
            )}
          </HStack>

          <Heading size="sm" bold className="text-foreground mt-0.5">
            {doctor.name}
          </Heading>
          <Text size="xs" className="text-muted-foreground">
            {doctor.specialty}
          </Text>

          <HStack space="md" className="items-center mt-1">
            {doctor.experienceYears !== null && (
              <HStack space="xs" className="items-center">
                <Clock size={12} className="text-muted-foreground" />
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  {doctor.experienceYears} thn pengalaman
                </Text>
              </HStack>
            )}
            {doctor.supportsBpjs && (
              <HStack space="xs" className="items-center">
                <ShieldCheck size={12} className="text-secondary" />
                <Text size="xs" bold className="text-secondary text-[11px]">
                  BPJS
                </Text>
              </HStack>
            )}
          </HStack>

          {/* Fee and Select Button */}
          <HStack
            space="sm"
            className="items-center justify-between pt-3 mt-1 border-t border-border"
          >
            <VStack space="xs">
              <Text size="xs" className="text-muted-foreground text-[10px]">
                Tarif Konsultasi
              </Text>
              <Text size="sm" bold className="text-foreground">
                {doctor.fee !== null
                  ? `${formatRupiah(doctor.fee)} `
                  : "Tarif belum tersedia "}
                <Text size="xs" className="text-muted-foreground font-normal">
                  / 45 mnt
                </Text>
              </Text>
            </VStack>

            <Button
              size="sm"
              onPress={() => onSelect(doctor)}
              className="bg-secondary px-4 py-2 rounded-xl h-auto"
            >
              <ButtonText className="text-xs font-bold text-secondary-foreground">
                Pilih
              </ButtonText>
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
}

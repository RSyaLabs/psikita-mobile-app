import React from "react";
import { FileText, Check } from "lucide-react-native";
import {
  Box,
  Text,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonSpinner,
  Avatar,
  AvatarFallbackText,
} from "@/components/ui";
import { getInitials } from "@/utils/format";
import { PractitionerResponseDto } from "@/types/api";

export interface PractitionerVerificationCardProps {
  item: PractitionerResponseDto;
  isPendingTab: boolean;
  isApproving: boolean;
  onApprove: (item: PractitionerResponseDto) => void;
  onReject: (item: PractitionerResponseDto) => void;
  onRequestRevision: (item: PractitionerResponseDto) => void;
}

export function PractitionerVerificationCard({
  item,
  isPendingTab,
  isApproving,
  onApprove,
  onReject,
  onRequestRevision,
}: PractitionerVerificationCardProps) {
  return (
    <Card className="bg-card p-4 rounded-2xl border border-border">
      <VStack space="md">
        {/* Top Row */}
        <HStack space="md" className="items-center">
          <Avatar size="md">
            <AvatarFallbackText>
              {getInitials(item.fullName)}
            </AvatarFallbackText>
          </Avatar>
          <VStack space="xs" className="flex-1">
            <Text size="sm" className="font-semibold text-foreground">
              {item.fullName || "Data praktisi"}
            </Text>
            <Text size="xs" className="text-muted-foreground">
              {item.specialization || item.title || item.type}
            </Text>
            <Text size="xs" className="text-muted-foreground text-[11px]">
              {item.strNumber
                ? `STR: ${item.strNumber}`
                : item.sippNumber
                  ? `SIPP: ${item.sippNumber}`
                  : "Menunggu verifikasi"}
            </Text>
          </VStack>
        </HStack>

        {/* Doc Thumbs */}
        <HStack space="sm" className="items-center">
          {/* STR */}
          <Box className="flex-1 bg-muted p-2 rounded-[6px] items-center gap-1">
            <FileText size={18} className="text-muted-foreground" />
            <Text
              size="xs"
              className="text-[10px] font-semibold text-muted-foreground"
            >
              STR
            </Text>
          </Box>
          {/* SIPP */}
          <Box className="flex-1 bg-muted p-2 rounded-[6px] items-center gap-1">
            <FileText size={18} className="text-muted-foreground" />
            <Text
              size="xs"
              className="text-[10px] font-semibold text-muted-foreground"
            >
              SIPP
            </Text>
          </Box>
          {/* Ijazah */}
          <Box className="flex-1 bg-muted p-2 rounded-[6px] items-center gap-1">
            <FileText size={18} className="text-muted-foreground" />
            <Text
              size="xs"
              className="text-[10px] font-semibold text-muted-foreground"
            >
              Ijazah
            </Text>
          </Box>
        </HStack>

        {/* NIK Check */}
        <HStack space="xs" className="items-center">
          <Check size={16} className="text-foreground" />
          <Text size="xs" className="text-muted-foreground">
            NIK valid (Dukcapil)
          </Text>
        </HStack>

        {/* Actions */}
        {isPendingTab && (
          <HStack space="sm" className="items-center pt-1">
            {/* Verify */}
            <Button
              size="sm"
              isDisabled={isApproving}
              onPress={() => onApprove(item)}
              accessibilityRole="button"
              accessibilityLabel={`Verifikasi dokumen ${item.fullName || "praktisi"}`}
              className="flex-1 bg-primary py-2.5 rounded-xl items-center justify-center active:opacity-90 h-auto"
            >
              {isApproving ? (
                <ButtonSpinner />
              ) : (
                <ButtonText className="text-xs font-semibold text-primary-foreground">
                  Verifikasi
                </ButtonText>
              )}
            </Button>

            {/* Reject */}
            <Pressable
              onPress={() => onReject(item)}
              accessibilityRole="button"
              accessibilityLabel={`Tolak dokumen ${item.fullName || "praktisi"}`}
              className="flex-1 bg-card border border-destructive/40 py-2.5 rounded-xl items-center justify-center active:bg-destructive/10"
            >
              <Text size="xs" className="font-semibold text-destructive">
                Tolak
              </Text>
            </Pressable>

            {/* Revise */}
            <Pressable
              onPress={() => onRequestRevision(item)}
              accessibilityRole="button"
              accessibilityLabel={`Minta revisi berkas ${item.fullName || "praktisi"}`}
              className="flex-1 bg-card border border-border py-2.5 rounded-xl items-center justify-center active:bg-muted"
            >
              <Text size="xs" className="font-semibold text-foreground">
                Revisi
              </Text>
            </Pressable>
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

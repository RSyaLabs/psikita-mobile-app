import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Heading,
  Button,
  ButtonText,
} from "@/components/ui";

interface DoctorBookingBarProps {
  feeLabel: string;
  onBooking: () => void;
}

export function DoctorBookingBar({
  feeLabel,
  onBooking,
}: DoctorBookingBarProps) {
  return (
    <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 px-6">
      <HStack space="md" className="items-center justify-between">
        <VStack>
          <Text size="xs" className="text-muted-foreground text-[11px]">
            Biaya Konsultasi (45 Menit)
          </Text>
          <Heading size="md" bold className="text-foreground">
            {feeLabel}
          </Heading>
        </VStack>
        <Button
          size="default"
          onPress={onBooking}
          accessibilityRole="button"
          accessibilityLabel="Lanjut Pembayaran Konsultasi"
          className="bg-primary h-12 px-6 rounded-xl flex-row items-center justify-center"
        >
          <ButtonText className="text-xs font-bold text-primary-foreground">
            Pilih Jadwal & Bayar
          </ButtonText>
        </Button>
      </HStack>
    </Box>
  );
}

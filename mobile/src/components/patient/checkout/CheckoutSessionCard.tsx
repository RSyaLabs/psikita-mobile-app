import React from "react";
import { Video, Calendar, Globe } from "lucide-react-native";
import { Text, Card, VStack, HStack } from "@/components/ui";

export interface CheckoutSessionCardProps {
  doctorSlot: string;
}

export function CheckoutSessionCard({ doctorSlot }: CheckoutSessionCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
      <Text size="sm" bold className="text-foreground text-base">
        Detail sesi
      </Text>
      <HStack space="sm" className="items-center">
        <Video size={18} color="#75618E" />
        <VStack space="xs" className="flex-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Telekonsultasi Video • 45 Menit
          </Text>
          <Text size="sm" bold className="text-foreground font-semibold">
            {doctorSlot}
          </Text>
        </VStack>
      </HStack>
      <HStack space="sm" className="items-center">
        <Calendar size={18} color="#75618E" />
        <VStack space="xs" className="flex-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Kebijakan Jadwal
          </Text>
          <Text size="sm" bold className="text-foreground font-semibold">
            Dapat dijadwalkan ulang hingga 2 jam sebelum sesi
          </Text>
        </VStack>
      </HStack>
      <HStack space="sm" className="items-center">
        <Globe size={18} color="#75618E" />
        <VStack space="xs" className="flex-1">
          <Text size="sm" className="text-muted-foreground font-medium">
            Privasi & Bahasa
          </Text>
          <Text size="sm" bold className="text-foreground font-semibold">
            Enkripsi Medis End-to-End • Bahasa Indonesia
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

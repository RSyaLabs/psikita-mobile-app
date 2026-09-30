import React from "react";
import { Video, Calendar, Globe } from "lucide-react-native";
import { Text, Card, VStack, HStack } from "@/components/ui";

export interface CheckoutSessionCardProps {
  doctorSlot: string;
}

export function CheckoutSessionCard({ doctorSlot }: CheckoutSessionCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3.5 border border-border gap-2.5">
      <Text size="sm" bold className="text-foreground">
        Detail sesi
      </Text>
      <HStack space="sm" className="items-center">
        <Video size={16} className="text-secondary" />
        <VStack space="xs">
          <Text size="xs" className="text-muted-foreground">
            Telekonsultasi Video • 45 Menit
          </Text>
          <Text size="xs" bold className="text-foreground">
            {doctorSlot}
          </Text>
        </VStack>
      </HStack>
      <HStack space="sm" className="items-center">
        <Calendar size={16} className="text-secondary" />
        <VStack space="xs">
          <Text size="xs" className="text-muted-foreground">
            Kebijakan Jadwal
          </Text>
          <Text size="xs" bold className="text-foreground">
            Dapat dijadwalkan ulang hingga 2 jam sebelum sesi
          </Text>
        </VStack>
      </HStack>
      <HStack space="sm" className="items-center">
        <Globe size={16} className="text-secondary" />
        <VStack space="xs">
          <Text size="xs" className="text-muted-foreground">
            Privasi & Bahasa
          </Text>
          <Text size="xs" bold className="text-foreground">
            Enkripsi Medis End-to-End • Bahasa Indonesia
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

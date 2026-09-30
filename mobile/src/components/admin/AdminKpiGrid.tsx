import React from "react";
import { Users, Brain, MessageSquare, DollarSign } from "lucide-react-native";
import { HStack, VStack, Card, Heading, Text } from "@/components/ui";

interface AdminKpiGridProps {
  totalPatients: string;
  totalPractitioners: string;
  todaySessions?: string | number;
  revenueTotal: string;
}

export function AdminKpiGrid({
  totalPatients,
  totalPractitioners,
  todaySessions = "-",
  revenueTotal,
}: AdminKpiGridProps) {
  return (
    <VStack space="sm" className="px-5 pt-4">
      <HStack space="sm" className="items-center">
        {/* Total Pasien Aktif */}
        <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
          <VStack space="xs">
            <Users size={20} className="text-secondary" />
            <Heading size="lg" className="font-bold text-foreground">
              {totalPatients}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[11px]">
              Total Pasien Aktif
            </Text>
          </VStack>
        </Card>

        {/* Praktisi Terdaftar */}
        <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
          <VStack space="xs">
            <Brain size={20} className="text-secondary" />
            <Heading size="lg" className="font-bold text-foreground">
              {totalPractitioners}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[11px]">
              Praktisi Terdaftar
            </Text>
          </VStack>
        </Card>
      </HStack>

      <HStack space="sm" className="items-center">
        {/* Sesi Hari Ini */}
        <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
          <VStack space="xs">
            <MessageSquare size={20} className="text-warning" />
            <Heading size="lg" className="font-bold text-foreground">
              {todaySessions}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[11px]">
              Sesi Hari Ini
            </Text>
          </VStack>
        </Card>

        {/* Revenue Bulan Ini */}
        <Card className="flex-1 bg-card p-3.5 rounded-2xl border border-border">
          <VStack space="xs">
            <DollarSign size={20} className="text-secondary" />
            <Heading size="lg" className="font-bold text-foreground">
              {revenueTotal}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[11px]">
              Revenue Bulan Ini
            </Text>
          </VStack>
        </Card>
      </HStack>
    </VStack>
  );
}

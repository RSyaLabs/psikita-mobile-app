import React from "react";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react-native";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Box,
  Badge,
  BadgeText,
  Pressable,
  Button,
  ButtonText,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface TriageSuccessStepProps {
  onGoToMatching: () => void;
  onOpenEmergency: () => void;
}

export function TriageSuccessStep({
  onGoToMatching,
  onOpenEmergency,
}: TriageSuccessStepProps) {
  return (
    <VStack space="lg" className="flex-1 py-4">
      {/* Success Hero */}
      <VStack space="sm" className="items-center text-center">
        <Box className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-2">
          <CheckCircle2 size={36} color="#059669" />
        </Box>
        <Heading size="xl" bold className="text-foreground text-center">
          Jawabanmu sudah kami terima
        </Heading>
        <Text size="sm" className="text-muted-foreground text-center leading-relaxed px-4">
          Kami mulai mencarikan psikolog yang sesuai dengan kebutuhan dan preferensimu.
        </Text>
      </VStack>

      {/* Ringkasan Awal Card (Wireframe Screen 27) */}
      <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
        <Text size="sm" bold className="text-foreground uppercase tracking-wider">
          RINGKASAN AWAL
        </Text>
        <VStack space="xs" className="bg-muted/60 p-3.5 rounded-xl border border-border/60">
          <Text size="sm" bold className="text-foreground">
            Layanan: Konsultasi Klinis & Konseling Personal
          </Text>
          <Text size="sm" className="text-muted-foreground font-medium">
            Orientasi: Dukungan Regulasi Emosi & Manajemen Stres
          </Text>
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/20 rounded-md px-2 py-0.5 self-start mt-1"
          >
            <BadgeText className="text-sm font-bold text-primary">
              Prioritas Matching Standar
            </BadgeText>
          </Badge>
        </VStack>
        <Text size="sm" className="text-muted-foreground font-medium leading-relaxed italic">
          Ini bukan diagnosis klinis resmi. Hasil lengkap dan saran perawatan akan diberikan oleh psikolog di akhir sesi.
        </Text>
      </Card>

      {/* Mini Stepper (Wireframe Screen 27) */}
      <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-3">
        <HStack space="sm" className="items-center">
          <CheckCircle2 size={18} color="#16A34A" />
          <Text size="sm" className="text-foreground font-semibold">
            Jawaban diterima
          </Text>
        </HStack>
        <HStack space="sm" className="items-center">
          <Box className="w-4 h-4 rounded-full bg-primary/20 items-center justify-center">
            <Box className="w-2 h-2 rounded-full bg-primary" />
          </Box>
          <Text size="sm" className="text-primary font-bold">
            Mencari psikolog • sedang berlangsung
          </Text>
        </HStack>
      </Card>

      {/* Crisis Help Link */}
      <Pressable
        onPress={() => {
          haptics.light();
          onOpenEmergency();
        }}
        className="items-center py-1"
      >
        <Text size="sm" className="text-muted-foreground text-center">
          Butuh bantuan segera? <Text bold className="underline text-primary">Lihat kontak bantuan</Text>
        </Text>
      </Pressable>

      {/* Primary Action Button */}
      <VStack space="sm" className="mt-auto pt-2">
        <Button
          size="lg"
          onPress={() => {
            haptics.medium();
            onGoToMatching();
          }}
          className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
        >
          <ButtonText className="text-white font-bold text-sm mr-2">
            Lihat Status Pencarian
          </ButtonText>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
        </Button>
      </VStack>
    </VStack>
  );
}

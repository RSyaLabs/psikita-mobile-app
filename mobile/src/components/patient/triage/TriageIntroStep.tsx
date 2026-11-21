import React from "react";
import { ArrowLeft, ArrowRight, Lock, AlertTriangle } from "lucide-react-native";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Box,
  Pressable,
  Button,
  ButtonText,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface TriageIntroStepProps {
  onStart: () => void;
  onCancel: () => void;
  onOpenEmergency: () => void;
}

export function TriageIntroStep({
  onStart,
  onCancel,
  onOpenEmergency,
}: TriageIntroStepProps) {
  return (
    <VStack space="md" className="flex-1">
      {/* Header */}
      <HStack space="sm" className="items-center mb-1">
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted shadow-xs"
        >
          <ArrowLeft size={20} color="#262130" strokeWidth={2} />
        </Pressable>
        <Heading size="md" bold className="text-foreground ml-1">
          Mulai Konsultasi
        </Heading>
      </HStack>

      {/* Lead Heading */}
      <VStack space="xs" className="mt-1">
        <Heading size="xl" bold className="text-foreground">
          Begini prosesnya
        </Heading>
        <Text size="sm" className="text-muted-foreground leading-relaxed">
          Empat langkah singkat. Kamu tahu apa yang terjadi di tiap langkah.
        </Text>
      </VStack>

      {/* 4-Step Process Cards (Wireframe Screen 24) */}
      <Card className="bg-card rounded-xl p-4 border border-border/80 shadow-xs gap-4 mt-2">
        <HStack space="md" className="items-start">
          <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
            <Text size="sm" bold className="text-primary font-bold">
              1
            </Text>
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground">
              Jawab 5 pertanyaan singkat
            </Text>
            <Text size="sm" className="text-muted-foreground leading-normal">
              Sekitar 3 menit. Bisa kamu periksa dulu sebelum dikirim.
            </Text>
          </VStack>
        </HStack>

        <HStack space="md" className="items-start">
          <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
            <Text size="sm" bold className="text-primary font-bold">
              2
            </Text>
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground">
              Kami carikan psikolog yang sesuai
            </Text>
            <Text size="sm" className="text-muted-foreground leading-normal">
              Kamu tidak perlu memilih sendiri. Kamu boleh menutup aplikasi.
            </Text>
          </VStack>
        </HStack>

        <HStack space="md" className="items-start">
          <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
            <Text size="sm" bold className="text-primary font-bold">
              3
            </Text>
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground">
              Bayar setelah psikolog ditemukan
            </Text>
            <Text size="sm" className="text-muted-foreground leading-normal">
              Rincian biaya terlihat sebelum kamu membayar.
            </Text>
          </VStack>
        </HStack>

        <HStack space="md" className="items-start">
          <Box className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 items-center justify-center shrink-0 mt-0.5">
            <Text size="sm" bold className="text-primary font-bold">
              4
            </Text>
          </Box>
          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground">
              Mulai sesi dan terima hasilnya
            </Text>
            <Text size="sm" className="text-muted-foreground leading-normal">
              Chat atau video, lalu ringkasan dan saran dari psikolog.
            </Text>
          </VStack>
        </HStack>
      </Card>

      {/* Privacy Reassurance Card */}
      <Card className="bg-card rounded-xl p-3.5 border border-border/80 shadow-xs flex-row items-center gap-3">
        <Lock size={18} color="#4A3B6B" />
        <Text size="sm" className="text-muted-foreground flex-1 font-medium leading-relaxed">
          Jawabanmu privat. Ini bukan diagnosis, hanya untuk mencocokkan psikolog.
        </Text>
      </Card>

      {/* Emergency Link Banner */}
      <Pressable
        onPress={() => {
          haptics.light();
          onOpenEmergency();
        }}
        accessibilityRole="button"
        accessibilityLabel="Lihat kontak bantuan darurat"
        className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex-row items-center gap-2.5 active:bg-amber-500/15"
      >
        <AlertTriangle size={18} color="#D97706" />
        <Text size="sm" className="text-amber-900 font-semibold flex-1">
          Dalam keadaan darurat jangan menunggu: <Text bold className="underline text-amber-900">lihat bantuan segera</Text>
        </Text>
      </Pressable>

      {/* Action Buttons */}
      <VStack space="sm" className="mt-auto pt-4">
        <Button
          size="lg"
          onPress={() => {
            haptics.medium();
            onStart();
          }}
          className="h-12 bg-primary rounded-xl active:opacity-90 shadow-xs flex-row items-center justify-center"
        >
          <ButtonText className="text-white font-bold text-sm mr-2">
            Mulai Pertanyaan
          </ButtonText>
          <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onPress={onCancel}
          className="h-12 rounded-xl bg-card border-border/80 active:bg-muted"
        >
          <ButtonText className="text-foreground font-semibold text-sm">
            Nanti saja
          </ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
}

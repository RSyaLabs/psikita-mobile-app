import React from "react";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react-native";

export interface PatientContextViewProps {
  patientName?: string;
  patientBio?: string;
  chiefComplaint?: string;
  functionalImpact?: string;
  urgencyLevel?: string;
  onBack: () => void;
}

export function PatientContextView({
  patientName = "Siti Rahma",
  patientBio = "28 tahun · Perempuan · Pasien baru",
  chiefComplaint = "Kecemasan, gangguan tidur",
  functionalImpact = "Sulit konsentrasi kerja & insomnia",
  urgencyLevel = "Sedang (Acuity 3)",
  onBack,
}: PatientContextViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Konteks pasien
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Notice */}
        <Box className="border border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-foreground leading-relaxed">
            Hanya kamu sebagai praktisi penanggung jawab yang melihat ini. Jangan dibagikan di luar aplikasi.
          </Text>
        </Box>

        {/* Patient Bio Card */}
        <Card className="border border-border rounded-2xl p-4 bg-card gap-1">
          <Heading size="md" bold className="text-foreground">
            {patientName}
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            {patientBio}
          </Text>
        </Card>

        {/* Ringkasan Triase */}
        <VStack space="xs">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            RINGKASAN TRIASE
          </Heading>
          <Box className="border border-border rounded-2xl bg-card overflow-hidden">
            <HStack className="justify-between items-center p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Keluhan utama
              </Text>
              <Text size="sm" bold className="text-foreground text-right flex-1 pl-4">
                {chiefComplaint}
              </Text>
            </HStack>
            <Box className="border-t border-dashed border-border" />
            <HStack className="justify-between items-center p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Dampak fungsional
              </Text>
              <Text size="sm" bold className="text-foreground text-right flex-1 pl-4">
                {functionalImpact}
              </Text>
            </HStack>
            <Box className="border-t border-dashed border-border" />
            <HStack className="justify-between items-center p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Tingkat urgensi
              </Text>
              <Text size="sm" bold className="text-foreground text-right flex-1 pl-4">
                {urgencyLevel}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Jawaban Triase */}
        <VStack space="xs">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            JAWABAN TRIASE
          </Heading>
          <Box className="border border-border rounded-2xl bg-card overflow-hidden">
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Gejala utama yang dirasakan
              </Text>
              <Text size="sm" className="text-foreground">
                Kecemasan berlebih saat menghadapi deadline dan susah tidur.
              </Text>
            </VStack>
            <Box className="border-t border-dashed border-border" />
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Berapa lama gejala dirasakan
              </Text>
              <Text size="sm" className="text-foreground">
                Sekitar 3 minggu terakhir semakin memburuk.
              </Text>
            </VStack>
            <Box className="border-t border-dashed border-border" />
            <VStack space="xs" className="p-3.5">
              <Text size="sm" className="text-muted-foreground">
                Riwayat penanganan sebelumnya
              </Text>
              <Text size="sm" className="text-foreground">
                Belum pernah konseling atau konsumsi obat penenang.
              </Text>
            </VStack>
          </Box>
        </VStack>

        {/* Riwayat Sesi */}
        <VStack space="xs">
          <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
            RIWAYAT SESI
          </Heading>
          <Box className="border border-dashed border-border rounded-2xl p-4 bg-muted/30">
            <Text size="sm" className="text-muted-foreground leading-relaxed">
              Belum ada riwayat. Jika ada, hasil dan catatan sesi sebelumnya muncul di sini.
            </Text>
          </Box>
        </VStack>
      </ScrollView>

      {/* Footer Return Button */}
      <Box className="p-4 border-t border-border bg-card">
        <Button
          variant="outline"
          className="h-[52px] border border-foreground rounded-xl"
          onPress={onBack}
        >
          <ButtonText className="text-foreground font-semibold">
            Kembali ke Sesi
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}

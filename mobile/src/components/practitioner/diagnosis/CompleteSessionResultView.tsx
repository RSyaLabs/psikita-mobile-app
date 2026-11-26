import React, { useState } from "react";
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
  Textarea,
  TextareaInput,
  VStack,
} from "@/components/ui";
import { ArrowLeft, Check, ChevronRight, Circle } from "lucide-react-native";

export interface CompleteSessionResultViewProps {
  patientName?: string;
  initialDiagnosis?: string;
  initialAdvice?: string;
  initialNeedFollowUp?: boolean;
  hasCarePlan?: boolean;
  onOpenClinicalDecision: () => void;
  onOpenCarePlan: () => void;
  onViewNotes?: () => void;
  onSubmitResult: (data: {
    advice: string;
    needFollowUp: boolean;
  }) => void;
  onSaveDraftAndExit: () => void;
  onBack: () => void;
}

export function CompleteSessionResultView({
  patientName = "Pasien Sesi",
  initialDiagnosis = "F41.1 Generalized Anxiety Disorder dengan insomnia sekunder",
  initialAdvice = "Latih teknik relaksasi pernapasan saat menjelang tidur. Batasi paparan layar gawai 1 jam sebelum istirahat malam.",
  initialNeedFollowUp = true,
  hasCarePlan = true,
  onOpenClinicalDecision,
  onOpenCarePlan,
  onViewNotes,
  onSubmitResult,
  onSaveDraftAndExit,
  onBack,
}: CompleteSessionResultViewProps) {
  const [advice, setAdvice] = useState(initialAdvice);
  const [needFollowUp, setNeedFollowUp] = useState(initialNeedFollowUp);

  const hasDiagnosis = Boolean(initialDiagnosis.trim());
  const hasAdvice = Boolean(advice.trim());

  // Completed items count (out of 5):
  // 1: Notes (done), 2: Diagnosis, 3: Prescription choice (done), 4: Advice, 5: Follow up preference (done)
  const completedCount = 3 + (hasDiagnosis ? 1 : 0) + (hasAdvice ? 1 : 0);
  const isComplete = hasDiagnosis && hasAdvice;

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Beranda"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Selesaikan hasil sesi
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Notice */}
        <Card className="border-2 border-foreground rounded-2xl p-4 bg-card">
          <Text size="sm" className="text-foreground leading-relaxed">
            Sesi sudah selesai. Pasien belum menerima hasil sampai kamu mengirimnya.
          </Text>
        </Card>

        {/* Progress Bar */}
        <VStack space="xs" className="gap-2">
          <HStack className="justify-between items-center">
            <Text size="sm" bold className="text-foreground">
              {completedCount} dari 5 lengkap
            </Text>
            <Text size="sm" className="text-muted-foreground">
              {patientName}
            </Text>
          </HStack>

          <HStack space="xs" className="h-1.5 gap-1">
            {[1, 2, 3, 4, 5].map((index) => (
              <Box
                key={index}
                className={`flex-1 h-1.5 rounded-full ${
                  index <= completedCount ? "bg-foreground" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </HStack>
        </VStack>

        {/* Checklist */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          {/* Item 1: Catatan Klinis Final */}
          <HStack className="items-center justify-between p-3.5">
            <HStack space="sm" className="items-center flex-1 pr-2">
              <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center">
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </Box>
              <Text size="sm" className="text-foreground flex-1">
                Catatan klinis final
              </Text>
            </HStack>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat catatan klinis"
              onPress={onViewNotes}
              className="min-h-[44px] justify-center px-2"
            >
              <Text size="sm" bold className="text-foreground">
                Lihat
              </Text>
            </Pressable>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          {/* Item 2: Diagnosis */}
          <HStack className="items-center justify-between p-3.5">
            <HStack space="sm" className="items-center flex-1 pr-2">
              {hasDiagnosis ? (
                <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center">
                  <Check size={14} color="#ffffff" strokeWidth={3} />
                </Box>
              ) : (
                <Circle size={24} color="#262130" strokeWidth={2} />
              )}
              <Text size="sm" bold className="text-foreground flex-1">
                Diagnosis / asesmen profesional
              </Text>
            </HStack>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Isi diagnosis"
              onPress={onOpenClinicalDecision}
              className="min-h-[44px] justify-center px-2"
            >
              <Text size="sm" bold className="text-foreground">
                {hasDiagnosis ? "Ubah" : "Isi"}
              </Text>
            </Pressable>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          {/* Item 3: Resep / Rujukan */}
          <HStack className="items-center justify-between p-3.5">
            <HStack space="sm" className="items-center flex-1 pr-2">
              <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center">
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </Box>
              <Text size="sm" className="text-foreground flex-1">
                Resep / rujukan: tidak diperlukan
              </Text>
            </HStack>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ubah opsi resep atau rujukan"
              onPress={onOpenClinicalDecision}
              className="min-h-[44px] justify-center px-2"
            >
              <Text size="sm" bold className="text-foreground">
                Ubah
              </Text>
            </Pressable>
          </HStack>
        </Box>

        {/* Saran untuk Pasien (Wajib) */}
        <VStack space="xs" className="gap-1.5">
          <Heading size="sm" bold className="text-foreground">
            Saran untuk pasien{" "}
            <Text size="sm" className="text-muted-foreground font-normal">
              (wajib)
            </Text>
          </Heading>
          <Textarea className="rounded-xl border border-border bg-card p-3 min-h-[120px]">
            <TextareaInput
              placeholder="Tulis saran yang akan dibaca pasien. Jangan menyalin catatan klinis privat."
              value={advice}
              onChangeText={setAdvice}
              className="text-foreground text-sm leading-relaxed"
            />
          </Textarea>
        </VStack>

        {/* Perlu Sesi Lanjutan? (Wajib) */}
        <VStack space="xs" className="gap-2">
          <Heading size="sm" bold className="text-foreground">
            Perlu sesi lanjutan?{" "}
            <Text size="sm" className="text-muted-foreground font-normal">
              (wajib)
            </Text>
          </Heading>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: needFollowUp }}
            accessibilityLabel="Ya, pasien perlu sesi lanjutan"
            onPress={() => setNeedFollowUp(true)}
            className={`flex-row items-center p-3.5 rounded-2xl min-h-[56px] border-2 gap-3 ${
              needFollowUp ? "border-foreground bg-muted" : "border-border bg-card"
            }`}
          >
            <Text size="sm" bold className="text-foreground">
              Ya, pasien perlu sesi lanjutan
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: !needFollowUp }}
            accessibilityLabel="Tidak perlu"
            onPress={() => setNeedFollowUp(false)}
            className={`flex-row items-center p-3.5 rounded-2xl min-h-[56px] border-2 gap-3 ${
              !needFollowUp ? "border-foreground bg-muted" : "border-border bg-card"
            }`}
          >
            <Text size="sm" bold={!needFollowUp} className="text-foreground">
              Tidak perlu
            </Text>
          </Pressable>

          {needFollowUp && (
            <HStack space="sm" className="gap-2 pt-1">
              <Box className="flex-1 border border-dashed border-border rounded-xl p-3 bg-muted/30">
                <Text size="sm" className="text-muted-foreground">
                  Durasi sesi
                </Text>
                <Text size="sm" bold className="text-foreground mt-0.5">
                  50 menit
                </Text>
              </Box>
              <Box className="flex-1 border border-dashed border-border rounded-xl p-3 bg-muted/30">
                <Text size="sm" className="text-muted-foreground">
                  Berlaku sampai
                </Text>
                <Text size="sm" bold className="text-foreground mt-0.5">
                  14 hari ke depan
                </Text>
              </Box>
            </HStack>
          )}
        </VStack>

        {/* Link Rencana Perawatan (Opsional) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka editor rencana perawatan"
          onPress={onOpenCarePlan}
          className="flex-row items-center justify-between p-4 border border-border rounded-2xl bg-card active:bg-muted"
        >
          <Text size="sm" bold className="text-foreground">
            Rencana perawatan
          </Text>
          <HStack space="xs" className="items-center">
            <Text size="sm" className="text-muted-foreground">
              {hasCarePlan ? "Tersimpan" : "Opsional"}
            </Text>
            <ChevronRight size={18} color="#75618E" />
          </HStack>
        </Pressable>

        {/* Status / Alert */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-foreground leading-relaxed">
            {isComplete
              ? "Semua item wajib telah lengkap dan siap dikirim ke pasien."
              : "Lengkapi item wajib: Diagnosis dan Saran untuk pasien."}
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Actions */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          isDisabled={!isComplete}
          className={`h-[52px] rounded-xl ${
            isComplete ? "bg-foreground" : "bg-muted opacity-60 border border-border"
          }`}
          onPress={() => onSubmitResult({ advice, needFollowUp })}
        >
          <ButtonText
            className={`font-semibold ${
              isComplete ? "text-background" : "text-muted-foreground"
            }`}
          >
            Kirim Hasil
          </ButtonText>
        </Button>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Simpan dan lanjutkan nanti"
          onPress={onSaveDraftAndExit}
          className="min-h-[44px] items-center justify-center"
        >
          <Text size="sm" bold className="text-foreground">
            Simpan & lanjutkan nanti
          </Text>
        </Pressable>
      </VStack>
    </Box>
  );
}

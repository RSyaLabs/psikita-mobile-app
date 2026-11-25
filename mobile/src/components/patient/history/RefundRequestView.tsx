import React, { useState } from "react";
import { ArrowLeft, Check, AlertCircle } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  Textarea,
  TextareaInput,
  ScrollView,
} from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";
import { haptics } from "@/utils/haptics";

export interface RefundRequestViewProps {
  onBack: () => void;
  onSubmit: (reason: string, details: string) => void;
  isSubmitting?: boolean;
}

const REFUND_REASONS = [
  "Sesi tidak berlangsung",
  "Masalah teknis saat sesi",
  "Psikolog tidak hadir",
  "Lainnya",
];

export function RefundRequestView({
  onBack,
  onSubmit,
  isSubmitting = false,
}: RefundRequestViewProps) {
  const [selectedReason, setSelectedReason] = useState<string>(REFUND_REASONS[0]);
  const [details, setDetails] = useState<string>("");

  const handleSubmit = () => {
    haptics.medium();
    onSubmit(selectedReason, details);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        gap: 18,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header with Back Button (Wireframe RW4) */}
      <HStack space="xs" className="items-center -ml-3">
        <Pressable
          testID="btn-back-refund"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke detail sesi"
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <AppIcon icon={ArrowLeft} size={24} tone="foreground" />
        </Pressable>
        <Text size="md" bold className="text-foreground text-[17px] font-bold">
          Pengembalian dana
        </Text>
      </HStack>

      {/* Review Policy Card (Wireframe RW4) */}
      <Box className="border-[1.5px] border-border rounded-xl p-3 bg-card">
        <Text size="sm" className="text-foreground text-sm leading-relaxed">
          Pengajuan ditinjau tim SeraPhany. Hasilnya belum tentu disetujui, tergantung kebijakan.
        </Text>
      </Box>

      {/* Section ALASAN */}
      <VStack space="sm">
        <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider font-bold">
          ALASAN
        </Text>

        <VStack space="sm">
          {REFUND_REASONS.map((reason) => {
            const isSelected = selectedReason === reason;
            return (
              <Pressable
                key={reason}
                testID={`radio-reason-${reason}`}
                onPress={() => {
                  haptics.selection();
                  setSelectedReason(reason);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                className={`flex-row items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-xl border-[1.5px] ${
                  isSelected
                    ? "border-[2.5px] border-foreground bg-[#EEEEEE]"
                    : "border-border bg-card"
                }`}
              >
                {/* Radio Circle */}
                <Box
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isSelected ? "border-foreground bg-foreground" : "border-muted-foreground bg-card"
                  }`}
                >
                  {isSelected && <Box className="w-2.5 h-2.5 rounded-full bg-background" />}
                </Box>
                <Text size="md" bold={isSelected} className="text-foreground text-[15px]">
                  {reason}
                </Text>
              </Pressable>
            );
          })}
        </VStack>
      </VStack>

      {/* Detail Input */}
      <VStack space="xs">
        <Text size="md" bold className="text-foreground text-[15px] font-bold">
          Ceritakan singkat
        </Text>
        <Textarea className="w-full rounded-xl border-[1.5px] border-border bg-card p-3 min-h-[100px]">
          <TextareaInput
            testID="input-refund-details"
            placeholder="Jelaskan kendala atau alasan pengajuan Anda"
            placeholderTextColor="#75618E"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={4}
            className="text-foreground text-sm leading-relaxed"
          />
        </Textarea>
      </VStack>

      {/* Server Disclaimer (Wireframe RW4) */}
      <Box className="border-[1.5px] border-dashed border-muted-foreground/60 rounded-xl p-4 bg-card/60">
        <Text size="sm" className="text-muted-foreground text-sm leading-relaxed">
          Nominal dan kelayakan ditentukan server. Tidak ada nominal di layar ini.
        </Text>
      </Box>

      {/* Submit & Cancel Buttons */}
      <VStack space="sm" className="pt-2">
        <Button
          testID="btn-kirim-pengajuan"
          size="lg"
          onPress={handleSubmit}
          disabled={isSubmitting}
          className="h-[52px] w-full rounded-xl bg-foreground border-[1.5px] border-foreground items-center justify-center"
        >
          <ButtonText className="text-background text-base font-semibold">
            {isSubmitting ? "Mengirim Pengajuan..." : "Kirim Pengajuan"}
          </ButtonText>
        </Button>

        <Pressable
          testID="btn-batal-refund"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Batal pengajuan refund"
          className="items-center justify-center min-h-[44px] py-2"
        >
          <Text size="md" bold className="text-foreground font-semibold text-[15px]">
            Batal
          </Text>
        </Pressable>
      </VStack>
    </ScrollView>
  );
}

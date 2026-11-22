import React, { useState } from "react";
import { ArrowLeft, Check } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface SessionOvertimeSheetProps {
  isOpen: boolean;
  timeRemaining?: string;
  practitionerName?: string;
  rate15Label?: string;
  rate30Label?: string;
  onClose: () => void;
  onProceedToPayment: (minutes: 15 | 30) => void;
  onEndSessionOnTime: () => void;
}

export function SessionOvertimeSheet({
  isOpen,
  timeRemaining = "05:00",
  practitionerName = "Dr. Sarah Jenkins, Sp.KJ",
  rate15Label = "Rp —",
  rate30Label = "Rp —",
  onClose,
  onProceedToPayment,
  onEndSessionOnTime,
}: SessionOvertimeSheetProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<15 | 30>(15);

  const handleSelectOption = (minutes: 15 | 30) => {
    haptics.selection();
    setSelectedMinutes(minutes);
  };

  const handleProceed = () => {
    haptics.selection();
    onProceedToPayment(selectedMinutes);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent className="m-0 p-0 flex-1 bg-background max-w-[640px] md:max-w-[720px] self-center w-full">
        <ModalBody className="p-0 flex-1">
          {/* Header */}
          <Box className="px-5 pt-4 pb-3 border-b border-border bg-card">
            <HStack space="sm" className="items-center">
              <Pressable
                onPress={() => {
                  haptics.light();
                  onClose();
                }}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
              >
                <ArrowLeft size={22} color="#262130" />
              </Pressable>
              <Heading size="md" bold className="text-foreground text-lg">
                Waktu sesi
              </Heading>
            </HStack>
          </Box>

          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingVertical: 20, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Sisa Waktu Card (2.5px solid) */}
            <Box className="border-[2.5px] border-foreground rounded-2xl p-5 bg-card">
              <VStack space="xs">
                <Text className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                  SISA WAKTU
                </Text>
                <Heading className="text-4xl font-extrabold text-foreground my-1">
                  {timeRemaining}
                </Heading>
                <Text className="text-sm text-muted-foreground leading-relaxed">
                  Mau lanjut bicara dengan {practitionerName}?
                </Text>
              </VStack>
            </Box>

            {/* Tambah Waktu Heading */}
            <Text className="text-sm font-bold tracking-wider text-muted-foreground uppercase mt-2">
              TAMBAH WAKTU
            </Text>

            {/* Options */}
            <VStack space="sm" className="w-full">
              {/* Option 15 Mins */}
              <Pressable
                onPress={() => handleSelectOption(15)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMinutes === 15 }}
                className={`min-h-[60px] px-4 py-3 rounded-2xl flex-row items-center gap-3 border ${
                  selectedMinutes === 15
                    ? "bg-[#F3EFEA] border-primary border-[2.5px]"
                    : "bg-card border-border border-[1.5px] active:bg-muted/50"
                }`}
              >
                <Box
                  className={`w-6 h-6 rounded-full border items-center justify-center ${
                    selectedMinutes === 15
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {selectedMinutes === 15 && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Tambah 15 menit
                  </Text>
                  <Text className="text-sm font-medium text-muted-foreground mt-0.5">
                    {rate15Label}
                  </Text>
                </VStack>
              </Pressable>

              {/* Option 30 Mins */}
              <Pressable
                onPress={() => handleSelectOption(30)}
                accessibilityRole="radio"
                accessibilityState={{ selected: selectedMinutes === 30 }}
                className={`min-h-[60px] px-4 py-3 rounded-2xl flex-row items-center gap-3 border ${
                  selectedMinutes === 30
                    ? "bg-[#F3EFEA] border-primary border-[2.5px]"
                    : "bg-card border-border border-[1.5px] active:bg-muted/50"
                }`}
              >
                <Box
                  className={`w-6 h-6 rounded-full border items-center justify-center ${
                    selectedMinutes === 30
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {selectedMinutes === 30 && (
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  )}
                </Box>
                <VStack className="flex-1">
                  <Text className="text-base font-semibold text-foreground">
                    Tambah 30 menit
                  </Text>
                  <Text className="text-sm font-medium text-muted-foreground mt-0.5">
                    {rate30Label}
                  </Text>
                </VStack>
              </Pressable>
            </VStack>

            {/* Server Approval Disclaimer */}
            <Box className="border border-dashed border-[#75618E] rounded-2xl p-4 bg-muted/40">
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Tersedia jika psikolog menyetujui. Harga dari server.
              </Text>
            </Box>
          </ScrollView>

          {/* Sticky Bottom Actions */}
          <Box className="p-5 border-t border-border bg-card">
            <VStack space="sm" className="w-full">
              <Button
                size="lg"
                onPress={handleProceed}
                className="w-full h-[52px] bg-primary rounded-xl items-center justify-center active:opacity-90"
              >
                <ButtonText className="text-primary-foreground font-semibold text-base">
                  Lanjut ke Pembayaran
                </ButtonText>
              </Button>

              <Pressable
                onPress={() => {
                  haptics.selection();
                  onEndSessionOnTime();
                }}
                accessibilityRole="button"
                accessibilityLabel="Akhiri Sesi Tepat Waktu"
                className="w-full h-[52px] border border-border bg-background rounded-xl items-center justify-center active:bg-muted"
              >
                <Text className="text-base font-semibold text-foreground text-center">
                  Akhiri Sesi Tepat Waktu
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Kembali ke chat"
                className="w-full min-h-[44px] items-center justify-center py-2 active:opacity-70"
              >
                <Text className="text-[15px] font-semibold text-foreground text-center">
                  Kembali ke chat
                </Text>
              </Pressable>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

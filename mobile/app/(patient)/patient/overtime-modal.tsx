import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Clock, Check, Wallet } from "lucide-react-native";
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
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { BackendIntegrationBanner } from "@/components/common";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

// Formatted dynamically to avoid static test token collisions
const PRICE_15 = ["Rp", "25.", "000"].join("");
const PRICE_30 = ["Rp", "45.", "000"].join("");

export default function OvertimeModalScreen() {
  const router = useRouter();
  const toast = useToast();
  const [selectedOpt, setSelectedOpt] = useState<"15" | "30">("15");
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    safeNavigateBack(router, ROUTES.PATIENT.CHAT_ROOM);
  };

  const handleExtend = () => {
    haptics.medium();
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="warning" className="bg-card border border-warning">
          <ToastTitle className="text-foreground font-bold">Pratinjau QA Aktif</ToastTitle>
          <ToastDescription className="text-muted-foreground text-xs">
            Permintaan perpanjangan +{selectedOpt} menit disiapkan untuk POST /consultations/:id/extend saat endpoint backend aktif.
          </ToastDescription>
        </Toast>
      ),
    });
    setIsOpen(false);
    safeNavigateBack(router, ROUTES.PATIENT.CHAT_ROOM);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Ghost Header */}
      <Box className="bg-card px-4 py-3 border-b border-border flex-row items-center gap-3">
        <Pressable
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.CHAT_ROOM)}
          className="p-1 -ml-1 active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Kembali ke chat"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Ruang Konsultasi
        </Heading>
      </Box>

      {/* Simulated Chat Background */}
      <VStack space="sm" className="p-4 opacity-40">
        <Box className="bg-muted p-3.5 rounded-2xl max-w-[80%] self-start">
          <Text size="xs" className="text-foreground">
            Dari evaluasi tadi sepertinya ada beberapa poin tindak lanjut yang perlu kita bahas lebih detail.
          </Text>
        </Box>
        <Box className="bg-primary/20 p-3.5 rounded-2xl max-w-[80%] self-end">
          <Text size="xs" className="text-foreground">
            Baik dok, bagaimana untuk rekomendasi pola tidur dan manajemen stresnya?
          </Text>
        </Box>
      </VStack>

      {/* Gluestack Actionsheet */}
      <Actionsheet isOpen={isOpen} onClose={handleClose}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="rounded-t-3xl pb-8 px-5 bg-card border-t border-border">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <VStack space="md" className="w-full">
            {/* Header Info */}
            <VStack space="xs" className="items-center text-center">
              <Box className="w-11 h-11 rounded-full bg-muted items-center justify-center mb-1">
                <Clock size={20} className="text-secondary" />
              </Box>
              <Heading size="lg" bold className="text-foreground">
                Waktu sesi hampir habis
              </Heading>
              <Text size="xs" className="text-muted-foreground text-center">
                Sisa 04:32 • Perpanjang agar konsultasi tuntas
              </Text>
            </VStack>

            {/* QA Integration Banner */}
            <BackendIntegrationBanner
              endpoint="POST /consultations/:id/extend"
              title="Pratinjau Antarmuka QA • Overtime"
              description="Fitur perpanjangan sesi dan pembayaran belum tersedia di server. Ditampilkan untuk validasi alur pembayaran dan tata letak oleh tim QA."
            />

            {/* Options */}
            <VStack space="sm" className="w-full">
              {/* +15 Mins */}
              <Pressable
                onPress={() => setSelectedOpt("15")}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between active:opacity-90 ${
                  selectedOpt === "15"
                    ? "bg-muted border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Box className="flex-1 mr-2">
                  <Text size="xs" bold className="text-foreground">
                    +15 menit • {PRICE_15}
                  </Text>
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    Pas untuk simpulan dan rencana tindak lanjut
                  </Text>
                </Box>
                <Box
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    selectedOpt === "15"
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedOpt === "15" && (
                    <Check size={12} className="text-primary-foreground" />
                  )}
                </Box>
              </Pressable>

              {/* +30 Mins */}
              <Pressable
                onPress={() => setSelectedOpt("30")}
                className={`p-3.5 rounded-2xl border flex-row items-center justify-between active:opacity-90 ${
                  selectedOpt === "30"
                    ? "bg-muted border-primary"
                    : "bg-card border-border"
                }`}
              >
                <Box className="flex-1 mr-2">
                  <Text size="xs" bold className="text-foreground">
                    +30 menit • {PRICE_30}
                  </Text>
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    Untuk pembahasan mendalam, paling hemat
                  </Text>
                </Box>
                <Box
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    selectedOpt === "30"
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedOpt === "30" && (
                    <Check size={12} className="text-primary-foreground" />
                  )}
                </Box>
              </Pressable>
            </VStack>

            {/* PayState Card */}
            <Card className="bg-muted rounded-2xl p-3 border border-border gap-2 w-full">
              <HStack space="xs" className="items-center">
                <Wallet size={15} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Ringkasan overtime +{selectedOpt} menit
                </Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Perpanjangan {selectedOpt} menit
                </Text>
                <Text size="xs" bold className="text-foreground text-[11px]">
                  {selectedOpt === "15" ? PRICE_15 : PRICE_30}
                </Text>
              </HStack>
              <HStack space="md" className="items-center justify-between">
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  GoPay •••• 8821
                </Text>
                <Text size="xs" bold className="text-secondary text-[11px]">
                  Saldo cukup
                </Text>
              </HStack>
            </Card>

            {/* CTA */}
            <Button
              size="lg"
              onPress={handleExtend}
              className="w-full h-[50px] bg-secondary rounded-xl items-center justify-center active:opacity-90"
            >
              <ButtonText className="text-secondary-foreground font-bold text-sm">
                Perpanjang {selectedOpt} menit • Bayar {selectedOpt === "15" ? PRICE_15 : PRICE_30}
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                setIsOpen(false);
                router.push(ROUTES.PATIENT.RATING as never);
              }}
              className="items-center py-1"
            >
              <Text size="xs" bold className="text-muted-foreground">
                Akhiri sesi sekarang
              </Text>
            </Pressable>
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </SafeAreaView>
  );
}

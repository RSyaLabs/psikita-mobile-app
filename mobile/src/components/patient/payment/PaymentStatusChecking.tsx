import React, { useEffect, useRef } from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react-native";
import { Animated, Easing } from "react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PaymentStatusCheckingProps {
  onCheckStatus: () => void;
  onViewInvoice: () => void;
  isChecking?: boolean;
}

export function PaymentStatusChecking({
  onCheckStatus,
  onViewInvoice,
  isChecking = false,
}: PaymentStatusCheckingProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl" className="w-full max-w-[640px] md:max-w-[720px] self-center items-center">
          {/* Header Visual */}
          <VStack space="md" className="items-center mt-6 text-center">
            <Box className="w-[76px] h-[76px] rounded-full border-2 border-dashed border-primary/60 items-center justify-center bg-card">
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={30} color="#4A3B6B" />
              </Animated.View>
            </Box>

            <Heading level={1} size="xl" bold className="text-foreground text-center font-bold text-2xl">
              Sedang memeriksa pembayaranmu
            </Heading>

            <Text size="sm" className="text-muted-foreground text-center leading-relaxed font-medium max-w-[340px]">
              Biasanya selesai dalam beberapa menit. Halaman ini diperbarui otomatis.
            </Text>
          </VStack>

          {/* Stepper Timeline */}
          <Box className="w-full border border-border bg-card rounded-2xl overflow-hidden">
            {/* Step 1 */}
            <HStack space="md" className="p-4 items-center">
              <Box className="w-6 h-6 rounded-full bg-foreground items-center justify-center">
                <Text size="sm" bold className="text-card font-bold">
                  ✓
                </Text>
              </Box>
              <Text size="sm" bold className="text-foreground font-bold">
                Pembayaran dibuat
              </Text>
            </HStack>

            {/* Step 2 */}
            <HStack space="md" className="p-4 items-center border-t border-dashed border-border bg-muted/20">
              <Box className="w-6 h-6 rounded-full border-2 border-primary items-center justify-center">
                <Box className="w-2.5 h-2.5 rounded-full bg-primary" />
              </Box>
              <Text size="sm" bold className="text-primary font-bold">
                Menunggu konfirmasi bank
              </Text>
            </HStack>

            {/* Step 3 */}
            <HStack space="md" className="p-4 items-center border-t border-dashed border-border">
              <Box className="w-6 h-6 rounded-full border-2 border-dashed border-border items-center justify-center" />
              <Text size="sm" className="text-muted-foreground font-medium">
                Sesi siap dimulai
              </Text>
            </HStack>
          </Box>

          {/* Notice Box */}
          <Box className="w-full border border-dashed border-border rounded-xl p-3.5 bg-card">
            <Text size="sm" className="text-foreground text-center leading-relaxed">
              Jangan membayar ulang. Kami akan memberi tahu begitu pembayaranmu terkonfirmasi.
            </Text>
          </Box>

          {/* Action Buttons */}
          <VStack space="xs" className="w-full pt-2">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onCheckStatus();
              }}
              isDisabled={isChecking}
              className="w-full h-[52px] bg-primary rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
            >
              <ButtonIcon as={RefreshCw} className="text-primary-foreground" />
              <ButtonText className="text-primary-foreground font-bold text-sm">
                {isChecking ? "Memeriksa Status..." : "Cek Status Sekarang"}
              </ButtonText>
            </Button>

            <Pressable
              onPress={() => {
                haptics.selection();
                onViewInvoice();
              }}
              accessibilityRole="button"
              accessibilityLabel="Lihat Invoice"
              className="min-h-[44px] items-center justify-center active:opacity-80"
            >
              <Text size="sm" bold className="text-foreground font-semibold">
                Lihat Invoice
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}

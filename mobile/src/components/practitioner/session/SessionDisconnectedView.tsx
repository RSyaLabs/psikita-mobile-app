import React from "react";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, WifiOff } from "lucide-react-native";

export interface SessionDisconnectedViewProps {
  patientName?: string;
  remainingTime?: string;
  onReconnect: () => void;
  onHelp?: () => void;
  onBack: () => void;
}

export function SessionDisconnectedView({
  patientName = "Pasien Sesi",
  remainingTime = "28:40",
  onReconnect,
  onHelp,
  onBack,
}: SessionDisconnectedViewProps) {
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
        <VStack space="xs" className="flex-1">
          <Heading size="sm" bold className="text-foreground">
            {patientName}
          </Heading>
          <Text size="sm" className="text-muted-foreground">
            Sisa waktu tetap berjalan: {remainingTime}
          </Text>
        </VStack>
      </HStack>

      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Disconnection Alert */}
        <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-2">
          <HStack className="items-center gap-2">
            <WifiOff size={20} color="#262130" />
            <Heading size="sm" bold className="text-foreground">
              Koneksi terputus
            </Heading>
          </HStack>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Kami menyambungkan ulang otomatis. Pesan yang sudah terkirim tidak hilang.
          </Text>
        </Card>

        {/* Previous Message Bubbles */}
        <Box className="self-end max-w-[80%] p-3.5 rounded-2xl border border-border bg-muted rounded-br-sm">
          <Text size="sm" className="text-foreground leading-relaxed">
            Halo, boleh ceritakan apa yang mengganggumu?
          </Text>
        </Box>

        <Box className="self-start max-w-[80%] p-3.5 rounded-2xl border border-border bg-card rounded-bl-sm">
          <Text size="sm" className="text-foreground leading-relaxed">
            Akhir-akhir ini saya susah tidur karena cemas.
          </Text>
        </Box>
      </ScrollView>

      {/* Disabled Input Row */}
      <VStack className="p-4 border-t border-border bg-card gap-3">
        <HStack className="items-center gap-2 opacity-60">
          <Input className="flex-1 h-[52px] rounded-full border border-border bg-muted/60 px-4">
            <InputField
              editable={false}
              placeholder="Tulis pesan..."
              className="text-foreground text-sm"
            />
          </Input>
          <Box className="w-12 h-12 rounded-full bg-muted-foreground/40 items-center justify-center" />
        </HStack>

        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={onReconnect}
        >
          <ButtonText className="text-background font-semibold">
            Coba Sambungkan Sekarang
          </ButtonText>
        </Button>

        {onHelp && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Butuh bantuan"
            onPress={onHelp}
            className="min-h-[44px] items-center justify-center"
          >
            <Text size="sm" bold className="text-foreground">
              Butuh bantuan?
            </Text>
          </Pressable>
        )}
      </VStack>
    </Box>
  );
}

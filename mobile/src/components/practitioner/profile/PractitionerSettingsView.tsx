import React, { useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Globe,
  Volume2,
  Wallet,
} from "lucide-react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PractitionerSettingsViewProps {
  onBack: () => void;
  onChangeLanguage?: () => void;
  onChangeSound?: () => void;
}

export const PractitionerSettingsView = React.memo(
  function PractitionerSettingsView({
    onBack,
    onChangeLanguage,
    onChangeSound,
  }: PractitionerSettingsViewProps) {
    const [notifNewCase, setNotifNewCase] = useState(true);
    const [notifResultPending, setNotifResultPending] = useState(true);
    const [notifPaymentConfirmed, setNotifPaymentConfirmed] = useState(true);
    const [notifPayoutStatus, setNotifPayoutStatus] = useState(true);
    const [notifBankUpdate, setNotifBankUpdate] = useState(true);
    const [language] = useState("Indonesia");
    const [notificationSound] = useState("[Bawaan]");

    return (
      <VStack className="flex-1 bg-background">
        {/* Header */}
        <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
          <Pressable
            onPress={() => {
              haptics.selection();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </Pressable>
          <Text size="lg" bold className="text-foreground ml-1">
            Notifikasi & preferensi
          </Text>
        </HStack>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="md">
            {/* KASUS & SESI Section */}
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-muted-foreground uppercase tracking-wider px-1 font-semibold"
              >
                KASUS & SESI
              </Text>
              <Box className="border border-border bg-card rounded-2xl overflow-hidden">
                {/* Kasus baru masuk */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setNotifNewCase((prev) => !prev);
                  }}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifNewCase }}
                  accessibilityLabel="Notifikasi kasus baru masuk"
                  className="p-4 flex-row items-center justify-between active:bg-muted"
                >
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">
                      Kasus baru masuk
                    </Text>
                    <Text size="sm" className="text-muted-foreground mt-0.5">
                      Wajib saat siap menerima kasus
                    </Text>
                  </VStack>
                  <Box
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      notifNewCase
                        ? "bg-primary items-end"
                        : "bg-muted-foreground/30 items-start"
                    }`}
                  >
                    <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </Box>
                </Pressable>

                {/* Hasil belum dikirim */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setNotifResultPending((prev) => !prev);
                  }}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifResultPending }}
                  accessibilityLabel="Pengingat hasil belum dikirim"
                  className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted"
                >
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">
                      Hasil belum dikirim
                    </Text>
                    <Text size="sm" className="text-muted-foreground mt-0.5">
                      Pengingat
                    </Text>
                  </VStack>
                  <Box
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      notifResultPending
                        ? "bg-primary items-end"
                        : "bg-muted-foreground/30 items-start"
                    }`}
                  >
                    <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </Box>
                </Pressable>

                {/* Pembayaran pasien terkonfirmasi */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setNotifPaymentConfirmed((prev) => !prev);
                  }}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifPaymentConfirmed }}
                  accessibilityLabel="Notifikasi pembayaran pasien terkonfirmasi"
                  className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted"
                >
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">
                      Pembayaran pasien terkonfirmasi
                    </Text>
                  </VStack>
                  <Box
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      notifPaymentConfirmed
                        ? "bg-primary items-end"
                        : "bg-muted-foreground/30 items-start"
                    }`}
                  >
                    <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </Box>
                </Pressable>
              </Box>
            </VStack>

            {/* PENDAPATAN Section */}
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-muted-foreground uppercase tracking-wider px-1 font-semibold"
              >
                PENDAPATAN
              </Text>
              <Box className="border border-border bg-card rounded-2xl overflow-hidden">
                {/* Status pencairan */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setNotifPayoutStatus((prev) => !prev);
                  }}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifPayoutStatus }}
                  accessibilityLabel="Notifikasi status pencairan"
                  className="p-4 flex-row items-center justify-between active:bg-muted"
                >
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">
                      Status pencairan
                    </Text>
                  </VStack>
                  <Box
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      notifPayoutStatus
                        ? "bg-primary items-end"
                        : "bg-muted-foreground/30 items-start"
                    }`}
                  >
                    <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </Box>
                </Pressable>

                {/* Rekening perlu diperbarui */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setNotifBankUpdate((prev) => !prev);
                  }}
                  accessibilityRole="switch"
                  accessibilityState={{ checked: notifBankUpdate }}
                  accessibilityLabel="Notifikasi rekening perlu diperbarui"
                  className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted"
                >
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">
                      Rekening perlu diperbarui
                    </Text>
                  </VStack>
                  <Box
                    className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                      notifBankUpdate
                        ? "bg-primary items-end"
                        : "bg-muted-foreground/30 items-start"
                    }`}
                  >
                    <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
                  </Box>
                </Pressable>
              </Box>
            </VStack>

            {/* PREFERENSI Section */}
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-muted-foreground uppercase tracking-wider px-1 font-semibold"
              >
                PREFERENSI
              </Text>
              <Box className="border border-border bg-card rounded-2xl overflow-hidden">
                {/* Bahasa */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    if (onChangeLanguage) onChangeLanguage();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Ganti preferensi bahasa"
                  className="p-4 flex-row items-center justify-between active:bg-muted"
                >
                  <HStack space="sm" className="items-center flex-1 pr-2">
                    <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                      <Globe size={18} color="#4A3B6B" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="md" bold className="text-foreground">
                        Bahasa
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {language}
                      </Text>
                    </VStack>
                  </HStack>
                  <ChevronRight size={18} color="#75618E" />
                </Pressable>

                {/* Suara notifikasi kasus */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    if (onChangeSound) onChangeSound();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Ganti suara notifikasi kasus"
                  className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted"
                >
                  <HStack space="sm" className="items-center flex-1 pr-2">
                    <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                      <Volume2 size={18} color="#4A3B6B" />
                    </Box>
                    <VStack className="flex-1">
                      <Text size="md" bold className="text-foreground">
                        Suara notifikasi kasus
                      </Text>
                      <Text size="sm" className="text-muted-foreground">
                        {notificationSound}
                      </Text>
                    </VStack>
                  </HStack>
                  <ChevronRight size={18} color="#75618E" />
                </Pressable>
              </Box>
            </VStack>

            {/* Note box */}
            <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
              <Text size="sm" className="text-foreground font-medium leading-relaxed">
                Kategori wajib vs opsional ditentukan produk.
              </Text>
            </Box>
          </VStack>
        </ScrollView>
      </VStack>
    );
  },
);

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Globe, Volume2 } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PractitionerSettingsViewProps {
  onBack: () => void;
  onChangeLanguage?: () => void;
  onChangeSound?: () => void;
}

function SwitchPill({ checked }: { checked: boolean }) {
  return (
    <Box className={`w-12 h-7 rounded-full p-0.5 justify-center ${checked ? "bg-primary items-end" : "bg-muted-foreground/30 items-start"}`}>
      <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
    </Box>
  );
}

export const PractitionerSettingsView = React.memo(function PractitionerSettingsView({
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
  const [notificationSound] = useState("Nada Bawaan Sistem");

  const caseItems = [
    { title: "Kasus baru masuk", desc: "Wajib saat siap menerima kasus", val: notifNewCase, toggle: () => setNotifNewCase((v) => !v) },
    { title: "Hasil belum dikirim", desc: "Pengingat", val: notifResultPending, toggle: () => setNotifResultPending((v) => !v) },
    { title: "Pembayaran pasien terkonfirmasi", val: notifPaymentConfirmed, toggle: () => setNotifPaymentConfirmed((v) => !v) },
  ];

  const payoutItems = [
    { title: "Status pencairan", val: notifPayoutStatus, toggle: () => setNotifPayoutStatus((v) => !v) },
    { title: "Rekening perlu diperbarui", val: notifBankUpdate, toggle: () => setNotifBankUpdate((v) => !v) },
  ];

  return (
    <VStack className="flex-1 bg-background">
      <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
        <Pressable onPress={() => { haptics.selection(); onBack(); }} accessibilityRole="button" accessibilityLabel="Kembali" className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted">
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>
        <Text size="lg" bold className="text-foreground ml-1">Notifikasi & preferensi</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <VStack space="md">
          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">KASUS & SESI</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              {caseItems.map((item, idx) => (
                <Pressable key={item.title} onPress={() => { haptics.selection(); item.toggle(); }} accessibilityRole="switch" accessibilityState={{ checked: item.val }} accessibilityLabel={item.title} className={`p-4 flex-row items-center justify-between active:bg-muted ${idx > 0 ? "border-t border-dashed border-border" : ""}`}>
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">{item.title}</Text>
                    {item.desc && <Text size="sm" className="text-muted-foreground mt-0.5">{item.desc}</Text>}
                  </VStack>
                  <SwitchPill checked={item.val} />
                </Pressable>
              ))}
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">PENDAPATAN</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              {payoutItems.map((item, idx) => (
                <Pressable key={item.title} onPress={() => { haptics.selection(); item.toggle(); }} accessibilityRole="switch" accessibilityState={{ checked: item.val }} accessibilityLabel={item.title} className={`p-4 flex-row items-center justify-between active:bg-muted ${idx > 0 ? "border-t border-dashed border-border" : ""}`}>
                  <VStack className="flex-1 pr-3">
                    <Text size="md" bold className="text-foreground">{item.title}</Text>
                  </VStack>
                  <SwitchPill checked={item.val} />
                </Pressable>
              ))}
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">PREFERENSI</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Pressable onPress={() => { haptics.selection(); if (onChangeLanguage) onChangeLanguage(); }} accessibilityRole="button" accessibilityLabel="Ganti preferensi bahasa" className="p-4 flex-row items-center justify-between active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Globe size={18} color="#4A3B6B" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Bahasa</Text>
                    <Text size="sm" className="text-muted-foreground">{language}</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); if (onChangeSound) onChangeSound(); }} accessibilityRole="button" accessibilityLabel="Ganti suara notifikasi kasus" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Volume2 size={18} color="#4A3B6B" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Suara notifikasi kasus</Text>
                    <Text size="sm" className="text-muted-foreground">{notificationSound}</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>
            </Box>
          </VStack>

          <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
            <Text size="sm" className="text-foreground font-medium leading-relaxed">
              Kategori wajib vs opsional ditentukan produk.
            </Text>
          </Box>
        </VStack>
      </ScrollView>
    </VStack>
  );
});

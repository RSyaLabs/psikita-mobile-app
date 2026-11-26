import React from "react";
import {
  Box,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ChevronRight } from "lucide-react-native";

export interface PractitionerEarningsViewProps {
  transferredAmount?: string;
  recordedAmount?: string;
  withheldAmount?: string;
  eligibleAmount?: string;
  paidAmount?: string;
  bankStatusLabel?: string;
  taxStatusLabel?: string;
  payoutAgreed?: boolean;
  onOpenBankAccount: () => void;
  onOpenTaxProfile: () => void;
  onOpenPayoutHistory: () => void;
}

export function PractitionerEarningsView({
  transferredAmount = "Rp 0",
  recordedAmount = "Rp 0",
  withheldAmount = "Rp 0",
  eligibleAmount = "Rp 0",
  paidAmount = "Rp 0",
  bankStatusLabel = "Belum diatur ›",
  taxStatusLabel = "Belum dilengkapi ›",
  payoutAgreed = false,
  onOpenBankAccount,
  onOpenTaxProfile,
  onOpenPayoutHistory,
}: PractitionerEarningsViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, gap: 18, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="xs" className="pt-2">
        <Heading size="2xl" bold className="text-foreground">
          Pendapatan
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Pantau dari sesi sampai uang masuk.
        </Text>
      </VStack>

      {/* Sudah Ditransfer Card */}
      <Card className="border-2 border-foreground rounded-2xl p-4 bg-card gap-1">
        <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          SUDAH DITRANSFER
        </Text>
        <Heading size="3xl" bold className="text-foreground my-1">
          {transferredAmount}
        </Heading>
        <Text size="sm" className="text-muted-foreground">
          Tanda — berarti belum diketahui, bukan Rp0.
        </Text>
      </Card>

      {/* Dari Mana Uangnya Sekarang */}
      <VStack space="xs">
        <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          DARI MANA UANGNYA SEKARANG
        </Heading>
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <HStack className="justify-between items-center p-3.5">
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="sm" bold className="text-foreground">
                Tercatat
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Dari sesi yang selesai
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              {recordedAmount}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          <HStack className="justify-between items-center p-3.5">
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="sm" bold className="text-foreground">
                Ditahan
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Menunggu peninjauan sesuai kebijakan
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              {withheldAmount}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          <HStack className="justify-between items-center p-3.5">
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="sm" bold className="text-foreground">
                Memenuhi syarat
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Siap masuk jadwal pencairan
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              {eligibleAmount}
            </Text>
          </HStack>

          <Box className="border-t border-dashed border-border" />

          <HStack className="justify-between items-center p-3.5">
            <VStack space="xs" className="flex-1 pr-2">
              <Text size="sm" bold className="text-foreground">
                Sudah dibayar
              </Text>
              <Text size="sm" className="text-muted-foreground">
                Sudah ditransfer sistem keuangan
              </Text>
            </VStack>
            <Text size="sm" bold className="text-foreground">
              {paidAmount}
            </Text>
          </HStack>
        </Box>
      </VStack>

      {/* Syarat Pencairan */}
      <VStack space="xs">
        <Heading size="sm" bold className="text-muted-foreground uppercase tracking-wider">
          SYARAT PENCAIRAN
        </Heading>
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atur rekening bank"
            onPress={onOpenBankAccount}
            className="flex-row items-center justify-between p-4 min-h-[56px] active:bg-muted/50"
          >
            <Text size="sm" bold className="text-foreground">
              Rekening bank
            </Text>
            <Text size="sm" bold className="text-foreground">
              {bankStatusLabel}
            </Text>
          </Pressable>

          <Box className="border-t border-dashed border-border" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atur profil pajak"
            onPress={onOpenTaxProfile}
            className="flex-row items-center justify-between p-4 min-h-[56px] active:bg-muted/50"
          >
            <Text size="sm" bold className="text-foreground">
              Profil pajak
            </Text>
            <Text size="sm" bold className="text-foreground">
              {taxStatusLabel}
            </Text>
          </Pressable>

          <Box className="border-t border-dashed border-border" />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Persetujuan pencairan"
            onPress={onOpenTaxProfile}
            className="flex-row items-center justify-between p-4 min-h-[56px] active:bg-muted/50"
          >
            <Text size="sm" bold className="text-foreground">
              Persetujuan pencairan
            </Text>
            <Text size="sm" bold className="text-foreground">
              {payoutAgreed ? "✓ Disetujui" : "Belum disetujui ›"}
            </Text>
          </Pressable>
        </Box>
      </VStack>

      {/* Link: Riwayat Pencairan */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buka riwayat pencairan"
        onPress={onOpenPayoutHistory}
        className="flex-row items-center justify-between p-4 border border-border rounded-2xl bg-card min-h-[56px] active:bg-muted"
      >
        <Text size="sm" bold className="text-foreground">
          Riwayat pencairan
        </Text>
        <ChevronRight size={18} color="#262130" />
      </Pressable>

      {/* Policy Notice */}
      <Box className="border border-dashed border-border rounded-2xl p-3.5 bg-muted/40">
        <Text size="sm" className="text-foreground leading-relaxed">
          Pencairan diproses otomatis oleh sistem keuangan SeraPhany sesuai jadwal. Tidak ada tombol cairkan di aplikasi.
        </Text>
      </Box>
    </ScrollView>
  );
}

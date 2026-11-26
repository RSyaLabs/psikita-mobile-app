import React from "react";
import { ArrowLeftRight, BadgeCheck, Bell, Building2, Check, ChevronRight, Clock, FileText, HelpCircle, LogOut, Receipt } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, Button, ButtonText, Avatar, AvatarFallbackText, AvatarImage, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { getInitials } from "@/utils/format";

export interface PractitionerAccountHubViewProps {
  fullName?: string;
  title?: string;
  avatarUrl?: string;
  strExpiryDate?: string;
  isReady?: boolean;
  bankStatus?: string;
  onOpenProfessionalProfile: () => void;
  onOpenAvailability: () => void;
  onOpenBankAccount: () => void;
  onOpenPayoutHistory: () => void;
  onSwitchToPatientView: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onSignOut: () => void;
}

export const PractitionerAccountHubView = React.memo(function PractitionerAccountHubView({
  fullName = "Mitra Praktisi",
  title = "Psikiater Klinis",
  avatarUrl,
  strExpiryDate = "31 Des 2027",
  isReady = true,
  bankStatus = "Menunggu verifikasi",
  onOpenProfessionalProfile,
  onOpenAvailability,
  onOpenBankAccount,
  onOpenPayoutHistory,
  onSwitchToPatientView,
  onOpenSettings,
  onOpenHelp,
  onSignOut,
}: PractitionerAccountHubViewProps) {
  return (
    <VStack className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <VStack space="md">
          <HStack space="md" className="items-center py-2">
            <Avatar className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/10 items-center justify-center">
              {avatarUrl ? (
                <AvatarImage source={{ uri: avatarUrl }} alt={fullName} />
              ) : (
                <AvatarFallbackText className="text-xl font-bold text-primary">{getInitials(fullName) || "P"}</AvatarFallbackText>
              )}
            </Avatar>
            <VStack className="flex-1">
              <Text size="xl" bold className="text-foreground leading-tight">{fullName}</Text>
              <Text size="sm" className="text-muted-foreground font-medium mt-0.5">{title}</Text>
            </VStack>
          </HStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">STATUS MITRA</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Box className="p-4 flex-row items-center justify-between">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <BadgeCheck size={18} color="#059669" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Pengajuan mitra</Text>
                    <Text size="sm" className="text-emerald-600 font-medium">Disetujui</Text>
                  </VStack>
                </HStack>
                <Box className="w-6 h-6 rounded-full bg-emerald-500/15 items-center justify-center">
                  <Check size={14} color="#059669" />
                </Box>
              </Box>

              <Pressable onPress={() => { haptics.selection(); onOpenProfessionalProfile(); }} accessibilityRole="button" accessibilityLabel="Profil profesional, STR dan SIP" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <FileText size={18} color="#4A3B6B" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Profil profesional, STR & SIP</Text>
                    <Text size="sm" className="text-muted-foreground">Berlaku sampai {strExpiryDate}</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">PRAKTIK</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Pressable onPress={() => { haptics.selection(); onOpenAvailability(); }} accessibilityRole="button" accessibilityLabel="Atur ketersediaan dan jam praktik" className="p-4 flex-row items-center justify-between active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Clock size={18} color="#4A3B6B" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Ketersediaan</Text>
                    <Text size="sm" className="text-muted-foreground">{isReady ? "Siap menerima kasus" : "Sedang istirahat"}</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); onOpenBankAccount(); }} accessibilityRole="button" accessibilityLabel="Pengaturan rekening bank" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Building2 size={18} color="#4A3B6B" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Rekening bank</Text>
                    <Text size="sm" className="text-amber-600 font-medium">{bankStatus}</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); onOpenPayoutHistory(); }} accessibilityRole="button" accessibilityLabel="Lihat riwayat pencairan pendapatan" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Receipt size={18} color="#4A3B6B" />
                  </Box>
                  <Text size="md" bold className="text-foreground flex-1">Riwayat pencairan</Text>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>
            </Box>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">AKUN</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              <Pressable onPress={() => { haptics.selection(); onSwitchToPatientView(); }} accessibilityRole="button" accessibilityLabel="Beralih ke tampilan pasien" className="p-4 flex-row items-center justify-between active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-secondary/20 items-center justify-center">
                    <ArrowLeftRight size={18} color="#75618E" />
                  </Box>
                  <VStack className="flex-1">
                    <Text size="md" bold className="text-foreground">Beralih ke tampilan pasien</Text>
                    <Text size="sm" className="text-muted-foreground">Satu akun, dua peran</Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); onOpenSettings(); }} accessibilityRole="button" accessibilityLabel="Notifikasi dan preferensi" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <Bell size={18} color="#4A3B6B" />
                  </Box>
                  <Text size="md" bold className="text-foreground flex-1">Notifikasi & preferensi</Text>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>

              <Pressable onPress={() => { haptics.selection(); onOpenHelp(); }} accessibilityRole="button" accessibilityLabel="Pusat bantuan praktisi" className="p-4 flex-row items-center justify-between border-t border-dashed border-border active:bg-muted">
                <HStack space="sm" className="items-center flex-1 pr-2">
                  <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                    <HelpCircle size={18} color="#4A3B6B" />
                  </Box>
                  <Text size="md" bold className="text-foreground flex-1">Bantuan</Text>
                </HStack>
                <ChevronRight size={18} color="#75618E" />
              </Pressable>
            </Box>
          </VStack>

          <Button variant="outline" onPress={() => { haptics.medium(); onSignOut(); }} accessibilityRole="button" accessibilityLabel="Keluar Akun" className="border-destructive/30 bg-destructive/5 h-12 rounded-xl mt-2 active:opacity-80">
            <HStack space="sm" className="items-center">
              <LogOut size={18} className="text-destructive" />
              <ButtonText className="text-destructive font-bold text-base">Keluar Akun</ButtonText>
            </HStack>
          </Button>
        </VStack>
      </ScrollView>
    </VStack>
  );
});

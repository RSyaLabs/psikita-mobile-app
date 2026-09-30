import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Building2,
  Calendar,
  Check,
  ChevronRight,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Badge,
  BadgeText,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  ScrollView,
} from "@/components/ui";
import {
  PractitionerSettingsModal,
  PractitionerScheduleModal,
  PractitionerHelpModal,
} from "@/components/modals";
import { AppHeader } from "@/components/common";
import { PractitionerTabBar } from "@/components/navigation";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import {
  usePractitionerProfile,
  useLedgerAccounts,
} from "@/hooks/useApiQueries";
import { resolveServerValue } from "@/utils/server-value";
import { formatRupiah } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";

export default function PractitionerProfileScreen() {
  const router = useRouter();
  const { data: profile } = usePractitionerProfile();
  const { data: accountsData } = useLedgerAccounts();
  const { signOut } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const fullName = profile?.fullName;
  const title = profile?.title;
  const strNumber = profile?.strNumber;
  const sippNumber = profile?.sippNumber;
  // practitioner.service.ts:91 already maps this field; the screen was
  // never reading it, so every practitioner saw a verified credential card.
  const isVerified = profile?.verificationStatus === "VERIFIED";
  const verificationStatus = profile?.verificationStatus;
  // No placeholder rating or session count. A pending practitioner showing
  // "4.9 / 128 sesi" is a fabricated track record.
  const rating = profile?.rating?.toString();
  const totalSessions = profile?.totalSessions?.toString();

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } finally {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <AppHeader
        title="Profil praktisi"
        showBack={false}
        rightAction={
          <Pressable
            onPress={() => {
              haptics.selection();
              setShowSettingsModal(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Pengaturan Akun"
            className="active:opacity-70"
          >
            <Settings size={18} className="text-foreground" />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <Card className="bg-primary rounded-3xl p-4 items-center mb-3 border-0">
          <VStack space="xs" className="items-center">
            <Avatar className="w-16 h-16 rounded-full border-2 border-primary-foreground/30 mb-1">
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzA0NDh8&ixlib=rb-4.1.0&q=80&w=1080",
                }}
              />
              <AvatarFallbackText>NP</AvatarFallbackText>
            </Avatar>
            <Heading size="md" className="font-bold text-primary-foreground">
              {fullName}
            </Heading>
            <Text size="xs" className="text-primary-foreground/70">
              {title}
            </Text>

            <Badge className="bg-primary-foreground/20 px-3 py-1 rounded-full flex-row items-center gap-1 mt-1 border-0">
              <Star
                size={12}
                className="text-primary-foreground fill-primary-foreground"
              />
              <BadgeText className="text-xs font-bold text-primary-foreground">
                Level 2 • Praktisi Senior
              </BadgeText>
            </Badge>
          </VStack>
        </Card>

        {/* Stats Row */}
        <HStack space="sm" className="items-center mb-3">
          <Card className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
            <Heading size="md" className="font-bold text-foreground">
              {totalSessions ?? "-"}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Total sesi
            </Text>
          </Card>
          <Card className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
            <Heading size="md" className="font-bold text-foreground">
              {rating ?? "-"}
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Rating
            </Text>
          </Card>
          <Card className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
            <Heading size="md" className="font-bold text-foreground">
              6 th
            </Heading>
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Pengalaman
            </Text>
          </Card>
        </HStack>

        {/* Verification Card */}
        <Card className="bg-muted rounded-2xl p-3.5 border border-border mb-3">
          <VStack space="xs">
            <HStack space="sm" className="items-center">
              <ShieldCheck size={18} className="text-foreground" />
              <Text size="xs" className="font-bold text-foreground">
                {isVerified
                  ? "Terverifikasi penuh"
                  : verificationStatus === "REJECTED"
                    ? "Verifikasi ditolak"
                    : "Menunggu verifikasi"}
              </Text>
            </HStack>
            {isVerified ? (
              <>
                {strNumber ? (
                  <HStack space="md" className="items-center justify-between">
                    <Text size="xs" className="text-[11px] text-foreground">
                      {strNumber}
                    </Text>
                    <Check size={14} className="text-foreground" />
                  </HStack>
                ) : null}
                {sippNumber ? (
                  <HStack space="md" className="items-center justify-between">
                    <Text size="xs" className="text-[11px] text-foreground">
                      {sippNumber}
                    </Text>
                    <Check size={14} className="text-foreground" />
                  </HStack>
                ) : null}
              </>
            ) : (
              <Text size="xs" className="text-[11px] text-muted-foreground">
                Nomor STR dan SIPP ditampilkan setelah verifikasi selesai.
              </Text>
            )}
          </VStack>
        </Card>

        {/* Menus */}
        <Card className="bg-card rounded-2xl p-3 border border-border mb-4">
          <VStack space="xs">
            <Pressable
              onPress={() => {
                haptics.selection();
                setShowScheduleModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Atur jadwal praktik"
              className="py-2.5 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Calendar size={16} className="text-secondary" />
                </Box>
                <VStack space="xs">
                  <Text size="xs" className="font-bold text-foreground">
                    Atur jadwal praktik
                  </Text>
                  <Text size="xs" className="text-[10px] text-muted-foreground">
                    Senin–Jumat • 09:00–17:00
                  </Text>
                </VStack>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PRACTITIONER.WITHDRAW)}
              accessibilityRole="button"
              accessibilityLabel="Lihat penghasilan dan insentif"
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Wallet size={16} className="text-secondary" />
                </Box>
                <VStack space="xs">
                  <Text size="xs" className="font-bold text-foreground">
                    Lihat penghasilan dan insentif
                  </Text>
                  <Text size="xs" className="text-[10px] text-muted-foreground">
                    {resolveServerValue(
                      accountsData?.data?.[0]?.balance,
                      (v) => `${formatRupiah(v)} tersedia`,
                      "Saldo belum dapat dimuat",
                    )}
                  </Text>
                </VStack>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PRACTITIONER.BANK_ACCOUNT)}
              accessibilityRole="button"
              accessibilityLabel="Rekening Bank Mitra"
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <Building2 size={16} className="text-secondary" />
                </Box>
                {/* No account line here. This used to be static JSX reading
                    "BCA •••• 8820 (dr. Andi)" with no server call at all: a
                    masked account number and a hardcoded owner name on the
                    finance screen. The API exposes no bank-account resource, so
                    the line stays gone until one exists. */}
                <Text size="xs" className="font-bold text-foreground">
                  Rekening Bank Mitra
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.selection();
                setShowHelpModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Pusat bantuan praktisi"
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-xl bg-muted items-center justify-center">
                  <HelpCircle size={16} className="text-foreground" />
                </Box>
                <Text size="xs" className="font-bold text-foreground">
                  Pusat bantuan
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Keluar akun"
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-xl bg-destructive/10 items-center justify-center">
                  <LogOut size={16} className="text-destructive" />
                </Box>
                <Text size="xs" className="font-bold text-destructive">
                  Keluar akun
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>
          </VStack>
        </Card>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PractitionerTabBar activeTab="profil" />

      {/* Pop-up Modals */}
      <PractitionerSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <PractitionerScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      <PractitionerHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </SafeAreaView>
  );
}

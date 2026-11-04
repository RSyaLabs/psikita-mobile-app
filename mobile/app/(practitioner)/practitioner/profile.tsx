import React, { useState } from "react";
import { Alert, ActivityIndicator, Linking } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Check,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
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
  useMyAvatar,
  useStartPractitionerVerification,
  useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { getInitials } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";

export default function PractitionerProfileScreen() {
  const router = useRouter();
  const { data: profile } = usePractitionerProfile();
  const { data: avatarData } = useMyAvatar();
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

  const startPractitionerVerificationMutation =
    useStartPractitionerVerification();
  const startAccountVerificationMutation = useStartDiditVerification();
  const isVerifying =
    startPractitionerVerificationMutation.isPending ||
    startAccountVerificationMutation.isPending;

  const handleStartVerification = async () => {
    haptics.selection();
    try {
      let session;
      if (profile?.id) {
        session = await startPractitionerVerificationMutation.mutateAsync(
          profile.id,
        );
      } else {
        session = await startAccountVerificationMutation.mutateAsync();
      }
      if (session?.url) {
        await Linking.openURL(session.url);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memulai sesi Didit KYC. Silakan coba lagi.";
      Alert.alert("Gagal Memulai Verifikasi", message);
    }
  };

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
              {avatarData?.avatarUrl ? (
                <AvatarImage
                  source={{
                    uri: avatarData.avatarUrl,
                  }}
                />
              ) : null}
              <AvatarFallbackText>{getInitials(fullName)}</AvatarFallbackText>
            </Avatar>
            <Heading size="md" className="font-bold text-primary-foreground">
              {fullName}
            </Heading>
            <Text size="sm" className="text-primary-foreground/70">
              {title}
            </Text>

            <Badge className="bg-primary-foreground/20 px-3 py-1 rounded-full flex-row items-center gap-1 mt-1 border-0">
              <Star
                size={14}
                className="text-primary-foreground fill-primary-foreground"
              />
              <BadgeText className="text-sm font-bold text-primary-foreground">
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
            <Text size="sm" className="text-muted-foreground font-medium text-sm">
              Total sesi
            </Text>
          </Card>
          <Card className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
            <Heading size="md" className="font-bold text-foreground">
              {rating ?? "-"}
            </Heading>
            <Text size="sm" className="text-muted-foreground font-medium text-sm">
              Rating
            </Text>
          </Card>
          <Card className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
            <Heading size="md" className="font-bold text-foreground">
              6 th
            </Heading>
            <Text size="sm" className="text-muted-foreground font-medium text-sm">
              Pengalaman
            </Text>
          </Card>
        </HStack>

        {/* Verification Card */}
        <Card className="bg-muted rounded-2xl p-3.5 border border-border mb-3">
          <VStack space="xs">
            <HStack space="sm" className="items-center">
              <ShieldCheck size={18} color="#4A3B6B" />
              <Text size="sm" className="font-bold text-foreground">
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
                    <Text size="sm" className="text-foreground font-medium">
                      {strNumber}
                    </Text>
                    <Check size={15} color="#4A3B6B" />
                  </HStack>
                ) : null}
                {sippNumber ? (
                  <HStack space="md" className="items-center justify-between">
                    <Text size="sm" className="text-foreground font-medium">
                      {sippNumber}
                    </Text>
                    <Check size={15} color="#4A3B6B" />
                  </HStack>
                ) : null}
              </>
            ) : (
              <VStack space="sm">
                <Text size="sm" className="text-muted-foreground font-medium leading-relaxed">
                  Nomor STR dan SIPP ditampilkan setelah verifikasi selesai.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Mulai Verifikasi Identitas Didit KYC"
                  onPress={handleStartVerification}
                  disabled={isVerifying}
                  className="mt-1 bg-primary py-2.5 px-4 rounded-xl flex-row items-center justify-center active:opacity-80"
                >
                  {isVerifying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <HStack space="xs" className="items-center">
                      <ShieldCheck size={16} color="#FFFFFF" />
                      <Text size="sm" className="font-bold text-white">
                        Mulai Verifikasi Identitas (KYC)
                      </Text>
                      <ExternalLink size={14} color="#FFFFFF" />
                    </HStack>
                  )}
                </Pressable>
              </VStack>
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
                  <Calendar size={16} color="#4A3B6B" />
                </Box>
                <VStack space="xs">
                  <Text size="sm" className="font-bold text-foreground">
                    Atur jadwal praktik
                  </Text>
                  <Text size="sm" className="text-muted-foreground font-medium">
                    Senin–Jumat • 09:00–17:00
                  </Text>
                </VStack>
              </HStack>
              <ChevronRight size={18} color="#4B4656" />
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

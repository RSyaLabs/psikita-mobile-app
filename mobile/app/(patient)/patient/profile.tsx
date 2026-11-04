import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage, Alert, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Edit3,
  Pill,
  FileText,
  Calendar,
  HelpCircle,
  MessageSquare,
  Shield,
  ShieldCheck,
  ExternalLink,
  LogOut,
  ChevronRight,
  Stethoscope,
} from "lucide-react-native";
import { getInitials } from "@/utils/format";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants/routes";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  ScrollView,
} from "@/components/ui";
import {
  PatientFaqModal,
  PatientSupportModal,
  PatientPrivacyModal,
} from "@/components/modals";
import { AppIcon } from "@/components/common/AppIcon";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  usePatientProfile,
  useMyAvatar,
  useMyVerificationStatus,
  useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: patient } = usePatientProfile();
  const { data: avatarData } = useMyAvatar();
  const { data: kycStatus } = useMyVerificationStatus();
  const startKycMutation = useStartDiditVerification();
  const isKycStarting = startKycMutation.isPending;
  const isKycVerified =
    kycStatus?.status === "APPROVED" || kycStatus?.status === "VERIFIED";
  const { signOut } = useAuth();

  const handleStartKyc = async () => {
    haptics.selection();
    try {
      const session = await startKycMutation.mutateAsync();
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

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCsModal, setShowCsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const patientName = patient?.fullName || "Pasien";
  const rmNumber = patient?.medicalRecordNumber || "Belum tersedia";

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
      {/* Profile Header (Root Tab - No Back Button, Authentic Brand Emblem) */}
      <Box className="bg-primary px-5 pt-3 pb-6 rounded-b-3xl items-center">
        <HStack space="xs" className="w-full justify-between items-center mb-1">
          <Box className="w-8 h-8" />
          <RNImage
            source={require("@/../assets/icon.png")}
            style={{ width: 32, height: 32, borderRadius: 8 }}
            resizeMode="cover"
          />
        </HStack>

        <VStack space="xs" className="items-center">
          <Avatar size="2xl" className="border-2 border-primary-foreground/20">
            {avatarData?.avatarUrl ? (
              <AvatarImage source={{ uri: avatarData.avatarUrl }} />
            ) : null}
            <AvatarFallbackText>{getInitials(patientName)}</AvatarFallbackText>
          </Avatar>
          <Heading size="lg" bold className="text-primary-foreground mt-1">
            {patientName}
          </Heading>
          <Text size="sm" className="text-primary-foreground/90 font-medium">
            Nomor rekam medis: {rmNumber}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ubah profil dan data medis"
            onPress={() => {
              haptics.light();
              router.push(ROUTES.PATIENT.EDIT_PROFILE);
            }}
            className="bg-primary-foreground/15 px-4 py-2 rounded-full flex-row items-center gap-2 mt-2 active:opacity-80"
          >
            <AppIcon icon={Edit3} size={15} color="#FFFFFF" />
            <Text size="sm" className="font-semibold text-primary-foreground">
              Ubah profil
            </Text>
          </Pressable>
        </VStack>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Care Continuity Banner */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <HStack space="md" className="items-center">
            <Box className="w-10 h-10 rounded-full bg-muted items-center justify-center">
              <AppIcon icon={Pill} size={20} tone="primary" />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Ringkasan perawatan belum tersedia
              </Text>
              <Text size="sm" className="text-muted-foreground font-medium leading-relaxed">
                Resep dan rujukan hanya ditampilkan setelah dimuat dari server.
              </Text>
            </VStack>
          </HStack>
        </Card>

        {/* Didit KYC Identity Verification Card */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <VStack space="sm">
            <HStack space="md" className="items-center">
              <Box className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                <AppIcon icon={ShieldCheck} size={20} tone="primary" />
              </Box>
              <VStack space="xs" className="flex-1">
                <HStack space="xs" className="items-center justify-between">
                  <Text size="sm" bold className="text-foreground">
                    Verifikasi Identitas (KYC)
                  </Text>
                  <Text
                    size="sm"
                    className={
                      isKycVerified
                        ? "text-primary font-bold"
                        : "text-muted-foreground font-medium"
                    }
                  >
                    {isKycVerified
                      ? "Terverifikasi"
                      : kycStatus?.status === "IN_PROGRESS"
                        ? "Diproses"
                        : "Belum Verifikasi"}
                  </Text>
                </HStack>
                <Text size="sm" className="text-muted-foreground font-medium leading-relaxed">
                  {isKycVerified
                    ? "Identitas terhubung dengan validasi KTP & Satu Sehat."
                    : "Verifikasi KTP melalui Didit KYC untuk perlindungan rekam medis."}
                </Text>
              </VStack>
            </HStack>

            {!isKycVerified && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Mulai Verifikasi Didit KYC"
                onPress={handleStartKyc}
                disabled={isKycStarting}
                className="mt-1 bg-primary py-2.5 px-4 rounded-xl flex-row items-center justify-center active:opacity-80"
              >
                {isKycStarting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <HStack space="xs" className="items-center">
                    <AppIcon icon={ShieldCheck} size={16} color="#FFFFFF" />
                    <Text size="sm" className="font-bold text-white">
                      Verifikasi Sekarang (Didit KYC)
                    </Text>
                    <ExternalLink size={14} color="#FFFFFF" />
                  </HStack>
                )}
              </Pressable>
            )}
          </VStack>
        </Card>

        {/* Group Akun */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <VStack space="xs">
            <Text
              size="sm"
              className="font-bold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Akun
            </Text>
            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.HISTORY)}
              className="py-3 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={Calendar} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Jadwal saya
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.PRESCRIPTION)}
              className="py-3 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={Pill} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Resep digital
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.REFERRAL)}
              className="py-3 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={FileText} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Rujukan rumah sakit
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>
          </VStack>
        </Card>

        {/* Group Kemitraan Praktisi */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <VStack space="xs">
            <Text
              size="sm"
              className="font-bold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Kemitraan Profesional
            </Text>
            <Pressable
              onPress={() => {
                haptics.selection();
                router.push(ROUTES.PRACTITIONER.REGISTER);
              }}
              className="py-3 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="md" className="items-center flex-1 pr-2">
                <AppIcon icon={Stethoscope} size={20} tone="primary" />
                <VStack space="xs" className="flex-1">
                  <Text size="sm" className="font-semibold text-foreground">
                    Daftar Sebagai Mitra Praktisi
                  </Text>
                  <Text size="sm" className="text-muted-foreground">
                    Bergabung sebagai Psikolog Klinis atau Psikiater
                  </Text>
                </VStack>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>
          </VStack>
        </Card>

        {/* Group Bantuan */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <VStack space="xs">
            <Text
              size="sm"
              className="font-bold text-muted-foreground uppercase tracking-wider mb-2"
            >
              Bantuan
            </Text>
            <Pressable
              onPress={() => {
                haptics.light();
                setShowHelpModal(true);
              }}
              className="py-3 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={HelpCircle} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Pusat bantuan & FAQ
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.light();
                setShowCsModal(true);
              }}
              className="py-3 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={MessageSquare} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Hubungi Tim Support
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.light();
                setShowPrivacyModal(true);
              }}
              className="py-3 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <AppIcon icon={Shield} size={20} tone="primary" />
                <Text size="sm" className="font-semibold text-foreground">
                  Kebijakan privasi & data medis
                </Text>
              </HStack>
              <AppIcon icon={ChevronRight} size={18} tone="muted" />
            </Pressable>
          </VStack>
        </Card>

        {/* Logout */}
        <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-3 active:opacity-80"
          >
            <AppIcon icon={LogOut} size={20} tone="destructive" />
            <Text size="sm" bold className="text-destructive">
              Keluar Akun
            </Text>
          </Pressable>
        </Card>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="akun" />

      {/* Modals */}
      <PatientFaqModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <PatientSupportModal
        isOpen={showCsModal}
        onClose={() => setShowCsModal(false)}
      />

      <PatientPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Edit3,
  Pill,
  FileText,
  Calendar,
  HelpCircle,
  MessageSquare,
  Shield,
  LogOut,
  ChevronRight,
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
import { usePatientProfile, useMyAvatar } from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: patient } = usePatientProfile();
  const { data: avatarData } = useMyAvatar();
  const { signOut } = useAuth();

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

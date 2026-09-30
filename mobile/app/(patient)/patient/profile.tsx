import React, { useState } from "react";
import { useRouter } from "expo-router";
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
  ArrowLeft,
} from "lucide-react-native";
import { getInitials } from "@/utils/format";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
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
  AvatarFallbackText,
  ScrollView,
} from "@/components/ui";
import {
  PatientFaqModal,
  PatientSupportModal,
  PatientPrivacyModal,
} from "@/components/modals";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import { usePatientProfile } from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const { data: patient } = usePatientProfile();
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
      {/* Profile Head */}
      <Box className="bg-primary px-5 pt-3 pb-5 rounded-b-3xl items-center">
        <HStack space="xs" className="w-full justify-between items-center mb-1">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Dashboard"
            className="p-1 -ml-1 active:opacity-70"
          >
            <ArrowLeft size={22} className="text-primary-foreground" />
          </Pressable>
          <Box className="w-6" />
        </HStack>
        <VStack space="xs" className="items-center">
          <Avatar size="2xl" className="border-2 border-primary-foreground/20">
            <AvatarFallbackText>{getInitials(patientName)}</AvatarFallbackText>
          </Avatar>
          <Heading size="md" bold className="text-primary-foreground mt-1">
            {patientName}
          </Heading>
          <Text size="xs" className="text-primary-foreground/80">
            Nomor rekam medis: {rmNumber}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ubah profil dan data medis"
            onPress={() => {
              haptics.light();
              router.push(ROUTES.PATIENT.EDIT_PROFILE);
            }}
            className="bg-primary-foreground/10 px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 my-1 active:opacity-80"
          >
            <Edit3 size={13} className="text-primary-foreground" />
            <Text size="xs" className="font-semibold text-primary-foreground">
              Ubah profil
            </Text>
          </Pressable>
        </VStack>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Care Continuity */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3.5">
          <HStack space="sm" className="items-center">
            <Pill size={18} className="text-secondary" />
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Ringkasan perawatan belum tersedia
              </Text>
              <Text size="xs" className="text-muted-foreground text-[11px]">
                Resep dan rujukan hanya ditampilkan setelah dimuat dari server.
              </Text>
            </VStack>
          </HStack>
        </Card>

        {/* Group Akun */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3.5">
          <VStack space="xs">
            <Text
              size="xs"
              className="font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 text-[11px]"
            >
              Akun
            </Text>
            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.HISTORY)}
              className="py-2.5 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <Calendar size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Jadwal saya
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.PRESCRIPTION)}
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <Pill size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Resep digital
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => router.push(ROUTES.PATIENT.REFERRAL)}
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <FileText size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Rujukan rumah sakit
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>
          </VStack>
        </Card>

        {/* Group Bantuan */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3.5">
          <VStack space="xs">
            <Text
              size="xs"
              className="font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 text-[11px]"
            >
              Bantuan
            </Text>
            <Pressable
              onPress={() => {
                haptics.light();
                setShowHelpModal(true);
              }}
              className="py-2.5 flex-row items-center justify-between active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <HelpCircle size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Pusat bantuan & FAQ
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.light();
                setShowCsModal(true);
              }}
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <MessageSquare size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Hubungi Tim Support
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>

            <Pressable
              onPress={() => {
                haptics.light();
                setShowPrivacyModal(true);
              }}
              className="py-2.5 flex-row items-center justify-between border-t border-border active:opacity-80"
            >
              <HStack space="md" className="items-center">
                <Shield size={18} className="text-foreground" />
                <Text size="xs" bold className="text-foreground">
                  Kebijakan privasi & data medis
                </Text>
              </HStack>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Pressable>
          </VStack>
        </Card>

        {/* Logout */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border mb-4">
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center gap-3 active:opacity-80"
          >
            <LogOut size={18} className="text-destructive" />
            <Text size="xs" bold className="text-destructive">
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

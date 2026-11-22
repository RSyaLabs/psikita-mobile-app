import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image as RNImage, Alert, ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Edit3,
  HelpCircle,
  MessageSquare,
  Shield,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Stethoscope,
  Lock,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Bell,
  User,
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
  Button,
  ButtonText,
  Badge,
  BadgeText,
} from "@/components/ui";
import { PatientPrivacyModal } from "@/components/modals";
import { AppIcon } from "@/components/common/AppIcon";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  usePatientProfile,
  useMyAvatar,
  useMyVerificationStatus,
  useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kyc?: string; guest?: string }>();
  const kycView = params.kyc;

  const { data: patient } = usePatientProfile();
  const { data: avatarData } = useMyAvatar();
  const { data: kycStatus, refetch: refetchKyc } = useMyVerificationStatus();
  const startKycMutation = useStartDiditVerification();
  const isKycStarting = startKycMutation.isPending;
  const isKycVerified =
    kycStatus?.status === "APPROVED" || kycStatus?.status === "VERIFIED";
  const { signOut } = useAuth();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const patientName = patient?.fullName || "Sinta Maharani";
  const patientEmail = patient?.email || "nama@email.com";
  const rmNumber = patient?.medicalRecordNumber || "Belum tersedia";

  const handleStartRealKyc = async () => {
    haptics.selection();
    try {
      const session = await startKycMutation.mutateAsync();
      await launchDiditVerification(session, {
        onApproved: () => {
          haptics.success();
          refetchKyc();
          router.push({
            pathname: ROUTES.PATIENT.PROFILE,
            params: { kyc: "verified" },
          } as any);
        },
        onCompleted: () => {
          refetchKyc();
        },
        onCancelled: () => {
          // user cancelled verification
        },
        onError: (err) => {
          haptics.error();
          Alert.alert("Kendala Verifikasi", err.message);
        },
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memulai sesi verifikasi identitas. Silakan coba lagi.";
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

  // =========================================================================
  // Screen 15: KY2 · Verifikasi identitas: mulai
  // =========================================================================
  if (kycView === "start") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <HStack space="sm" className="items-center px-4 py-3 border-b border-[#EBE7E0]">
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="p-2 -ml-2 rounded-full active:bg-black/5"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-[#262130]">
            Verifikasi Identitas
          </Heading>
        </HStack>

        <ScrollView className="flex-1 px-5 py-6">
          <VStack space="lg" className="items-center">
            <Box className="w-20 h-20 rounded-full bg-[#4A3B6B]/10 items-center justify-center">
              <ShieldCheck size={40} color="#4A3B6B" />
            </Box>

            <VStack space="xs" className="items-center text-center">
              <Heading size="xl" bold className="text-[#262130] text-center">
                Verifikasi identitasmu
              </Heading>
              <Text size="sm" className="text-[#75618E] text-center leading-relaxed">
                Kamu akan diminta foto e-KTP dan selfie wajah. Butuh sekitar 3 menit.
              </Text>
            </VStack>

            {/* SIAPKAN Box */}
            <Box className="w-full bg-white p-5 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider mb-3">
                SIAPKAN
              </Text>
              <VStack space="sm">
                <HStack space="sm" className="items-start">
                  <Text className="text-[#4A3B6B] font-bold">•</Text>
                  <Text size="sm" className="text-[#262130] flex-1 leading-normal">
                    Dokumen identitas asli milikmu (cth: e-KTP)
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-[#4A3B6B] font-bold">•</Text>
                  <Text size="sm" className="text-[#262130] flex-1 leading-normal">
                    Ruangan dengan cahaya cukup
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-[#4A3B6B] font-bold">•</Text>
                  <Text size="sm" className="text-[#262130] flex-1 leading-normal">
                    Wajah terlihat jelas, tanpa masker atau kacamata hitam
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text className="text-[#4A3B6B] font-bold">•</Text>
                  <Text size="sm" className="text-[#262130] flex-1 leading-normal">
                    Izinkan akses kamera saat diminta
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Text size="sm" className="text-[#75618E] text-center leading-relaxed px-4">
              Data identitasmu hanya dipakai untuk verifikasi. Baca Kebijakan Privasi (English).
            </Text>

            <VStack space="sm" className="w-full pt-4 pb-8">
              <Button
                className="w-full bg-[#4A3B6B] rounded-xl py-3.5 shadow-sm"
                onPress={() => {
                  haptics.medium();
                  router.push({
                    pathname: ROUTES.PATIENT.PROFILE,
                    params: { kyc: "scan" },
                  } as any);
                }}
              >
                <ButtonText className="text-white font-semibold text-center text-base">
                  Mulai Verifikasi
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#EBE7E0] bg-white rounded-xl py-3.5"
                onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
              >
                <ButtonText className="text-[#262130] font-semibold text-center text-base">
                  Nanti saja
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 16: KY3 · Layar Verifikasi Identitas (Pindai e-KTP)
  // =========================================================================
  if (kycView === "didit" || kycView === "camera" || kycView === "scan") {
    return (
      <SafeAreaView className="flex-1 bg-[#1A1A1A]">
        {/* Top Header */}
        <HStack space="sm" className="items-center justify-between px-5 py-4">
          <Heading size="md" bold className="text-white">
            Pindai Dokumen Identitas
          </Heading>
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="px-3 py-1.5 rounded-lg bg-white/10"
          >
            <Text size="sm" className="text-white font-medium">
              Batal
            </Text>
          </Pressable>
        </HStack>

        <VStack space="lg" className="flex-1 justify-between px-6 py-6 items-center">
          <VStack space="xs" className="items-center text-center">
            <Text size="sm" className="text-white/80 text-center font-medium">
              Verifikasi e-KTP
            </Text>
            <Heading size="lg" bold className="text-white text-center">
              Arahkan e-KTP ke dalam bingkai
            </Heading>
            <Text size="sm" className="text-white/70 text-center">
              Pastikan semua teks terbaca jelas dan tidak silau
            </Text>
          </VStack>

          {/* Viewfinder frame */}
          <Box className="w-full h-64 rounded-2xl border-2 border-dashed border-white/60 bg-white/5 items-center justify-center p-6 text-center">
            <VStack space="sm" className="items-center text-center">
              <Camera size={40} color="#FFFFFF" opacity={0.8} />
              <Text size="sm" className="text-white/90 text-center leading-relaxed font-semibold">
                Posisikan e-KTP Anda tepat di dalam bingkai
              </Text>
              <Text size="sm" className="text-white/70 text-center leading-relaxed mt-1">
                Gunakan pencahayaan yang cukup, hindari pantulan cahaya atau bayangan agar data terbaca jelas.
              </Text>
            </VStack>
          </Box>

          {/* Shutter / Simulate Complete Button */}
          <VStack space="sm" className="w-full items-center pb-6">
            <Pressable
              onPress={() => {
                haptics.medium();
                router.push({
                  pathname: ROUTES.PATIENT.PROFILE,
                  params: { kyc: "reviewing" },
                } as any);
              }}
              className="w-20 h-20 rounded-full border-4 border-white bg-white/20 items-center justify-center active:scale-95"
            >
              <Box className="w-14 h-14 rounded-full bg-white" />
            </Pressable>
            <Text size="sm" className="text-white/70 mt-2 font-medium">
              Tekan tombol untuk mengambil foto dokumen
            </Text>
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 17: KY4 · Hasil: sedang ditinjau
  // =========================================================================
  if (kycView === "reviewing") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <HStack space="sm" className="items-center px-4 py-3 border-b border-[#EBE7E0]">
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="p-2 -ml-2 rounded-full active:bg-black/5"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-[#262130]">
            Verifikasi Sedang Ditinjau
          </Heading>
        </HStack>

        <ScrollView className="flex-1 px-5 py-8">
          <VStack space="xl" className="items-center">
            <Box className="w-20 h-20 rounded-full bg-[#E8AF38]/15 items-center justify-center">
              <Clock size={40} color="#D97706" />
            </Box>

            <VStack space="xs" className="items-center text-center">
              <Heading size="xl" bold className="text-[#262130] text-center">
                Verifikasi sedang ditinjau
              </Heading>
              <Text size="sm" className="text-[#75618E] text-center leading-relaxed">
                Dokumenmu sudah kami terima. Hasilnya akan dikabarkan lewat notifikasi dan email.
              </Text>
            </VStack>

            {/* Steps Timeline Card */}
            <Box className="w-full bg-white p-5 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <VStack space="md">
                <HStack space="sm" className="items-center">
                  <Box className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center">
                    <CheckCircle2 size={18} color="#059669" />
                  </Box>
                  <Text size="sm" bold className="text-[#262130]">
                    1. Dokumen diterima
                  </Text>
                </HStack>

                <HStack space="sm" className="items-center">
                  <Box className="w-8 h-8 rounded-full bg-amber-100 items-center justify-center">
                    <Text size="sm" bold className="text-amber-800">
                      2
                    </Text>
                  </Box>
                  <Text size="sm" bold className="text-amber-800">
                    Peninjauan · sedang berlangsung
                  </Text>
                </HStack>

                <HStack space="sm" className="items-center">
                  <Box className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Text size="sm" bold className="text-gray-500">
                      3
                    </Text>
                  </Box>
                  <Text size="sm" className="text-gray-500 font-medium">
                    Hasil dikabarkan
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Text size="sm" className="text-[#75618E] text-center leading-relaxed px-4">
              Proses verifikasi membutuhkan waktu beberapa menit. Anda akan menerima notifikasi status.
            </Text>

            <Button
              className="w-full bg-[#4A3B6B] rounded-xl py-3.5 mt-4"
              onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            >
              <ButtonText className="text-white font-semibold text-center text-base">
                Kembali ke Akun
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 18: KY5 · Hasil: terverifikasi
  // =========================================================================
  if (kycView === "verified") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <HStack space="sm" className="items-center px-4 py-3 border-b border-[#EBE7E0]">
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="p-2 -ml-2 rounded-full active:bg-black/5"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-[#262130]">
            Verifikasi Berhasil
          </Heading>
        </HStack>

        <ScrollView className="flex-1 px-5 py-8">
          <VStack space="xl" className="items-center">
            <Box className="w-20 h-20 rounded-full bg-emerald-100 items-center justify-center">
              <CheckCircle2 size={44} color="#059669" />
            </Box>

            <VStack space="xs" className="items-center text-center">
              <Heading size="xl" bold className="text-[#262130] text-center">
                Identitasmu terverifikasi
              </Heading>
              <Text size="sm" className="text-[#75618E] text-center leading-relaxed">
                Terima kasih, verifikasi identitasmu berhasil. Layanan konsultasi dan matching psikolog kini aktif penuh.
              </Text>
            </VStack>

            <VStack space="sm" className="w-full pt-6">
              <Button
                className="w-full bg-[#4A3B6B] rounded-xl py-3.5"
                onPress={() => router.push(ROUTES.PATIENT.DASHBOARD as any)}
              >
                <ButtonText className="text-white font-semibold text-center text-base">
                  Ke Beranda
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#EBE7E0] bg-white rounded-xl py-3.5"
                onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
              >
                <ButtonText className="text-[#262130] font-semibold text-center text-base">
                  Kembali ke Akun
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 19: KY6 · Hasil: ditolak
  // =========================================================================
  if (kycView === "rejected") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <HStack space="sm" className="items-center px-4 py-3 border-b border-[#EBE7E0]">
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="p-2 -ml-2 rounded-full active:bg-black/5"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-[#262130]">
            Verifikasi Belum Berhasil
          </Heading>
        </HStack>

        <ScrollView className="flex-1 px-5 py-8">
          <VStack space="xl" className="items-center">
            <Box className="w-20 h-20 rounded-full bg-rose-100 items-center justify-center">
              <AlertCircle size={44} color="#E11D48" />
            </Box>

            <VStack space="xs" className="items-center text-center">
              <Heading size="xl" bold className="text-[#262130] text-center">
                Verifikasi belum berhasil
              </Heading>
              <Text size="sm" className="text-[#75618E] text-center leading-relaxed">
                Kami belum bisa memverifikasi identitasmu.
              </Text>
            </VStack>

            {/* Penyebab Card */}
            <Box className="w-full bg-white p-5 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider mb-2">
                PENYEBAB
              </Text>
              <Text size="sm" className="text-[#262130] font-medium leading-relaxed">
                Contoh: dokumen kedaluwarsa, foto e-KTP buram, atau wajah tidak cocok dengan dokumen.
              </Text>
            </Box>

            <VStack space="sm" className="w-full pt-4">
              <Button
                className="w-full bg-[#4A3B6B] rounded-xl py-3.5"
                onPress={() => {
                  haptics.medium();
                  router.push({
                    pathname: ROUTES.PATIENT.PROFILE,
                    params: { kyc: "start" },
                  } as any);
                }}
              >
                <ButtonText className="text-white font-semibold text-center text-base">
                  Coba Lagi
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                className="w-full border-[#EBE7E0] bg-white rounded-xl py-3.5"
                onPress={() => router.push(ROUTES.PATIENT.HELP as any)}
              >
                <ButtonText className="text-[#262130] font-semibold text-center text-base">
                  Hubungi Tim Support
                </ButtonText>
              </Button>

              <Button
                variant="ghost"
                className="w-full py-2.5"
                onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
              >
                <ButtonText className="text-[#75618E] font-medium text-center text-sm">
                  Kembali ke Akun
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 20: KY7 · Kartu KYC: varian per status
  // =========================================================================
  if (kycView === "variants") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <HStack space="sm" className="items-center px-4 py-3 border-b border-[#EBE7E0]">
          <Pressable
            onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            className="p-2 -ml-2 rounded-full active:bg-black/5"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading size="md" bold className="text-[#262130]">
            Varian Kartu KYC
          </Heading>
        </HStack>

        <ScrollView className="flex-1 px-5 py-4">
          <VStack space="md" className="pb-10">
            <Box className="pb-2">
              <Heading size="lg" bold className="text-[#262130]">
                Kartu KYC di Akun
              </Heading>
              <Text size="sm" className="text-[#75618E] mt-1">
                Satu kartu, tampilan menyesuaikan status verifikasi identitas e-KTP pengguna.
              </Text>
            </Box>

            {/* Varian 1: Belum Diverifikasi */}
            <Box className="bg-white p-4 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" className="text-[#75618E] font-semibold mb-2">
                Not Started · Abandoned · Expired
              </Text>
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider">
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge variant="outline" className="border-amber-300 bg-amber-50 rounded-full px-2.5 py-1">
                  <BadgeText className="text-amber-800 text-sm font-semibold">
                    Belum diverifikasi
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-[#555060] mt-1 mb-3">
                Verifikasi identitasmu untuk melindungi akun dan data medismu.
              </Text>
              <Button
                size="sm"
                className="bg-[#4A3B6B] rounded-xl py-2.5"
                onPress={() => router.push({ pathname: ROUTES.PATIENT.PROFILE, params: { kyc: "start" } } as any)}
              >
                <ButtonText className="text-white text-sm font-semibold">
                  Verifikasi Sekarang
                </ButtonText>
              </Button>
            </Box>

            {/* Varian 2: Belum Selesai (In Progress) */}
            <Box className="bg-white p-4 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" className="text-[#75618E] font-semibold mb-2">
                In Progress
              </Text>
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider">
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge variant="outline" className="border-blue-300 bg-blue-50 rounded-full px-2.5 py-1">
                  <BadgeText className="text-blue-800 text-sm font-semibold">
                    Belum selesai
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-[#555060] mt-1 mb-3">
                Kamu belum menyelesaikan verifikasi.
              </Text>
              <Button
                size="sm"
                className="bg-[#4A3B6B] rounded-xl py-2.5"
                onPress={() => router.push({ pathname: ROUTES.PATIENT.PROFILE, params: { kyc: "start" } } as any)}
              >
                <ButtonText className="text-white text-sm font-semibold">
                  Lanjutkan Verifikasi
                </ButtonText>
              </Button>
            </Box>

            {/* Varian 3: Sedang Ditinjau (In Review) */}
            <Box className="bg-white p-4 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" className="text-[#75618E] font-semibold mb-2">
                In Review
              </Text>
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider">
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge variant="outline" className="border-amber-300 bg-amber-50 rounded-full px-2.5 py-1">
                  <BadgeText className="text-amber-800 text-sm font-semibold">
                    Sedang ditinjau
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-[#555060] mt-1 mb-3">
                Dokumenmu sedang kami tinjau. Hasilnya dikabarkan lewat notifikasi dan email.
              </Text>
              <Button
                size="sm"
                variant="outline"
                className="border-[#4A3B6B] rounded-xl py-2.5"
                onPress={() => router.push({ pathname: ROUTES.PATIENT.PROFILE, params: { kyc: "reviewing" } } as any)}
              >
                <ButtonText className="text-[#4A3B6B] text-sm font-semibold">
                  Lihat Status
                </ButtonText>
              </Button>
            </Box>

            {/* Varian 4: Terverifikasi (Approved) */}
            <Box className="bg-white p-4 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" className="text-[#75618E] font-semibold mb-2">
                Approved
              </Text>
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider">
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 rounded-full px-2.5 py-1">
                  <BadgeText className="text-emerald-800 text-sm font-semibold">
                    ✓ Terverifikasi
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-[#555060] mt-1">
                Identitasmu sudah terverifikasi.
              </Text>
            </Box>

            {/* Varian 5: Ditolak (Declined) */}
            <Box className="bg-white p-4 rounded-2xl border border-[#EBE7E0] shadow-xs">
              <Text size="sm" className="text-[#75618E] font-semibold mb-2">
                Declined
              </Text>
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text size="sm" bold className="text-[#75618E] uppercase tracking-wider">
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge variant="outline" className="border-rose-300 bg-rose-50 rounded-full px-2.5 py-1">
                  <BadgeText className="text-rose-800 text-sm font-semibold">
                    Ditolak
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-[#555060] mt-1 mb-3">
                Verifikasi belum berhasil. Foto e-KTP tidak terbaca jelas.
              </Text>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-600 rounded-xl py-2.5"
                onPress={() => router.push({ pathname: ROUTES.PATIENT.PROFILE, params: { kyc: "rejected" } } as any)}
              >
                <ButtonText className="text-rose-600 text-sm font-semibold">
                  Lihat & Coba Lagi
                </ButtonText>
              </Button>
            </Box>

            <Button
              className="w-full bg-[#4A3B6B] rounded-xl py-3.5 mt-2"
              onPress={() => router.push(ROUTES.PATIENT.PROFILE as any)}
            >
              <ButtonText className="text-white font-semibold text-center text-base">
                Kembali ke Akun
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================================================================
  // Screen 14: KY1 · Akun: profil, KYC & pengaturan (Default View)
  // =========================================================================
  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]">
      {/* Profile Header */}
      <Box className="bg-[#4A3B6B] px-5 pt-3 pb-6 rounded-b-3xl items-center">
        <HStack space="xs" className="w-full justify-between items-center mb-1">
          <Box className="w-8 h-8" />
          <RNImage
            source={require("@/../assets/icon.png")}
            style={{ width: 32, height: 32, borderRadius: 8 }}
            resizeMode="cover"
          />
        </HStack>

        <VStack space="xs" className="items-center">
          <Avatar size="2xl" className="border-2 border-white/20 bg-[#75618E]">
            {avatarData?.avatarUrl ? (
              <AvatarImage source={{ uri: avatarData.avatarUrl }} />
            ) : null}
            <AvatarFallbackText className="text-white text-xl font-bold">
              {getInitials(patientName)}
            </AvatarFallbackText>
          </Avatar>
          <Heading size="lg" bold className="text-white mt-1">
            {patientName}
          </Heading>
          <Text size="sm" className="text-white/90 font-medium">
            {patientEmail}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ubah profil dan data medis"
            onPress={() => {
              haptics.light();
              router.push(ROUTES.PATIENT.EDIT_PROFILE);
            }}
            className="bg-white/15 px-4 py-2 rounded-full flex-row items-center gap-2 mt-2 active:opacity-80"
          >
            <AppIcon icon={Edit3} size={15} color="#FFFFFF" />
            <Text size="sm" className="font-semibold text-white">
              Ubah profil
            </Text>
          </Pressable>
        </VStack>
      </Box>

      <ScrollView className="flex-1 px-4 py-4">
        <Box className="pb-20">
          {/* KYC Identity Verification Card (Wireframe Parity) */}
          <Card className="bg-white rounded-2xl p-4 border border-[#EBE7E0] shadow-xs mb-4">
            <VStack space="xs">
              <HStack space="xs" className="items-center justify-between mb-1">
                <Text
                  size="sm"
                  bold
                  className="text-[#75618E] uppercase tracking-wider"
                >
                  VERIFIKASI IDENTITAS
                </Text>
                <Badge
                  variant="outline"
                  className={
                    isKycVerified
                      ? "border-emerald-300 bg-emerald-50 rounded-full px-2.5 py-1"
                      : "border-amber-300 bg-amber-50 rounded-full px-2.5 py-1"
                  }
                >
                  <BadgeText
                    className={
                      isKycVerified
                        ? "text-emerald-800 text-sm font-semibold"
                        : "text-amber-800 text-sm font-semibold"
                    }
                  >
                    {isKycVerified ? "Terverifikasi" : "Belum diverifikasi"}
                  </BadgeText>
                </Badge>
              </HStack>

              <Text size="sm" className="text-[#555060] font-medium leading-relaxed">
                {isKycVerified
                  ? "Identitasmu sudah terverifikasi."
                  : "Verifikasi identitasmu untuk melindungi akun dan data medismu."}
              </Text>

              {!isKycVerified && (
                <Button
                  onPress={() => {
                    haptics.selection();
                    router.push({
                      pathname: ROUTES.PATIENT.PROFILE,
                      params: { kyc: "start" },
                    } as any);
                  }}
                  disabled={isKycStarting}
                  className="mt-3 bg-[#4A3B6B] rounded-xl h-11 flex-row items-center justify-center shadow-xs"
                >
                  {isKycStarting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ButtonText className="text-white font-semibold text-sm">
                      Verifikasi Sekarang
                    </ButtonText>
                  )}
                </Button>
              )}
            </VStack>
          </Card>

          {/* Group Pengaturan Akun */}
          <Card className="bg-white rounded-2xl p-4 border border-[#EBE7E0] shadow-xs mb-4">
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-[#75618E] uppercase tracking-wider mb-2"
              >
                PENGATURAN AKUN
              </Text>

              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(ROUTES.PATIENT.EDIT_PROFILE as any);
                }}
                className="py-3 flex-row items-center justify-between active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={User} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
                    Data diri
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>

              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(ROUTES.PATIENT.SECURITY as any);
                }}
                className="py-3 flex-row items-center justify-between border-t border-[#EBE7E0] active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={Lock} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
                    Kata sandi & keamanan
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>

              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(ROUTES.PATIENT.NOTIFICATIONS as any);
                }}
                className="py-3 flex-row items-center justify-between border-t border-[#EBE7E0] active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={Bell} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
                    Notifikasi
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            </VStack>
          </Card>

          {/* Group Kemitraan */}
          <Card className="bg-white rounded-2xl p-4 border border-[#EBE7E0] shadow-xs mb-4">
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-[#75618E] uppercase tracking-wider mb-2"
              >
                KEMITRAAN
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
                    <Text size="sm" className="font-semibold text-[#262130]">
                      Daftar sebagai Mitra Praktisi
                    </Text>
                    <Text size="sm" className="text-[#75618E]">
                      Psikolog Klinis atau Psikiater
                    </Text>
                  </VStack>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            </VStack>
          </Card>

          {/* Group Bantuan & Legal */}
          <Card className="bg-white rounded-2xl p-4 border border-[#EBE7E0] shadow-xs mb-4">
            <VStack space="xs">
              <Text
                size="sm"
                bold
                className="text-[#75618E] uppercase tracking-wider mb-2"
              >
                BANTUAN & LEGAL
              </Text>
              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(ROUTES.PATIENT.HELP as any);
                }}
                className="py-3 flex-row items-center justify-between active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={HelpCircle} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
                    Pusat bantuan & FAQ
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>

              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(ROUTES.PATIENT.HELP as any);
                }}
                className="py-3 flex-row items-center justify-between border-t border-[#EBE7E0] active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={MessageSquare} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
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
                className="py-3 flex-row items-center justify-between border-t border-[#EBE7E0] active:opacity-80"
              >
                <HStack space="md" className="items-center">
                  <AppIcon icon={Shield} size={20} tone="primary" />
                  <Text size="sm" className="font-semibold text-[#262130]">
                    Kebijakan Privasi & Syarat Layanan
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            </VStack>
          </Card>

          {/* Logout */}
          <Card className="bg-white rounded-2xl p-4 border border-[#EBE7E0] shadow-xs mb-4">
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center gap-3 active:opacity-80"
            >
              <AppIcon icon={LogOut} size={20} tone="destructive" />
              <Text size="sm" bold className="text-rose-600">
                Keluar Akun
              </Text>
            </Pressable>
          </Card>
        </Box>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="akun" />

      {/* Modals */}
      <PatientPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
}

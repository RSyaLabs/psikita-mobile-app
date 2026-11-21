import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Smile,
  Meh,
  Clock,
  AlertCircle,
  Frown,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Lock,
  PhoneCall,
  Bell,
  ClipboardCheck,
  MessageSquare,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonSpinner,
  Badge,
  BadgeText,
  ScrollView,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  usePatientProfile,
  useMyVerificationStatus,
  useStartDiditVerification,
  useWaitingRoomStatus,
  usePatientConsultations,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants/routes";

const SeraPhanyLogo = require("../../../assets/icon.png");

const MOODS = [
  { id: "Tenang", label: "Tenang", icon: Smile },
  { id: "Biasa", label: "Biasa", icon: Meh },
  { id: "Lelah", label: "Lelah", icon: Clock },
  { id: "Cemas", label: "Cemas", icon: AlertCircle },
  { id: "Sedih", label: "Sedih", icon: Frown },
] as const;

export default function PatientDashboard() {
  const router = useRouter();
  const toast = useToast();

  const [selectedMood, setSelectedMood] = useState("Tenang");
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isKycLaunching, setIsKycLaunching] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // Queries
  const { data: patient } = usePatientProfile();
  const { data: kycStatus, refetch: refetchKyc } = useMyVerificationStatus();
  const { data: waitingRoom } = useWaitingRoomStatus();
  const { data: activeConsultations } = usePatientConsultations({ status: "ACTIVE" });
  const startKycMutation = useStartDiditVerification();

  // Verification state: Wireframe BR1 (unverified) vs BR2/BR3 (verified)
  const isVerified =
    kycStatus?.status === "VERIFIED" || kycStatus?.status === "APPROVED";

  // Active consultation state: Wireframe BR3
  const isWaitingRoomActive = Boolean(
    waitingRoom?.status &&
      waitingRoom.status !== "CANCELLED" &&
      waitingRoom.status !== "TIMEOUT" &&
      waitingRoom.status !== "COMPLETED",
  );
  const activeConsultation = activeConsultations?.[0];
  const hasActiveConsultation = isWaitingRoomActive || Boolean(activeConsultation);

  const patientFirstName = patient?.fullName?.split(" ")[0] || "Pasien";

  // Handlers
  const handleLaunchDidit = async () => {
    haptics.selection();
    setIsKycLaunching(true);
    try {
      const session = await startKycMutation.mutateAsync();
      await launchDiditVerification(session, {
        onApproved: () => {
          haptics.success();
          setKycModalOpen(false);
          refetchKyc();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Identitas Terverifikasi</ToastTitle>
                <ToastDescription>
                  Akun Anda telah terverifikasi. Layanan konsultasi dan triase mandiri kini aktif penuh!
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onCompleted: () => {
          refetchKyc();
        },
        onCancelled: () => {
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="info">
                <ToastTitle>Verifikasi Ditunda</ToastTitle>
                <ToastDescription>
                  Selesaikan verifikasi identitas e-KTP sebelum memulai konsultasi langsung.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onFallbackUrlLaunched: () => {
          setKycModalOpen(false);
        },
        onError: (err) => {
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="error">
                <ToastTitle>Kendala Verifikasi</ToastTitle>
                <ToastDescription>{err.message}</ToastDescription>
              </Toast>
            ),
          });
        },
      });
    } catch (err: unknown) {
      haptics.error();
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memulai sesi verifikasi Didit.";
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={id} action="error">
            <ToastTitle>Gagal Memulai</ToastTitle>
            <ToastDescription>{msg}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsKycLaunching(false);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    haptics.light();
    setSelectedMood(moodId);
  };

  const dialEmergency = (phone: string) => {
    haptics.medium();
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="w-full max-w-[640px] md:max-w-[720px] self-center px-5 pt-3">
          {/* ========================================================
           * TOP HEADER: SALUTATION & NOTIFICATION
           * ======================================================== */}
          <HStack className="justify-between items-center pb-4">
            <VStack space="xs" className="flex-1 pr-3">
              <Heading
                level={1}
                size="2xl"
                bold
                className="text-foreground tracking-tight"
              >
                Halo, {patientFirstName}
              </Heading>
              <Text className="text-sm text-muted-foreground font-medium">
                {!isVerified
                  ? "Satu langkah lagi sebelum mulai."
                  : hasActiveConsultation
                  ? "Lanjutkan dari mana kamu berhenti."
                  : "Apa kabarmu hari ini?"}
              </Text>
            </VStack>

            <HStack space="sm" className="items-center">
              <Pressable
                onPress={() => {
                  haptics.light();
                  toast.show({
                    placement: "top",
                    render: ({ id }) => (
                      <Toast nativeID={id} action="info">
                        <ToastTitle>Notifikasi</ToastTitle>
                        <ToastDescription>
                          Tidak ada notifikasi baru saat ini.
                        </ToastDescription>
                      </Toast>
                    ),
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel="Notifikasi"
                className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Bell size={20} color="#262130" strokeWidth={2} />
              </Pressable>
              <RNImage
                source={SeraPhanyLogo}
                style={{ width: 40, height: 40, borderRadius: 10 }}
                resizeMode="contain"
              />
            </HStack>
          </HStack>

          {/* ========================================================
           * CONDITIONAL HERO: WIREFRAME BR1 (LOCKED) vs BR3 (ACTIVE) vs BR2 (STANDARD)
           * ======================================================== */}

          {!isVerified ? (
            /* ========================================================
             * WIREFRAME BR1: HERO GATE (VERIFIKASI IDENTITAS DULU)
             * ======================================================== */
            <VStack space="lg" className="pt-1">
              {/* Gate Card */}
              <Box className="rounded-xl bg-card border-[2px] border-border/90 p-5 shadow-sm">
                <VStack space="md">
                  <HStack space="sm" className="items-center">
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                      <ShieldCheck size={22} color="#4A3B6B" />
                    </Box>
                    <Heading
                      level={2}
                      size="lg"
                      bold
                      className="text-foreground flex-1 tracking-tight"
                    >
                      Verifikasi identitas dulu
                    </Heading>
                  </HStack>

                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Butuh sekitar 3 menit. Siapkan e-KTP dan cari tempat dengan cahaya cukup.
                  </Text>

                  <Button
                    size="lg"
                    onPress={() => {
                      haptics.medium();
                      setKycModalOpen(true);
                    }}
                    className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center shadow-sm"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Verifikasi Sekarang
                    </ButtonText>
                  </Button>

                  <Text className="text-sm text-muted-foreground text-center">
                    Agar akun dan data kesehatanmu tetap aman.
                  </Text>
                </VStack>
              </Box>

              {/* Locked Features Preview (Wireframe BR1) */}
              <VStack space="xs" className="pt-2">
                <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  SETELAH TERVERIFIKASI
                </Text>
                <Box className="rounded-xl bg-card border border-dashed border-border/80 overflow-hidden divide-y divide-dashed divide-border/80">
                  {[
                    { label: "Mulai konsultasi", target: "konsultasi" },
                    { label: "Tes mandiri", target: "tes mandiri" },
                    { label: "Feed komunitas", target: "feed komunitas" },
                    { label: "Riwayat & hasil", target: "riwayat & hasil" },
                  ].map((item, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        haptics.light();
                        setKycModalOpen(true);
                      }}
                      className="flex-row items-center justify-between p-4 active:bg-muted/50"
                    >
                      <Text className="text-base text-muted-foreground font-medium">
                        {item.label}
                      </Text>
                      <Box className="w-7 h-7 rounded-lg bg-muted items-center justify-center">
                        <Lock size={15} color="#8C829D" />
                      </Box>
                    </Pressable>
                  ))}
                </Box>
              </VStack>
            </VStack>
          ) : hasActiveConsultation ? (
            /* ========================================================
             * WIREFRAME BR3: HERO KONSULTASI AKTIF
             * ======================================================== */
            <VStack space="lg" className="pt-1">
              <Box className="rounded-xl bg-card border-[2px] border-primary/40 p-5 shadow-sm">
                <VStack space="md">
                  <HStack className="justify-between items-center">
                    <Text className="text-sm font-bold text-primary tracking-wider uppercase">
                      KONSULTASI AKTIF
                    </Text>
                    <Badge
                      variant="default"
                      className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
                    >
                      <BadgeText className="text-sm font-bold text-primary">
                        {isWaitingRoomActive ? "Mencari psikolog" : "Sesi Aktif"}
                      </BadgeText>
                    </Badge>
                  </HStack>

                  <VStack space="xs">
                    <Heading
                      level={2}
                      size="lg"
                      bold
                      className="text-foreground tracking-tight"
                    >
                      {isWaitingRoomActive
                        ? "Kami sedang mencarikan psikolog untukmu"
                        : "Sesi konsultasi Anda sedang berlangsung"}
                    </Heading>
                    <Text className="text-sm text-muted-foreground leading-relaxed">
                      {isWaitingRoomActive
                        ? "Posisi antreanmu aman. Anda dapat melihat radar pencocokan atau menunggu di sini."
                        : "Tekan tombol di bawah untuk masuk ke ruang konsultasi."}
                    </Text>
                  </VStack>

                  {/* 4-Step Progress Indicator */}
                  <HStack space="xs" className="w-full py-1">
                    <Box className="flex-1 h-1.5 rounded-full bg-primary" />
                    <Box className="flex-1 h-1.5 rounded-full bg-primary" />
                    <Box className={`flex-1 h-1.5 rounded-full ${!isWaitingRoomActive ? "bg-primary" : "bg-border"}`} />
                    <Box className="flex-1 h-1.5 rounded-full bg-border" />
                  </HStack>

                  <Button
                    size="lg"
                    onPress={() => {
                      haptics.medium();
                      if (isWaitingRoomActive) {
                        router.push(ROUTES.PATIENT.MATCHING as any);
                      } else {
                        router.push(ROUTES.PATIENT.CHAT_ROOM as any);
                      }
                    }}
                    className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center shadow-sm"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      {isWaitingRoomActive ? "Lihat Status Pencocokan" : "Masuk ke Sesi Konsultasi"}
                    </ButtonText>
                    <ArrowRight size={18} color="#FFFFFF" className="ml-1" />
                  </Button>
                </VStack>
              </Box>

              {/* Notice */}
              <Box className="rounded-xl border border-dashed border-border p-4 bg-muted/40">
                <Text className="text-sm text-muted-foreground leading-relaxed">
                  Mulai konsultasi baru tersedia setelah konsultasi aktif ini selesai.
                </Text>
              </Box>

              {/* Grid 2 Kolom (Wireframe BR3) */}
              <VStack space="xs" className="pt-1">
                <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  UNTUK DIRIMU SENDIRI
                </Text>
                <HStack space="sm" className="w-full">
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push({
                        pathname: ROUTES.PATIENT.TRIAGE,
                        params: { mode: "assessment", guest: "false" },
                      } as any);
                    }}
                    className="flex-1 rounded-xl bg-card border border-border p-4 active:bg-muted"
                  >
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                      <ClipboardCheck size={20} color="#4A3B6B" />
                    </Box>
                    <Text className="text-base font-bold text-foreground">
                      Tes mandiri
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      Cek stres & kecemasan
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push(ROUTES.PATIENT.COMMUNITY as any);
                    }}
                    className="flex-1 rounded-xl bg-card border border-border p-4 active:bg-muted"
                  >
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                      <MessageSquare size={20} color="#4A3B6B" />
                    </Box>
                    <Text className="text-base font-bold text-foreground">
                      Feed
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      Cerita & komunitas
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            </VStack>
          ) : (
            /* ========================================================
             * WIREFRAME BR2: HERO STANDAR (TERVERIFIKASI & AKSES PENUH)
             * ======================================================== */
            <VStack space="lg" className="pt-1">
              {/* Hero Mulai Konsultasi */}
              <Box className="rounded-xl bg-card border-[2px] border-primary/30 p-5 shadow-sm">
                <VStack space="md">
                  <HStack space="xs" className="items-center">
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-2">
                      <Sparkles size={22} color="#4A3B6B" />
                    </Box>
                    <VStack className="flex-1">
                      <Heading
                        level={2}
                        size="lg"
                        bold
                        className="text-foreground tracking-tight"
                      >
                        Butuh bicara dengan psikolog?
                      </Heading>
                    </VStack>
                  </HStack>

                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Jawab beberapa pertanyaan singkat (sekitar 3 menit). Kami carikan psikolog yang sesuai.
                  </Text>

                  <Button
                    size="lg"
                    onPress={() => {
                      haptics.medium();
                      router.push({
                        pathname: ROUTES.PATIENT.TRIAGE,
                        params: { mode: "consultation" },
                      } as any);
                    }}
                    className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center shadow-sm"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Mulai Konsultasi
                    </ButtonText>
                    <ArrowRight size={18} color="#FFFFFF" className="ml-1" />
                  </Button>

                  <Text className="text-sm text-muted-foreground text-center">
                    Privat dan bukan diagnosis.
                  </Text>
                </VStack>
              </Box>

              {/* Mood Check-In Section (Wireframe BR2) */}
              <VStack space="xs" className="pt-1">
                <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  BAGAIMANA PERASAANMU HARI INI? (OPSIONAL)
                </Text>
                <HStack space="xs" className="w-full">
                  {MOODS.map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    const IconComp = mood.icon;
                    return (
                      <Pressable
                        key={mood.id}
                        onPress={() => handleMoodSelect(mood.id)}
                        className={`flex-1 py-3 px-1 rounded-xl items-center justify-center border transition-all ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "bg-card border-border/80 active:bg-muted"
                        }`}
                      >
                        <IconComp
                          size={22}
                          color={isSelected ? "#4A3B6B" : "#75618E"}
                          strokeWidth={isSelected ? 2.5 : 2}
                        />
                        <Text
                          className={`text-sm mt-1.5 ${
                            isSelected
                              ? "font-bold text-primary"
                              : "font-semibold text-foreground"
                          }`}
                        >
                          {mood.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>

              {/* Grid 2 Kolom: UNTUK DIRIMU SENDIRI (Wireframe BR2) */}
              <VStack space="xs" className="pt-1">
                <Text className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  UNTUK DIRIMU SENDIRI
                </Text>
                <HStack space="sm" className="w-full">
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push({
                        pathname: ROUTES.PATIENT.TRIAGE,
                        params: { mode: "assessment", guest: "false" },
                      } as any);
                    }}
                    className="flex-1 rounded-xl bg-card border border-border p-4 active:bg-muted"
                  >
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                      <ClipboardCheck size={20} color="#4A3B6B" />
                    </Box>
                    <Text className="text-base font-bold text-foreground">
                      Tes mandiri
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      Cek stres & kecemasan
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push(ROUTES.PATIENT.COMMUNITY as any);
                    }}
                    className="flex-1 rounded-xl bg-card border border-border p-4 active:bg-muted"
                  >
                    <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                      <MessageSquare size={20} color="#4A3B6B" />
                    </Box>
                    <Text className="text-base font-bold text-foreground">
                      Feed
                    </Text>
                    <Text className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      Cerita & komunitas
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            </VStack>
          )}

          {/* ========================================================
           * EMERGENCY CRISIS LINK (WIREFRAME BR1 - BR3 PERSISTENT)
           * ======================================================== */}
          <VStack className="pt-6 pb-2 items-center">
            <Pressable
              onPress={() => {
                haptics.light();
                setEmergencyModalOpen(true);
              }}
              className="py-2 px-3 active:opacity-75 flex-row items-center gap-1.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <PhoneCall size={16} color="#4A3B6B" />
              <Text className="text-sm font-bold text-primary underline">
                Butuh bantuan segera? Lihat kontak bantuan
              </Text>
            </Pressable>
          </VStack>
        </Box>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="beranda" />

      {/* ========================================================
       * EMERGENCY / CRISIS HOTLINE MODAL
       * ======================================================== */}
      <Modal
        isOpen={emergencyModalOpen}
        onClose={() => setEmergencyModalOpen(false)}
      >
        <ModalBackdrop />
        <ModalContent className="max-w-[92%] p-5 rounded-2xl bg-card border border-border">
          <ModalHeader className="pb-3 border-b border-border">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center">
                <ShieldAlert size={22} color="#CF2424" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Kontak Bantuan Darurat
                </Heading>
                <Text className="text-sm text-muted-foreground">
                  Layanan Krisis 24 Jam
                </Text>
              </VStack>
              <ModalCloseButton />
            </HStack>
          </ModalHeader>
          <ModalBody className="py-4">
            <VStack space="md">
              <Text className="text-sm text-foreground leading-relaxed">
                Jika Anda atau orang terdekat sedang berada dalam krisis atau membutuhkan bantuan darurat segera:
              </Text>
              <Pressable
                onPress={() => dialEmergency("119")}
                className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex-row items-center justify-between active:bg-primary/20"
              >
                <VStack space="xs" className="flex-1">
                  <Text className="text-base font-bold text-primary">
                    Hotline Sejiwa Kemenkes (119 ext 8)
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Konseling krisis kesehatan jiwa gratis 24 jam
                  </Text>
                </VStack>
                <PhoneCall size={20} color="#4A3B6B" />
              </Pressable>

              <Pressable
                onPress={() => dialEmergency("112")}
                className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex-row items-center justify-between active:bg-destructive/20"
              >
                <VStack space="xs" className="flex-1">
                  <Text className="text-base font-bold text-destructive">
                    Panggilan Darurat Indonesia (112)
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Ambulans & penanganan gawat darurat umum
                  </Text>
                </VStack>
                <PhoneCall size={20} color="#CF2424" />
              </Pressable>
            </VStack>
          </ModalBody>
          <ModalFooter className="pt-3 border-t border-border">
            <Button
              variant="outline"
              onPress={() => setEmergencyModalOpen(false)}
              className="w-full border-border rounded-xl h-11"
            >
              <ButtonText className="text-sm font-semibold text-foreground">
                Tutup
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ========================================================
       * MODAL VERIFIKASI DIDIT KYC (GATE MODAL)
       * ======================================================== */}
      <Modal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="max-w-[92%] p-5 rounded-2xl bg-card border border-border">
          <ModalHeader className="pb-3 border-b border-border">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <ShieldCheck size={22} color="#4A3B6B" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Verifikasi Identitas
                </Heading>
                <Text className="text-sm text-muted-foreground">
                  Keamanan Rekam Medis
                </Text>
              </VStack>
              <ModalCloseButton />
            </HStack>
          </ModalHeader>
          <ModalBody className="py-4">
            <VStack space="sm">
              <Text className="text-sm text-foreground leading-relaxed">
                Untuk mengakses layanan <Text className="font-bold">Konsultasi Langsung</Text> dan <Text className="font-bold">Pencocokan Praktisi</Text>, akun Anda memerlukan verifikasi e-KTP.
              </Text>
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Verifikasi foto e-KTP dan pindai wajah berlangsung sekitar 3 menit langsung di dalam aplikasi.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col gap-2 pt-3 border-t border-border">
            <Button
              onPress={handleLaunchDidit}
              disabled={isKycLaunching}
              className="w-full h-12 bg-primary rounded-xl flex-row items-center justify-center shadow-sm"
            >
              {isKycLaunching ? (
                <ButtonSpinner color="#FFFFFF" />
              ) : (
                <ButtonText className="text-base font-bold text-primary-foreground">
                  Mulai Verifikasi Sekarang
                </ButtonText>
              )}
            </Button>
            <Button
              variant="outline"
              onPress={() => setKycModalOpen(false)}
              className="w-full h-11 border-border rounded-xl"
            >
              <ButtonText className="text-sm font-semibold text-foreground">
                Nanti Saja
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}

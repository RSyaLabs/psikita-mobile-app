import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Smile,
  Meh,
  Clock,
  AlertCircle,
  Frown,
  ChevronRight,
  Video,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonSpinner,
  Badge,
  BadgeText,
  ScrollView,
  Image,
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
import { AppIcon } from "@/components/common/AppIcon";
import {
  usePatientProfile,
  usePractitioners,
  useMyVerificationStatus,
  useStartDiditVerification,
} from "@/hooks/useApiQueries";
import { launchDiditVerification } from "@/services/didit-kyc";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants/routes";

const SeraPhanyLogo = require("../../../assets/icon.png");

const MOODS = [
  {
    id: "Tenang",
    label: "Tenang",
    icon: <AppIcon icon={Smile} size={20} tone="primary" />,
  },
  {
    id: "Biasa",
    label: "Biasa",
    icon: <AppIcon icon={Meh} size={20} tone="primary" />,
  },
  {
    id: "Lelah",
    label: "Lelah",
    icon: <AppIcon icon={Clock} size={20} tone="primary" />,
  },
  {
    id: "Cemas",
    label: "Cemas",
    icon: <AppIcon icon={AlertCircle} size={20} tone="primary" />,
  },
  {
    id: "Sedih",
    label: "Sedih",
    icon: <AppIcon icon={Frown} size={20} tone="primary" />,
  },
] as const;

export default function PatientDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [selectedMood, setSelectedMood] = useState("Tenang");
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [isKycLaunching, setIsKycLaunching] = useState(false);

  const { data: patient } = usePatientProfile();
  const { data: practitionersData } = usePractitioners();
  const { data: kycStatus, refetch: refetchKyc } = useMyVerificationStatus();
  const startKycMutation = useStartDiditVerification();

  const isVerified =
    kycStatus?.status === "VERIFIED" || kycStatus?.status === "APPROVED";

  const patientFirstName = patient?.fullName?.split(" ")[0];
  const practitionersList = practitionersData?.data || [];
  const onlineCount = practitionersList.length;

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
                  Akun Anda telah berstatus VERIFIED. Layanan konsultasi dan pencocokan kini aktif penuh!
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
                  Selesaikan verifikasi Didit KYC sebelum memulai konsultasi langsung.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onFallbackUrlLaunched: () => {
          setKycModalOpen(false);
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="info">
                <ToastTitle>Portal Verifikasi Didit</ToastTitle>
                <ToastDescription>
                  Membuka portal verifikasi identitas resmi Didit untuk menyelesaikan KYC Anda.
                </ToastDescription>
              </Toast>
            ),
          });
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
    // The selection is component-local and is discarded on unmount, and no
    // request is sent. The previous toast said "berhasil dicatat", which told the
    // user something was saved when nothing left the device. It now says what
    // actually happened.
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={id} action="info">
          <ToastTitle>Suasana Hari Ini</ToastTitle>
          <ToastDescription>
            Kamu memilih {moodId}. Catatan ini belum dikirim ke server.
          </ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <VStack space="xs" className="px-5 pt-3">
          <HStack className="justify-between items-center">
            <VStack className="flex-1 pr-3">
              <Heading size="xl" bold className="text-foreground text-2xl font-bold tracking-tight">
                {patientFirstName ? `Halo, ${patientFirstName}` : "Halo"}
              </Heading>
              <Text size="sm" className="text-muted-foreground mt-0.5 font-medium">
                Cek kabarmu hari ini atau lanjutkan sesi konselingmu.
              </Text>
            </VStack>
            <RNImage
              source={SeraPhanyLogo}
              style={{ width: 44, height: 44, borderRadius: 12 }}
            />
          </HStack>
        </VStack>

        {/* Verification Warning Banner if Not Verified */}
        {!isVerified && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Verifikasi identitas Didit KYC"
            onPress={() => {
              haptics.selection();
              setKycModalOpen(true);
            }}
            className="mx-5 mt-3.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex-row items-center gap-3 active:opacity-90"
          >
            <Box className="w-10 h-10 rounded-xl bg-amber-500/20 items-center justify-center">
              <ShieldAlert size={20} color="#D97706" />
            </Box>
            <VStack className="flex-1" space="xs">
              <HStack space="xs" className="items-center">
                <Text size="sm" bold className="text-amber-900 font-bold">
                  Verifikasi Identitas Diperlukan
                </Text>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/20 rounded-full px-2 py-0.5"
                >
                  <BadgeText className="text-sm text-amber-900 font-bold">
                    Didit KYC
                  </BadgeText>
                </Badge>
              </HStack>
              <Text size="sm" className="text-amber-800 leading-tight">
                Selesaikan Didit KYC untuk membuka Konsultasi Langsung & Matching (mencegah 403 Forbidden).
              </Text>
            </VStack>
            <ChevronRight size={18} color="#D97706" />
          </Pressable>
        )}

        {/* Golden Flow Hero Card - Tujuan Utama Aplikasi */}
        <Box className="mx-5 mt-4 rounded-3xl overflow-hidden bg-card border border-primary/25 shadow-sm p-4">
          <VStack space="sm">
            {/* Top Tag & Live Status */}
            <HStack className="justify-between items-center">
              <Badge
                variant="default"
                className="bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1 flex-row items-center gap-1.5"
              >
                <AppIcon icon={Sparkles} size={14} color="#6b5b95" />
                <BadgeText className="text-sm font-bold text-primary">
                  ALUR UTAMA
                </BadgeText>
              </Badge>
              <HStack className="items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Box className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text size="sm" className="text-emerald-700 font-semibold">
                  {onlineCount > 0 ? `${onlineCount} Praktisi Siaga` : "Praktisi Siaga"}
                </Text>
              </HStack>
            </HStack>

            {/* Title & Core Purpose */}
            <VStack space="xs" className="mt-0.5">
              <Heading size="lg" bold className="text-foreground tracking-tight text-xl font-bold">
                Konsultasi Langsung & Triase Cepat
              </Heading>
              <Text size="sm" className="text-muted-foreground leading-relaxed">
                Temukan psikolog tepat dalam hitungan menit melalui asesmen mandiri terarah dan radar pencocokan otomatis.
              </Text>
            </VStack>

            {/* 3-Step Visual Process Bar */}
            <Box className="bg-muted/70 p-2.5 rounded-2xl border border-border my-0.5">
              <HStack className="justify-between items-center">
                <HStack space="xs" className="items-center flex-1">
                  <Box className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                    <Text size="sm" bold className="text-primary font-bold">
                      1
                    </Text>
                  </Box>
                  <Text size="sm" className="font-semibold text-foreground">
                    Triase
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={14} color="#6b5b95" />
                <HStack space="xs" className="items-center flex-1 justify-center">
                  <Box className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                    <Text size="sm" bold className="text-primary font-bold">
                      2
                    </Text>
                  </Box>
                  <Text size="sm" className="font-semibold text-foreground">
                    Matching
                  </Text>
                </HStack>
                <AppIcon icon={ChevronRight} size={14} color="#6b5b95" />
                <HStack space="xs" className="items-center flex-1 justify-end">
                  <Box className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                    <Text size="sm" bold className="text-primary font-bold">
                      3
                    </Text>
                  </Box>
                  <Text size="sm" className="font-semibold text-foreground">
                    War Room
                  </Text>
                </HStack>
              </HStack>
            </Box>

            {/* Primary Action Button */}
            <Button
              size="default"
              accessibilityRole="button"
              accessibilityLabel="Mulai Triase dan Konsultasi Langsung"
              onPress={() => {
                haptics.medium();
                if (!isVerified) {
                  setKycModalOpen(true);
                  return;
                }
                router.push({
                  pathname: ROUTES.PATIENT.TRIAGE,
                  params: { mode: "consultation" },
                } as any);
              }}
              className="bg-primary py-3 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90 shadow-sm mt-0.5"
            >
              <AppIcon icon={Video} size={18} color="#FFFFFF" />
              <ButtonText className="text-sm font-bold text-primary-foreground">
                Mulai Konsultasi (Triase Mandiri)
              </ButtonText>
              <AppIcon icon={ArrowRight} size={16} color="#FFFFFF" />
            </Button>
          </VStack>
        </Box>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka asesmen mandiri"
          onPress={() => router.push(ROUTES.PATIENT.MY_ASSESSMENTS as never)}
          className="mx-5 mt-4 bg-card rounded-2xl border border-border p-4"
        >
          <HStack className="items-center gap-3">
            <ClipboardCheck size={23} className="text-primary" />
            <VStack className="flex-1" space="xs">
              <Text className="font-semibold text-foreground">Asesmen Mandiri</Text>
              <Text size="xs" className="text-muted-foreground">Mulai atau lanjutkan kuesioner</Text>
            </VStack>
            <ChevronRight size={18} className="text-primary" />
          </HStack>
        </Pressable>

        {/* Sections */}
        <VStack space="sm" className="px-5 mt-3">
          {/* Vibe Section */}
          <VStack space="xs" className="pt-1">
            <Text size="sm" className="font-bold text-foreground">
              Check-in hari ini
            </Text>
            <HStack space="xs">
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <Pressable
                    key={mood.id}
                    onPress={() => handleMoodSelect(mood.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Suasana ${mood.label}`}
                    accessibilityState={{ selected: isSelected }}
                    className={`flex-1 py-2.5 rounded-xl items-center justify-center border border-border active:opacity-80 ${
                      isSelected ? "bg-muted border-primary" : "bg-card"
                    }`}
                  >
                    {mood.icon}
                    <Text
                      size="sm"
                      className={`text-sm mt-1.5 ${
                        isSelected
                          ? "font-bold text-foreground"
                          : "font-semibold text-muted-foreground"
                      }`}
                    >
                      {mood.label}
                    </Text>
                  </Pressable>
                );
              })}
            </HStack>
          </VStack>

          {/* Layanan Utama */}
          <VStack space="xs" className="pt-2">
            {/* Konsultasi Langsung */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Konsultasi langsung"
              onPress={() => {
                haptics.medium();
                if (!isVerified) {
                  setKycModalOpen(true);
                  return;
                }
                router.push({
                  pathname: ROUTES.PATIENT.TRIAGE,
                  params: { mode: "consultation" },
                } as any);
              }}
              className="bg-card p-3.5 rounded-2xl flex-row items-center border border-border active:bg-muted"
            >
              <Box className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                <AppIcon icon={Video} size={22} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <HStack space="xs" className="items-center">
                  <Text size="md" bold className="text-foreground">
                    Konsultasi langsung
                  </Text>
                  <Badge
                    variant="default"
                    className="bg-primary/10 rounded-full px-2 py-0.5"
                  >
                    <BadgeText className="text-sm text-primary font-bold">
                      Utama
                    </BadgeText>
                  </Badge>
                </HStack>
                <Text size="sm" className="text-muted-foreground font-medium">
                  {onlineCount} psikolog online • Triase & Pencocokan
                </Text>
              </VStack>
              <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
            </Pressable>

            {/* Jadwalkan Sesi */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jadwalkan sesi"
              onPress={() => {
                haptics.light();
                router.push(ROUTES.PATIENT.DOCTORS);
              }}
              className="bg-card p-3.5 rounded-2xl flex-row items-center border border-border active:bg-muted"
            >
              <Box className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                <AppIcon icon={Calendar} size={22} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <Text size="md" bold className="text-foreground">
                  Jadwalkan sesi
                </Text>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Pilih dokter & jam
                </Text>
              </VStack>
              <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
            </Pressable>

            {/* Tes Mandiri */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tes mandiri"
              onPress={() => {
                haptics.light();
                router.push({
                  pathname: ROUTES.PATIENT.TRIAGE,
                  params: { mode: "assessment", guest: "false" },
                } as any);
              }}
              className="bg-card p-3.5 rounded-2xl flex-row items-center border border-border active:bg-muted"
            >
              <Box className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                <AppIcon icon={ClipboardCheck} size={22} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <Text size="md" bold className="text-foreground">
                  Tes mandiri
                </Text>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Cek tingkat stres & kecemasan
                </Text>
              </VStack>
              <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
            </Pressable>

            {/* Ruang Cerita & Komunitas */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ruang cerita dan komunitas"
              onPress={() => {
                haptics.light();
                router.push(ROUTES.PATIENT.COMMUNITY);
              }}
              className="bg-card p-3.5 rounded-2xl flex-row items-center border border-border active:bg-muted"
            >
              <Box className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                <AppIcon icon={MessageSquare} size={22} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <Text size="md" bold className="text-foreground">
                  Ruang cerita & komunitas
                </Text>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Dukungan sebaya & berbagi cerita aman
                </Text>
              </VStack>
              <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
            </Pressable>

            {/* Sesi Kontrol & Lanjutan */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sesi kontrol dan lanjutan"
              onPress={() => {
                haptics.light();
                router.push(ROUTES.PATIENT.FOLLOW_UPS);
              }}
              className="bg-card p-3.5 rounded-2xl flex-row items-center border border-border active:bg-muted"
            >
              <Box className="w-11 h-11 rounded-xl bg-primary/10 items-center justify-center mr-3.5">
                <AppIcon icon={CalendarCheck} size={22} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <Text size="md" bold className="text-foreground">
                  Sesi kontrol & lanjutan
                </Text>
                <Text size="sm" className="text-muted-foreground font-medium">
                  Jadwal tindak lanjut dari psikolog
                </Text>
              </VStack>
              <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="beranda" />

      {/* Modal Verifikasi Didit KYC */}
      <Modal isOpen={kycModalOpen} onClose={() => setKycModalOpen(false)}>
        <ModalBackdrop />
        <ModalContent className="max-w-[92%] p-5 rounded-3xl bg-card border border-border">
          <ModalHeader className="pb-3 border-b border-border">
            <HStack space="sm" className="items-center">
              <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <ShieldCheck size={22} color="#4A3B6B" />
              </Box>
              <VStack className="flex-1">
                <Heading size="md" bold className="text-foreground">
                  Verifikasi Identitas
                </Heading>
                <Text size="sm" className="text-muted-foreground">
                  Didit KYC Resmi
                </Text>
              </VStack>
              <ModalCloseButton />
            </HStack>
          </ModalHeader>
          <ModalBody className="py-4">
            <VStack space="sm">
              <Text size="sm" className="text-foreground leading-relaxed">
                Untuk mengakses layanan <Text bold>Konsultasi Langsung</Text> dan <Text bold>Pencocokan Praktisi</Text>, akun Anda wajib terverifikasi melalui Didit KYC.
              </Text>
              <Box className="bg-muted p-3.5 rounded-2xl border border-border">
                <Text size="sm" className="text-muted-foreground leading-relaxed">
                  Jika akun belum berstatus <Text bold className="text-foreground">VERIFIED</Text>, server akan menolak permintaan triase dan antrean matching dengan status <Text bold className="text-destructive">403 Forbidden</Text>.
                </Text>
              </Box>
              <Text size="sm" className="text-muted-foreground leading-relaxed">
                Verifikasi berjalan langsung di dalam aplikasi melalui Didit Native SDK tanpa membuka browser external.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter className="flex-col gap-2 pt-3 border-t border-border">
            <Button
              onPress={handleLaunchDidit}
              disabled={isKycLaunching}
              className="w-full bg-primary rounded-xl py-3"
            >
              {isKycLaunching ? (
                <ButtonSpinner color="#FFFFFF" />
              ) : (
                <ButtonText className="text-sm font-bold text-primary-foreground">
                  Mulai Verifikasi Didit Sekarang
                </ButtonText>
              )}
            </Button>
            <Button
              variant="outline"
              onPress={() => setKycModalOpen(false)}
              className="w-full border-border rounded-xl"
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

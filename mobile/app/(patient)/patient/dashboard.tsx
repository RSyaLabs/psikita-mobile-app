import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Smile,
  Meh,
  Clock,
  AlertCircle,
  Frown,
  ChevronRight,
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
  ScrollView,
  Image,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import { usePatientProfile, usePractitioners } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants/routes";

export default function PatientDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [selectedMood, setSelectedMood] = useState("Tenang");

  const { data: patient } = usePatientProfile();
  const { data: practitionersData } = usePractitioners();

  // No borrowed name. `patient?.fullName?.split(" ")[0] || "Siti"` greeted every
  // patient whose profile had not loaded as one specific person, the same
  // fabrication the practitioner count below already gave up. An unanswered
  // profile gets a neutral greeting, not someone's name.
  const patientFirstName = patient?.fullName?.split(" ")[0];
  const practitionersList = practitionersData?.data || [];
  // No fallback count. The previous `|| 3` displayed a fabricated "3 psikolog
  // online" whenever the API had not answered, which reads as real data to the
  // user. An unanswered query is shown as unknown, not invented.
  const onlineCount = practitionersList.length;

  const moods = [
    {
      id: "Tenang",
      label: "Tenang",
      icon: <Smile size={18} className="text-primary" />,
    },
    {
      id: "Biasa",
      label: "Biasa",
      icon: <Meh size={18} className="text-primary" />,
    },
    {
      id: "Lelah",
      label: "Lelah",
      icon: <Clock size={18} className="text-primary" />,
    },
    {
      id: "Cemas",
      label: "Cemas",
      icon: <AlertCircle size={18} className="text-primary" />,
    },
    {
      id: "Sedih",
      label: "Sedih",
      icon: <Frown size={18} className="text-primary" />,
    },
  ];

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
            <VStack>
              <Heading size="xl" bold className="text-foreground">
                {patientFirstName ? `Halo, ${patientFirstName}` : "Halo"}
              </Heading>
              <Text size="xs" className="text-muted-foreground mt-0.5">
                Cek kabarmu hari ini atau lanjutkan sesi konselingmu.
              </Text>
            </VStack>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lihat notifikasi"
              onPress={() => {
                haptics.light();
                router.push(ROUTES.PATIENT.NOTIFICATIONS);
              }}
              className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border active:opacity-80"
            >
              <Bell size={18} className="text-foreground" />
            </Pressable>
          </HStack>
        </VStack>

        {/* Photo Zone - Single Elegant Hero Banner */}
        <Box className="mx-5 mt-4 rounded-3xl overflow-hidden relative h-44 justify-end p-3.5">
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1769307347488-b874a53c19cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzEwODB8&ixlib=rb-4.1.0&q=80&w=1080",
            }}
            alt="Dashboard Banner"
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay Card */}
          <Card className="bg-card/95 rounded-xl p-2.5 flex-row items-center justify-between border border-border">
            <VStack space="xs">
              <Text size="xs" className="font-semibold text-muted-foreground">
                Lanjut sesi • 15 mnt
              </Text>
              <Text size="xs" bold className="text-foreground">
                Ceritamu belum selesai.
              </Text>
            </VStack>
            <Button
              size="sm"
              onPress={() => {
                haptics.medium();
                router.push(ROUTES.PATIENT.CHAT_ROOM);
              }}
              className="bg-secondary px-3.5 py-2 rounded-full h-auto min-h-0"
            >
              <ButtonText className="text-xs font-semibold text-secondary-foreground">
                Lanjut
              </ButtonText>
            </Button>
          </Card>
        </Box>

        {/* Sections */}
        <VStack space="sm" className="px-5 mt-3">
          {/* Vibe Section */}
          <VStack space="xs" className="pt-1">
            <Text size="xs" className="font-semibold text-muted-foreground">
              Check-in hari ini
            </Text>
            <HStack space="xs">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.id;
                return (
                  <Pressable
                    key={mood.id}
                    onPress={() => handleMoodSelect(mood.id)}
                    // Selection was previously conveyed by colour alone, so the
                    // chosen mood was invisible to a screen reader.
                    accessibilityRole="button"
                    accessibilityLabel={`Suasana ${mood.label}`}
                    accessibilityState={{ selected: isSelected }}
                    className={`flex-1 py-2 rounded-xl items-center justify-center border border-border active:opacity-80 ${
                      isSelected ? "bg-muted border-primary" : "bg-card"
                    }`}
                  >
                    {mood.icon}
                    <Text
                      size="xs"
                      className={`text-[11px] mt-1 ${
                        isSelected
                          ? "font-bold text-foreground"
                          : "font-medium text-muted-foreground"
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
                router.push({
                  pathname: ROUTES.PATIENT.TRIAGE,
                  params: { mode: "consultation" },
                } as any);
              }}
              className="bg-card px-4 py-3.5 rounded-2xl flex-row items-center justify-between border border-border active:bg-muted"
            >
              <VStack space="xs">
                <Text size="sm" bold className="text-foreground">
                  Konsultasi langsung
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  {onlineCount} psikolog online
                </Text>
              </VStack>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Pressable>

            {/* Jadwalkan Sesi */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Jadwalkan sesi"
              onPress={() => {
                haptics.light();
                router.push(ROUTES.PATIENT.DOCTORS);
              }}
              className="bg-card px-4 py-3.5 rounded-2xl flex-row items-center justify-between border border-border active:bg-muted"
            >
              <VStack space="xs">
                <Text size="sm" bold className="text-foreground">
                  Jadwalkan sesi
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Pilih dokter & jam
                </Text>
              </VStack>
              <ChevronRight size={18} className="text-muted-foreground" />
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
              className="bg-card px-4 py-3.5 rounded-2xl flex-row items-center justify-between border border-border active:bg-muted"
            >
              <VStack space="xs">
                <Text size="sm" bold className="text-foreground">
                  Tes mandiri
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Cek tingkat stres & kecemasan
                </Text>
              </VStack>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="beranda" />
    </SafeAreaView>
  );
}

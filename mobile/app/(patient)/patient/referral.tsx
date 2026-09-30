import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Download,
  Headphones,
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
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import {
  ReferralBannerAlert,
  ReferralHospitalCard,
  ReferralSatuSehatCard,
  ReferralFaqAccordion,
  CareTeamModal,
} from "@/components/patient/referral";
import { haptics } from "@/utils/haptics";
import { useReferral } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants";
import { safeNavigateBack } from "@/utils/navigation";

export default function ReferralScreen() {
  const router = useRouter();
  const [showCareTeamModal, setShowCareTeamModal] = useState(false);
  const { consultationId: consultationIdParam } = useLocalSearchParams<{
    consultationId?: string | string[];
  }>();
  // Route value only. No invented consultation id: useReferral is disabled
  // without one, so a missing id means no request and the placeholders below
  // stand for a referral the server never issued.
  const consultationId = Array.isArray(consultationIdParam)
    ? consultationIdParam[0]
    : consultationIdParam;
  const { data: referral } = useReferral(consultationId);

  const hospitalName =
    referral?.targetHospital ||
    referral?.destinationInstitutionId ||
    "Rujukan rumah sakit belum tersedia";
  const department =
    referral?.targetDepartment || "Poliklinik belum tersedia";
  const diagnosisIcd =
    referral?.icd10Code && referral?.icd10Description
      ? `${referral.icd10Code} (${referral.icd10Description})`
      : referral?.icd10Code || "Kode diagnosis belum tersedia";
  const referralNumber =
    referral?.referralNumber || referral?.id || "Nomor rujukan belum tersedia";

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Bar */}
      <Box className="bg-primary px-5 py-4 rounded-b-3xl">
        <HStack space="md" className="items-center">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
            className="p-1 -ml-1 active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={20} className="text-primary-foreground" />
          </Pressable>
          <Heading size="md" bold className="text-primary-foreground">
            Rujukan rumah sakit
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ReferralBannerAlert />

        {!consultationId && (
          <Card className="bg-card rounded-2xl p-4 border border-border gap-1">
            <Text size="sm" bold className="text-foreground">
              Surat rujukan belum tersedia
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Layar ini butuh consultationId dari navigasi. Tanpa ID itu tidak
              ada permintaan ke server dan isi surat di bawah adalah status
              sebenarnya, bukan data. Buka dari daftar konsultasi agar ID
              diteruskan.
            </Text>
          </Card>
        )}

        <ReferralHospitalCard
          hospitalName={hospitalName}
          department={department}
          diagnosisIcd={diagnosisIcd}
          referralNumber={referralNumber}
        />

        <ReferralSatuSehatCard />

        <ReferralFaqAccordion />

        {/* Save CTA */}
        <Button
          size="lg"
          onPress={() => haptics.medium()}
          accessibilityLabel="Unduh surat rujukan digital"
          className="w-full h-[50px] bg-secondary rounded-xl flex-row items-center justify-center gap-2 mb-3.5 active:opacity-90"
        >
          <ButtonIcon as={Download} className="text-secondary-foreground" />
          <ButtonText className="text-secondary-foreground font-semibold text-sm">
            Unduh Surat Rujukan PDF
          </ButtonText>
        </Button>

        {/* CS Card */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bantuan pendampingan rujukan RS"
            onPress={() => {
              haptics.light();
              setShowCareTeamModal(true);
            }}
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center flex-1 mr-2">
              <Headphones size={20} className="text-primary" />
              <VStack space="xs" className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Butuh bantuan menggunakan surat ini?
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Care Team PsiKita siap dampingi proses rujukan ke RS.
                </Text>
              </VStack>
            </HStack>
            <ChevronRight size={16} className="text-muted-foreground" />
          </Pressable>
        </Card>
      </ScrollView>

      <CareTeamModal
        isOpen={showCareTeamModal}
        onClose={() => setShowCareTeamModal(false)}
      />
    </SafeAreaView>
  );
}

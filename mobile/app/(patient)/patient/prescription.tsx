import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  FileText,
  Pill,
  QrCode,
  AlertTriangle,
  MapPin,
  Download,
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
  Progress,
  ProgressFilledTrack,
} from "@/components/ui";
import { PharmacyPartnerModal } from "@/components/modals";
import { usePrescriptions } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants";
import { safeNavigateBack } from "@/utils/navigation";

export default function PrescriptionScreen() {
  const router = useRouter();
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);

  // TanStack Query for Digital Prescriptions
  const { data: prescriptions, isLoading } = usePrescriptions();
  const rx = prescriptions?.[0];
  const medications = rx?.medications || [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Bar */}
      <Box className="bg-primary px-5 py-4 rounded-b-3xl">
        <HStack space="md" className="items-center">
          <Pressable
            onPress={() => {
              haptics.light();
              safeNavigateBack(router, ROUTES.PATIENT.HISTORY);
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="p-1 -ml-1 active:opacity-70"
          >
            <ArrowLeft size={20} className="text-primary-foreground" />
          </Pressable>
          <Heading size="md" bold className="text-primary-foreground">
            Resep digital
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
        {/* Rx Card / Empty State */}
        {medications.length === 0 ? (
          <Box className="bg-card rounded-3xl p-8 items-center justify-center border border-border my-6">
            <Box className="w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
              <Pill size={24} className="text-secondary" />
            </Box>
            <Heading size="xs" bold className="text-foreground text-center">
              Belum Ada Resep Digital Aktif
            </Heading>
            <Text
              size="xs"
              className="text-muted-foreground text-center mt-1 leading-relaxed"
            >
              Resep obat digital akan otomatis diterbitkan oleh dokter/psikiater
              setelah konsultasi selesai.
            </Text>
          </Box>
        ) : (
          <Card className="bg-primary rounded-3xl p-4 mb-3.5 border-0">
            <VStack space="md">
              <HStack space="xs" className="items-center justify-between">
                <HStack space="xs" className="items-center">
                  <FileText size={16} className="text-primary-foreground" />
                  <Text
                    size="xs"
                    className="font-semibold text-primary-foreground text-[11px]"
                  >
                    {rx?.prescriptionNumber ||
                      (rx?.id ? `Resep ${rx.id}` : "Nomor resep belum tersedia")}
                  </Text>
                </HStack>
                {rx?.doctorName ? (
                  <Text
                    size="xs"
                    className="text-primary-foreground/90 text-[11px] font-medium"
                  >
                    {rx.doctorName}
                  </Text>
                ) : rx?.practitionerId ? (
                  <Text
                    size="xs"
                    className="text-primary-foreground/80 text-[10px]"
                  >
                    Praktisi {rx.practitionerId}
                  </Text>
                ) : null}
              </HStack>

              {/* Meds List */}
              {medications.map((med, idx) => (
                <Box
                  key={`${med.name}|${med.dosage}|${med.frequency}`}
                  className="bg-primary-foreground/10 rounded-2xl p-3"
                >
                  <HStack space="md" className="items-center">
                    <Box className="w-8 h-8 rounded-full bg-primary-foreground/20 items-center justify-center">
                      <Pill size={16} className="text-primary-foreground" />
                    </Box>
                    <VStack space="xs" className="flex-1">
                      <Text size="sm" bold className="text-primary-foreground">
                        {med.name}
                      </Text>
                      <Text size="xs" className="text-primary-foreground/80">
                        {med.frequency}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}

              <Text
                size="xs"
                className="text-primary-foreground/90 leading-relaxed"
              >
                {rx?.notes || "Catatan dokter belum tersedia"}
              </Text>

              {/* QR Row */}
              <Box className="bg-primary-foreground/10 rounded-2xl p-3">
                <HStack space="md" className="items-center">
                  <Box className="p-2 bg-card rounded-xl">
                    <QrCode size={36} className="text-foreground" />
                  </Box>
                  <VStack space="xs" className="flex-1">
                    <Text size="xs" bold className="text-primary-foreground">
                      Tunjukkan kode QR ini di apotek
                    </Text>
                    <Text
                      size="xs"
                      className="text-primary-foreground/70 text-[11px]"
                    >
                      Berlaku di RS dan apotek rekanan PsiKita
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </Card>
        )}

        {/* Dose Alert */}
        <Card className="bg-muted rounded-2xl p-3 mb-3.5 border border-border">
          <HStack space="sm" className="items-center">
            <AlertTriangle size={18} className="text-foreground" />
            <Text size="xs" bold className="text-foreground flex-1">
              Jangan ubah dosis tanpa konsultasi dokter
            </Text>
          </HStack>
        </Card>

        {/* Pharmacy Card */}
        <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3.5">
          <Pressable
            onPress={() => {
              haptics.light();
              setShowPharmacyModal(true);
            }}
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center flex-1 mr-2">
              <MapPin size={20} className="text-secondary" />
              <VStack space="xs">
                <Text size="xs" bold className="text-foreground">
                  Apotek pilihan belum tersedia
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Detail apotek belum tersedia
                </Text>
              </VStack>
            </HStack>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>

        {/* Save CTA */}
        <Button
          size="lg"
          isDisabled
          onPress={() => haptics.error()}
          accessibilityLabel="Simpan resep belum tersedia"
          className="!opacity-100 w-full h-[50px] bg-muted rounded-xl flex-row items-center justify-center gap-2 mb-3.5"
        >
          <ButtonIcon as={Download} className="text-muted-foreground" />
          <ButtonText className="text-muted-foreground font-semibold text-sm">
            Simpan resep belum tersedia
          </ButtonText>
        </Button>

        {/* Adherence Card */}
        <Card className="bg-card rounded-2xl p-4 border border-border">
          <VStack space="xs">
            <Text size="sm" bold className="text-foreground">
              Kepatuhan minum obat
            </Text>
            <Progress
              value={0}
              className="w-full h-2 bg-muted rounded-full my-1"
            >
              <ProgressFilledTrack className="bg-secondary" />
            </Progress>
            <Text size="xs" className="text-muted-foreground">
              Data kepatuhan belum tersedia
            </Text>
          </VStack>
        </Card>
      </ScrollView>

      {/* Modals */}
      <PharmacyPartnerModal
        isOpen={showPharmacyModal}
        onClose={() => setShowPharmacyModal(false)}
        onOpenMaps={() => {
          setShowPharmacyModal(false);
        }}
      />
    </SafeAreaView>
  );
}

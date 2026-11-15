import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "@/components/ui";
import { PractitionerNotifModal } from "@/components/modals";
import { ROUTES } from "@/constants";
import { PractitionerTabBar } from "@/components/navigation";
import {
  PractitionerDashboardHeader,
  PractitionerStatsRow,
  PractitionerQueueSection,
  PractitionerQuickActions,
} from "@/components/practitioner/dashboard";
import {
  usePractitionerProfile,
  useMatchingOffers,
  useChangeAvailability,
  usePayoutBankAccountQuery,
  useSavePayoutBankAccountMutation,
} from "@/hooks/useApiQueries";
import { maskAccountNumber } from "@/api/payout.service";
import {
  Box,
  Card,
  Text,
  Heading,
  HStack,
  VStack,
  Badge,
  BadgeText,
  Button,
  ButtonText,
  Input,
  InputField,
  Pressable as UIPressable,
} from "@/components/ui";
import { Building2, ShieldCheck, AlertCircle, Edit3 } from "lucide-react-native";
import { haptics } from "@/utils";
import { resolveServerValue } from "@/utils/server-value";

export default function PractitionerDashboardScreen() {
  const router = useRouter();
  const [showNotifModal, setShowNotifModal] = useState(false);
  const { data: profile } = usePractitionerProfile();
  const offersQuery = useMatchingOffers();
  const changeAvailabilityMutation = useChangeAvailability();
  const isOnline = profile?.availabilityStatus === "AVAILABLE";

  const { data: bankAccount, isLoading: isBankLoading } =
    usePayoutBankAccountQuery();
  const saveBankMutation = useSavePayoutBankAccountMutation();
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankCode, setBankCode] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankFormError, setBankFormError] = useState<string | null>(null);

  const handleSaveBank = async () => {
    if (
      !bankCode.trim() ||
      accountNumber.trim().length < 5 ||
      !accountName.trim()
    ) {
      setBankFormError(
        "Lengkapi bank, nomor rekening (min 5 digit), dan nama pemilik.",
      );
      haptics.error();
      return;
    }
    setBankFormError(null);
    try {
      await saveBankMutation.mutateAsync({
        bankCode: bankCode.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });
      haptics.success();
      setShowBankModal(false);
    } catch (err: any) {
      haptics.error();
      setBankFormError(err?.message || "Gagal menyimpan data rekening.");
    }
  };

  // No invented practitioner identity or credentials: an unverified profile
  // used to render a licensed doctor with a Kemenkes verification badge.
  const doctorName = resolveServerValue(
    profile?.fullName,
    (value) => value,
    "Nama belum tersedia",
  );
  const specText = resolveServerValue(
    profile?.specialization,
    (value) => value,
    "Spesialisasi belum tersedia",
  );
  const licenseText = profile?.strNumber
    ? `STR: ${profile.strNumber}`
    : profile?.sippNumber
      ? `SIPP: ${profile.sippNumber}`
      : "Nomor STR/SIPP belum tersedia";

  const queueCount =
    offersQuery.isLoading || offersQuery.isError
      ? undefined
      : offersQuery.data?.length;

  const queueMessage = offersQuery.isLoading
    ? "Memeriksa tawaran kasus dari server…"
    : offersQuery.isError
      ? "Status tawaran tidak tersedia dari server."
      : queueCount === 0
        ? "Ruang Siaga aktif • Belum ada tawaran kasus."
        : queueCount === undefined
          ? "Jumlah tawaran belum tersedia dari server."
          : `${queueCount} tawaran kasus matching menunggu respons Anda di Ruang Siaga.`;

  const handleToggleOnline = (val: boolean) => {
    if (!profile?.id) {
      haptics.error();
      return;
    }
    haptics.light();
    changeAvailabilityMutation.mutate({
      practitionerId: profile.id,
      status: val ? "AVAILABLE" : "INACTIVE",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <PractitionerDashboardHeader
        doctorName={doctorName}
        specText={specText}
        isOnline={isOnline}
        licenseText={licenseText}
        onToggleOnline={handleToggleOnline}
        onOpenNotif={() => {
          haptics.light();
          setShowNotifModal(true);
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* "Sesi berikutnya" is intentionally absent. The API exposes no next
            session, and the card used to present a named patient, a fixed
            clock time and a GAD diagnosis as a real appointment that a
            practitioner could act on. It returns once the server sends one. */}
        <PractitionerStatsRow
          queueCount={queueCount}
          todaySessionsCount={undefined}
          rating={profile?.rating}
        />

        <PractitionerQueueSection
          queueMessage={queueMessage}
          onOpenWarRoom={() => router.push(ROUTES.PRACTITIONER.WAR_ROOM)}
        />

        {/* Practitioner Verified Payout Bank Card (RLN-22) */}
        <Card className="bg-card border border-border rounded-2xl p-4 mt-3 gap-3">
          <HStack space="md" className="items-center justify-between">
            <HStack space="sm" className="items-center">
              <Building2 size={18} color="#4A3B6B" />
              <Heading level={2} size="sm" bold className="text-foreground">
                Rekening Pencairan Insentif
              </Heading>
            </HStack>
            {bankAccount?.status === "VERIFIED" ? (
              <Badge
                variant="outline"
                className="bg-secondary/15 border-secondary/30"
              >
                <BadgeText className="text-secondary font-semibold text-sm">
                  Terverifikasi
                </BadgeText>
              </Badge>
            ) : bankAccount?.status === "PENDING" ? (
              <Badge
                variant="outline"
                className="bg-primary/10 border-primary/30"
              >
                <BadgeText className="text-primary font-semibold text-sm">
                  Menunggu Verifikasi
                </BadgeText>
              </Badge>
            ) : bankAccount?.status === "BLOCKED" ? (
              <Badge
                variant="outline"
                className="bg-destructive/10 border-destructive/30"
              >
                <BadgeText className="text-destructive font-semibold text-sm">
                  Ditangguhkan
                </BadgeText>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-muted border-border">
                <BadgeText className="text-muted-foreground font-semibold text-sm">
                  Belum Diatur
                </BadgeText>
              </Badge>
            )}
          </HStack>

          {isBankLoading ? (
            <Text size="xs" className="text-muted-foreground">
              Memeriksa status rekening...
            </Text>
          ) : bankAccount && bankAccount.status !== "NOT_CONFIGURED" ? (
            <VStack space="xs">
              <HStack space="sm" className="items-center justify-between">
                <Text size="sm" bold className="text-foreground">
                  {bankAccount.bankCode} •{" "}
                  {maskAccountNumber(bankAccount.accountNumber)}
                </Text>
                <UIPressable
                  onPress={() => {
                    setBankCode(bankAccount.bankCode || "BCA");
                    setAccountName(bankAccount.accountName || "");
                    setAccountNumber("");
                    setShowBankModal(true);
                  }}
                  className="p-1"
                >
                  <Edit3 size={16} className="text-muted-foreground" />
                </UIPressable>
              </HStack>
              <Text size="xs" className="text-muted-foreground">
                Atas Nama: {bankAccount.accountName || "Nama belum diverifikasi"}
              </Text>
              <Text size="xs" className="text-muted-foreground mt-1">
                {bankAccount.status === "VERIFIED"
                  ? "Rekening siap menerima pencairan insentif otomatis sesuai jadwal siklus."
                  : "Rekening sedang ditinjau. Pencairan dana diproses setelah status terverifikasi."}
              </Text>
            </VStack>
          ) : (
            <VStack space="sm">
              <Text size="xs" className="text-muted-foreground">
                Daftarkan rekening bank resmi Anda untuk menerima pencairan
                insentif konsultasi klinis.
              </Text>
              <Button
                size="sm"
                onPress={() => {
                  setBankCode("BCA");
                  setAccountName(profile?.fullName || "");
                  setAccountNumber("");
                  setShowBankModal(true);
                }}
                className="bg-primary rounded-xl"
              >
                <ButtonText className="text-primary-foreground font-semibold text-sm">
                  Daftarkan Rekening Bank
                </ButtonText>
              </Button>
            </VStack>
          )}

          {/* Modal Form Pendaftaran / Perubahan Rekening Payout */}
          {showBankModal && (
            <Box className="mt-2 p-3 bg-muted rounded-xl border border-border gap-2.5">
              <HStack space="sm" className="items-center justify-between">
                <Text size="xs" bold className="text-foreground">
                  Atur Rekening Bank
                </Text>
                <UIPressable onPress={() => setShowBankModal(false)}>
                  <Text size="xs" className="text-muted-foreground">
                    Batal
                  </Text>
                </UIPressable>
              </HStack>

              <VStack space="xs">
                <Text size="xs" className="text-muted-foreground">
                  Kode Bank (BCA, MANDIRI, BNI, BRI, dll):
                </Text>
                <Input className="border-border bg-background rounded-lg h-9">
                  <InputField
                    value={bankCode}
                    onChangeText={setBankCode}
                    autoCapitalize="characters"
                    placeholder="Contoh: BCA"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text size="xs" className="text-muted-foreground">
                  Nomor Rekening:
                </Text>
                <Input className="border-border bg-background rounded-lg h-9">
                  <InputField
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                    placeholder="Hanya angka (min 5 digit)"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text size="xs" className="text-muted-foreground">
                  Nama Pemilik Rekening:
                </Text>
                <Input className="border-border bg-background rounded-lg h-9">
                  <InputField
                    value={accountName}
                    onChangeText={setAccountName}
                    placeholder="Sesuai buku tabungan"
                  />
                </Input>
              </VStack>

              {bankFormError && (
                <HStack space="xs" className="items-center">
                  <AlertCircle size={14} className="text-destructive" />
                  <Text size="xs" className="text-destructive font-medium flex-1">
                    {bankFormError}
                  </Text>
                </HStack>
              )}

              <Button
                size="sm"
                isDisabled={saveBankMutation.isPending}
                onPress={handleSaveBank}
                className="bg-primary rounded-lg mt-1"
              >
                <ButtonText className="text-primary-foreground font-semibold text-sm">
                  {saveBankMutation.isPending
                    ? "Menyimpan Rekening..."
                    : "Simpan Rekening"}
                </ButtonText>
              </Button>
            </Box>
          )}
        </Card>

        <PractitionerQuickActions
          onOpenHistory={() => router.push(ROUTES.PRACTITIONER.HISTORY)}
          onOpenDiagnosis={() => router.push(ROUTES.PRACTITIONER.DIAGNOSIS)}
          onOpenProfile={() => router.push(ROUTES.PRACTITIONER.PROFILE)}
        />
      </ScrollView>

      <PractitionerNotifModal
        isOpen={showNotifModal}
        onClose={() => setShowNotifModal(false)}
        queueCount={queueCount}
        onOpenWarRoom={() => {
          setShowNotifModal(false);
          router.push(ROUTES.PRACTITIONER.WAR_ROOM);
        }}
      />

      <PractitionerTabBar activeTab="beranda" />
    </SafeAreaView>
  );
}

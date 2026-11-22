import React, { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Plus,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  Badge,
  BadgeText,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
  Input,
  InputField,
} from "@/components/ui";
import {
  useRefundCasesQuery,
  useRefundDestinationsQuery,
  useRequestRefundMutation,
} from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { LoadingState, ErrorState, EmptyState } from "@/components/common";

export default function PatientRefundsScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [paymentIdInput, setPaymentIdInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const submitInFlight = useRef(false);

  const {
    data: refundCases,
    isLoading,
    isError,
    refetch,
  } = useRefundCasesQuery();
  const { data: destinations } = useRefundDestinationsQuery();
  const requestMutation = useRequestRefundMutation();

  const handleOpenModal = () => {
    setFormError(null);
    setPaymentIdInput("");
    setShowModal(true);
  };

  const handleSubmitRefund = async () => {
    const trimmedId = paymentIdInput.trim();
    if (trimmedId.length !== 26) {
      setFormError("ID Pembayaran (paymentId) harus valid sepanjang 26 karakter ULID.");
      haptics.error();
      return;
    }

    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setFormError(null);

    try {
      const idempotencyKey = `refund-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      await requestMutation.mutateAsync({
        paymentId: trimmedId,
        idempotencyKey,
      });

      haptics.success();
      setShowModal(false);
      setPaymentIdInput("");
    } catch (err: any) {
      haptics.error();
      setFormError(
        err?.message ||
          "Gagal mengajukan pengembalian dana. Pastikan pembayaran memenuhi syarat refund.",
      );
    } finally {
      submitInFlight.current = false;
    }
  };

  const getStatusBadge = (status: string, disabledReason?: string | null) => {
    if (disabledReason) {
      return (
        <Badge variant="outline" className="bg-destructive/10 border-destructive/30">
          <BadgeText className="text-destructive font-semibold text-sm">
            {disabledReason === "REFUND_DISABLED"
              ? "Refund Dinonaktifkan"
              : "Verifikasi Transfer Bank"}
          </BadgeText>
        </Badge>
      );
    }

    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-secondary/15 border-secondary/30">
            <BadgeText className="text-secondary font-semibold text-sm">
              Selesai Ditransfer
            </BadgeText>
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="outline" className="bg-primary/15 border-primary/30">
            <BadgeText className="text-primary font-semibold text-sm">
              Diproses Bank
            </BadgeText>
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-primary/10 border-primary/30">
            <BadgeText className="text-primary font-semibold text-sm">
              Disetujui
            </BadgeText>
          </Badge>
        );
      case "UNDER_REVIEW":
      case "REQUESTED":
        return (
          <Badge variant="outline" className="bg-muted border-border">
            <BadgeText className="text-muted-foreground font-semibold text-sm">
              Dalam Peninjauan
            </BadgeText>
          </Badge>
        );
      case "FAILED":
      case "RETURNED":
      case "DISPUTED":
        return (
          <Badge variant="outline" className="bg-destructive/10 border-destructive/30">
            <BadgeText className="text-destructive font-semibold text-sm">
              {status}
            </BadgeText>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted border-border">
            <BadgeText className="text-muted-foreground font-semibold text-sm">
              {status}
            </BadgeText>
          </Badge>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-card px-5 py-3.5 border-b border-border flex-row items-center justify-between">
        <HStack space="md" className="items-center">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.PROFILE)}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke profil"
            className="p-1 -ml-1"
          >
            <ArrowLeft size={22} color="#262130" />
          </Pressable>
          <Heading level={1} size="md" bold className="text-foreground">
            Pengembalian Dana (Refund)
          </Heading>
        </HStack>
        <Button
          size="sm"
          onPress={handleOpenModal}
          className="bg-primary rounded-xl flex-row items-center gap-1 px-3 py-1.5"
        >
          <ButtonIcon as={Plus} className="text-primary-foreground" />
          <ButtonText className="text-primary-foreground font-semibold text-sm">
            Ajukan
          </ButtonText>
        </Button>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <Card className="bg-muted border border-border rounded-2xl p-4 mb-4 gap-2">
          <HStack space="sm" className="items-center">
            <ShieldCheck size={18} className="text-primary" />
            <Text size="sm" bold className="text-foreground">
              Kebijakan Pengembalian Dana Aman
            </Text>
          </HStack>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Seluruh permohonan pengembalian dana diproses berdasarkan riwayat transaksi yang sah dan kuotasi resmi server. Dana refund dicairkan ke rekening terdaftar pasien setelah verifikasi selesai.
          </Text>
        </Card>

        {isLoading ? (
          <LoadingState label="Memuat riwayat pengajuan refund..." />
        ) : isError ? (
          <ErrorState
            errorLabel="Gagal memuat status refund"
            description="Tidak dapat menghubungi server untuk mengambil data refund."
            onRetry={refetch}
          />
        ) : !refundCases || refundCases.items.length === 0 ? (
          <EmptyState
            label="Belum Ada Pengajuan Refund"
            description="Jika ada sesi konsultasi yang dibatalkan atau terkendala, Anda dapat mengajukan refund di sini."
          />
        ) : (
          <VStack space="md">
            {refundCases.items.map((item) => (
              <Card
                key={item.id}
                className="bg-card border border-border rounded-2xl p-4 gap-3"
              >
                <HStack space="md" className="items-center justify-between">
                  <VStack space="xs">
                    <Text size="sm" className="text-muted-foreground font-mono">
                      ID: {item.id.substring(0, 12)}...
                    </Text>
                    <Text size="lg" bold className="text-foreground">
                      Rp {item.quote.netRefund.toLocaleString("id-ID")}
                    </Text>
                  </VStack>
                  {getStatusBadge(item.status, item.disabledReason)}
                </HStack>

                <Box className="h-[1px] bg-border my-1" />

                <HStack space="md" className="items-center justify-between">
                  <VStack space="xs">
                    <Text size="sm" className="text-muted-foreground">
                      ID Transaksi Terkait:
                    </Text>
                    <Text size="sm" bold className="text-foreground font-mono">
                      {item.paymentId.substring(0, 8)}...{item.paymentId.substring(item.paymentId.length - 4)}
                    </Text>
                  </VStack>
                  <Text size="sm" className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Text>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* Modal Pengajuan Refund */}
        {showModal && (
          <Box className="mt-6 p-4 rounded-2xl border border-primary bg-card gap-3">
            <HStack space="sm" className="items-center justify-between">
              <Heading level={2} size="sm" bold className="text-foreground">
                Ajukan Pengembalian Dana
              </Heading>
              <Pressable onPress={() => setShowModal(false)}>
                <Text size="sm" className="text-muted-foreground">
                  Tutup
                </Text>
              </Pressable>
            </HStack>

            <Text size="sm" className="text-muted-foreground">
              Masukkan ID Pembayaran (ULID 26 karakter) dari riwayat transaksi yang ingin diajukan pengembalian:
            </Text>

            <Input className="border-border bg-background rounded-xl">
              <InputField
                placeholder="Contoh: 01H7XYZ0000000000000000000"
                value={paymentIdInput}
                onChangeText={setPaymentIdInput}
                autoCapitalize="characters"
              />
            </Input>

            {destinations && destinations.items.length > 0 && (
              <VStack space="xs" className="mt-1">
                <Text size="sm" bold className="text-muted-foreground">
                  Kanal Pencairan Didukung:
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  {destinations.items.map((d) => d.name).join(", ")}
                </Text>
              </VStack>
            )}

            {formError && (
              <Box className="p-3 bg-destructive/10 rounded-xl flex-row items-center gap-2">
                <AlertCircle size={16} className="text-destructive" />
                <Text size="sm" className="text-destructive font-medium flex-1">
                  {formError}
                </Text>
              </Box>
            )}

            <Button
              size="default"
              isDisabled={requestMutation.isPending}
              onPress={handleSubmitRefund}
              className="bg-primary rounded-xl mt-2"
            >
              <ButtonText className="text-primary-foreground font-semibold">
                {requestMutation.isPending ? "Mengirim Pengajuan..." : "Kirim Permohonan Refund"}
              </ButtonText>
            </Button>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

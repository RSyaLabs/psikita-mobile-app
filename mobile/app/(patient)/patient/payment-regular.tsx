import React, { useEffect, useRef, useState } from "react";
import { Image, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { getCapability } from "@/config/capabilities";
import { ROUTES } from "@/constants/routes";
import { PaymentMethodSelector } from "@/components/patient/payment";
import {
  useCreateBillingOrder,
  useCreatePayment,
  useInitialBillingPreview,
  usePaymentMethods,
  useServerPaymentStatus,
  useValidatedServerPaymentContext,
} from "@/hooks/useApiQueries";
import { createBillingOrderIdempotencyKey, isPaymentSettled, paymentService } from "@/api/payment.service";
import {
  Box, Text, Heading, Card, VStack, HStack, Pressable,
  Button, ButtonText, ScrollView,
} from "@/components/ui";
import type { PaymentResponseDto } from "@/types/api";

function rupiah(amount: number | undefined) {
  return typeof amount === "number"
    ? `Rp ${amount.toLocaleString("id-ID")}`
    : "Belum tersedia";
}

export default function PaymentRegularScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ consultationId?: string }>();
  const consultationId = typeof params.consultationId === "string" ? params.consultationId : "";

  // Orders and payments are restored from authenticated server endpoints on every entry.
  const current = useValidatedServerPaymentContext(consultationId);
  const order = current.order;
  const pendingWithPayment = order?.paymentStatus === "PENDING" && Boolean(order.paymentId);
  const expiredWithoutPayment = Boolean(
    order?.paymentStatus === "PENDING" &&
    !order.paymentId &&
    order.expiresAt &&
    Date.parse(order.expiresAt) <= Date.now(),
  );
  const canStartNewOrder = current.isSuccess && (
    !order || order.paymentStatus === "EXPIRED" ||
    order.paymentStatus === "FAILED" || expiredWithoutPayment
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const preview = useInitialBillingPreview(canStartNewOrder ? consultationId : undefined, selectedKey ?? undefined);
  const methodBaseAmount = order
    ? Math.max(0, order.grossAmount - order.discountAmount)
    : preview.data?.netAmount;
  const catalog = usePaymentMethods(methodBaseAmount, "IDR");
  const methods = catalog.data?.groups.flatMap((group) => group.methods) ?? [];
  const lockedKey = canStartNewOrder ? null : order?.gatewayChannel;
  const choice = methods.find((item) => item.key === (lockedKey ?? selectedKey));

  const createOrder = useCreateBillingOrder();
  const createPayment = useCreatePayment();
  const [submittedPayment, setSubmittedPayment] = useState<PaymentResponseDto | null>(null);
  const [error, setError] = useState("");
  const submitInFlight = useRef(false);
  const paymentId = submittedPayment?.id || order?.paymentId || undefined;
  const billingOrderId = submittedPayment?.billingOrderId || order?.id;
  const transaction = useServerPaymentStatus(paymentId, billingOrderId);
  const payment = transaction.data ?? submittedPayment;
  const settled = isPaymentSettled(payment, billingOrderId ?? "");
  const paymentPending = Boolean(paymentId && !settled && (!payment || payment.status === "PENDING"));
  const paymentFailed = Boolean(payment && ["FAILED", "EXPIRED", "CANCELLED", "REFUNDED"].includes(payment.status));
  const creating = createOrder.isPending || createPayment.isPending;
  const capabilityEnabled = getCapability("payment") === "live";

  // Refetch the order when a transaction is resolved to restore the durable settlement state.
  useEffect(() => {
    if (transaction.data && transaction.data.status !== "PENDING") {
      void current.refetch();
    }
  // Only status transitions trigger reconciliation, not every query object change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction.data?.status]);

  const pay = async () => {
    if (
      !capabilityEnabled || !choice?.available || !current.isSuccess ||
      current.isFetching || creating || paymentId || settled ||
      submitInFlight.current || (!canStartNewOrder && !order?.id) ||
      (canStartNewOrder && (!preview.data || preview.isFetching))
    ) return;
    submitInFlight.current = true;
    setError("");
    try {
      let payableOrder = canStartNewOrder ? undefined : order ?? undefined;
      if (!payableOrder) {
        if (!consultationId || !selectedKey || !preview.data) return;
        payableOrder = await createOrder.mutateAsync({
          consultationId,
          dto: {
            orderType: "INITIAL",
            durationMinutes: 60,
            payerType: "SELF_PAY",
            gatewayChannel: choice.key,
            idempotencyKey: createBillingOrderIdempotencyKey(consultationId, {
              orderType: "INITIAL", durationMinutes: 60,
              payerType: "SELF_PAY", gatewayChannel: choice.key,
            }),
          },
        });
      }
      if (payableOrder.paymentStatus !== "PENDING" || payableOrder.paymentId) {
        setError("Sudah ada transaksi untuk tagihan ini. Muat ulang status sebelum melakukan tindakan lain.");
        return;
      }
      if (payableOrder.gatewayChannel !== choice.key) {
        setError("Kanal pembayaran tidak cocok dengan tagihan yang dikunci server.");
        return;
      }
      const context = paymentService.serverPaymentContextFromBillingOrder(payableOrder);
      if (!context) {
        setError("Tagihan belum terverifikasi oleh server. Muat ulang status pembayaran.");
        return;
      }
      const created = await createPayment.mutateAsync({
        methodType: choice.methodType as "E_WALLET" | "VIRTUAL_ACCOUNT" | "QRIS",
        channelCode: choice.channelCode,
        context,
      });
      setSubmittedPayment(created);
      await current.refetch();
      haptics.success();
    } catch {
      // A timeout can mean the gateway accepted the payment. Never retry blindly.
      setError("Hasil transaksi belum pasti. Periksa status tagihan sebelum mencoba kembali; jangan melakukan pembayaran ganda.");
      await current.refetch();
      haptics.error();
    } finally {
      submitInFlight.current = false;
    }
  };

  const openPaymentLink = async (url: string) => {
    if (!/^https:\/\//i.test(url)) {
      setError("Tautan pembayaran tidak valid.");
      return;
    }
    try {
      await Linking.openURL(url);
    } catch {
      setError("Tautan pembayaran tidak dapat dibuka.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <HStack className="items-center gap-3 bg-card border-b border-border px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke checkout"
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.CHECKOUT)}
        >
          <ArrowLeft size={22} className="text-foreground" />
        </Pressable>
        <Heading level={1} size="lg" className="text-foreground">Pembayaran konsultasi</Heading>
      </HStack>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 45 }}>
        <VStack space="lg">
          <Card className="p-4 border border-border bg-card rounded-2xl">
            <Text className="font-semibold text-foreground">Ringkasan tagihan resmi</Text>
            <Text className="text-muted-foreground">Sesi konsultasi awal · 60 menit</Text>
            <Text className="text-foreground">Harga awal: {rupiah(order?.grossAmount ?? preview.data?.baseAmount)}</Text>
            <Text className="text-foreground">Diskon: {rupiah(order?.discountAmount ?? preview.data?.discountAmount)}</Text>
            <Text className="text-foreground font-semibold">
              Total bayar: {rupiah(order?.totalAmount ?? preview.data?.estimatedTotalPayable ?? choice?.totalPayable.amount)}
            </Text>
            <Text size="xs" className="text-muted-foreground">
              Estimasi dihitung server; nominal final terkunci saat order dibuat.
            </Text>
          </Card>
          {current.isLoading || current.isFetching ? (
            <Text className="text-muted-foreground">Memulihkan order dari server...</Text>
          ) : current.isError ? (
            <Button variant="outline" onPress={() => void current.refetch()}>
              <ButtonText>Gagal memuat order · Coba lagi</ButtonText>
            </Button>
          ) : null}

          {canStartNewOrder ? (
            <Card className="p-4 border border-border bg-card rounded-2xl">
              <Text className="font-semibold text-foreground mb-3">Pilih metode pembayaran</Text>
              {preview.isLoading ? <Text className="text-muted-foreground">Memuat tarif konsultasi...</Text> : null}
              {preview.isError ? (
                <Button variant="outline" onPress={() => void preview.refetch()}>
                  <ButtonText>Gagal memuat tarif · Coba lagi</ButtonText>
                </Button>
              ) : null}
              {catalog.isError ? (
                <Button variant="outline" onPress={() => void catalog.refetch()}>
                  <ButtonText>Gagal memuat metode · Coba lagi</ButtonText>
                </Button>
              ) : null}
              <PaymentMethodSelector
                groups={catalog.data?.groups}
                selectedKey={selectedKey ?? undefined}
                onSelectKey={(item) => {
                  setSelectedKey(item.key);
                  setError("");
                }}
                paymentEnabled={capabilityEnabled && !creating}
                isLoading={preview.isLoading || catalog.isLoading}
              />
              {choice ? (
                <Text size="xs" className="text-muted-foreground">
                  Biaya kanal: {rupiah(choice.fee.amount)} · {choice.feeBearer === "INCLUDED" ? "Ditanggung dalam tarif" : "Ditanggung pasien"}
                </Text>
              ) : null}
            </Card>
          ) : order ? (
            <Card className="p-4 border border-border bg-card rounded-2xl">
              <Text className="font-semibold text-foreground">Order yang sudah ada</Text>
              <Text className="text-muted-foreground">Status: {order.paymentStatus} · Kanal: {order.gatewayChannel ?? "Belum ditentukan"}</Text>
              <Text size="xs" className="text-muted-foreground">
                Metode tidak dapat diubah selama order masih aktif. Ini mencegah tagihan ganda.
              </Text>
              {order.expiresAt ? <Text size="xs" className="text-muted-foreground">Berlaku sampai {new Date(order.expiresAt).toLocaleString("id-ID")}</Text> : null}
            </Card>
          ) : null}

          {payment?.paymentUrl ? (
            <Button onPress={() => void openPaymentLink(payment.paymentUrl!)} className="bg-primary">
              <ButtonText>Buka halaman pembayaran aman</ButtonText>
            </Button>
          ) : null}
          {payment?.qrCodeUrl ? (
            <Card className="p-4 border border-border bg-card rounded-2xl items-center">
              <Text className="font-semibold mb-2">QRIS dari gateway</Text>
              <Image source={{uri: payment.qrCodeUrl}} style={{width: 220, height: 220}} resizeMode="contain" />
            </Card>
          ) : null}
          {payment?.qrString && !payment.qrCodeUrl ? (
            <Text className="text-muted-foreground">
              Gateway mengembalikan payload QRIS tanpa gambar. Jangan bayar sebelum kode dapat ditampilkan dengan aman.
            </Text>
          ) : null}
          {payment?.accountNumber ? (
            <Card className="p-4 border border-border bg-card rounded-2xl">
              <Text className="font-semibold">Instruksi Virtual Account</Text>
              <Text>Bank: {payment.bankCode ?? "Lihat instruksi"}</Text>
              <Text>Nomor VA: {payment.accountNumber}</Text>
            </Card>
          ) : null}

          {paymentPending ? (
            <Card className="p-4 border border-border bg-card rounded-2xl">
              <Text className="font-semibold text-foreground">Menunggu konfirmasi pembayaran</Text>
              <Text className="text-muted-foreground">Pembayaran baru dapat membuka konsultasi setelah server menerima settlement.</Text>
              <Button variant="outline" onPress={() => { void transaction.refetch(); void current.refetch(); }}>
                <ButtonText>Periksa status pembayaran</ButtonText>
              </Button>
            </Card>
          ) : null}
          {paymentFailed ? (
            <Text accessibilityRole="alert" className="text-destructive">Pembayaran berstatus {payment?.status}. Perbarui status order sebelum membuat transaksi lain.</Text>
          ) : null}
          {error ? <Text accessibilityRole="alert" className="text-destructive">{error}</Text> : null}

          {settled ? (
            <Button onPress={() => router.replace({pathname: ROUTES.PATIENT.CHAT_ROOM, params: {consultationId}} as never)} className="bg-primary">
              <HStack space="sm" className="items-center">
                <CheckCircle2 size={18} color="#FFFFFF" />
                <ButtonText>Pembayaran terkonfirmasi · Masuk konsultasi</ButtonText>
              </HStack>
            </Button>
          ) : (
            <Button
              isDisabled={
                !capabilityEnabled || !current.isSuccess || current.isFetching ||
                !choice?.available || creating || Boolean(paymentId) ||
                (canStartNewOrder && (!preview.data || preview.isFetching || !selectedKey)) ||
                (!canStartNewOrder && (!order || order.paymentStatus !== "PENDING" || !order.gatewayChannel))
              }
              onPress={() => void pay()}
              className="bg-primary"
            >
              <HStack space="sm" className="items-center">
                <CreditCard size={18} color="#FFFFFF" />
                <ButtonText>{creating ? "Memproses..." : paymentId ? "Menunggu pembayaran" : "Buat order dan bayar"}</ButtonText>
              </HStack>
            </Button>
          )}

          {!capabilityEnabled ? (
            <Text className="text-muted-foreground">Layanan pembayaran sedang tidak tersedia.</Text>
          ) : null}
          <Text size="xs" className="text-muted-foreground">
            Tidak ada akses konsultasi yang diberikan dari status lokal. Settlement dan hak akses diperiksa oleh Core API.
          </Text>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

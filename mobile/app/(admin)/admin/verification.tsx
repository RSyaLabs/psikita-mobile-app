import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileText, AlertTriangle } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { AppHeader } from "@/components/common";
import { RevisionRequestModal } from "@/components/modals";
import { PractitionerVerificationCard } from "@/components/admin/PractitionerVerificationCard";
import {
  usePractitioners,
  useApprovePractitioner,
  useRejectPractitioner,
} from "@/hooks/useApiQueries";
import { PractitionerResponseDto } from "@/types/api";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants";

export default function VerificationScreen() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "pending" | "verified" | "rejected"
  >("pending");
  const [selectedPracForRevise, setSelectedPracForRevise] =
    useState<PractitionerResponseDto | null>(null);

  // TanStack Queries & Mutations
  const { data: pracData } = usePractitioners();
  const approveMutation = useApprovePractitioner();
  const rejectMutation = useRejectPractitioner();

  const allPractitioners: PractitionerResponseDto[] = pracData?.data || [];

  const pendingList = allPractitioners.filter(
    (p) => p.verificationStatus === "PENDING" || !p.verificationStatus,
  );
  const verifiedList = allPractitioners.filter(
    (p) => p.verificationStatus === "VERIFIED",
  );
  const rejectedList = allPractitioners.filter(
    (p) => p.verificationStatus === "REJECTED",
  );

  const displayedList =
    activeTab === "pending"
      ? pendingList
      : activeTab === "verified"
        ? verifiedList
        : rejectedList;

  const handleApprove = (item: PractitionerResponseDto) => {
    haptics.medium();
    approveMutation.mutate(item.id, {
      onSuccess: () => {
        haptics.success();
        toast.show({
          placement: "top",
          render: ({ id: toastId }) => (
            <Toast nativeID={toastId} action="success">
              <ToastTitle>Praktisi Terverifikasi</ToastTitle>
              <ToastDescription>
                {item.fullName || "Praktisi"} kini aktif dan dapat menerima
                konsultasi.
              </ToastDescription>
            </Toast>
          ),
        });
      },
      onError: (err: any) => {
        haptics.error();
        toast.show({
          placement: "top",
          render: ({ id: toastId }) => (
            <Toast nativeID={toastId} action="error">
              <ToastTitle>Gagal Memverifikasi</ToastTitle>
              <ToastDescription>
                {err?.message || "Terjadi kesalahan pada sistem verifikasi."}
              </ToastDescription>
            </Toast>
          ),
        });
      },
    });
  };

  const handleReject = (item: PractitionerResponseDto, reason?: string) => {
    haptics.medium();
    rejectMutation.mutate(
      { id: item.id, reason },
      {
        onSuccess: () => {
          haptics.success();
          toast.show({
            placement: "top",
            render: ({ id: toastId }) => (
              <Toast nativeID={toastId} action="info">
                <ToastTitle>Status Diperbarui</ToastTitle>
                <ToastDescription>
                  Pengajuan {item.fullName || "praktisi"} telah{" "}
                  {reason ? "diminta revisi" : "ditolak"}.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onError: (err: any) => {
          haptics.error();
          toast.show({
            placement: "top",
            render: ({ id: toastId }) => (
              <Toast nativeID={toastId} action="error">
                <ToastTitle>Gagal Memperbarui</ToastTitle>
                <ToastDescription>
                  {err?.message || "Terjadi kesalahan saat memproses data."}
                </ToastDescription>
              </Toast>
            ),
          });
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <AppHeader
        title="Verifikasi STR & SIP"
        fallbackRoute={ROUTES.ADMIN.DASHBOARD}
      />

      {/* Segmented Filter Tabs */}
      <Box className="px-5 pt-3.5 pb-2">
        <HStack
          space="xs"
          className="bg-card p-1 rounded-2xl border border-border"
        >
          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab("pending");
            }}
            accessibilityRole="button"
            accessibilityLabel="Filter berkas menunggu verifikasi"
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeTab === "pending" ? "bg-muted" : ""
            }`}
          >
            <Text
              size="xs"
              className={`font-semibold ${
                activeTab === "pending"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Menunggu
            </Text>
            {pendingList.length > 0 && (
              <Box className="w-5 h-5 rounded-full bg-secondary items-center justify-center">
                <Text
                  size="xs"
                  className="text-secondary-foreground text-[10px] font-bold"
                >
                  {pendingList.length}
                </Text>
              </Box>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab("verified");
            }}
            accessibilityRole="button"
            accessibilityLabel="Filter berkas terverifikasi"
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeTab === "verified" ? "bg-muted" : ""
            }`}
          >
            <Text
              size="xs"
              className={`font-semibold ${
                activeTab === "verified"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Terverifikasi
            </Text>
            {verifiedList.length > 0 && (
              <Box className="w-5 h-5 rounded-full bg-border items-center justify-center">
                <Text
                  size="xs"
                  className="text-foreground text-[10px] font-bold"
                >
                  {verifiedList.length}
                </Text>
              </Box>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab("rejected");
            }}
            accessibilityRole="button"
            accessibilityLabel="Filter berkas ditolak"
            className={`flex-1 py-2.5 rounded-xl items-center justify-center flex-row gap-1.5 ${
              activeTab === "rejected" ? "bg-muted" : ""
            }`}
          >
            <Text
              size="xs"
              className={`font-semibold ${
                activeTab === "rejected"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Ditolak
            </Text>
            {rejectedList.length > 0 && (
              <Box className="w-5 h-5 rounded-full bg-destructive/15 items-center justify-center">
                <Text
                  size="xs"
                  className="text-destructive text-[10px] font-bold"
                >
                  {rejectedList.length}
                </Text>
              </Box>
            )}
          </Pressable>
        </HStack>
      </Box>

      {/* Practitioner Cards List */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {displayedList.length === 0 ? (
          <Box className="bg-card rounded-2xl p-8 border border-border items-center justify-center mt-6">
            <FileText size={32} className="text-muted-foreground mb-2" />
            <Heading size="xs" bold className="text-foreground text-center">
              Tidak Ada Pengajuan
            </Heading>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              {activeTab === "pending"
                ? "Semua berkas praktisi telah selesai ditinjau."
                : activeTab === "verified"
                  ? "Belum ada praktisi dalam status terverifikasi."
                  : "Belum ada pengajuan yang ditolak."}
            </Text>
          </Box>
        ) : (
          displayedList.map((item) => (
            <PractitionerVerificationCard
              key={item.id}
              item={item}
              isPendingTab={activeTab === "pending"}
              isApproving={approveMutation.isPending}
              onApprove={handleApprove}
              onReject={(prac) =>
                handleReject(prac, "Dokumen tidak memenuhi persyaratan.")
              }
              onRequestRevision={(prac) => {
                haptics.light();
                setSelectedPracForRevise(prac);
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Pop-up Modal: Permintaan Revisi Berkas */}
      <RevisionRequestModal
        practitioner={selectedPracForRevise}
        onClose={() => setSelectedPracForRevise(null)}
        onConfirmRevision={(prac, reason) => handleReject(prac, reason)}
      />
    </SafeAreaView>
  );
}

import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Box,
  Text,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { AppHeader } from "@/components/common";
import { UserDetailModal } from "@/components/modals";
import { haptics } from "@/utils/haptics";
import { usePatients, usePractitioners } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants";
import {
  AdminUserList,
  AdminConfigSection,
  AdminUserListItem,
} from "@/components/admin";
import { resolveServerValue } from "@/utils/server-value";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80";

export default function SettingsScreen() {
  const toast = useToast();
  const { data: patientsData } = usePatients();
  const { data: practitionersData } = usePractitioners();
  const [activeTab, setActiveTab] = useState<
    "pasien" | "praktisi" | "pengaturan"
  >("pasien");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  );

  const patients: AdminUserListItem[] = useMemo(
    () =>
      (patientsData?.data || []).map((p) => ({
        id: p.id,
        name: p.fullName,
        // No invented NIK digits. The `|| "0001"` used to complete the last four
        // characters so an admin saw a well-formed national id for a patient
        // whose record has no NIK at all.
        identifier: resolveServerValue(
          p.nik,
          (nik) => `NIK: ${nik.substring(0, 4)}****${nik.substring(12)}`,
          "NIK belum tersedia",
        ),
        // Same class of bug already fixed for practitioners below: never
        // derive a mailbox from a display name.
        email: "email tidak tersedia",
        role: "Pasien Terdaftar",
        sessions: "Sesi Selesai",
        status: "Akun Aktif",
        // The server reports no SATUSEHAT linkage, so the admin must not be
        // shown a sync status and an id that were synthesised here.
        satusehat: "SATUSEHAT belum tersedia",
        avatar: FALLBACK_AVATAR,
      })),
    [patientsData],
  );

  const practitioners: AdminUserListItem[] = useMemo(
    () =>
      (practitionersData?.data || []).map((pr) => ({
        id: pr.id,
        name: pr.fullName || "Data praktisi tidak tersedia",
        identifier: `STR: ${pr.strNumber || "belum terdaftar"} • ${pr.verificationStatus}`,
        // Previously synthesised an address from the display name, so an
        // admin saw a mailbox that had never been issued to anyone.
        email: "email tidak tersedia",
        role: pr.title || "Praktisi",
        sessions: `${pr.totalSessions || 0} Sesi Terlaksana`,
        status:
          pr.verificationStatus === "VERIFIED"
            ? "Terverifikasi Penuh"
            : pr.verificationStatus,
        // `1000${2890 + idx}` was an invented SATUSEHAT nakes id: the row
        // index has nothing to do with any real registration.
        satusehat: "SATUSEHAT belum tersedia",
        avatar: pr.avatar || FALLBACK_AVATAR,
      })),
    [practitionersData],
  );

  const handleSave = () => {
    haptics.success();
    toast.show({
      placement: "top",
      render: ({ id }) => (
        <Toast nativeID={id} action="success">
          <ToastTitle>Pengaturan Berhasil Disimpan</ToastTitle>
          <ToastDescription>
            Parameter tarif, bagi hasil, dan kuota telah diperbarui.
          </ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <AppHeader
        title="Manajemen Pengaturan"
        fallbackRoute={ROUTES.ADMIN.DASHBOARD}
      />

      {/* Tab Switcher */}
      <HStack space="xs" className="px-5">
        <Pressable
          onPress={() => {
            haptics.light();
            setActiveTab("pasien");
          }}
          className={`px-4 py-1.5 rounded-full active:opacity-80 ${
            activeTab === "pasien" ? "bg-primary" : "bg-card"
          }`}
        >
          <Text
            size="xs"
            className={`font-semibold ${
              activeTab === "pasien"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Pasien ({patients.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            haptics.light();
            setActiveTab("praktisi");
          }}
          className={`px-4 py-1.5 rounded-full active:opacity-80 ${
            activeTab === "praktisi" ? "bg-primary" : "bg-card"
          }`}
        >
          <Text
            size="xs"
            className={`font-semibold ${
              activeTab === "praktisi"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Praktisi ({practitioners.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            haptics.light();
            setActiveTab("pengaturan");
          }}
          className={`px-4 py-1.5 rounded-full active:opacity-80 ${
            activeTab === "pengaturan" ? "bg-primary" : "bg-card"
          }`}
        >
          <Text
            size="xs"
            className={`font-semibold ${
              activeTab === "pengaturan"
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            Pengaturan
          </Text>
        </Pressable>
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab !== "pengaturan" ? (
          <AdminUserList
            activeTab={activeTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            users={activeTab === "pasien" ? patients : practitioners}
            onSelectUser={setSelectedUser}
          />
        ) : (
          <AdminConfigSection />
        )}
      </ScrollView>

      {/* Save CTA for Settings */}
      {activeTab === "pengaturan" && (
        <Box className="absolute bottom-6 left-5 right-5 bg-card/90 p-1.5 rounded-full">
          <Button
            size="default"
            onPress={handleSave}
            className="bg-primary py-3.5 rounded-full items-center justify-center active:opacity-90 h-auto"
          >
            <ButtonText className="text-sm font-semibold text-primary-foreground">
              Simpan Pengaturan
            </ButtonText>
          </Button>
        </Box>
      )}

      {/* Pop-up Modal: Detail Akun Pengguna */}
      <UserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </SafeAreaView>
  );
}

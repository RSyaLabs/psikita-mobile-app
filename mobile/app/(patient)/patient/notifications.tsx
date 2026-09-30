import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, CheckCheck } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  DataSourceBanner,
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import {
  NotificationCategoryTabs,
  NotificationItemCard,
} from "@/components/patient/notifications";
import { getCapability } from "@/config/capabilities";
import { DEV_FIXTURE_UNDOCUMENTED_NOTICE } from "@/config/devFixtures";
import { haptics } from "@/utils/haptics";
import { isNotificationActionRoute } from "@/api/notification.service";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants";
import { NotificationDto } from "@/api/notification.service";

const TABS = ["Semua", "Konsultasi", "Resep & Medis", "Pengingat"];

export default function NotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Semua");
  const {
    data: notificationsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useNotifications(activeTab);
  const notificationsCapability = getCapability("notifications");
  const notificationsUnavailable = notificationsCapability === "unavailable";
  const markReadMutation = useMarkNotificationRead(activeTab);
  const markAllMutation = useMarkAllNotificationsRead();

  const notifications = notificationsData || [];
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => haptics.success(),
      onError: () => haptics.error(),
    });
  };

  const handleNotificationPress = (notif: NotificationDto) => {
    if (!isNotificationActionRoute(notif.actionRoute)) {
      haptics.error();
      return;
    }

    haptics.light();
    markReadMutation.mutate(notif.id);
    router.push(notif.actionRoute);
  };

  const isPending = isLoading || isFetching;
  const showDemoBanner =
    notificationsCapability === "demo" &&
    !isPending &&
    !isError &&
    !notificationsUnavailable &&
    notifications.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <Box className="px-5 pt-3.5 pb-2 bg-background border-b border-border/50">
        <HStack space="sm" className="items-center justify-between mb-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Dashboard Pasien"
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Pressable>

          <VStack space="xs" className="items-center">
            <Heading size="sm" bold className="text-foreground">
              Notifikasi
            </Heading>
            {unreadCount > 0 && (
              <Text size="xs" className="text-secondary font-semibold text-[10px]">
                {unreadCount} belum dibaca
              </Text>
            )}
          </VStack>

          {unreadCount > 0 ? (
            <Pressable
              onPress={handleMarkAllRead}
              accessibilityRole="button"
              accessibilityLabel="Tandai semua dibaca"
              className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
            >
              <CheckCheck size={18} className="text-secondary" />
            </Pressable>
          ) : (
            <Box className="w-10" />
          )}
        </HStack>

        <NotificationCategoryTabs
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </Box>

      {/* Main Notification Stream */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {showDemoBanner && (
          <DataSourceBanner
            source="demo"
            label="Mode demo — endpoint tidak ada di kontrak"
            description={DEV_FIXTURE_UNDOCUMENTED_NOTICE}
          />
        )}

        {isPending ? (
          <LoadingState label="Memuat notifikasi..." />
        ) : notificationsUnavailable ? (
          <UnavailableState
            label="Notifikasi Belum Tersedia"
            description="Fitur notifikasi real-time belum aktif pada backend saat ini."
          />
        ) : isError ? (
          <ErrorState
            errorLabel="Gagal Memuat Notifikasi"
            description="Terjadi kendala saat menghubungkan ke pusat notifikasi."
            onRetry={() => refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            label="Belum Ada Notifikasi"
            description={
              activeTab === "Semua"
                ? "Semua notifikasi pengingat sesi dan resep akan muncul di sini."
                : `Tidak ada notifikasi untuk kategori ${activeTab}.`
            }
          />
        ) : (
          <VStack space="sm">
            {notifications.map((item) => (
              <NotificationItemCard
                key={item.id}
                item={item}
                onPress={handleNotificationPress}
              />
            ))}
          </VStack>
        )}
      </ScrollView>

      <PatientTabBar activeTab="beranda" />
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import {
  usePractitioners,
  usePatients,
  useLedgerAccounts,
} from "@/hooks/useApiQueries";
import { safeNavigateBack, formatCompactCurrency } from "@/utils";
import { resolveServerValue } from "@/utils/server-value";
import { AdminKpiGrid, AdminActionList } from "@/components/admin";

// Exact 12 bars from .pen - tokenized highlight states (static constant to avoid re-allocation)
const BAR_DATA = [
  { h: 45, isHighlight: false },
  { h: 60, isHighlight: false },
  { h: 52, isHighlight: false },
  { h: 90, isHighlight: true },
  { h: 65, isHighlight: false },
  { h: 85, isHighlight: true },
  { h: 48, isHighlight: false },
  { h: 55, isHighlight: false },
  { h: 95, isHighlight: true },
  { h: 70, isHighlight: false },
  { h: 62, isHighlight: false },
  { h: 58, isHighlight: false },
] as const;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { data: practitionersData } = usePractitioners();
  const { data: patientsData } = usePatients();
  const { data: accountsData } = useLedgerAccounts();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "7d" | "30d" | "custom"
  >("today");

  // These three used truthiness to pick between server data and a hardcoded
  // number, so a legitimate 0 rendered "89", "1,247" and "Rp 7,2M". The
  // invented figure appeared exactly when the server was telling the truth.
  // No fabricated fallback remains: absent data shows as "-".
  const totalPractitioners = resolveServerValue(
    practitionersData?.data?.length,
    (n) => n.toString(),
  );
  const totalPatients = resolveServerValue(patientsData?.total, (n) =>
    n.toLocaleString("id-ID"),
  );
  const revenueTotal = resolveServerValue(
    accountsData?.data?.[0]?.balance,
    formatCompactCurrency,
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
          <HStack space="md" className="items-center justify-between">
            <HStack space="sm" className="items-center">
              <Pressable
                onPress={() => safeNavigateBack(router, ROUTES.INDEX)}
                accessibilityRole="button"
                accessibilityLabel="Kembali ke Katalog"
                className="p-1 -ml-1 active:opacity-70"
              >
                <ArrowLeft size={22} className="text-primary-foreground" />
              </Pressable>
              <Heading size="xl" className="font-bold text-primary-foreground">
                PsiKita Admin
              </Heading>
            </HStack>
            <Pressable
              onPress={() => router.push(ROUTES.ADMIN.SETTINGS)}
              accessibilityRole="button"
              accessibilityLabel="Pengaturan Admin"
              className="active:opacity-80"
            >
              <Avatar size="sm" className="border border-primary-foreground/20">
                <AvatarImage
                  source={{
                    uri: "https://images.unsplash.com/photo-1750741268857-7e44510f867d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzAzNTZ8&ixlib=rb-4.1.0&q=80&w=1080",
                  }}
                />
                <AvatarFallbackText>AD</AvatarFallbackText>
              </Avatar>
            </Pressable>
          </HStack>
        </Box>

        {/* Date Selector */}
        <HStack space="xs" className="px-5 pt-3 pb-1">
          <Pressable
            onPress={() => setSelectedPeriod("today")}
            className={`px-3 py-1.5 rounded-full active:opacity-80 ${
              selectedPeriod === "today" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              size="xs"
              className={`${
                selectedPeriod === "today"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Hari Ini
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedPeriod("7d")}
            className={`px-3 py-1.5 rounded-full active:opacity-80 ${
              selectedPeriod === "7d" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              size="xs"
              className={`${
                selectedPeriod === "7d"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              7 Hari
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedPeriod("30d")}
            className={`px-3 py-1.5 rounded-full active:opacity-80 ${
              selectedPeriod === "30d" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              size="xs"
              className={`${
                selectedPeriod === "30d"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              30 Hari
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedPeriod("custom")}
            className={`px-3 py-1.5 rounded-full active:opacity-80 ${
              selectedPeriod === "custom" ? "bg-primary" : "bg-card"
            }`}
          >
            <Text
              size="xs"
              className={`${
                selectedPeriod === "custom"
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              Pilih Tanggal
            </Text>
          </Pressable>
        </HStack>

        {/* Modular KPI Grid */}
        <AdminKpiGrid
          totalPatients={totalPatients}
          totalPractitioners={totalPractitioners}
          todaySessions="156"
          revenueTotal={revenueTotal}
        />

        {/* Chart Section */}
        <Box className="px-5 pt-3">
          <Card className="bg-card p-4 rounded-2xl border border-border">
            <VStack space="sm">
              <Text size="md" className="font-semibold text-foreground">
                Tren Sesi Harian
              </Text>

              {/* Bar Chart 12 bars */}
              <Box className="h-28 flex-row items-end justify-between px-1 pt-4 pb-2">
                {BAR_DATA.map((item, idx) => (
                  <Box
                    key={idx}
                    style={{ height: item.h }}
                    className={`w-4 rounded-t-sm ${
                      item.isHighlight ? "bg-primary" : "bg-secondary/40"
                    }`}
                  />
                ))}
              </Box>

              {/* Chart Axis */}
              <Text
                size="xs"
                className="text-[10px] text-muted-foreground text-center tracking-wider"
              >
                Sen Sel Rab Kam Jum Sab Min
              </Text>
            </VStack>
          </Card>
        </Box>

        {/* Modular Alert & Quick Navigation List */}
        <AdminActionList />
      </ScrollView>
    </SafeAreaView>
  );
}

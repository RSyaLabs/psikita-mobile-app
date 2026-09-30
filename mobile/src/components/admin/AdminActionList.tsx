import React from "react";
import { useRouter } from "expo-router";
import {
  ShieldCheck,
  Building,
  Users,
  BarChart3,
  Settings,
  ChevronRight,
} from "lucide-react-native";
import {
  Box,
  Text,
  Card,
  VStack,
  HStack,
  Pressable,
  Badge,
  BadgeText,
} from "@/components/ui";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";

export function AdminActionList() {
  const router = useRouter();

  return (
    <>
      {/* Alert List */}
      <VStack space="xs" className="px-5 pt-3">
        {/* Alert 1 */}
        <Pressable
          onPress={() => {
            haptics.medium();
            router.push(ROUTES.ADMIN.VERIFICATION);
          }}
          accessibilityRole="button"
          accessibilityLabel="3 dokumen praktisi menunggu verifikasi"
          className="active:opacity-80"
        >
          <Card className="bg-destructive/10 p-3 rounded-xl border border-destructive/20 flex-row items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <Box className="w-2.5 h-2.5 rounded-full bg-destructive" />
              <Text size="xs" className="text-foreground flex-1">
                3 dokumen praktisi menunggu verifikasi
              </Text>
            </HStack>
            <ChevronRight size={14} className="text-destructive" />
          </Card>
        </Pressable>

        {/* Alert 2 */}
        <Pressable
          onPress={() => {
            haptics.medium();
            router.push(ROUTES.ADMIN.LEDGER);
          }}
          accessibilityRole="button"
          accessibilityLabel="2 pengajuan refund menunggu persetujuan"
          className="active:opacity-80"
        >
          <Card className="bg-warning/15 p-3 rounded-xl border border-warning/30 flex-row items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <Box className="w-2.5 h-2.5 rounded-full bg-warning" />
              <Text size="xs" className="text-foreground flex-1">
                2 pengajuan refund menunggu persetujuan
              </Text>
            </HStack>
            <ChevronRight size={14} className="text-warning" />
          </Card>
        </Pressable>

        {/* Alert 3 */}
        <Pressable
          onPress={() => {
            haptics.medium();
            router.push(ROUTES.ADMIN.SETTINGS);
          }}
          accessibilityRole="button"
          accessibilityLabel="5 praktisi baru mendaftar hari ini"
          className="active:opacity-80"
        >
          <Card className="bg-muted p-3 rounded-xl border border-border flex-row items-center justify-between">
            <HStack space="sm" className="items-center flex-1">
              <Box className="w-2.5 h-2.5 rounded-full bg-primary" />
              <Text size="xs" className="text-foreground flex-1">
                5 praktisi baru mendaftar hari ini
              </Text>
            </HStack>
            <ChevronRight size={14} className="text-muted-foreground" />
          </Card>
        </Pressable>
      </VStack>

      {/* Quick Nav */}
      <VStack space="xs" className="px-5 pt-3">
        {/* Verifikasi Dokumen */}
        <Card className="bg-card p-3.5 rounded-2xl border border-border">
          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.VERIFICATION)}
            accessibilityRole="button"
            accessibilityLabel="Buka Verifikasi Dokumen"
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center">
              <ShieldCheck size={20} className="text-destructive" />
              <Text size="sm" className="font-semibold text-foreground">
                Verifikasi Dokumen
              </Text>
            </HStack>
            <Badge className="bg-destructive px-2 py-0.5 rounded-full border-0">
              <BadgeText className="text-[11px] font-bold text-destructive-foreground">
                3
              </BadgeText>
            </Badge>
          </Pressable>
        </Card>

        {/* Ledger & Keuangan */}
        <Card className="bg-card p-3.5 rounded-2xl border border-border">
          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.LEDGER)}
            accessibilityRole="button"
            accessibilityLabel="Buka Keuangan"
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center">
              <Building size={20} className="text-secondary" />
              <Text size="sm" className="font-semibold text-foreground">
                Keuangan
              </Text>
            </HStack>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>

        {/* Manajemen Pengguna */}
        <Card className="bg-card p-3.5 rounded-2xl border border-border">
          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.SETTINGS)}
            accessibilityRole="button"
            accessibilityLabel="Buka Manajemen Pengguna"
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center">
              <Users size={20} className="text-secondary" />
              <Text size="sm" className="font-semibold text-foreground">
                Manajemen Pengguna
              </Text>
            </HStack>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>

        {/* Laporan & Analitik */}
        <Card className="bg-card p-3.5 rounded-2xl border border-border">
          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.LEDGER)}
            accessibilityRole="button"
            accessibilityLabel="Buka Laporan dan Analitik"
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center">
              <BarChart3 size={20} className="text-secondary" />
              <Text size="sm" className="font-semibold text-foreground">
                Laporan & Analitik
              </Text>
            </HStack>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>

        {/* Pengaturan Platform */}
        <Card className="bg-card p-3.5 rounded-2xl border border-border">
          <Pressable
            onPress={() => router.push(ROUTES.ADMIN.SETTINGS)}
            accessibilityRole="button"
            accessibilityLabel="Buka Pengaturan Platform"
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center">
              <Settings size={20} className="text-muted-foreground" />
              <Text size="sm" className="font-semibold text-foreground">
                Pengaturan Platform
              </Text>
            </HStack>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Pressable>
        </Card>
      </VStack>
    </>
  );
}

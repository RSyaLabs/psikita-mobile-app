import React from "react";
import { useRouter } from "expo-router";
import { Card, HStack, Pressable, Text, VStack } from "@/components/ui";
import { ROUTES } from "@/constants";
import { haptics } from "@/utils/haptics";
import { Platform } from "react-native";

export function LauncherQuickRoles() {
  const router = useRouter();

  return (
    <Card className="bg-card rounded-2xl p-3 border border-border mb-4">
      <VStack space="xs">
        <Text
          size="xs"
          className="font-semibold text-muted-foreground text-[11px]"
        >
          Akses Cepat Beranda Role:
        </Text>
        <HStack space="xs" className="items-center">
          <Pressable
            onPress={() => {
              haptics.selection();
              router.push(ROUTES.AUTH.LOGIN);
            }}
            className="flex-1 py-2 px-1.5 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center active:opacity-75"
          >
            <Text
              size="xs"
              className="font-bold text-primary text-[11px]"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              🔑 Masuk
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.selection();
              router.push(ROUTES.PATIENT.DASHBOARD);
            }}
            className="flex-1 py-2 px-1.5 rounded-xl bg-secondary/15 border border-secondary/20 items-center justify-center active:opacity-75"
          >
            <Text
              size="xs"
              className="font-bold text-secondary text-[11px]"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              👤 Pasien
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.selection();
              router.push(ROUTES.PRACTITIONER.DASHBOARD);
            }}
            className="flex-1 py-2 px-1.5 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center active:opacity-75"
          >
            <Text
              size="xs"
              className="font-bold text-primary text-[11px]"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              🩺 Praktisi
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.selection();
              router.push(ROUTES.ADMIN.DASHBOARD);
            }}
            className="flex-1 py-2 px-1.5 rounded-xl bg-muted border border-border items-center justify-center active:opacity-75"
          >
            <Text
              size="xs"
              className="font-bold text-foreground text-[11px]"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              🛡️ Admin
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    </Card>
  );
}

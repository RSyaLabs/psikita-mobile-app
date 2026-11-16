import React, { useEffect } from "react";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, ShieldCheck, HeartHandshake, LockKeyhole } from "lucide-react-native";
import { Box, Text, Heading, VStack, HStack, Pressable, Button, ButtonText, ScrollView } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { status, homeRoute } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      router.replace(homeRoute as any);
    }
  }, [status, homeRoute, router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" className="w-full max-w-[440px] self-center">
          <HStack space="sm" className="items-center">
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 48, height: 48, borderRadius: 12 }}
              resizeMode="contain"
            />
            <VStack space="xs">
              <Heading level={1} size="xl" bold className="text-foreground">
                SeraPhany
              </Heading>
              <Text className="text-sm text-muted-foreground">Temukan dirimu, satu cerita setiap kali.</Text>
            </VStack>
          </HStack>

          <VStack space="md" className="pt-8 pb-4">
            <Heading level={2} size="3xl" bold className="text-foreground leading-tight">
              Ruang aman untuk kesehatan mentalmu.
            </Heading>
            <Text className="text-base text-muted-foreground leading-relaxed">
              Mulai dengan memahami kondisimu, lalu pilih dukungan yang sesuai dengan kebutuhanmu.
            </Text>
          </VStack>

          <VStack space="md" className="border-t border-border pt-6">
            <HStack space="md" className="items-center">
              <ShieldCheck size={22} className="text-primary" />
              <Text className="flex-1 text-sm text-foreground">Privasi dan data kesehatanmu menjadi prioritas.</Text>
            </HStack>
            <HStack space="md" className="items-center">
              <HeartHandshake size={22} className="text-primary" />
              <Text className="flex-1 text-sm text-foreground">Dukungan dari praktisi sesuai kebutuhanmu.</Text>
            </HStack>
            <HStack space="md" className="items-center">
              <LockKeyhole size={22} className="text-primary" />
              <Text className="flex-1 text-sm text-foreground">Masuk untuk melanjutkan layanan dengan aman.</Text>
            </HStack>
          </VStack>
        </VStack>

        <VStack space="sm" className="w-full max-w-[440px] self-center pt-12">
          <Button
            size="lg"
            onPress={() => {
              haptics.light();
              router.push(ROUTES.AUTH.SIGN_IN as any);
            }}
            className="w-full h-[52px] rounded-xl bg-primary flex-row justify-center items-center"
          >
            <ButtonText className="font-bold text-base text-primary-foreground">Masuk ke Akun</ButtonText>
            <ArrowRight size={18} color="#FFFFFF" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onPress={() => {
              haptics.light();
              router.push(ROUTES.AUTH.REGISTER as any);
            }}
            className="w-full h-[52px] rounded-xl border border-border bg-card"
          >
            <ButtonText className="font-semibold text-base text-foreground">Buat Akun</ButtonText>
          </Button>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              haptics.light();
              router.push({
                pathname: ROUTES.PATIENT.TRIAGE,
                params: { guest: "true" },
              } as any);
            }}
            className="py-3 items-center"
          >
            <Text className="font-semibold text-primary">Cek kondisi tanpa masuk</Text>
          </Pressable>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

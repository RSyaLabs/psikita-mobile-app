import React, { useEffect } from "react";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";
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
              
            </VStack>
          </HStack>

          <VStack space="sm" className="pt-16 pb-6">
            <Heading level={2} size="3xl" bold className="text-foreground leading-tight">
              Temukan ruang untuk dirimu.
            </Heading>
            <Text className="text-base text-muted-foreground">
              Mulai dari langkah yang paling nyaman.
            </Text>
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

        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

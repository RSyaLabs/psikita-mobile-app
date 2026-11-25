import React from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import { Text, Heading, VStack, HStack, Box, Button, ButtonText, ScrollView, Pressable } from "@/components/ui";
import { useAuth, getHomeRouteForRole } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { colors } from "@/theme/colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, ShieldCheck, HeartHandshake, Stethoscope } from "lucide-react-native";

export default function IndexGatewayScreen() {
  const router = useRouter();
  const { preview, guest, view } = useLocalSearchParams<{
    preview?: string;
    guest?: string;
    view?: string;
  }>();
  const { status, user, isAuthenticated } = useAuth();

  const isPublicPreview = Boolean(__DEV__) || preview === "true" || guest === "true";

  // Screen 1: Peta Alur Sebab-Akibat
  if (isPublicPreview && view === "peta") {
    return (
      <SafeAreaView className="flex-1 bg-[#FAF8F5]">
        <ScrollView className="flex-1 px-5 py-4">
          <VStack space="md" className="pb-10">
            <Box className="border-b border-[#EBE7E0] pb-3">
              <Heading size="xl" bold className="text-[#262130]">
                Peta Alur Sebab-Akibat
              </Heading>
              <Text size="sm" className="text-[#75618E] mt-1">
                Arsitektur & alur end-to-end layanan kesehatan jiwa SeraPhany
              </Text>
            </Box>

            <VStack space="sm">
              <Box className="p-4 rounded-xl bg-white border border-[#EBE7E0] shadow-sm">
                <HStack space="sm" className="items-center">
                  <ShieldCheck size={20} color="#4A3B6B" />
                  <Heading size="md" className="text-[#262130] font-bold">
                    1. Autentikasi & Verifikasi Identitas
                  </Heading>
                </HStack>
                <Text size="sm" className="text-[#555060] mt-1">
                  Pendaftaran akun aman, verifikasi OTP, & verifikasi identitas e-KTP untuk perlindungan rekam medis.
                </Text>
              </Box>

              <Box className="p-4 rounded-xl bg-white border border-[#EBE7E0] shadow-sm">
                <HStack space="sm" className="items-center">
                  <HeartHandshake size={20} color="#4A3B6B" />
                  <Heading size="md" className="text-[#262130] font-bold">
                    2. Triase Klinis & Matching
                  </Heading>
                </HStack>
                <Text size="sm" className="text-[#555060] mt-1">
                  Skrining cepat PHQ-9 & GAD-7, alur krisis darurat, matching otomatis ke psikolog tersertifikasi.
                </Text>
              </Box>

              <Box className="p-4 rounded-xl bg-white border border-[#EBE7E0] shadow-sm">
                <HStack space="sm" className="items-center">
                  <Stethoscope size={20} color="#4A3B6B" />
                  <Heading size="md" className="text-[#262130] font-bold">
                    3. Konsultasi & Portal Praktisi
                  </Heading>
                </HStack>
                <Text size="sm" className="text-[#555060] mt-1">
                  Ruang sesi terenkripsi, war room penawaran kasus, perpanjangan waktu, & diagnosis care plan.
                </Text>
              </Box>
            </VStack>

            <Button
              className="w-full bg-[#4A3B6B] rounded-xl py-3.5 mt-2"
              onPress={() => router.push(ROUTES.AUTH.LOGIN as any)}
            >
              <ButtonText className="text-white font-semibold text-center text-base">
                Lanjut ke Halaman Masuk
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Screen 2: MS1 · Halaman Awal (shown for public preview OR unauthenticated landing)
  if (!isPublicPreview && status === "loading") {
    return (
      <View
        className="flex-1 items-center justify-center bg-background px-6"
        style={{ backgroundColor: colors.sera.cream }}
      >
        <VStack space="lg" className="items-center">
          <Box className="w-24 h-24 rounded-3xl overflow-hidden items-center justify-center bg-card border border-border">
            <Image
              source={require("../assets/icon.png")}
              style={{ width: 76, height: 76 }}
              resizeMode="contain"
            />
          </Box>
          <VStack space="xs" className="items-center">
            <Heading size="2xl" bold className="text-foreground tracking-tight">
              SeraPhany
            </Heading>
            <Text size="sm" className="text-muted-foreground text-center">
              Ruang aman untuk bercerita
            </Text>
          </VStack>
          <Box className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color={colors.sera.purple} />
            <Text size="sm" className="text-muted-foreground">
              Menyiapkan ruang aman...
            </Text>
          </Box>
        </VStack>
      </View>
    );
  }

  if (!isPublicPreview && isAuthenticated && user) {
    const targetRoute = getHomeRouteForRole(user.role);
    return <Redirect href={targetRoute as any} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5] justify-between px-6 py-8">
      <Box className="flex-1 items-center justify-center">
        <Box className="w-24 h-24 rounded-3xl overflow-hidden items-center justify-center bg-white border border-[#EBE7E0] shadow-sm mb-6">
          <Image
            source={require("../assets/icon.png")}
            style={{ width: 76, height: 76 }}
            resizeMode="contain"
          />
        </Box>
        <Heading size="2xl" bold className="text-[#262130] tracking-tight text-center">
          SeraPhany
        </Heading>
        <Text size="md" className="text-[#75618E] text-center mt-2 max-w-xs">
          Ruang aman untuk bercerita dan mendapatkan bantuan psikologis terpercaya.
        </Text>
      </Box>

      <VStack space="md" className="w-full max-w-sm self-center pb-4">
        <Button
          className="w-full bg-[#4A3B6B] rounded-xl py-3.5"
          onPress={() => router.push(ROUTES.AUTH.LOGIN as any)}
        >
          <ButtonText className="text-white font-semibold text-center text-base">
            Masuk dengan Akun
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="w-full border-[#4A3B6B] rounded-xl py-3.5"
          onPress={() => router.push(ROUTES.AUTH.REGISTER as any)}
        >
          <ButtonText className="text-[#4A3B6B] font-semibold text-center text-base">
            Daftar Pasien Baru
          </ButtonText>
        </Button>
      </VStack>
    </SafeAreaView>
  );
}

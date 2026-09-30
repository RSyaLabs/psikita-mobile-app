import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Lock, KeyRound } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
  ScrollView,
} from "@/components/ui";
import { AuthLoginModal, RegisterPatientModal } from "@/components/modals";
import { LoginHeroCarousel, GoogleIcon } from "@/components/auth";
import { haptics } from "@/utils/haptics";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const router = useRouter();
  const { status, homeRoute } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  // Auth Modals State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<
    "login" | "forgot_request" | "forgot_verify"
  >("login");
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      router.replace(homeRoute as any);
    }
  }, [status, homeRoute, router]);

  useEffect(() => {
    if (mode === "register") {
      setShowRegisterModal(true);
    }
  }, [mode]);

  const handleCheckCondition = () => {
    haptics.medium();
    router.push(ROUTES.PATIENT.TRIAGE);
  };

  const handleGoogleLogin = () => {
    haptics.selection();
    setLoginModalTab("login");
    setLoginErrorMsg(
      "Login Google belum tersedia. Gunakan email dan kata sandi.",
    );
    setShowLoginModal(true);
  };

  const handleOpenAccountLogin = () => {
    haptics.light();
    setLoginModalTab("login");
    setLoginErrorMsg(null);
    setShowLoginModal(true);
  };

  const handleOpenForgotPassword = () => {
    haptics.light();
    setLoginModalTab("forgot_request");
    setLoginErrorMsg(null);
    setShowLoginModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 48,
          flexGrow: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="w-full max-w-[440px] flex-1 justify-between">
          <Box>
            {/* Top Meta: Brand Row & Trust Badge */}
            <Box className="mb-3.5">
              <HStack space="sm" className="items-center mb-1">
                <Box className="w-8 h-8 bg-primary rounded-xl items-center justify-center">
                  <Lock size={16} className="text-primary-foreground" />
                </Box>
                <Heading
                  level={1}
                  size="xl"
                  bold
                  className="text-foreground tracking-tight"
                >
                  PsiKita
                </Heading>
              </HStack>
              <Text
                size="xs"
                className="text-muted-foreground font-medium pl-0.5"
              >
                Layanan Konsultasi Kesehatan Mental
              </Text>
            </Box>

            {/* Hero Carousel Zone */}
            <LoginHeroCarousel />
          </Box>

          {/* CTA Block */}
          <VStack space="sm" className="pt-4 pb-2 w-full">
            <Button
              size="lg"
              onPress={handleCheckCondition}
              className="w-full h-[52px] rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center"
            >
              <ButtonText className="text-primary-foreground font-bold text-base tracking-wide">
                Cari Tahu Kondisimu
              </ButtonText>
              <ButtonIcon
                as={ArrowRight}
                className="text-primary-foreground ml-1"
              />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={handleGoogleLogin}
              className="w-full h-[50px] rounded-2xl border border-border bg-card active:bg-muted flex-row items-center justify-center"
            >
              <GoogleIcon size={18} />
              <ButtonText className="text-foreground font-semibold text-sm ml-2.5">
                Lanjutkan dengan Google
              </ButtonText>
            </Button>

            <HStack className="items-center my-2 w-full">
              <Box className="flex-1 h-[1px] bg-border" />
              <Text
                size="xs"
                className="px-3 text-muted-foreground font-medium"
              >
                atau
              </Text>
              <Box className="flex-1 h-[1px] bg-border" />
            </HStack>

            <Button
              variant="outline"
              size="lg"
              onPress={handleOpenAccountLogin}
              className="w-full h-[48px] rounded-2xl border border-border bg-card active:bg-muted flex-row items-center justify-center"
            >
              <KeyRound size={16} className="text-foreground mr-2" />
              <ButtonText className="text-foreground font-semibold text-sm">
                Masuk dengan Akun
              </ButtonText>
            </Button>

            <Pressable
              onPress={handleOpenForgotPassword}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="pt-2 items-center"
            >
              <Text size="xs" className="text-secondary font-semibold text-xs">
                Lupa kata sandi?
              </Text>
            </Pressable>

            <VStack
              space="xs"
              className="items-center justify-center pt-3 pb-2"
            >
              <HStack space="xs" className="items-center">
                <Text size="xs" className="text-muted-foreground font-medium">
                  Belum punya akun?
                </Text>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setShowRegisterModal(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text size="xs" bold className="text-primary underline">
                    Daftar Pasien Baru
                  </Text>
                </Pressable>
              </HStack>

              <HStack space="xs" className="items-center pt-1">
                <Text size="xs" className="text-muted-foreground font-medium">
                  Tertarik praktik di PsiKita?
                </Text>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    router.push(ROUTES.PRACTITIONER.REGISTER);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text size="xs" bold className="text-primary underline">
                    Daftar Mitra Praktisi
                  </Text>
                </Pressable>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>

      {/* Modular Auth Modals */}
      <AuthLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        initialTab={loginModalTab}
        initialErrorMsg={loginErrorMsg}
        onOpenRegister={() => setShowRegisterModal(true)}
      />

      <RegisterPatientModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onOpenLogin={() => {
          setLoginModalTab("login");
          setLoginErrorMsg(null);
          setShowLoginModal(true);
        }}
      />
    </SafeAreaView>
  );
}

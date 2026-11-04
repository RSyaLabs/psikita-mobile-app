import React, { useState, useEffect } from "react";
import { Image } from "react-native";
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
import { LoginHeroCarousel } from "@/components/auth";
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

  const [authFeedback, setAuthFeedback] = useState<{
    type: "info" | "error";
    message: string;
  } | null>(null);

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
    router.push({
      pathname: ROUTES.PATIENT.TRIAGE,
      params: { guest: "true" },
    } as any);
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
            {/* Top Meta: Official Brand Logo & Identity */}
            <Box className="mb-4">
              <HStack space="md" className="items-center mb-1">
                <Image
                  source={require("../../assets/icon.png")}
                  style={{ width: 44, height: 44, borderRadius: 12 }}
                  resizeMode="contain"
                />
                <VStack>
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    SeraPhany
                  </Heading>
                  <Text className="text-sm font-semibold text-muted-foreground">
                    Ruang aman untuk bercerita
                  </Text>
                </VStack>
              </HStack>
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

            {authFeedback && (
              <Box
                className={`w-full p-3 rounded-xl border flex-row items-center justify-between ${
                  authFeedback.type === "error"
                    ? "bg-destructive/10 border-destructive/20"
                    : "bg-muted border-border"
                }`}
              >
                <Text
                  size="sm"
                  className={`font-medium flex-1 ${
                    authFeedback.type === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {authFeedback.message}
                </Text>
                <Pressable
                  onPress={() => setAuthFeedback(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="ml-2 p-1"
                >
                  <Text
                    size="sm"
                    className={`font-bold ${
                      authFeedback.type === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    ✕
                  </Text>
                </Pressable>
              </Box>
            )}

            <Button
              variant="outline"
              size="lg"
              onPress={handleOpenAccountLogin}
              className="w-full h-[52px] rounded-2xl border border-border bg-card active:bg-muted flex-row items-center justify-center mt-1"
            >
              <KeyRound size={20} className="text-foreground mr-2" />
              <ButtonText className="text-foreground font-bold text-base">
                Masuk dengan Akun
              </ButtonText>
            </Button>

            <Pressable
              onPress={handleOpenForgotPassword}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="pt-2.5 items-center"
            >
              <Text className="text-sm text-primary font-bold">
                Lupa kata sandi?
              </Text>
            </Pressable>

            <VStack
              space="xs"
              className="items-center justify-center pt-3 pb-2"
            >
              <HStack space="xs" className="items-center">
                <Text className="text-sm text-muted-foreground font-medium">
                  Belum punya akun?
                </Text>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setShowRegisterModal(true);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text className="text-sm font-bold text-primary underline">
                    Daftar Akun Baru
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

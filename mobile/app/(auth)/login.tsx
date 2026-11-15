import React, { useState, useEffect } from "react";
import { Image, Linking, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
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
  ButtonSpinner,
  Input,
  InputField,
  InputSlot,
  InputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  ScrollView,
} from "@/components/ui";
import { LoginHeroCarousel } from "@/components/auth";
import { haptics } from "@/utils/haptics";
import { useAuth, getHomeRouteForResponse } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function LoginScreen() {
  const router = useRouter();
  const { status, homeRoute, acceptSession } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  // View state: "welcome" | "login"
  const [currentView, setCurrentView] = useState<"welcome" | "login">(
    mode === "login" ? "login" : "welcome",
  );

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      router.replace(homeRoute as any);
    }
  }, [status, homeRoute, router]);

  useEffect(() => {
    if (mode === "login") {
      setCurrentView("login");
    } else if (mode === "register") {
      router.replace(ROUTES.AUTH.REGISTER as any);
    }
  }, [mode, router]);

  const handleCheckCondition = () => {
    haptics.medium();
    router.push({
      pathname: ROUTES.PATIENT.TRIAGE,
      params: { guest: "true" },
    } as any);
  };

  const handleOpenAccountLogin = () => {
    haptics.light();
    setLoginErrorMsg(null);
    setCurrentView("login");
  };

  const handleBackToWelcome = () => {
    haptics.light();
    setLoginErrorMsg(null);
    setCurrentView("welcome");
  };

  const handleCredentialLogin = async () => {
    haptics.medium();
    setLoginErrorMsg(null);

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setLoginErrorMsg("Silakan lengkapi username/email dan kata sandi.");
      haptics.error();
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        username: normalizedUsername,
        password,
      });

      haptics.success();
      await acceptSession(response);
      const targetRoute = getHomeRouteForResponse(response);
      router.replace(targetRoute as any);
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setLoginErrorMsg(
            "Kredensial tidak valid. Periksa kembali email dan kata sandi Anda.",
          );
        } else if (err.statusCode === 403) {
          setLoginErrorMsg(
            "Akun belum aktif. Silakan periksa inbox email Anda untuk aktivasi akun.",
          );
        } else {
          setLoginErrorMsg(
            err.message || "Gagal masuk ke akun. Silakan coba lagi.",
          );
        }
      } else {
        setLoginErrorMsg("Terjadi kendala jaringan saat menghubungi server.");
      }
    }
  };

  const openUrl = (url: string) => {
    haptics.light();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {currentView === "welcome" ? (
          /* ================================================================= */
          /*                       WELCOME / LANDING VIEW                      */
          /* ================================================================= */
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 40,
              flexGrow: 1,
              justifyContent: "space-between",
              alignItems: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            <Box className="w-full max-w-[440px] flex-1 justify-between">
              <Box>
                {/* Brand Logo & Header */}
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

              {/* CTA Action Block */}
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
                  onPress={handleOpenAccountLogin}
                  className="w-full h-[52px] rounded-2xl border border-border bg-card active:bg-muted flex-row items-center justify-center mt-1"
                >
                  <KeyRound size={20} className="text-foreground mr-2" />
                  <ButtonText className="text-foreground font-bold text-base">
                    Masuk dengan Akun
                  </ButtonText>
                </Button>

                <Pressable
                  onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD as any)}
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
                        router.push(ROUTES.AUTH.REGISTER as any);
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
        ) : (
          /* ================================================================= */
          /*              FULL-SCREEN CLEAN LOGIN VIEW (LIKE X / IG)          */
          /* ================================================================= */
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 40,
              flexGrow: 1,
              justifyContent: "space-between",
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <VStack space="lg" className="w-full max-w-[440px] self-center">
              {/* Clean Top Navigation Bar */}
              <HStack space="sm" className="items-center justify-between pt-1 pb-2">
                <Pressable
                  onPress={handleBackToWelcome}
                  accessibilityRole="button"
                  accessibilityLabel="Kembali ke halaman utama"
                  className="w-10 h-10 rounded-full border border-border bg-card items-center justify-center active:bg-muted"
                >
                  <ArrowLeft size={20} className="text-foreground" />
                </Pressable>
                <HStack space="xs" className="items-center">
                  <Image
                    source={require("../../assets/icon.png")}
                    style={{ width: 28, height: 28, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                  <Text className="text-sm font-bold text-foreground">
                    SeraPhany
                  </Text>
                </HStack>
                <Box className="w-10" />
              </HStack>

              {/* Title & Context */}
              <VStack space="xs" className="pt-2">
                <Heading
                  level={1}
                  size="2xl"
                  bold
                  className="text-foreground tracking-tight"
                >
                  Masuk ke Akun
                </Heading>
                <Text className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Selamat datang kembali. Masuk untuk melanjutkan konsultasi Anda di ruang aman.
                </Text>
              </VStack>

              {/* Error Banner */}
              {loginErrorMsg && (
                <Box className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex-row items-center gap-2.5">
                  <Text className="text-sm text-destructive font-semibold flex-1 leading-relaxed">
                    {loginErrorMsg}
                  </Text>
                </Box>
              )}

              {/* Credentials Form */}
              <VStack space="md" className="pt-1">
                <FormControl>
                  <FormControlLabel className="mb-1.5">
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Username atau Email
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Masukkan username atau email"
                      placeholderTextColor="#8C829D"
                      value={username}
                      onChangeText={(val) => {
                        setUsername(val);
                        if (loginErrorMsg) setLoginErrorMsg(null);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      returnKeyType="next"
                      className="text-sm text-foreground"
                    />
                  </Input>
                </FormControl>

                <FormControl>
                  <HStack space="xs" className="items-center justify-between mb-1.5">
                    <FormControlLabel>
                      <FormControlLabelText className="text-sm font-bold text-foreground">
                        Kata Sandi
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Pressable
                      onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD as any)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-sm text-primary font-bold">
                        Lupa kata sandi?
                      </Text>
                    </Pressable>
                  </HStack>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Masukkan kata sandi"
                      placeholderTextColor="#8C829D"
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (loginErrorMsg) setLoginErrorMsg(null);
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleCredentialLogin}
                      className="text-sm text-foreground flex-1"
                    />
                    <InputSlot
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-2"
                    >
                      <InputIcon
                        as={showPassword ? EyeOff : Eye}
                        className="text-muted-foreground"
                      />
                    </InputSlot>
                  </Input>
                </FormControl>

                <Button
                  size="lg"
                  disabled={isLoading}
                  onPress={handleCredentialLogin}
                  className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3"
                >
                  {isLoading ? (
                    <ButtonSpinner className="text-primary-foreground" />
                  ) : (
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Masuk Sekarang
                    </ButtonText>
                  )}
                </Button>
              </VStack>

              {/* Register Link */}
              <VStack space="xs" className="items-center pt-2">
                <HStack space="xs" className="items-center">
                  <Text className="text-sm text-muted-foreground font-medium">
                    Belum punya akun?
                  </Text>
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push(ROUTES.AUTH.REGISTER as any);
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

            {/* Official Legal Footer */}
            <VStack space="xs" className="w-full max-w-[440px] self-center items-center pt-8">
              <Text className="text-sm text-muted-foreground text-center leading-relaxed">
                Dengan masuk, Anda menyetujui{" "}
                <Text
                  onPress={() => openUrl("https://staging.seraphany.id/syarat-layanan")}
                  className="text-sm text-primary font-bold underline"
                >
                  Syarat Layanan
                </Text>{" "}
                dan{" "}
                <Text
                  onPress={() => openUrl("https://staging.seraphany.id/kebijakan-privasi")}
                  className="text-sm text-primary font-bold underline"
                >
                  Kebijakan Privasi
                </Text>{" "}
                SeraPhany.
              </Text>
              <HStack space="xs" className="items-center mt-1">
                <Text
                  onPress={() => openUrl("https://staging.seraphany.id/en/terms-of-service")}
                  className="text-sm text-muted-foreground underline"
                >
                  Terms of Service (EN)
                </Text>
                <Text className="text-sm text-muted-foreground">•</Text>
                <Text
                  onPress={() => openUrl("https://staging.seraphany.id/en/privacy-policy")}
                  className="text-sm text-muted-foreground underline"
                >
                  Privacy Policy (EN)
                </Text>
              </HStack>
            </VStack>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from "react";
import { Image, Linking, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  HeartPulse,
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
import { haptics } from "@/utils/haptics";
import { useAuth, getHomeRouteForResponse } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function LoginScreen() {
  const router = useRouter();
  const { status, homeRoute, acceptSession } = useAuth();
  const { redirect, triageId } = useLocalSearchParams<{
    redirect?: string;
    triageId?: string;
  }>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  useEffect(() => {
    if (status === "authenticated" && homeRoute) {
      if (triageId) {
        router.replace({
          pathname: ROUTES.PATIENT.MATCHING,
          params: { triageId },
        } as any);
      } else if (redirect) {
        router.replace(redirect as any);
      } else {
        router.replace(homeRoute as any);
      }
    }
  }, [status, homeRoute, redirect, triageId, router]);

  const handleBack = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.INDEX as any);
    }
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

      if (triageId) {
        router.replace({
          pathname: ROUTES.PATIENT.MATCHING,
          params: { triageId },
        } as any);
      } else if (redirect) {
        router.replace(redirect as any);
      } else {
        const targetRoute = getHomeRouteForResponse(response);
        router.replace(targetRoute as any);
      }
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

  const handleGuestTriage = () => {
    haptics.light();
    router.push({
      pathname: ROUTES.PATIENT.TRIAGE,
      params: { guest: "true" },
    } as any);
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
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Back Button */}
          <Box className="w-full max-w-[480px] md:max-w-[540px] self-center">
            <HStack className="items-center justify-between pb-6">
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={20} className="text-foreground" />
              </Pressable>
              <HStack space="xs" className="items-center">
                <Image
                  source={require("../../assets/icon.png")}
                  style={{ width: 28, height: 28, borderRadius: 8 }}
                  resizeMode="contain"
                />
                <Text className="text-base font-bold text-foreground">
                  SeraPhany
                </Text>
              </HStack>
              <Box className="w-10" />
            </HStack>

            {/* Title & Context */}
            <VStack space="xs" className="pt-2 pb-6">
              <Heading
                level={1}
                size="2xl"
                bold
                className="text-foreground tracking-tight"
              >
                Masuk ke Akun
              </Heading>
              <Text className="text-sm text-muted-foreground leading-relaxed">
                Akses konsultasi psikolog, riwayat triage, dan ruang aman Anda.
              </Text>
            </VStack>

            {/* Error Banner */}
            {loginErrorMsg && (
              <Box className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-2xl mb-4">
                <Text className="text-sm text-destructive font-medium leading-relaxed">
                  {loginErrorMsg}
                </Text>
              </Box>
            )}

            {/* Form Inputs */}
            <VStack space="md">
              {/* Username / Email */}
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-bold text-foreground">
                    Username atau Email
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-12 rounded-2xl border-border bg-card px-3">
                  <InputField
                    placeholder="nama@email.com atau username"
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
                    className="text-sm text-foreground flex-1"
                  />
                  <InputSlot className="pr-2">
                    <InputIcon as={Mail} className="text-muted-foreground" />
                  </InputSlot>
                </Input>
              </FormControl>

              {/* Password */}
              <FormControl isRequired>
                <HStack className="items-center justify-between">
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Kata Sandi
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: ROUTES.AUTH.FORGOT_PASSWORD,
                        params: { mode: "reset" },
                      } as any)
                    }
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

              {/* Submit Button */}
              <Button
                size="lg"
                disabled={isLoading}
                onPress={handleCredentialLogin}
                className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-2"
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

            {/* Divider atau Masuk dengan Kode OTP (Wireframe MS2) */}
            <VStack space="sm" className="pt-5 items-center">
              <HStack space="sm" className="items-center w-full">
                <Box className="flex-1 h-[1px] bg-border" />
                <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  atau
                </Text>
                <Box className="flex-1 h-[1px] bg-border" />
              </HStack>

              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push({
                    pathname: ROUTES.AUTH.FORGOT_PASSWORD,
                    params: { mode: "otp" },
                  } as any);
                }}
                className="w-full h-12 rounded-2xl bg-card border border-border items-center justify-center flex-row gap-2 active:bg-muted mt-1"
              >
                <Mail size={18} color="#262130" />
                <Text className="text-sm font-bold text-foreground">
                  Masuk dengan Kode OTP
                </Text>
              </Pressable>
            </VStack>

            {/* Register Link */}
            <VStack space="xs" className="items-center pt-5">
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

            {/* Guest Triage Gateway Divider & Action */}
            <VStack space="sm" className="pt-8 items-center">
              <HStack space="sm" className="items-center w-full">
                <Box className="flex-1 h-[1px] bg-border" />
                <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  atau
                </Text>
                <Box className="flex-1 h-[1px] bg-border" />
              </HStack>

              <Pressable
                onPress={handleGuestTriage}
                className="w-full p-4 rounded-2xl bg-card border border-border items-center justify-center flex-row gap-2 active:bg-muted mt-2"
              >
                <HeartPulse size={18} className="text-primary" />
                <Text className="text-sm font-bold text-foreground">
                  Periksa Kondisimu Sekarang (Triage Skrining)
                </Text>
                <ArrowRight size={16} className="text-primary" />
              </Pressable>
            </VStack>
          </Box>

          {/* Official Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[480px] md:max-w-[540px] self-center items-center pt-8"
          >
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              Dengan masuk, Anda menyetujui{" "}
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/syarat-layanan")
                }
                className="text-sm text-primary font-bold underline"
              >
                Syarat Layanan
              </Text>{" "}
              dan{" "}
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/kebijakan-privasi")
                }
                className="text-sm text-primary font-bold underline"
              >
                Kebijakan Privasi
              </Text>{" "}
              SeraPhany.
            </Text>
            <HStack space="xs" className="items-center mt-1">
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/en/terms-of-service")
                }
                className="text-sm text-muted-foreground underline"
              >
                Terms of Service (EN)
              </Text>
              <Text className="text-sm text-muted-foreground">•</Text>
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/en/privacy-policy")
                }
                className="text-sm text-muted-foreground underline"
              >
                Privacy Policy (EN)
              </Text>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

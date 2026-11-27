import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
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
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { useRequestOtp } from "@/hooks/useApiQueries";
import { ApiError, WEB_BASE_URL } from "@/api/client";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const initialMode = params.mode === "reset" ? "reset" : "otp";
  const [mode, setMode] = useState<"otp" | "reset">(initialMode);

  const requestOtpMutation = useRequestOtp();
  const [email, setEmail] = useState(params.email ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(params.mode === "reset" ? "reset" : "otp");
  }, [params.mode]);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

  const isLoading = requestOtpMutation.isPending;

  const handleSendOtp = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Masukkan alamat email yang valid.");
      haptics.error();
      return;
    }

    try {
      await requestOtpMutation.mutateAsync({ email: trimmedEmail });
      haptics.success();
      // Route immediately to standalone OTP verification screen (MS4)
      router.push({
        pathname: ROUTES.AUTH.RESET_PASSWORD,
        params: {
          email: trimmedEmail,
          mode,
        },
      } as any);
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Gagal mengirimkan kode OTP verifikasi.");
      } else {
        setErrorMsg("Terjadi kendala jaringan saat menghubungi server.");
      }
    }
  };

  const openUrl = (url: string) => {
    haptics.light();
    Linking.openURL(url).catch(() => {});
  };

  const isResetMode = mode === "reset";

  const handleBack = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(ROUTES.AUTH.LOGIN as any);
    }
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
          <Box className="w-full max-w-[440px] md:max-w-[480px] self-center">
            {/* Header with Back button */}
            <HStack className="items-center justify-between pb-6">
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={20} color="#262130" strokeWidth={2} />
              </Pressable>
              <Text className="text-base font-bold text-foreground">
                {isResetMode ? "Lupa Kata Sandi" : "Masuk dengan OTP"}
              </Text>
              <Box className="w-10" />
            </HStack>

            {/* Title & Context (Wireframe MS3 & MS6) */}
            <VStack space="xs" className="pb-4">
              <Heading
                level={1}
                size="2xl"
                bold
                className="text-foreground tracking-tight"
              >
                {isResetMode ? "Lupa Kata Sandi?" : "Masuk dengan Kode OTP"}
              </Heading>
              <Text className="text-sm text-muted-foreground leading-relaxed">
                {isResetMode
                  ? "Masukkan email akunmu. Kami akan mengirimkan kode 6 digit untuk mengatur ulang kata sandi."
                  : "Masukkan email akunmu. Kami akan mengirim kode 6 digit ke email tersebut."}
              </Text>
            </VStack>

            {/* Error Message */}
            {errorMsg && (
              <Box className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-xl mb-4">
                <Text className="text-sm text-destructive font-medium leading-relaxed">
                  {errorMsg}
                </Text>
              </Box>
            )}

            {/* Form Input: ONLY EMAIL (Clean, no left icon) */}
            <VStack space="md">
              <FormControl isRequired>
                <FormControlLabel>
                  <FormControlLabelText className="text-sm font-semibold text-foreground mb-1">
                    Alamat Email
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="h-[52px] rounded-xl border-border bg-card px-4">
                  <InputField
                    placeholder="nama@email.com"
                    placeholderTextColor="#8C829D"
                    value={email}
                    onChangeText={(val) => {
                      setEmail(val);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleSendOtp}
                    className="text-base text-foreground flex-1"
                  />
                </Input>
              </FormControl>

              {/* Submit Button */}
              <Button
                size="lg"
                disabled={isLoading}
                onPress={handleSendOtp}
                className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3 shadow-sm"
              >
                {isLoading ? (
                  <ButtonSpinner className="text-primary-foreground" />
                ) : (
                  <HStack space="xs" className="items-center">
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Kirim Kode OTP
                    </ButtonText>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </HStack>
                )}
              </Button>

              {/* Links (Wireframe MS3 & MS6) */}
              <VStack space="sm" className="items-center pt-6">
                {isResetMode ? (
                  <>
                    <Pressable
                      onPress={() => {
                        haptics.selection();
                        setMode("otp");
                        setErrorMsg(null);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="py-1"
                    >
                      <Text className="text-sm font-bold text-primary underline">
                        Masuk dengan Kode OTP saja
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      className="pt-1"
                    >
                      <Text className="text-sm text-muted-foreground font-medium">
                        Kembali ke Masuk
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <HStack space="xs" className="items-center py-1">
                    <Text className="text-sm text-muted-foreground font-medium">
                      Ingin masuk dengan kata sandi?
                    </Text>
                    <Pressable
                      onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-sm font-bold text-primary underline">
                        Masuk
                      </Text>
                    </Pressable>
                  </HStack>
                )}
              </VStack>
            </VStack>
          </Box>

          {/* Official Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[440px] md:max-w-[480px] self-center items-center pt-8"
          >
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              Dengan melanjutkan, Anda menyetujui{" "}
              <Text
                onPress={() => openUrl(`${WEB_BASE_URL}/syarat-layanan`)}
                className="text-sm text-primary font-bold underline"
              >
                Syarat Layanan
              </Text>{" "}
              dan{" "}
              <Text
                onPress={() => openUrl(`${WEB_BASE_URL}/kebijakan-privasi`)}
                className="text-sm text-primary font-bold underline"
              >
                Kebijakan Privasi
              </Text>{" "}
              SeraPhany.
            </Text>
            <HStack space="xs" className="items-center mt-1">
              <Text
                onPress={() => openUrl(`${WEB_BASE_URL}/en/terms-of-service`)}
                className="text-sm text-muted-foreground underline"
              >
                Terms of Service (EN)
              </Text>
              <Text className="text-sm text-muted-foreground">•</Text>
              <Text
                onPress={() => openUrl(`${WEB_BASE_URL}/en/privacy-policy`)}
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

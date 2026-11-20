import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
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
import { useResetPassword } from "@/hooks/useApiQueries";
import { authService } from "@/api/auth.service";
import { setAuthTokens, ApiError } from "@/api/client";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email: initialEmail, newPassword: initialPassword } =
    useLocalSearchParams<{ email?: string; newPassword?: string }>();
  const resetPasswordMutation = useResetPassword();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState(initialPassword ?? "");
  const [confirmPassword, setConfirmPassword] = useState(initialPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isSubmitting || resetPasswordMutation.isPending;

  const handleResetPassword = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedToken = token.trim();
    if (!trimmedToken || trimmedToken.length !== 6) {
      setErrorMsg("Masukkan kode OTP verifikasi.");
      haptics.error();
      return;
    }

    const effectivePassword = initialPassword || newPassword;
    if (!effectivePassword || effectivePassword.length < 8) {
      setErrorMsg("Kata sandi baru wajib memiliki minimal 8 karakter.");
      haptics.error();
      return;
    }

    if (!initialPassword && newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    try {
      if (trimmedToken.length === 6 && initialEmail) {
        // Alur mobile verifikasi OTP 6-digit & simpan sandi baru
        const tokens = await authService.verifyOtp({
          email: initialEmail,
          otp: trimmedToken,
        });
        await setAuthTokens(tokens);
        await authService.updatePassword({ newPassword: effectivePassword });
      } else {
        await resetPasswordMutation.mutateAsync({
          token: trimmedToken,
          newPassword: effectivePassword,
        });
      }

      haptics.success();
      setIsSuccess(true);
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        if (err.statusCode === 400 || err.statusCode === 401) {
          setErrorMsg(
            "Kode OTP tidak valid atau telah kedaluwarsa. Silakan ajukan permohonan reset ulang.",
          );
        } else {
          setErrorMsg(err.message || "Gagal mereset kata sandi.");
        }
      } else {
        setErrorMsg("Terjadi kendala jaringan saat menghubungi server.");
      }
    } finally {
      setIsSubmitting(false);
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
          <Box className="w-full max-w-[440px] self-center">
            {/* Header with Back button */}
            <HStack className="items-center justify-between pb-6">
              <Pressable
                onPress={() => {
                  haptics.light();
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace(ROUTES.AUTH.LOGIN as any);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Kembali"
                className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <ArrowLeft size={20} className="text-foreground" />
              </Pressable>
              <Box className="w-10" />
            </HStack>

            {isSuccess ? (
              /* Success confirmation state */
              <VStack
                space="lg"
                className="pt-10 items-center bg-card border border-border p-6 rounded-3xl"
              >
                <Box className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                  <CheckCircle2 size={36} className="text-primary" />
                </Box>
                <VStack space="xs" className="items-center">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground text-center"
                  >
                    Kata Sandi Berhasil Diperbarui
                  </Heading>
                  <Text className="text-sm text-muted-foreground text-center leading-relaxed mt-1">
                    Kata sandi akun Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi baru Anda.
                  </Text>
                </VStack>

                <VStack space="sm" className="w-full pt-4">
                  <Button
                    size="lg"
                    onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                    className="w-full h-12 rounded-2xl bg-primary flex-row items-center justify-center"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Masuk ke Akun Sekarang
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>
            ) : (
              /* Reset Form */
              <VStack space="md">
                <VStack space="xs" className="pb-3">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Verifikasi OTP
                  </Heading>
                  {initialEmail ? (
                    <Text className="text-sm text-muted-foreground">
                      Kode dikirim ke{" "}
                      <Text className="text-sm font-semibold text-foreground">
                        {initialEmail}
                      </Text>
                    </Text>
                  ) : (
                    <Text className="text-sm text-muted-foreground">
                      Masukkan kode verifikasi dari email Anda.
                    </Text>
                  )}
                </VStack>

                {errorMsg && (
                  <Box className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-2xl mb-2">
                    <Text className="text-sm text-destructive font-medium leading-relaxed">
                      {errorMsg}
                    </Text>
                  </Box>
                )}

                {/* Kode OTP */}
                <FormControl isRequired isInvalid={Boolean(errorMsg && (!token || token.length !== 6))}>
                  {!initialPassword && (
                    <FormControlLabel>
                      <FormControlLabelText className="text-sm font-bold text-foreground">
                        Kode OTP
                      </FormControlLabelText>
                    </FormControlLabel>
                  )}
                  <Input className="h-14 rounded-2xl border-border bg-card px-3 justify-center">
                    <InputField
                      id="reset-otp-input"
                      accessibilityLabel="Kode verifikasi OTP"
                      placeholder="0 0 0 0 0 0"
                      placeholderTextColor="#8C829D"
                      value={token}
                      onChangeText={(val) => {
                        setToken(val.replace(/[^0-9]/g, "").slice(0, 6));
                        if (errorMsg) setErrorMsg(null);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType={initialPassword ? "done" : "next"}
                      onSubmitEditing={initialPassword ? handleResetPassword : undefined}
                      className="text-center font-mono font-bold text-2xl tracking-[12px] text-foreground flex-1"
                    />
                  </Input>
                </FormControl>

                {/* Kata Sandi Baru (hanya jika belum diisi di tahap sebelumnya) */}
                {!initialPassword && (
                  <>
                    <FormControl isRequired>
                      <FormControlLabel>
                        <FormControlLabelText className="text-sm font-bold text-foreground">
                          Kata Sandi Baru
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="h-12 rounded-2xl border-border bg-card px-3">
                        <InputField
                          placeholder="Minimal 8 karakter"
                          placeholderTextColor="#8C829D"
                          value={newPassword}
                          onChangeText={(val) => {
                            setNewPassword(val);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          secureTextEntry={!showPassword}
                          returnKeyType="next"
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

                    <FormControl isRequired>
                      <FormControlLabel>
                        <FormControlLabelText className="text-sm font-bold text-foreground">
                          Konfirmasi Kata Sandi Baru
                        </FormControlLabelText>
                      </FormControlLabel>
                      <Input className="h-12 rounded-2xl border-border bg-card px-3">
                        <InputField
                          placeholder="Ulangi kata sandi baru"
                          placeholderTextColor="#8C829D"
                          value={confirmPassword}
                          onChangeText={(val) => {
                            setConfirmPassword(val);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          secureTextEntry={!showConfirmPassword}
                          returnKeyType="done"
                          onSubmitEditing={handleResetPassword}
                          className="text-sm text-foreground flex-1"
                        />
                        <InputSlot
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="pr-2"
                        >
                          <InputIcon
                            as={showConfirmPassword ? EyeOff : Eye}
                            className="text-muted-foreground"
                          />
                        </InputSlot>
                      </Input>
                    </FormControl>
                  </>
                )}

                {/* Submit button */}
                <Button
                  size="lg"
                  disabled={isLoading}
                  onPress={handleResetPassword}
                  className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3"
                >
                  {isLoading ? (
                    <ButtonSpinner className="text-primary-foreground" />
                  ) : (
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Simpan Kata Sandi
                    </ButtonText>
                  )}
                </Button>

                <HStack space="xs" className="justify-center items-center pt-4">
                  <Text className="text-sm text-muted-foreground font-medium">
                    Kembali ke halaman masuk?
                  </Text>
                  <Pressable
                    onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="text-sm font-bold text-primary underline">
                      Masuk ke Akun
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[440px] self-center items-center pt-8"
          >
            <HStack space="xs" className="items-center">
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/syarat-layanan")
                }
                className="text-sm text-muted-foreground underline"
              >
                Syarat Layanan
              </Text>
              <Text className="text-sm text-muted-foreground">•</Text>
              <Text
                onPress={() =>
                  openUrl("https://staging.seraphany.id/kebijakan-privasi")
                }
                className="text-sm text-muted-foreground underline"
              >
                Kebijakan Privasi
              </Text>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

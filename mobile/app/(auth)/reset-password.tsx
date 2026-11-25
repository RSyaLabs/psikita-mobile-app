import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
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
  InputSlot,
  InputIcon,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  ScrollView,
} from "@/components/ui";
import { OtpDigitInput } from "@/components/auth";
import { haptics } from "@/utils/haptics";
import { useAuth, parseServerSession, getHomeRouteForRole } from "@/hooks/useAuth";
import { authService } from "@/api/auth.service";
import { setAuthTokens, ApiError } from "@/api/client";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { acceptSession } = useAuth();
  const params = useLocalSearchParams<{
    email?: string;
    mode?: string;
    token?: string;
  }>();

  const email = (params.email ?? "").trim().toLowerCase();
  const isResetMode = params.mode === "reset";

  // Step state for reset mode: "otp" -> "new_password" -> "success"
  const [step, setStep] = useState<"otp" | "new_password" | "success">(
    params.token ? "new_password" : "otp",
  );

  // OTP State
  const [otp, setOtp] = useState(params.token ?? "");
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // New Password State (Only used in reset mode step 2)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    if (params.token) {
      setOtp(params.token);
      setStep("new_password");
    } else if (params.mode !== "reset" && !params.token) {
      setStep("otp");
    }
  }, [params.token, params.mode]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleResendOtp = async () => {
    if (!email) {
      setErrorMsg("Email tidak ditemukan. Silakan masukkan email kembali.");
      return;
    }
    haptics.light();
    setErrorMsg(null);
    setResendMsg(null);
    try {
      await authService.requestOtp({ email });
      haptics.success();
      setCountdown(30);
      setCanResend(false);
      setResendMsg("Kode OTP baru telah dikirimkan ke email Anda.");
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Gagal mengirim ulang kode OTP.");
      } else {
        setErrorMsg("Terjadi kendala jaringan saat mengirim ulang kode.");
      }
    }
  };

  const handleVerifyOtp = async () => {
    haptics.medium();
    setErrorMsg(null);
    setResendMsg(null);

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6 || !/^\d{6}$/.test(trimmedOtp)) {
      setErrorMsg("Masukkan 6 digit angka kode OTP verifikasi.");
      haptics.error();
      return;
    }

    if (!email) {
      setErrorMsg("Email tidak ditemukan. Silakan kembali dan masukkan email Anda.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    try {
      const tokens = await authService.verifyOtp({
        email,
        otp: trimmedOtp,
      });

      haptics.success();

      if (!isResetMode) {
        // Alur Wireframe MS4: OTP Login Langsung Masuk ke Dashboard sesuai peran akun
        await acceptSession(tokens);
        const parsedSession = parseServerSession(tokens);
        const targetHome = parsedSession
          ? getHomeRouteForRole(parsedSession.user.role)
          : ROUTES.PATIENT.DASHBOARD;
        router.replace(targetHome as any);
      } else {
        // Alur Reset Sandi: Lanjut ke Langkah 2 Buat Sandi Baru
        await setAuthTokens(tokens);
        setStep("new_password");
      }
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        if (err.statusCode === 400 || err.statusCode === 401) {
          setErrorMsg("Kode OTP tidak valid atau telah kedaluwarsa. Silakan periksa kembali atau kirim ulang.");
        } else {
          setErrorMsg(err.message || "Gagal memverifikasi kode OTP.");
        }
      } else {
        setErrorMsg("Terjadi kendala jaringan saat menghubungi server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNewPassword = async () => {
    haptics.medium();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg("Kata sandi baru wajib memiliki minimal 8 karakter.");
      haptics.error();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.");
      haptics.error();
      return;
    }

    setIsSubmitting(true);
    try {
      if (params.token) {
        await authService.resetPassword(params.token, newPassword);
      } else {
        await authService.updatePassword({ newPassword });
      }
      haptics.success();
      setStep("success");
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Gagal memperbarui kata sandi.");
      } else {
        setErrorMsg("Terjadi kendala jaringan saat memperbarui kata sandi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUrl = (url: string) => {
    haptics.light();
    Linking.openURL(url).catch(() => {});
  };

  const handleBack = () => {
    haptics.light();
    if (step === "new_password") {
      setStep("otp");
    } else if (router.canGoBack()) {
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
            {/* Header with Back Button */}
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
                {step === "new_password"
                  ? "Kata Sandi Baru"
                  : step === "success"
                  ? "Sandi Diperbarui"
                  : "Verifikasi Kode OTP"}
              </Text>
              <Box className="w-10" />
            </HStack>

            {/* Error & Feedback Banner */}
            {errorMsg && (
              <Box className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-xl mb-4">
                <Text className="text-sm text-destructive font-medium leading-relaxed">
                  {errorMsg}
                </Text>
              </Box>
            )}

            {resendMsg && (
              <Box className="bg-primary/10 border border-primary/20 p-3.5 rounded-xl mb-4">
                <Text className="text-sm text-primary font-medium leading-relaxed">
                  {resendMsg}
                </Text>
              </Box>
            )}

            {step === "otp" && (
              /* ========================================================
               * WIREFRAME MS4: STANDALONE OTP SCREEN (6 DISCRETE DIGIT BOXES)
               * ======================================================== */
              <VStack space="md">
                <VStack space="xs" className="pb-2">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Masukkan Kode OTP
                  </Heading>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Kode 6 digit sudah dikirim ke{" "}
                    <Text className="text-sm font-bold text-foreground">
                      {email || "email Anda"}
                    </Text>
                    . Kode berlaku 5 menit.
                  </Text>
                  <Pressable
                    onPress={() =>
                      router.replace({
                        pathname: ROUTES.AUTH.FORGOT_PASSWORD,
                        params: { mode: isResetMode ? "reset" : "otp", email },
                      } as any)
                    }
                    className="pt-1.5 self-start"
                  >
                    <Text className="text-sm font-bold text-primary underline">
                      Ganti email
                    </Text>
                  </Pressable>
                </VStack>

                {/* 6 Individual Discrete Digit Input Boxes (Wireframe MS4) */}
                <VStack space="xs" className="py-2">
                  <Text className="text-sm font-semibold text-foreground">
                    Kode Verifikasi (6 Digit)
                  </Text>
                  <OtpDigitInput
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    disabled={isSubmitting}
                    autoFocus={true}
                  />
                </VStack>

                {/* Submit Button */}
                <Button
                  size="lg"
                  disabled={isSubmitting || otp.length !== 6}
                  onPress={handleVerifyOtp}
                  className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center mt-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <ButtonSpinner className="text-primary-foreground" />
                  ) : (
                    <HStack space="xs" className="items-center">
                      <ButtonText className="text-primary-foreground font-bold text-base">
                        {isResetMode ? "Verifikasi Kode" : "Verifikasi & Masuk"}
                      </ButtonText>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </HStack>
                  )}
                </Button>

                {/* Resend Countdown (Wireframe MS4) */}
                <VStack space="xs" className="items-center pt-5">
                  {!canResend ? (
                    <Text className="text-sm text-muted-foreground font-medium">
                      Kirim ulang kode dalam{" "}
                      <Text className="text-sm font-bold text-foreground">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </Text>
                    </Text>
                  ) : (
                    <Pressable
                      onPress={handleResendOtp}
                      className="flex-row items-center gap-1.5 active:opacity-80 py-1"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <RotateCcw size={16} color="#4A3B6B" />
                      <Text className="text-sm font-bold text-primary underline">
                        Kirim ulang kode
                      </Text>
                    </Pressable>
                  )}
                </VStack>
              </VStack>
            )}

            {step === "new_password" && (
              /* ========================================================
               * STEP 2 (KHUSUS RESET SANDI): BUAT KATA SANDI BARU
               * ======================================================== */
              <VStack space="md">
                <VStack space="xs" className="pb-3">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Buat Kata Sandi Baru
                  </Heading>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Kode OTP terverifikasi. Masukkan kata sandi baru untuk akun Anda (minimal 8 karakter).
                  </Text>
                </VStack>

                {/* Password Baru */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground mb-1">
                      Kata Sandi Baru
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-[52px] rounded-xl border-border bg-card px-4">
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
                      className="text-base text-foreground flex-1"
                    />
                    <InputSlot
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-2"
                    >
                      <InputIcon
                        as={showPassword ? EyeOff : Eye}
                        color="#75618E"
                      />
                    </InputSlot>
                  </Input>
                </FormControl>

                {/* Konfirmasi Password Baru */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-semibold text-foreground mb-1">
                      Konfirmasi Kata Sandi Baru
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-[52px] rounded-xl border-border bg-card px-4">
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
                      onSubmitEditing={handleSaveNewPassword}
                      className="text-base text-foreground flex-1"
                    />
                    <InputSlot
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="pr-2"
                    >
                      <InputIcon
                        as={showConfirmPassword ? EyeOff : Eye}
                        color="#75618E"
                      />
                    </InputSlot>
                  </Input>
                </FormControl>

                {/* Submit New Password */}
                <Button
                  size="lg"
                  disabled={isSubmitting}
                  onPress={handleSaveNewPassword}
                  className="w-full h-[52px] rounded-xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3 shadow-sm"
                >
                  {isSubmitting ? (
                    <ButtonSpinner className="text-primary-foreground" />
                  ) : (
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Simpan Kata Sandi Baru
                    </ButtonText>
                  )}
                </Button>
              </VStack>
            )}

            {step === "success" && (
              /* ========================================================
               * STEP 3: KATA SANDI BERHASIL DIPERBARUI
               * ======================================================== */
              <VStack
                space="lg"
                className="pt-10 items-center bg-card border border-border p-6 rounded-2xl"
              >
                <Box className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                  <CheckCircle2 size={36} color="#4A3B6B" />
                </Box>
                <VStack space="xs" className="items-center">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground text-center"
                  >
                    Kata Sandi Diperbarui
                  </Heading>
                  <Text className="text-sm text-muted-foreground text-center leading-relaxed mt-1">
                    Kata sandi baru Anda telah berhasil disimpan. Silakan masuk menggunakan kata sandi baru.
                  </Text>
                </VStack>

                <VStack space="sm" className="w-full pt-4">
                  <Button
                    size="lg"
                    onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                    className="w-full h-[52px] rounded-xl bg-primary flex-row items-center justify-center"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Masuk ke Akun Sekarang
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>
            )}
          </Box>

          {/* Official Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[440px] md:max-w-[480px] self-center items-center pt-8"
          >
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              Dengan melanjutkan, Anda menyetujui{" "}
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

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MailCheck } from "lucide-react-native";
import {
  Box, Heading, Text, VStack, Pressable, Input, InputField,
  Button, ButtonText, ScrollView,
} from "@/components/ui";
import { useRequestOtp, useVerifyOtp } from "@/hooks/useApiQueries";
import { getHomeRouteForResponse, useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function OtpSignInScreen() {
  const router = useRouter();
  const { beginAuthAttempt, acceptSession } = useAuth();
  const requestOtp = useRequestOtp();
  const verifyOtp = useVerifyOtp();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanEmail = email.trim().toLowerCase();
  const validCode = /^\d{6}$/.test(code);

  const requestCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Email tidak valid.");
      return;
    }
    setError(null);
    try {
      await requestOtp.mutateAsync({ email: cleanEmail });
      setSent(true);
      setCode("");
      haptics.success();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal mengirim kode.");
      haptics.error();
    }
  };

  const verifyCode = async () => {
    if (!validCode) {
      setError("Masukkan 6 digit OTP.");
      return;
    }
    setError(null);
    const attempt = beginAuthAttempt();
    try {
      const result = await verifyOtp.mutateAsync({ email: cleanEmail, otp: code });
      const next = getHomeRouteForResponse(result);
      if (!next) {
        setError("Sesi tidak valid. Coba lagi.");
        return;
      }
      acceptSession(result, attempt);
      setCode("");
      haptics.success();
      router.replace(next as any);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kode tidak valid.");
      haptics.error();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Box className="w-full max-w-[440px] self-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={() => sent ? (setSent(false), setCode(""), setError(null)) : router.back()}
            className="self-start p-2 -ml-2"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="lg" className="pt-10">
            <MailCheck size={32} className="text-primary" />
            <Heading level={1} size="2xl" bold className="text-foreground">
              {sent ? "Verifikasi OTP" : "Masuk dengan OTP"}
            </Heading>
            {sent ? (
              <>
                <Text className="text-sm text-muted-foreground">{cleanEmail}</Text>
                <VStack space="xs">
                  <Text className="text-sm font-semibold text-foreground">Kode 6 digit</Text>
                  <Input className="h-14 rounded-xl border-border bg-card">
                    <InputField
                      accessibilityLabel="Kode OTP enam digit"
                      value={code}
                      onChangeText={(value) => { setCode(value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
                      placeholder="000000"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={6}
                      className="text-center font-semibold text-xl tracking-[8px]"
                    />
                  </Input>
                </VStack>
                {error ? <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text> : null}
                <Button onPress={verifyCode} isDisabled={verifyOtp.isPending || !validCode} className="h-12 rounded-xl bg-primary">
                  <ButtonText className="font-bold text-primary-foreground">
                    {verifyOtp.isPending ? "Memverifikasi..." : "Verifikasi & Masuk"}
                  </ButtonText>
                </Button>
                <Pressable accessibilityRole="button" onPress={requestCode} disabled={requestOtp.isPending} className="items-center py-3">
                  <Text className="font-semibold text-primary">{requestOtp.isPending ? "Mengirim..." : "Kirim ulang kode"}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <VStack space="xs">
                  <Text className="text-sm font-semibold text-foreground">Email</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField
                      accessibilityLabel="Email akun"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={email}
                      onChangeText={(value) => { setEmail(value); setError(null); }}
                      placeholder="nama@email.com"
                    />
                  </Input>
                </VStack>
                {error ? <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text> : null}
                <Button onPress={requestCode} isDisabled={requestOtp.isPending} className="h-12 rounded-xl bg-primary">
                  <ButtonText className="font-bold text-primary-foreground">
                    {requestOtp.isPending ? "Mengirim..." : "Kirim Kode"}
                  </ButtonText>
                </Button>
                <Pressable onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)} className="items-center py-3">
                  <Text className="font-semibold text-primary">Masuk dengan kata sandi</Text>
                </Pressable>
              </>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

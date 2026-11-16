import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MailCheck } from "lucide-react-native";
import { Box, Heading, Text, VStack, Input, InputField, Button, ButtonText, Pressable, ScrollView } from "@/components/ui";
import { useForgotPassword, useResetPassword } from "@/hooks/queries/auth";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { token: linkToken } = useLocalSearchParams<{ token?: string }>();
  const request = useForgotPassword();
  const reset = useResetPassword();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(typeof linkToken === "string" ? linkToken : "");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasResetToken = token.trim().length > 0;

  const requestLink = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Masukkan alamat email yang valid.");
      return;
    }
    setError(null);
    try {
      await request.mutateAsync(email.trim().toLowerCase());
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Permintaan belum berhasil. Coba lagi.");
    }
  };

  const submitReset = async () => {
    if (!hasResetToken || password.length < 6) {
      setError("Masukkan token pemulihan dan kata sandi minimal 6 karakter.");
      return;
    }
    setError(null);
    try {
      await reset.mutateAsync({ token: token.trim(), newPassword: password });
      setCompleted(true);
      setPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pemulihan gagal. Periksa token dan coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Kembali" className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="lg" className="pt-10">
            <Heading level={1} size="2xl" bold className="text-foreground">
              {completed ? "Kata sandi diperbarui" : "Pulihkan kata sandi"}
            </Heading>
            {completed ? (
              <VStack space="md">
                <MailCheck size={42} className="text-primary" />
                <Text className="text-muted-foreground">Kata sandi baru sudah tersimpan. Silakan masuk kembali.</Text>
                <Button onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)} className="h-12 rounded-xl bg-primary">
                  <ButtonText className="font-bold text-primary-foreground">Ke Halaman Masuk</ButtonText>
                </Button>
              </VStack>
            ) : (
              <>
                <Text className="text-muted-foreground leading-relaxed">
                  Minta tautan pemulihan ke email terdaftar. Gunakan token dari tautan tersebut untuk membuat kata sandi baru.
                </Text>
                <VStack space="xs">
                  <Text className="text-sm font-semibold text-foreground">Email</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="nama@email.com" accessibilityLabel="Email terdaftar" />
                  </Input>
                </VStack>
                <Button onPress={requestLink} isDisabled={request.isPending} className="h-12 rounded-xl bg-primary">
                  <ButtonText className="font-bold text-primary-foreground">{request.isPending ? "Mengirim..." : "Kirim Tautan Pemulihan"}</ButtonText>
                </Button>
                {sent ? <Text className="text-sm text-primary">Jika email terdaftar, instruksi pemulihan akan dikirimkan.</Text> : null}
                <VStack space="xs" className="pt-5">
                  <Text className="text-sm font-semibold text-foreground">Token pemulihan</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField value={token} onChangeText={setToken} autoCapitalize="none" placeholder="Token dari tautan pemulihan" accessibilityLabel="Token pemulihan" />
                  </Input>
                </VStack>
                <VStack space="xs">
                  <Text className="text-sm font-semibold text-foreground">Kata sandi baru</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="Minimal 6 karakter" accessibilityLabel="Kata sandi baru" />
                  </Input>
                </VStack>
                {error ? <Text className="text-sm text-destructive" accessibilityRole="alert">{error}</Text> : null}
                <Button onPress={submitReset} isDisabled={reset.isPending || !hasResetToken} variant="outline" className="h-12 rounded-xl border-border bg-card">
                  <ButtonText className="font-semibold text-foreground">{reset.isPending ? "Memperbarui..." : "Simpan Kata Sandi Baru"}</ButtonText>
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

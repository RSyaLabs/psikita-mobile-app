import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react-native";
import { Box, Heading, Text, VStack, Pressable, Input, InputField, Button, ButtonText, ScrollView } from "@/components/ui";
import { useResetPassword } from "@/hooks/queries/auth";
import { ROUTES } from "@/constants/routes";

/**
 * Only the link issued by the backend may enter this screen.
 * Do not log, persist, or display the single-use token.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = typeof params.token === "string" ? params.token.trim() : "";
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!token && password.length >= 8 && password.length <= 128 && password === confirmPassword;

  const submit = async () => {
    if (!canSubmit) {
      setError("Periksa kata sandi dan konfirmasi.");
      return;
    }
    setError(null);
    try {
      await reset.mutateAsync({ token, newPassword: password });
      setPassword("");
      setConfirmPassword("");
      setCompleted(true);
    } catch {
      setError("Tautan tidak valid, kedaluwarsa, atau gagal diproses. Minta tautan baru.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)} className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="lg" className="pt-10">
            {completed ? <CheckCircle2 size={34} className="text-primary" /> : <LockKeyhole size={34} className="text-primary" />}
            <Heading level={1} size="2xl" bold className="text-foreground">
              {completed ? "Kata sandi diperbarui" : token ? "Buat kata sandi baru" : "Tautan tidak valid"}
            </Heading>
            {completed ? (
              <Button className="h-12 rounded-xl bg-primary" onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)}>
                <ButtonText className="font-semibold text-primary-foreground">Masuk</ButtonText>
              </Button>
            ) : !token ? (
              <Button className="h-12 rounded-xl bg-primary" onPress={() => router.replace(ROUTES.AUTH.FORGOT_PASSWORD as any)}>
                <ButtonText className="font-semibold text-primary-foreground">Minta Tautan Baru</ButtonText>
              </Button>
            ) : (
              <>
                <VStack space="xs">
                  <Text className="font-semibold text-foreground">Kata sandi baru</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField
                      accessibilityLabel="Kata sandi baru"
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      value={password}
                      onChangeText={(value) => { setPassword(value); setError(null); }}
                      placeholder="Minimal 8 karakter"
                    />
                    <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onPress={() => setShowPassword(value => !value)} className="px-3">
                      {showPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
                    </Pressable>
                  </Input>
                </VStack>
                <VStack space="xs">
                  <Text className="font-semibold text-foreground">Konfirmasi kata sandi</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField
                      accessibilityLabel="Konfirmasi kata sandi baru"
                      secureTextEntry
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChangeText={(value) => { setConfirmPassword(value); setError(null); }}
                      placeholder="Ulangi kata sandi"
                    />
                  </Input>
                </VStack>
                {error ? <Text accessibilityRole="alert" className="text-sm text-destructive">{error}</Text> : null}
                <Button className="h-12 rounded-xl bg-primary" onPress={submit} isDisabled={reset.isPending || !canSubmit}>
                  <ButtonText className="font-semibold text-primary-foreground">{reset.isPending ? "Menyimpan..." : "Simpan Kata Sandi"}</ButtonText>
                </Button>
                <Pressable accessibilityRole="button" className="items-center py-2" onPress={() => router.replace(ROUTES.AUTH.FORGOT_PASSWORD as any)}>
                  <Text className="font-semibold text-primary">Minta tautan baru</Text>
                </Pressable>
              </>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

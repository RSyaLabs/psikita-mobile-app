import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MailCheck } from "lucide-react-native";
import { Box, Text, Heading, VStack, HStack, Pressable, Input, InputField, Button, ButtonText, ScrollView } from "@/components/ui";
import { useRegisterPatient } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function RegisterScreen() {
  const router = useRouter();
  const mutation = useRegisterPatient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254 || password.length < 8 || password.length > 128 || password !== confirmPassword) {
      setError("Periksa username, email, dan konfirmasi kata sandi.");
      return;
    }
    setError(null);
    try {
      await mutation.mutateAsync({ username: username.trim(), email: cleanEmail, password });
      haptics.success();
      setPassword("");
      setConfirmPassword("");
      setRegisteredEmail(cleanEmail);
    } catch (cause) {
      haptics.error();
      setError(cause instanceof Error ? cause.message : "Pendaftaran gagal. Silakan coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Kembali" className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          {registeredEmail ? (
            <VStack space="lg" className="pt-12 items-center">
              <MailCheck size={48} className="text-primary" />
              <Heading level={1} size="2xl" bold className="text-foreground text-center">Periksa emailmu</Heading>
              <Text className="text-center text-muted-foreground leading-relaxed">
                Jika aktivasi diperlukan, ikuti instruksi yang dikirim ke {registeredEmail}.
              </Text>
              <Button onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)} className="w-full h-12 rounded-xl bg-primary">
                <ButtonText className="font-bold text-primary-foreground">Ke Halaman Masuk</ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack space="lg" className="pt-10">
              <VStack space="sm" className="pb-3">
                <Heading level={1} size="2xl" bold className="text-foreground">Buat akun SeraPhany</Heading>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-foreground">Username</Text>
                <Input className="h-12 rounded-xl border-border bg-card">
                  <InputField value={username} onChangeText={setUsername} accessibilityLabel="Username" placeholder="Username" autoCapitalize="none" autoComplete="username" />
                </Input>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
                <Input className="h-12 rounded-xl border-border bg-card">
                  <InputField value={email} onChangeText={setEmail} accessibilityLabel="Email" placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
                </Input>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-foreground">Kata sandi</Text>
                <Input className="h-12 rounded-xl border-border bg-card">
                  <InputField value={password} onChangeText={setPassword} accessibilityLabel="Kata sandi" placeholder="Minimal 8 karakter" secureTextEntry autoComplete="new-password" />
                </Input>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-foreground">Konfirmasi kata sandi</Text>
                <Input className="h-12 rounded-xl border-border bg-card">
                  <InputField value={confirmPassword} onChangeText={setConfirmPassword} accessibilityLabel="Konfirmasi kata sandi" placeholder="Ulangi kata sandi" secureTextEntry autoComplete="new-password" />
                </Input>
              </VStack>
              {error ? <Text className="text-sm text-destructive" accessibilityRole="alert">{error}</Text> : null}
              <Button onPress={submit} isDisabled={mutation.isPending} className="h-12 rounded-xl bg-primary">
                <ButtonText className="font-bold text-primary-foreground">{mutation.isPending ? "Memproses..." : "Daftar"}</ButtonText>
              </Button>
              <HStack space="xs" className="justify-center">
                <Text className="text-sm text-muted-foreground">Sudah punya akun?</Text>
                <Pressable onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)}>
                  <Text className="text-sm font-semibold text-primary">Masuk</Text>
                </Pressable>
              </HStack>
            </VStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

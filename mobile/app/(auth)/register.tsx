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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || password.length < 6) {
      setError("Isi nama lengkap, email valid, dan kata sandi minimal 6 karakter.");
      return;
    }
    setError(null);
    const username = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
    try {
      await mutation.mutateAsync({ username, fullName: fullName.trim(), email: cleanEmail, password });
      haptics.success();
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
                Tautan aktivasi telah dikirim ke {registeredEmail}. Aktifkan akun melalui email sebelum masuk.
              </Text>
              <Button onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)} className="w-full h-12 rounded-xl bg-primary">
                <ButtonText className="font-bold text-primary-foreground">Ke Halaman Masuk</ButtonText>
              </Button>
            </VStack>
          ) : (
            <VStack space="lg" className="pt-10">
              <VStack space="sm" className="pb-3">
                <Heading level={1} size="2xl" bold className="text-foreground">Buat akun SeraPhany</Heading>
                <Text className="text-muted-foreground">Isi data akun untuk memulai.</Text>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-foreground">Nama lengkap</Text>
                <Input className="h-12 rounded-xl border-border bg-card">
                  <InputField value={fullName} onChangeText={setFullName} accessibilityLabel="Nama lengkap" placeholder="Nama sesuai identitas" autoComplete="name" />
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
                  <InputField value={password} onChangeText={setPassword} accessibilityLabel="Kata sandi" placeholder="Minimal 6 karakter" secureTextEntry autoComplete="new-password" />
                </Input>
              </VStack>
              {error ? <Text className="text-sm text-destructive" accessibilityRole="alert">{error}</Text> : null}
              <Button onPress={submit} isDisabled={mutation.isPending} className="h-12 rounded-xl bg-primary">
                <ButtonText className="font-bold text-primary-foreground">{mutation.isPending ? "Memproses..." : "Daftar"}</ButtonText>
              </Button>
              <Text className="text-xs text-muted-foreground leading-relaxed text-center">
                Dengan mendaftar, kamu menyetujui syarat layanan dan kebijakan privasi SeraPhany.
              </Text>
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

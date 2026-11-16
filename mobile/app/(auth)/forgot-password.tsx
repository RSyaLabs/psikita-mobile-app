import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mail } from "lucide-react-native";
import { Box, Heading, Text, VStack, Input, InputField, Button, ButtonText, Pressable, ScrollView } from "@/components/ui";
import { useForgotPassword } from "@/hooks/queries/auth";
import { ROUTES } from "@/constants/routes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Requesting a password reset never verifies whether an email exists.
 * The reset token is delivered by the server, not displayed or entered here.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const request = useForgotPassword();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const address = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(address) || address.length > 254) {
      setError("Masukkan email yang valid.");
      return;
    }
    setError(null);
    try {
      await request.mutateAsync(address);
      setSubmitted(true);
    } catch {
      // Do not expose backend error descriptions that could reveal account state.
      setError("Permintaan belum berhasil. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.back()} className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="lg" className="pt-10">
            <Mail size={32} className="text-primary" />
            <Heading level={1} size="2xl" bold className="text-foreground">
              {submitted ? "Periksa email" : "Lupa kata sandi"}
            </Heading>
            {submitted ? (
              <>
                <Text className="text-muted-foreground">
                  Jika akun terdaftar, tautan pemulihan akan dikirim ke email tersebut.
                </Text>
                <Button className="h-12 rounded-xl bg-primary" onPress={() => router.replace(ROUTES.AUTH.SIGN_IN as any)}>
                  <ButtonText className="text-primary-foreground font-semibold">Kembali ke Masuk</ButtonText>
                </Button>
                <Pressable accessibilityRole="button" onPress={() => { setSubmitted(false); setError(null); }} className="items-center py-3">
                  <Text className="font-semibold text-primary">Gunakan email lain</Text>
                </Pressable>
              </>
            ) : (
              <>
                <VStack space="xs">
                  <Text className="font-semibold text-foreground">Email akun</Text>
                  <Input className="h-12 rounded-xl border-border bg-card">
                    <InputField
                      accessibilityLabel="Email akun"
                      value={email}
                      onChangeText={(value) => { setEmail(value); setError(null); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholder="nama@email.com"
                    />
                  </Input>
                </VStack>
                {error ? <Text accessibilityRole="alert" className="text-destructive text-sm">{error}</Text> : null}
                <Button className="h-12 rounded-xl bg-primary" onPress={submit} isDisabled={request.isPending}>
                  <ButtonText className="text-primary-foreground font-semibold">{request.isPending ? "Mengirim..." : "Kirim Tautan"}</ButtonText>
                </Button>
              </>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

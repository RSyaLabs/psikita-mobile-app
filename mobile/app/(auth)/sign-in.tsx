import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import { Box, Text, Heading, VStack, HStack, Pressable, Input, InputField, Button, ButtonText, ScrollView } from "@/components/ui";
import { useLogin } from "@/hooks/useApiQueries";
import { getHomeRouteForResponse } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function SignInScreen() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setError("Isi username atau email dan kata sandi.");
      return;
    }
    setError(null);
    try {
      const response = await loginMutation.mutateAsync({
        username: normalizedUsername,
        password,
      });
      const next = getHomeRouteForResponse(response);
      if (!next) {
        setError("Data akun belum dapat diverifikasi. Coba lagi.");
        return;
      }
      haptics.success();
      router.replace(next as any);
    } catch (cause) {
      haptics.error();
      setError(cause instanceof Error ? cause.message : "Gagal masuk. Coba kembali.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Kembali" className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="sm" className="pt-10 pb-8">
            <Heading level={1} size="2xl" bold className="text-foreground">Selamat datang kembali</Heading>
          </VStack>
          <VStack space="lg">
            <VStack space="xs">
              <Text className="text-sm font-semibold text-foreground">Username atau email</Text>
              <Input className="h-12 rounded-xl border-border bg-card">
                <InputField accessibilityLabel="Username atau email" value={username} onChangeText={setUsername} placeholder="nama@email.com" autoCapitalize="none" autoComplete="username" />
              </Input>
            </VStack>
            <VStack space="xs">
              <HStack className="items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Kata sandi</Text>
                <Pressable accessibilityRole="button" onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD as any)}>
                  <Text className="text-sm font-semibold text-primary">Lupa kata sandi?</Text>
                </Pressable>
              </HStack>
              <Input className="h-12 rounded-xl border-border bg-card">
                <InputField accessibilityLabel="Kata sandi" value={password} onChangeText={setPassword} placeholder="Masukkan kata sandi" secureTextEntry={!showPassword} autoComplete="password" className="flex-1" />
                <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"} onPress={() => setShowPassword((value) => !value)} className="px-3">
                  {showPassword ? <EyeOff size={18} className="text-muted-foreground" /> : <Eye size={18} className="text-muted-foreground" />}
                </Pressable>
              </Input>
            </VStack>
            {error ? <Text className="text-sm text-destructive" accessibilityRole="alert">{error}</Text> : null}
            <Button className="h-12 rounded-xl bg-primary" isDisabled={loginMutation.isPending} onPress={submit}>
              <ButtonText className="font-bold text-primary-foreground">{loginMutation.isPending ? "Memverifikasi..." : "Masuk"}</ButtonText>
            </Button>
            <Pressable accessibilityRole="button" onPress={() => router.push(ROUTES.AUTH.OTP as any)} className="py-3 items-center">
              <Text className="font-semibold text-primary">Masuk dengan kode OTP</Text>
            </Pressable>
            <HStack space="xs" className="justify-center pt-3">
              <Text className="text-sm text-muted-foreground">Belum punya akun?</Text>
              <Pressable accessibilityRole="button" onPress={() => router.push(ROUTES.AUTH.REGISTER as any)}>
                <Text className="text-sm font-semibold text-primary">Daftar</Text>
              </Pressable>
            </HStack>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { Linking, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  MailCheck,
  Check,
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
import { useRegisterPatient } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterPatient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const isLoading = registerMutation.isPending;

  const handleRegister = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMsg("Nama lengkap wajib diisi.");
      haptics.error();
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Format alamat email tidak valid.");
      haptics.error();
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Kata sandi wajib memiliki minimal 8 karakter.");
      haptics.error();
      return;
    }

    if (!agreed) {
      setErrorMsg("Anda harus menyetujui Syarat Layanan dan Kebijakan Privasi.");
      haptics.error();
      return;
    }

    // Auto-generate a clean, conformant username from email/name
    const mailPrefix = trimmedEmail
      .split("@")[0]
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/^[._-]+|[._-]+$/g, "")
      .toLowerCase();
    const cleanUsername =
      mailPrefix.length >= 3
        ? mailPrefix.slice(0, 24)
        : `user_${Date.now().toString().slice(-6)}`;

    try {
      await registerMutation.mutateAsync({
        username: cleanUsername,
        fullName: trimmedName,
        email: trimmedEmail,
        password,
      });

      haptics.success();
      setRegisteredEmail(trimmedEmail);
    } catch (err: unknown) {
      haptics.error();
      if (err instanceof ApiError) {
        if (err.statusCode === 409) {
          setErrorMsg(
            "Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk.",
          );
        } else {
          setErrorMsg(err.message || "Gagal melakukan pendaftaran akun.");
        }
      } else {
        setErrorMsg("Terjadi kendala jaringan saat menghubungi server.");
      }
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
          <Box className="w-full max-w-[480px] md:max-w-[540px] self-center">
            {/* Header with Back Button */}
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
              <Text className="text-base font-bold text-foreground">
                Pendaftaran Akun
              </Text>
              <Box className="w-10" />
            </HStack>

            {registeredEmail ? (
              /* Success Activation Banner */
              <VStack
                space="lg"
                className="pt-10 items-center bg-card border border-border p-6 rounded-3xl"
              >
                <Box className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
                  <MailCheck size={36} className="text-primary" />
                </Box>
                <VStack space="xs" className="items-center">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground text-center"
                  >
                    Aktivasi Akun Dikirim
                  </Heading>
                  <Text className="text-sm text-muted-foreground text-center leading-relaxed mt-1">
                    Silakan periksa inbox email di{" "}
                    <Text className="text-sm font-bold text-foreground">
                      {registeredEmail}
                    </Text>{" "}
                    lalu klik tautan aktivasi untuk mengaktifkan akun Anda.
                  </Text>
                </VStack>

                <VStack space="sm" className="w-full pt-4">
                  <Button
                    size="lg"
                    onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                    className="w-full h-12 rounded-2xl bg-primary flex-row items-center justify-center"
                  >
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Ke Halaman Masuk
                    </ButtonText>
                  </Button>
                </VStack>
              </VStack>
            ) : (
              /* Registration Form (Wireframe MS5) */
              <VStack space="md">
                <VStack space="xs" className="pb-3">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Buat Akun Baru
                  </Heading>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Mulai perjalanan kesehatan mental Anda dengan ruang yang aman dan terpercaya.
                  </Text>
                </VStack>

                {errorMsg && (
                  <Box className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-2xl mb-2">
                    <Text className="text-sm text-destructive font-medium leading-relaxed">
                      {errorMsg}
                    </Text>
                  </Box>
                )}

                {/* Nama Lengkap */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Nama lengkap
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Contoh: Sinta Maharani"
                      placeholderTextColor="#8C829D"
                      value={fullName}
                      onChangeText={(val) => {
                        setFullName(val);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      autoCapitalize="words"
                      returnKeyType="next"
                      className="text-sm text-foreground flex-1"
                    />
                    <InputSlot className="pr-2">
                      <InputIcon as={User} className="text-muted-foreground" />
                    </InputSlot>
                  </Input>
                </FormControl>

                {/* Email */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Email
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
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
                      returnKeyType="next"
                      className="text-sm text-foreground flex-1"
                    />
                    <InputSlot className="pr-2">
                      <InputIcon as={Mail} className="text-muted-foreground" />
                    </InputSlot>
                  </Input>
                </FormControl>

                {/* Kata Sandi */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Kata sandi
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Minimal 8 karakter"
                      placeholderTextColor="#8C829D"
                      value={password}
                      onChangeText={(val) => {
                        setPassword(val);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      secureTextEntry={!showPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
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

                {/* Checkbox Persetujuan (Wireframe MS5) */}
                <Pressable
                  onPress={() => setAgreed(!agreed)}
                  className="flex-row items-center gap-2.5 pt-2"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Box
                    className={`w-5 h-5 rounded-md border items-center justify-center ${
                      agreed ? "bg-primary border-primary" : "border-border bg-card"
                    }`}
                  >
                    {agreed && <Check size={14} color="#FFFFFF" />}
                  </Box>
                  <Text className="text-sm text-muted-foreground flex-1 leading-relaxed">
                    Saya menyetujui{" "}
                    <Text
                      onPress={() =>
                        openUrl("https://staging.seraphany.id/syarat-layanan")
                      }
                      className="text-sm font-bold text-primary underline"
                    >
                      Syarat Layanan
                    </Text>{" "}
                    dan{" "}
                    <Text
                      onPress={() =>
                        openUrl("https://staging.seraphany.id/kebijakan-privasi")
                      }
                      className="text-sm font-bold text-primary underline"
                    >
                      Kebijakan Privasi
                    </Text>{" "}
                    SeraPhany.
                  </Text>
                </Pressable>

                {/* Tombol Submit */}
                <Button
                  size="lg"
                  disabled={isLoading}
                  onPress={handleRegister}
                  className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3"
                >
                  {isLoading ? (
                    <ButtonSpinner className="text-primary-foreground" />
                  ) : (
                    <ButtonText className="text-primary-foreground font-bold text-base">
                      Daftar Sekarang
                    </ButtonText>
                  )}
                </Button>

                {/* Sudah punya akun */}
                <HStack space="xs" className="justify-center items-center pt-3">
                  <Text className="text-sm text-muted-foreground font-medium">
                    Sudah punya akun?
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
              </VStack>
            )}
          </Box>

          {/* Official Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[480px] md:max-w-[540px] self-center items-center pt-8"
          >
            <HStack space="xs" className="items-center">
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

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
  AtSign,
  Eye,
  EyeOff,
  MailCheck,
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
import { useRegisterPatient } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegisterPatient();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const isLoading = registerMutation.isPending;

  const handleRegister = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMsg("Nama lengkap wajib diisi.");
      haptics.error();
      return;
    }

    // Username format check: 3 to 30 characters, alphanumeric + . _ -
    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      setErrorMsg("Username harus memiliki panjang 3 hingga 30 karakter.");
      haptics.error();
      return;
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUsername)) {
      setErrorMsg(
        "Username hanya boleh memuat huruf, angka, titik (.), strip (-), dan garis bawah (_).",
      );
      haptics.error();
      return;
    }

    if (!/^(?![._-])(?!.*[._-]{2})[a-zA-Z0-9._-]+(?<![._-])$/.test(trimmedUsername)) {
      setErrorMsg(
        "Username tidak boleh diawali/diakhiri simbol dan tidak boleh memuat simbol berurutan.",
      );
      haptics.error();
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg("Format alamat email tidak valid.");
      haptics.error();
      return;
    }

    // Core API requires min length 8
    if (password.length < 8) {
      setErrorMsg("Kata sandi wajib memiliki minimal 8 karakter.");
      haptics.error();
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok dengan kata sandi.");
      haptics.error();
      return;
    }

    try {
      await registerMutation.mutateAsync({
        username: trimmedUsername,
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
            "Alamat email atau username ini sudah terdaftar. Silakan gunakan kredensial lain atau masuk.",
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
          <Box className="w-full max-w-[440px] self-center">
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
                    Akun tidak otomatis aktif. Silakan periksa inbox email di{" "}
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
              /* Registration Form */
              <VStack space="md">
                <VStack space="xs" className="pb-3">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Buat Akun SeraPhany
                  </Heading>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Satu akun tunggal untuk pasien, konseling, dan praktisi kesehatan mental.
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
                      Nama Lengkap
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Nama lengkap sesuai identitas"
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

                {/* Username */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Username
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="john_doe (3-30 karakter)"
                      placeholderTextColor="#8C829D"
                      value={username}
                      onChangeText={(val) => {
                        setUsername(val);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                      className="text-sm text-foreground flex-1"
                    />
                    <InputSlot className="pr-2">
                      <InputIcon as={AtSign} className="text-muted-foreground" />
                    </InputSlot>
                  </Input>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Huruf, angka, titik, strip, dan garis bawah.
                  </Text>
                </FormControl>

                {/* Email */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Alamat Email
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
                      Kata Sandi
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

                {/* Konfirmasi Kata Sandi */}
                <FormControl isRequired>
                  <FormControlLabel>
                    <FormControlLabelText className="text-sm font-bold text-foreground">
                      Konfirmasi Kata Sandi
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Input className="h-12 rounded-2xl border-border bg-card px-3">
                    <InputField
                      placeholder="Ulangi kata sandi"
                      placeholderTextColor="#8C829D"
                      value={confirmPassword}
                      onChangeText={(val) => {
                        setConfirmPassword(val);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
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
                      Daftar Akun Baru
                    </ButtonText>
                  )}
                </Button>

                {/* Sudah punya akun */}
                <HStack space="xs" className="justify-center items-center pt-3">
                  <Text className="text-sm text-muted-foreground font-medium">
                    Sudah memiliki akun?
                  </Text>
                  <Pressable
                    onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="text-sm font-bold text-primary underline">
                      Masuk Sekarang
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            )}
          </Box>

          {/* Official Legal Footer */}
          <VStack
            space="xs"
            className="w-full max-w-[440px] self-center items-center pt-8"
          >
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
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

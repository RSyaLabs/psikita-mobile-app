import React, { useState } from "react";
import { Image, Linking, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MailCheck,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const isLoading = registerMutation.isPending;

  const handleRegister = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMsg("Nama lengkap wajib diisi.");
      haptics.error();
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Alamat email tidak valid.");
      haptics.error();
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      haptics.error();
      return;
    }

    try {
      const generatedUsername =
        trimmedEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") ||
        `user_${Date.now()}`;

      await registerMutation.mutateAsync({
        username: generatedUsername,
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
          setErrorMsg("Alamat email ini sudah terdaftar. Silakan masuk.");
        } else {
          setErrorMsg(err.message || "Gagal melakukan pendaftaran.");
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
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 40,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <VStack space="lg" className="w-full max-w-[440px] self-center">
            {/* Top Navigation Bar */}
            <HStack space="sm" className="items-center justify-between pt-1 pb-2">
              <Pressable
                onPress={() => router.replace(ROUTES.AUTH.LOGIN as any)}
                accessibilityRole="button"
                accessibilityLabel="Kembali ke halaman masuk"
                className="w-10 h-10 rounded-full border border-border bg-card items-center justify-center active:bg-muted"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </Pressable>
              <HStack space="xs" className="items-center">
                <Image
                  source={require("../../assets/icon.png")}
                  style={{ width: 28, height: 28, borderRadius: 8 }}
                  resizeMode="contain"
                />
                <Text className="text-sm font-bold text-foreground">
                  SeraPhany
                </Text>
              </HStack>
              <Box className="w-10" />
            </HStack>

            {registeredEmail ? (
              /* Success / Email Activation Notice View */
              <VStack space="lg" className="py-6 items-center">
                <Box className="w-20 h-20 rounded-3xl bg-secondary/15 items-center justify-center mb-2">
                  <MailCheck size={44} color="#0D9488" />
                </Box>
                <Heading
                  level={1}
                  size="2xl"
                  bold
                  className="text-foreground text-center tracking-tight"
                >
                  Cek Kotak Masuk Anda
                </Heading>
                <Text className="text-sm text-muted-foreground text-center font-medium leading-relaxed px-4">
                  Tautan aktivasi akun telah dikirimkan ke{" "}
                  <Text className="text-sm font-bold text-primary">
                    {registeredEmail}
                  </Text>
                  . Silakan periksa inbox atau folder spam email Anda dan klik
                  tautan untuk mengaktifkan akun sebelum masuk.
                </Text>

                <Box className="w-full p-4 rounded-2xl bg-card border border-border mt-2">
                  <Text className="text-sm text-muted-foreground leading-relaxed text-center">
                    💡 Satu akun SeraPhany dapat digunakan untuk konsultasi pasien
                    maupun pendaftaran kemitraan praktisi setelah verifikasi Didit.
                  </Text>
                </Box>

                <Button
                  size="lg"
                  onPress={() => {
                    haptics.medium();
                    router.replace({
                      pathname: ROUTES.AUTH.LOGIN,
                      params: { mode: "login" },
                    } as any);
                  }}
                  className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-4"
                >
                  <ButtonText className="text-primary-foreground font-bold text-base">
                    Masuk ke Akun Sekarang
                  </ButtonText>
                </Button>
              </VStack>
            ) : (
              /* Registration Form View */
              <VStack space="md">
                <VStack space="xs" className="pt-2">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Daftar Akun Baru
                  </Heading>
                  <Text className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Satu akun terpadu untuk pasien dan calon praktisi kesehatan mental.
                  </Text>
                </VStack>

                {errorMsg && (
                  <Box className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 flex-row items-center gap-2.5">
                    <Text className="text-sm text-destructive font-semibold flex-1 leading-relaxed">
                      {errorMsg}
                    </Text>
                  </Box>
                )}

                <VStack space="md" className="pt-1">
                  <FormControl>
                    <FormControlLabel className="mb-1.5">
                      <FormControlLabelText className="text-sm font-bold text-foreground">
                        Nama Lengkap
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
                        className="text-sm text-foreground"
                      />
                    </Input>
                  </FormControl>

                  <FormControl>
                    <FormControlLabel className="mb-1.5">
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
                        className="text-sm text-foreground"
                      />
                    </Input>
                  </FormControl>

                  <FormControl>
                    <FormControlLabel className="mb-1.5">
                      <FormControlLabelText className="text-sm font-bold text-foreground">
                        Kata Sandi (Minimal 6 karakter)
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Input className="h-12 rounded-2xl border-border bg-card px-3">
                      <InputField
                        placeholder="Buat kata sandi aman"
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
                </VStack>

                {/* Login Link */}
                <VStack space="xs" className="items-center pt-2">
                  <HStack space="xs" className="items-center">
                    <Text className="text-sm text-muted-foreground font-medium">
                      Sudah punya akun?
                    </Text>
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        router.replace({
                          pathname: ROUTES.AUTH.LOGIN,
                          params: { mode: "login" },
                        } as any);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text className="text-sm font-bold text-primary underline">
                        Masuk ke Akun
                      </Text>
                    </Pressable>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </VStack>

          {/* Legal Compliance Footer */}
          <VStack space="xs" className="w-full max-w-[440px] self-center items-center pt-8">
            <Text className="text-sm text-muted-foreground text-center leading-relaxed">
              Dengan mendaftar, Anda menyetujui{" "}
              <Text
                onPress={() => openUrl("https://staging.seraphany.id/syarat-layanan")}
                className="text-sm text-primary font-bold underline"
              >
                Syarat Layanan
              </Text>{" "}
              dan{" "}
              <Text
                onPress={() => openUrl("https://staging.seraphany.id/kebijakan-privasi")}
                className="text-sm text-primary font-bold underline"
              >
                Kebijakan Privasi
              </Text>{" "}
              SeraPhany.
            </Text>
            <HStack space="xs" className="items-center mt-1">
              <Text
                onPress={() => openUrl("https://staging.seraphany.id/en/terms-of-service")}
                className="text-sm text-muted-foreground underline"
              >
                Terms of Service (EN)
              </Text>
              <Text className="text-sm text-muted-foreground">•</Text>
              <Text
                onPress={() => openUrl("https://staging.seraphany.id/en/privacy-policy")}
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

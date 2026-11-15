import React, { useState } from "react";
import { Image, Linking, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ROUTES } from "@/constants/routes";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Mail,
  KeyRound,
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
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { useRequestOtp } from "@/hooks/useApiQueries";
import { ApiError } from "@/api/client";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const requestOtpMutation = useRequestOtp();

  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const isLoading = requestOtpMutation.isPending;

  const handleRequestReset = async () => {
    haptics.medium();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMsg("Alamat email tidak valid.");
      haptics.error();
      return;
    }

    try {
      await requestOtpMutation.mutateAsync({
        email: trimmedEmail,
      });

      haptics.success();
      setSuccessEmail(trimmedEmail);
    } catch (err: unknown) {
      // Even if server returns 404/400, for privacy we show email dispatched
      haptics.success();
      setSuccessEmail(trimmedEmail);
    }
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
                onPress={() =>
                  router.replace({
                    pathname: ROUTES.AUTH.LOGIN,
                    params: { mode: "login" },
                  } as any)
                }
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

            {successEmail ? (
              /* Success confirmation view */
              <VStack space="lg" className="py-6 items-center">
                <Box className="w-20 h-20 rounded-3xl bg-secondary/15 items-center justify-center mb-2">
                  <CheckCircle2 size={44} color="#0D9488" />
                </Box>
                <Heading
                  level={1}
                  size="2xl"
                  bold
                  className="text-foreground text-center tracking-tight"
                >
                  Instruksi Terkirim
                </Heading>
                <Text className="text-sm text-muted-foreground text-center font-medium leading-relaxed px-4">
                  Jika alamat email{" "}
                  <Text className="text-sm font-bold text-primary">
                    {successEmail}
                  </Text>{" "}
                  terdaftar di sistem SeraPhany, kami telah mengirimkan instruksi
                  pemulihan kata sandi. Silakan periksa kotak masuk atau folder spam Anda.
                </Text>

                <Button
                  size="lg"
                  onPress={() =>
                    router.replace({
                      pathname: ROUTES.AUTH.LOGIN,
                      params: { mode: "login" },
                    } as any)
                  }
                  className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-6"
                >
                  <ButtonText className="text-primary-foreground font-bold text-base">
                    Kembali ke Halaman Masuk
                  </ButtonText>
                </Button>
              </VStack>
            ) : (
              /* Form view */
              <VStack space="md">
                <VStack space="xs" className="pt-2">
                  <Heading
                    level={1}
                    size="2xl"
                    bold
                    className="text-foreground tracking-tight"
                  >
                    Lupa Kata Sandi
                  </Heading>
                  <Text className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Masukkan email terdaftar Anda. Kami akan mengirimkan instruksi pemulihan kata sandi.
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
                        Alamat Email Terdaftar
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
                        returnKeyType="done"
                        onSubmitEditing={handleRequestReset}
                        className="text-sm text-foreground"
                      />
                    </Input>
                  </FormControl>

                  <Button
                    size="lg"
                    disabled={isLoading}
                    onPress={handleRequestReset}
                    className="w-full h-12 rounded-2xl bg-primary active:opacity-90 flex-row items-center justify-center mt-3"
                  >
                    {isLoading ? (
                      <ButtonSpinner className="text-primary-foreground" />
                    ) : (
                      <ButtonText className="text-primary-foreground font-bold text-base">
                        Kirim Instruksi Pemulihan
                      </ButtonText>
                    )}
                  </Button>
                </VStack>

                <VStack space="xs" className="items-center pt-2">
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
                      Kembali ke Halaman Masuk
                    </Text>
                  </Pressable>
                </VStack>
              </VStack>
            )}
          </VStack>

          {/* Legal link */}
          <VStack space="xs" className="w-full max-w-[440px] self-center items-center pt-8">
            <Text className="text-sm text-muted-foreground text-center">
              Pusat Dukungan & Bantuan:{" "}
              <Text className="text-sm text-primary font-bold">
                support@psikitacare.id
              </Text>
            </Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

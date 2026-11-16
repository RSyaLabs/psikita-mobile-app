import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Box, Heading, Text, Pressable, ScrollView } from "@/components/ui";
import { ForgotPasswordView } from "@/components/modals/auth/ForgotPasswordView";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "forgot_request" | "forgot_verify">("forgot_request");
  const handleStep = (next: "login" | "forgot_request" | "forgot_verify") => {
    if (next === "login") {
      router.replace(ROUTES.AUTH.SIGN_IN as any);
    } else {
      setStep(next);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 }} keyboardShouldPersistTaps="handled">
        <Box className="w-full max-w-[440px] self-center">
          <Pressable onPress={() => step === "forgot_verify" ? setStep("forgot_request") : router.back()} accessibilityRole="button" accessibilityLabel="Kembali" className="self-start p-2 -ml-2">
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <Heading level={1} size="2xl" bold className="text-foreground pt-10">
            {step === "forgot_verify" ? "Verifikasi akun" : "Lupa kata sandi?"}
          </Heading>
          <Text className="text-muted-foreground pt-2 pb-8">
            {step === "forgot_verify" ? "Masukkan kode yang telah dikirim ke email." : "Kami akan membantu memulihkan akses ke akunmu."}
          </Text>
          <ForgotPasswordView
            tab={step === "forgot_verify" ? "forgot_verify" : "forgot_request"}
            setTab={handleStep}
            onPasswordResetSuccess={() => undefined}
          />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import {
  Button,
  ButtonSpinner,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Input,
  InputField,
  Pressable,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from "@/components/ui";
import { useRequestOtp, useVerifyOtp } from "@/hooks/useApiQueries";
import { haptics } from "@/utils/haptics";

interface ForgotPasswordViewProps {
  tab: "forgot_request" | "forgot_verify";
  setTab: (tab: "login" | "forgot_request" | "forgot_verify") => void;
  onPasswordResetSuccess: (newPassword: string) => void;
}

export function ForgotPasswordView({
  tab,
  setTab,
  onPasswordResetSuccess,
}: ForgotPasswordViewProps) {
  const toast = useToast();
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string | null>(null);

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const handleRequestForgotOtp = () => {
    setForgotErrorMsg(null);
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (
      !targetEmail ||
      (!targetEmail.includes("@") && targetEmail.length < 10)
    ) {
      haptics.error();
      setForgotErrorMsg("Masukkan email atau nomor WhatsApp yang valid.");
      return;
    }
    haptics.medium();
    requestOtpMutation.mutate(
      { email: targetEmail },
      {
        onSuccess: (res) => {
          haptics.success();
          setTab("forgot_verify");
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Kode OTP Terkirim</ToastTitle>
                <ToastDescription>
                  {res?.message || "Kode 4-digit verifikasi telah dikirim."}
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onError: (err: any) => {
          haptics.error();
          setForgotErrorMsg(
            err?.message || "Gagal mengirim OTP. Silakan coba lagi.",
          );
        },
      },
    );
  };

  const handleVerifyForgotOtp = () => {
    setForgotErrorMsg(null);
    if (!forgotOtp.trim()) {
      haptics.error();
      setForgotErrorMsg("Masukkan 4 digit kode OTP verifikasi.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      haptics.error();
      setForgotErrorMsg("Kata sandi baru minimal 6 karakter.");
      return;
    }

    haptics.medium();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      haptics.error();
      setForgotErrorMsg("Masukkan email terlebih dahulu.");
      return;
    }

    verifyOtpMutation.mutate(
      { email: targetEmail, otp: forgotOtp.trim() },
      {
        onSuccess: () => {
          haptics.success();
          onPasswordResetSuccess(forgotNewPassword);
          setTab("login");
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Sandi Berhasil Diperbarui</ToastTitle>
                <ToastDescription>
                  Silakan masuk menggunakan sandi baru Anda.
                </ToastDescription>
              </Toast>
            ),
          });
        },
        onError: (err: any) => {
          haptics.error();
          setForgotErrorMsg(
            err?.message || "Kode OTP tidak valid atau telah kedaluwarsa.",
          );
        },
      },
    );
  };

  if (tab === "forgot_request") {
    return (
      <VStack space="sm" className="w-full">
        <Text
          size="xs"
          className="text-muted-foreground text-xs leading-relaxed"
        >
          Masukkan email atau nomor WhatsApp terdaftar untuk menerima 4 digit kode verifikasi OTP:
        </Text>

        <FormControl
          id="forgot-email-field"
          isRequired
          isInvalid={Boolean(forgotErrorMsg)}
        >
          <FormControlLabel htmlFor="forgot-email-input">
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Email / Nomor WhatsApp
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11">
            <InputField
              id="forgot-email-input"
              name="forgotEmail"
              accessibilityLabel="Email atau nomor WhatsApp terdaftar"
              accessibilityHint={forgotErrorMsg ?? undefined}
              value={forgotEmail}
              onChangeText={(t) => {
                setForgotErrorMsg(null);
                setForgotEmail(t);
              }}
              placeholder="email terdaftar"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
          {forgotErrorMsg && (
            <FormControlError>
              <FormControlErrorText>{forgotErrorMsg}</FormControlErrorText>
            </FormControlError>
          )}
        </FormControl>

        <Button
          size="default"
          isDisabled={requestOtpMutation.isPending}
          onPress={handleRequestForgotOtp}
          className="w-full h-11 rounded-xl bg-primary active:opacity-90 mt-1"
        >
          {requestOtpMutation.isPending ? (
            <ButtonSpinner className="text-primary-foreground" />
          ) : (
            <ButtonText className="text-primary-foreground font-bold text-sm">
              Kirim Kode Verifikasi
            </ButtonText>
          )}
        </Button>

        <HStack
          space="xs"
          className="items-center justify-center pt-2 border-t border-border/40 mt-1"
        >
          <Text size="xs" className="text-muted-foreground text-xs">
            Ingat kata sandi?
          </Text>
          <Pressable
            onPress={() => {
              haptics.light();
              setTab("login");
            }}
          >
            <Text size="xs" bold className="text-primary underline">
              Kembali ke Masuk
            </Text>
          </Pressable>
        </HStack>
      </VStack>
    );
  }

  return (
    <VStack space="sm" className="w-full">
      <Text
        size="xs"
        className="text-muted-foreground text-xs leading-relaxed"
      >
        Kode 4-digit OTP telah dikirim. Masukkan kode verifikasi dan tentukan sandi baru:
      </Text>

      <FormControl
        id="forgot-otp-field"
        isRequired
        isInvalid={Boolean(forgotErrorMsg)}
      >
        <FormControlLabel htmlFor="forgot-otp-input">
          <HStack space="xs" className="w-full items-center justify-between">
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Kode OTP (4 Digit)
            </FormControlLabelText>
            <Text
              size="xs"
              className="text-[10px] text-muted-foreground font-semibold"
            >
              {forgotOtp.length}/4
            </Text>
          </HStack>
        </FormControlLabel>
        <Input className="rounded-xl border-border bg-background h-12 px-3 justify-center">
          <InputField
            id="forgot-otp-input"
            name="forgotOtp"
            accessibilityLabel="Kode OTP empat digit"
            accessibilityHint={forgotErrorMsg ?? undefined}
            value={forgotOtp}
            onChangeText={(t) => {
              setForgotErrorMsg(null);
              setForgotOtp(t.replace(/[^0-9]/g, "").slice(0, 4));
            }}
            placeholder="0 0 0 0"
            keyboardType="number-pad"
            maxLength={4}
            className="text-center font-mono font-bold text-xl tracking-[16px] text-foreground"
          />
        </Input>
        {forgotErrorMsg && (
          <FormControlError>
            <FormControlErrorText>{forgotErrorMsg}</FormControlErrorText>
          </FormControlError>
        )}
      </FormControl>

      <FormControl
        id="forgot-new-password-field"
        isRequired
        isInvalid={Boolean(forgotErrorMsg)}
      >
        <FormControlLabel htmlFor="forgot-new-password-input">
          <FormControlLabelText className="text-xs font-bold text-foreground">
            Kata Sandi Baru
          </FormControlLabelText>
        </FormControlLabel>
        <Input className="rounded-xl border-border bg-background h-11 px-3 flex-row items-center">
          <InputField
            id="forgot-new-password-input"
            name="forgotNewPassword"
            accessibilityLabel="Kata sandi baru"
            accessibilityHint={forgotErrorMsg ?? undefined}
            value={forgotNewPassword}
            onChangeText={(t) => {
              setForgotErrorMsg(null);
              setForgotNewPassword(t);
            }}
            placeholder="Minimal 6 karakter"
            secureTextEntry={!showForgotNewPassword}
            className="flex-1 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <Pressable
            onPress={() => setShowForgotNewPassword(!showForgotNewPassword)}
            className="p-1.5 -mr-1"
            accessibilityRole="button"
            accessibilityLabel={
              showForgotNewPassword ? "Sembunyikan sandi" : "Tampilkan sandi"
            }
          >
            {showForgotNewPassword ? (
              <EyeOff size={18} className="text-muted-foreground" />
            ) : (
              <Eye size={18} className="text-muted-foreground" />
            )}
          </Pressable>
        </Input>
        {forgotErrorMsg && (
          <FormControlError
            className="sr-only"
            accessibilityLabel={forgotErrorMsg}
          >
            <FormControlErrorText />
          </FormControlError>
        )}
      </FormControl>

      <Button
        size="default"
        isDisabled={verifyOtpMutation.isPending}
        onPress={handleVerifyForgotOtp}
        className="w-full h-11 rounded-xl bg-primary active:opacity-90 mt-1"
      >
        {verifyOtpMutation.isPending ? (
          <ButtonSpinner className="text-primary-foreground" />
        ) : (
          <ButtonText className="text-primary-foreground font-bold text-sm">
            Simpan Sandi & Selesai
          </ButtonText>
        )}
      </Button>

      <Pressable
        onPress={() => {
          haptics.light();
          setTab("forgot_request");
        }}
        className="items-center py-1 mt-0.5 active:opacity-75"
      >
        <Text
          size="xs"
          className="text-muted-foreground text-[11px] underline"
        >
          Kirim ulang kode OTP
        </Text>
      </Pressable>
    </VStack>
  );
}

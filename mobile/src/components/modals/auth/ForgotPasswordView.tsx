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
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
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
      setForgotErrorMsg("Masukkan email yang valid.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      haptics.error();
      setForgotErrorMsg("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      haptics.error();
      setForgotErrorMsg("Konfirmasi kata sandi tidak cocok.");
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
                  {res?.message || "Kode verifikasi OTP telah dikirim."}
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
    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      haptics.error();
      setForgotErrorMsg("Masukkan kode OTP verifikasi.");
      return;
    }
    if (forgotNewPassword.length < 8) {
      haptics.error();
      setForgotErrorMsg("Kata sandi baru minimal 8 karakter.");
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
          size="sm"
          className="text-muted-foreground text-sm leading-relaxed"
        >
          Masukkan email dan buat kata sandi baru akun Anda:
        </Text>

        {forgotErrorMsg && (
          <Text size="sm" className="text-destructive text-sm font-medium">
            {forgotErrorMsg}
          </Text>
        )}

        <FormControl
          id="forgot-email-field"
          isRequired
          isInvalid={Boolean(forgotErrorMsg)}
        >
          <FormControlLabel htmlFor="forgot-email-input">
            <FormControlLabelText className="text-sm font-bold text-foreground">
              Email Akun
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11">
            <InputField
              id="forgot-email-input"
              name="forgotEmail"
              accessibilityLabel="Email terdaftar"
              value={forgotEmail}
              onChangeText={(t) => {
                setForgotErrorMsg(null);
                setForgotEmail(t);
              }}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="text-sm text-foreground placeholder:text-muted-foreground"
            />
          </Input>
        </FormControl>

        <FormControl
          id="forgot-new-password-field"
          isRequired
          isInvalid={Boolean(forgotErrorMsg && forgotNewPassword.length < 8)}
        >
          <FormControlLabel htmlFor="forgot-new-password-input">
            <FormControlLabelText className="text-sm font-bold text-foreground">
              Kata Sandi Baru
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3 flex-row items-center">
            <InputField
              id="forgot-new-password-input"
              name="forgotNewPassword"
              accessibilityLabel="Kata sandi baru"
              value={forgotNewPassword}
              onChangeText={(t) => {
                setForgotErrorMsg(null);
                setForgotNewPassword(t);
              }}
              placeholder="Minimal 8 karakter"
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
        </FormControl>

        <FormControl
          id="forgot-confirm-password-field"
          isRequired
          isInvalid={Boolean(
            forgotErrorMsg && forgotConfirmPassword !== forgotNewPassword,
          )}
        >
          <FormControlLabel htmlFor="forgot-confirm-password-input">
            <FormControlLabelText className="text-sm font-bold text-foreground">
              Konfirmasi Kata Sandi
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3 flex-row items-center">
            <InputField
              id="forgot-confirm-password-input"
              name="forgotConfirmPassword"
              accessibilityLabel="Konfirmasi kata sandi"
              value={forgotConfirmPassword}
              onChangeText={(t) => {
                setForgotErrorMsg(null);
                setForgotConfirmPassword(t);
              }}
              placeholder="Ulangi kata sandi baru"
              secureTextEntry={!showForgotConfirmPassword}
              className="flex-1 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Pressable
              onPress={() =>
                setShowForgotConfirmPassword(!showForgotConfirmPassword)
              }
              className="p-1.5 -mr-1"
              accessibilityRole="button"
              accessibilityLabel={
                showForgotConfirmPassword
                  ? "Sembunyikan sandi"
                  : "Tampilkan sandi"
              }
            >
              {showForgotConfirmPassword ? (
                <EyeOff size={18} className="text-muted-foreground" />
              ) : (
                <Eye size={18} className="text-muted-foreground" />
              )}
            </Pressable>
          </Input>
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
              Kirim Kode OTP
            </ButtonText>
          )}
        </Button>

        <HStack
          space="xs"
          className="items-center justify-center pt-2 border-t border-border/40 mt-1"
        >
          <Text size="sm" className="text-muted-foreground text-sm">
            Ingat kata sandi?
          </Text>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => {
              haptics.light();
              setTab("login");
            }}
          >
            <Text size="sm" bold className="text-primary underline">
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
        size="sm"
        className="text-muted-foreground text-sm leading-relaxed"
      >
        Kode OTP telah dikirim ke {forgotEmail || "email Anda"}. Masukkan kode verifikasi:
      </Text>

      {forgotErrorMsg && (
        <Text size="sm" className="text-destructive text-sm font-medium">
          {forgotErrorMsg}
        </Text>
      )}

      <FormControl
        id="forgot-otp-field"
        isRequired
        isInvalid={Boolean(forgotErrorMsg)}
      >
        <FormControlLabel htmlFor="forgot-otp-input">
          <FormControlLabelText className="text-sm font-bold text-foreground">
            Kode OTP
          </FormControlLabelText>
        </FormControlLabel>
        <Input className="rounded-xl border-border bg-background h-12 px-3 justify-center">
          <InputField
            id="forgot-otp-input"
            name="forgotOtp"
            accessibilityLabel="Kode verifikasi OTP"
            value={forgotOtp}
            onChangeText={(t) => {
              setForgotErrorMsg(null);
              setForgotOtp(t.replace(/[^0-9]/g, "").slice(0, 6));
            }}
            placeholder="0 0 0 0 0 0"
            keyboardType="number-pad"
            maxLength={6}
            className="text-center font-mono font-bold text-xl tracking-[12px] text-foreground"
          />
        </Input>
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
            Verifikasi OTP & Simpan Sandi
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
          size="sm"
          className="text-muted-foreground text-sm font-medium underline"
        >
          Kirim ulang kode OTP
        </Text>
      </Pressable>
    </VStack>
  );
}

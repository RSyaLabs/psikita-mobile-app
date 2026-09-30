import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Lock,
  KeyRound,
  X,
  ArrowLeft,
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
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { useLogin } from "@/hooks/useApiQueries";
import { getHomeRouteForResponse } from "@/hooks/useAuth";
import { haptics } from "@/utils/haptics";
import { DevQuickLoginChips } from "./DevQuickLoginChips";
import { ForgotPasswordView } from "./ForgotPasswordView";

/**
 * Sign-in modal.
 *
 * Handles credential sign-in, 1-click test accounts, and the forgot-password
 * recovery flow via modular child views.
 */

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "forgot_request" | "forgot_verify";
  initialErrorMsg?: string | null;
  onOpenRegister?: () => void;
}

export function AuthLoginModal({
  isOpen,
  onClose,
  initialTab = "login",
  initialErrorMsg = null,
  onOpenRegister,
}: AuthLoginModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "forgot_request" | "forgot_verify">(
    initialTab,
  );

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(initialErrorMsg);

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  useEffect(() => {
    setTab(initialTab);
    if (initialErrorMsg !== undefined) {
      setErrorMsg(initialErrorMsg);
    }
  }, [initialTab, initialErrorMsg, isOpen]);

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const handleCredentialLogin = async () => {
    haptics.medium();
    setErrorMsg(null);

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setErrorMsg("Masukkan username/email dan kata sandi.");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({
        username: normalizedUsername,
        password,
      });
      const homeRoute = getHomeRouteForResponse(res);
      if (!homeRoute) {
        haptics.error();
        setErrorMsg("Respons login tidak valid. Silakan coba lagi.");
        return;
      }
      haptics.success();
      handleClose();
      router.replace(homeRoute as any);
    } catch (err: any) {
      haptics.error();
      setErrorMsg(err?.message || "Login gagal. Cek username dan sandi.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalBackdrop
        dataSet={{ backdrop: "true" }}
        className="bg-black/45 backdrop-blur-md"
        style={
          {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[390px] max-h-[92vh] overflow-hidden">
        <ModalHeader className="pb-3 border-b border-border/40">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center flex-1 mr-2">
              {tab !== "login" && (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setTab(
                      tab === "forgot_verify" ? "forgot_request" : "login",
                    );
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1.5 -ml-1 mr-1 rounded-full active:bg-muted"
                >
                  <ArrowLeft size={18} className="text-foreground" />
                </Pressable>
              )}
              <Box className="w-7 h-7 bg-primary/10 rounded-xl items-center justify-center mr-1">
                {tab === "login" ? (
                  <Lock size={14} className="text-primary" />
                ) : (
                  <KeyRound size={14} className="text-primary" />
                )}
              </Box>
              <Heading
                level={1}
                size="md"
                bold
                className="text-foreground flex-1"
                numberOfLines={1}
              >
                {tab === "login"
                  ? "Masuk ke Akun"
                  : tab === "forgot_request"
                    ? "Lupa Kata Sandi"
                    : "Verifikasi & Sandi Baru"}
              </Heading>
            </HStack>
            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-0 mb-0">
          {tab === "login" ? (
            <VStack space="sm" className="w-full">
              <DevQuickLoginChips
                onSelectAccount={(selectedUsername) => {
                  setUsername(selectedUsername);
                  setPassword("password123");
                  setErrorMsg(null);
                }}
              />

              <FormControl
                id="login-username-field"
                isRequired
                isInvalid={Boolean(errorMsg)}
              >
                <FormControlLabel htmlFor="login-username-input">
                  <FormControlLabelText className="text-xs font-bold text-foreground">
                    Username / Email
                  </FormControlLabelText>
                </FormControlLabel>
                <Input className="rounded-xl border-border bg-background h-11">
                  <InputField
                    id="login-username-input"
                    name="username"
                    accessibilityLabel="Username atau email"
                    accessibilityHint={errorMsg ?? undefined}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="username atau email"
                    autoCapitalize="none"
                  />
                </Input>
                {errorMsg && (
                  <FormControlError>
                    <FormControlErrorText>{errorMsg}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              <FormControl
                id="login-password-field"
                isRequired
                isInvalid={Boolean(errorMsg)}
              >
                <FormControlLabel htmlFor="login-password-input">
                  <HStack
                    space="xs"
                    className="w-full items-center justify-between"
                  >
                    <FormControlLabelText className="text-xs font-bold text-foreground">
                      Kata Sandi
                    </FormControlLabelText>
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        setErrorMsg(null);
                        setTab("forgot_request");
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityRole="button"
                      accessibilityLabel="Lupa kata sandi"
                    >
                      <Text
                        size="xs"
                        className="text-secondary font-semibold text-[11px]"
                      >
                        Lupa kata sandi?
                      </Text>
                    </Pressable>
                  </HStack>
                </FormControlLabel>
                <Input className="rounded-xl border-border bg-background h-11">
                  <InputField
                    id="login-password-input"
                    name="password"
                    accessibilityLabel="Kata sandi"
                    accessibilityHint={errorMsg ?? undefined}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry
                  />
                </Input>
                {errorMsg && (
                  <FormControlError
                    className="sr-only"
                    accessibilityLabel={errorMsg}
                  >
                    <FormControlErrorText />
                  </FormControlError>
                )}
              </FormControl>

              <Button
                size="default"
                isDisabled={isLoading}
                onPress={handleCredentialLogin}
                className="w-full h-11 rounded-xl bg-primary active:opacity-90 mt-1"
              >
                <ButtonText className="text-primary-foreground font-bold text-sm">
                  {isLoading ? "Memverifikasi..." : "Masuk Sekarang"}
                </ButtonText>
              </Button>

              {onOpenRegister && (
                <HStack
                  space="xs"
                  className="items-center justify-center pt-2 border-t border-border/40 mt-1"
                >
                  <Text size="xs" className="text-muted-foreground text-xs">
                    Belum punya akun?
                  </Text>
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      handleClose();
                      onOpenRegister();
                    }}
                  >
                    <Text size="xs" bold className="text-primary underline">
                      Daftar Pasien Baru
                    </Text>
                  </Pressable>
                </HStack>
              )}
            </VStack>
          ) : (
            <ForgotPasswordView
              tab={tab}
              setTab={setTab}
              onPasswordResetSuccess={(newPassword) => {
                setPassword(newPassword);
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

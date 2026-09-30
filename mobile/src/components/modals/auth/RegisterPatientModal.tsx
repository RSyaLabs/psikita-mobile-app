import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Lock,
  KeyRound,
  UserPlus,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
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
  FormControlError,
  FormControlErrorText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import {
  useLogin,
  useRegisterPatient,
  useRequestOtp,
  useVerifyOtp,
} from "@/hooks/useApiQueries";
import { getHomeRouteForResponse } from "@/hooks/useAuth";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants/routes";


/**
 * New patient registration modal.
 */

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export function RegisterPatientModal({
  isOpen,
  onClose,
  onOpenLogin,
}: RegisterPatientModalProps) {
  const router = useRouter();
  const toast = useToast();
  const registerMutation = useRegisterPatient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const handleRegister = () => {
    setErrorMsg(null);
    if (!fullName.trim()) {
      haptics.error();
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      haptics.error();
      setErrorMsg("Masukkan alamat email yang valid.");
      return;
    }
    if (password.length < 6) {
      haptics.error();
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    haptics.medium();
    const cleanEmail = email.trim().toLowerCase();
    const username =
      cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") ||
      fullName.toLowerCase().replace(/\s+/g, "_");

    registerMutation.mutate(
      {
        username,
        email: cleanEmail,
        password,
        fullName: fullName.trim(),
      },
      {
        onSuccess: () => {
          haptics.success();
          handleClose();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Registrasi Berhasil</ToastTitle>
                <ToastDescription>
                  Akun Anda berhasil dibuat. Selamat datang di PsiKita!
                </ToastDescription>
              </Toast>
            ),
          });
          router.replace(ROUTES.AUTH.LOGIN);
        },
        onError: (err: any) => {
          haptics.error();
          setErrorMsg(
            err?.message || "Terjadi kesalahan saat memproses data registrasi.",
          );
        },
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalBackdrop
        className="bg-black/40 backdrop-blur-md"
        style={
          {
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[90%] max-w-[390px]">
        <ModalHeader className="pb-3 border-b border-border/40">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-6 h-6 bg-primary rounded-lg items-center justify-center">
                <UserPlus size={12} className="text-primary-foreground" />
              </Box>
              <Heading level={1} size="md" bold className="text-foreground">
                Daftar Akun Baru
              </Heading>
            </HStack>
            <Pressable
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md" className="w-full">
            <FormControl
              id="register-name-field"
              isRequired
              isInvalid={Boolean(errorMsg)}
            >
              <FormControlLabel htmlFor="register-name-input">
                <FormControlLabelText className="text-xs font-bold text-foreground">
                  Nama Lengkap
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="rounded-xl border-border bg-background h-11">
                <InputField
                  id="register-name-input"
                  name="fullName"
                  accessibilityLabel="Nama lengkap"
                  accessibilityHint={errorMsg ?? undefined}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Contoh: Sinta Maharani"
                />
              </Input>
              {errorMsg && (
                <FormControlError>
                  <FormControlErrorText>{errorMsg}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>

            <FormControl
              id="register-email-field"
              isRequired
              isInvalid={Boolean(errorMsg)}
            >
              <FormControlLabel htmlFor="register-email-input">
                <FormControlLabelText className="text-xs font-bold text-foreground">
                  Email
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="rounded-xl border-border bg-background h-11">
                <InputField
                  id="register-email-input"
                  name="email"
                  accessibilityLabel="Email"
                  accessibilityHint={errorMsg ?? undefined}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nama@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
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

            <FormControl
              id="register-password-field"
              isRequired
              isInvalid={Boolean(errorMsg)}
            >
              <FormControlLabel htmlFor="register-password-input">
                <FormControlLabelText className="text-xs font-bold text-foreground">
                  Kata Sandi
                </FormControlLabelText>
              </FormControlLabel>
              <Input className="rounded-xl border-border bg-background h-11">
                <InputField
                  id="register-password-input"
                  name="password"
                  accessibilityLabel="Kata sandi"
                  accessibilityHint={errorMsg ?? undefined}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 6 karakter"
                  secureTextEntry={!showPassword}
                  className="flex-1"
                />
                <InputSlot
                  onPress={() => setShowPassword(!showPassword)}
                  className="pr-3"
                >
                  <InputIcon
                    as={showPassword ? EyeOff : Eye}
                    className="text-muted-foreground"
                  />
                </InputSlot>
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
              size="lg"
              isDisabled={registerMutation.isPending}
              onPress={handleRegister}
              className="w-full h-12 rounded-xl bg-primary active:opacity-90 mt-1"
            >
              {registerMutation.isPending ? (
                <ButtonSpinner className="text-primary-foreground" />
              ) : (
                <ButtonText className="text-primary-foreground font-bold text-sm">
                  Daftar Sekarang
                </ButtonText>
              )}
            </Button>

            <Text
              size="xs"
              className="text-center text-muted-foreground text-[11px] leading-relaxed px-1"
            >
              Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta
              Kebijakan Privasi PsiKita.
            </Text>

            {onOpenLogin && (
              <HStack
                space="xs"
                className="items-center justify-center pt-2 border-t border-border/40 mt-1"
              >
                <Text size="xs" className="text-muted-foreground text-xs">
                  Sudah punya akun?
                </Text>
                <Pressable
                  onPress={() => {
                    haptics.light();
                    handleClose();
                    onOpenLogin();
                  }}
                >
                  <Text size="xs" bold className="text-primary underline">
                    Masuk Sekarang
                  </Text>
                </Pressable>
              </HStack>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

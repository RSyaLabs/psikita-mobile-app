import React from "react";
import { ShieldCheck, X } from "lucide-react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Pressable,
  Button,
  ButtonText,
  Image,
  Badge,
  BadgeText,
} from "@/components/ui";

export interface UserDetailData {
  id: string;
  name: string;
  identifier: string;
  email: string;
  role: string;
  sessions: string;
  status: string;
  satusehat: string;
  avatar: string;
}

export interface UserDetailModalProps {
  user: UserDetailData | null;
  onClose: () => void;
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const isPractitioner =
    user?.role?.includes("Psikolog") || user?.role?.includes("Psikiater");

  return (
    <Modal isOpen={!!user} onClose={onClose} size="md">
      <ModalBackdrop
        className="bg-black/40 backdrop-blur-md"
        style={
          {
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[400px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <ShieldCheck size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Detail Akun {isPractitioner ? "Praktisi" : "Pasien"}
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full active:bg-muted"
              accessibilityRole="button"
              accessibilityLabel="Tutup modal"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          {user && (
            <VStack space="sm">
              <HStack space="md" className="items-center">
                <Image
                  source={{ uri: user.avatar }}
                  className="w-14 h-14 rounded-full border border-border"
                  alt={user.name}
                />
                <VStack space="xs" className="flex-1">
                  <Heading size="xs" bold className="text-foreground">
                    {user.name}
                  </Heading>
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    {user.email}
                  </Text>
                  <Badge className="bg-secondary/15 px-2 py-0.5 rounded-full border-0 self-start mt-0.5">
                    <BadgeText className="text-[10px] font-bold text-secondary">
                      {user.status}
                    </BadgeText>
                  </Badge>
                </VStack>
              </HStack>

              <Box className="p-3 bg-muted rounded-2xl border border-border mt-1">
                <VStack space="xs">
                  <HStack space="md" className="items-center justify-between">
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[11px]"
                    >
                      Legalitas / Identitas
                    </Text>
                    <Text
                      size="xs"
                      bold
                      className="text-foreground text-[11px]"
                    >
                      {user.identifier}
                    </Text>
                  </HStack>
                  <HStack space="md" className="items-center justify-between">
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[11px]"
                    >
                      Riwayat Interaksi
                    </Text>
                    <Text
                      size="xs"
                      bold
                      className="text-foreground text-[11px]"
                    >
                      {user.sessions}
                    </Text>
                  </HStack>
                  <HStack space="md" className="items-center justify-between">
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[11px]"
                    >
                      Integrasi SATUSEHAT
                    </Text>
                    <Text size="xs" bold className="text-secondary text-[11px]">
                      {user.satusehat}
                    </Text>
                  </HStack>
                </VStack>
              </Box>

              <Button
                size="default"
                onPress={onClose}
                className="w-full bg-secondary h-11 rounded-xl mt-3"
              >
                <ButtonText className="text-xs font-bold text-secondary-foreground">
                  Tutup
                </ButtonText>
              </Button>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

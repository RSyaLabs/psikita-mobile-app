import React from "react";
import { Headphones, X, Phone } from "lucide-react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  HStack,
  VStack,
  Box,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
} from "@/components/ui";

interface CareTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CareTeamModal({ isOpen, onClose }: CareTeamModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[390px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Headphones size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Care Team Pendamping RS
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            <Text size="xs" className="text-muted-foreground leading-relaxed">
              Tim Care Navigator PsiKita siap memandu proses administrasi di
              rumah sakit tujuan agar antrean dan klaim BPJS berjalan lancar.
            </Text>

            <Box className="bg-muted p-3.5 rounded-2xl border border-border">
              <HStack space="sm" className="items-center mb-1">
                <Phone size={16} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Hotline WhatsApp Care Team
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground font-mono pl-6">
                0811-9988-7766
              </Text>
            </Box>

            <Button
              size="default"
              onPress={onClose}
              className="w-full bg-primary h-11 rounded-xl mt-1"
            >
              <ButtonText className="text-xs font-bold text-primary-foreground">
                Tutup
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

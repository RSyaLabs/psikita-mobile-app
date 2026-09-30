import React from "react";
import {
  MessageSquare,
  Shield,
  X,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  HelpCircle,
  MapPin,
  Navigation,
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
  ButtonIcon,
  ScrollView,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";


/* -------------------------------------------------------------------------- */
/*                            PatientPrivacyModal                             */
/* -------------------------------------------------------------------------- */
export interface PatientPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientPrivacyModal({
  isOpen,
  onClose,
}: PatientPrivacyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop
        className="bg-black/40 backdrop-blur-md"
        style={
          {
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
                <Shield size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Privasi & Rekam Medis
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup kebijakan privasi"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            <VStack space="xs">
              <HStack space="xs" className="items-center">
                <Lock size={14} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Enkripsi End-to-End
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground leading-relaxed">
                Seluruh percakapan chat, panggilan video, dan catatan konsultasi
                dilindungi enkripsi standar medis internasional dan hanya dapat
                diakses oleh Anda dan praktisi yang bertugas.
              </Text>
            </VStack>

            <VStack space="xs">
              <HStack space="xs" className="items-center">
                <CheckCircle2 size={14} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Kepatuhan UU Perlindungan Data (PDP)
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground leading-relaxed">
                PsiKita tunduk pada regulasi kerahasiaan medis Kemenkes RI dan
                Undang-Undang Perlindungan Data Pribadi No. 27 Tahun 2022. Data
                medis Anda tidak pernah diperjualbelikan kepada pihak ketiga.
              </Text>
            </VStack>

            <Button
              size="default"
              onPress={onClose}
              className="w-full bg-primary h-11 rounded-xl mt-1"
            >
              <ButtonText className="text-xs font-bold text-primary-foreground">
                Saya Mengerti
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

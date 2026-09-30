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
/*                            PatientSupportModal                             */
/* -------------------------------------------------------------------------- */
export interface PatientSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientSupportModal({
  isOpen,
  onClose,
}: PatientSupportModalProps) {
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
              <Box className="w-8 h-8 rounded-xl bg-secondary/15 items-center justify-center">
                <MessageSquare size={18} className="text-secondary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Bantuan & Tim Support
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup bantuan"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            <Text size="xs" className="text-muted-foreground leading-relaxed">
              Tim Care Navigator PsiKita siap membantu kendala teknis
              konsultasi, pertanyaan resep digital, atau proses rujukan BPJS
              Anda.
            </Text>

            <VStack space="xs">
              <Box className="bg-muted p-3 rounded-2xl border border-border">
                <HStack space="sm" className="items-center mb-1">
                  <Phone size={15} className="text-secondary" />
                  <Text size="xs" bold className="text-foreground">
                    Hotline WhatsApp Care
                  </Text>
                </HStack>
                <Text
                  size="xs"
                  className="text-muted-foreground font-mono pl-6"
                >
                  0812-8899-7711 (Respon cepat)
                </Text>
              </Box>

              <Box className="bg-muted p-3 rounded-2xl border border-border">
                <HStack space="sm" className="items-center mb-1">
                  <Mail size={15} className="text-secondary" />
                  <Text size="xs" bold className="text-foreground">
                    Email Pengaduan & Layanan
                  </Text>
                </HStack>
                <Text size="xs" className="text-muted-foreground pl-6">
                  halo@psikita.id
                </Text>
              </Box>

              <Box className="bg-muted p-3 rounded-2xl border border-border">
                <HStack space="sm" className="items-center mb-1">
                  <Clock size={15} className="text-secondary" />
                  <Text size="xs" bold className="text-foreground">
                    Jam Operasional Layanan
                  </Text>
                </HStack>
                <Text size="xs" className="text-muted-foreground pl-6">
                  Senin – Minggu: 08:00 – 22:00 WIB
                </Text>
              </Box>
            </VStack>

            <Button
              size="default"
              onPress={onClose}
              className="w-full bg-secondary h-11 rounded-xl mt-1"
            >
              <ButtonText className="text-xs font-bold text-secondary-foreground">
                Tutup
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

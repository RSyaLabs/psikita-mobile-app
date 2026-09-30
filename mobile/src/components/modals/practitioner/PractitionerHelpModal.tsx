import React from "react";
import {
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Calendar,
  PhoneCall,
  Clock,
  X,
  Bell,
  CheckCircle2,
  ArrowRight,
  FileText,
  Settings,
  HelpCircle,
  BookOpen,
  Activity,
  Phone,
  Share2,
  Copy,
  Camera,
  Image as ImageIcon,
  Hospital,
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
  Badge,
  BadgeText,
  ScrollView,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";


/* -------------------------------------------------------------------------- */
/*                            PractitionerHelpModal                           */
/* -------------------------------------------------------------------------- */
export interface PractitionerHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PractitionerHelpModal({
  isOpen,
  onClose,
}: PractitionerHelpModalProps) {
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
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[400px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <HelpCircle size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Pusat Bantuan Praktisi
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup pusat bantuan"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="xs">
            <Box className="p-3 rounded-2xl bg-muted border border-border flex-row items-center gap-3">
              <BookOpen size={16} className="text-primary" />
              <VStack className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Panduan Standar SOAP & ICD-10
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Pedoman klinis rekam medis digital
                </Text>
              </VStack>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border flex-row items-center gap-3">
              <Activity size={16} className="text-secondary" />
              <VStack className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Protokol Penanganan Krisis & Darurat
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Eskalasi belum tersedia
                </Text>
              </VStack>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border flex-row items-center gap-3">
              <Phone size={16} className="text-foreground" />
              <VStack className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Kanal dukungan belum tersedia
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Belum ada kontak liaison yang tervalidasi dari server.
                </Text>
              </VStack>
            </Box>
          </VStack>

          <Button
            size="default"
            variant="outline"
            onPress={onClose}
            className="w-full border-border bg-card h-11 rounded-xl mt-3"
          >
            <ButtonText className="text-xs font-semibold text-foreground">
              Tutup
            </ButtonText>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

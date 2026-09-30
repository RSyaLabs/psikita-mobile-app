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
/*                          PractitionerSettingsModal                         */
/* -------------------------------------------------------------------------- */
export interface PractitionerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PractitionerSettingsModal({
  isOpen,
  onClose,
}: PractitionerSettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop
        className="bg-black/40 backdrop-blur-md"
        style={
          {
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[400px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Settings size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Pengaturan Praktisi
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup pengaturan praktisi"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="sm">
            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <HStack space="xs" className="items-center justify-between">
                <Text size="xs" bold className="text-foreground">
                  Integrasi SATUSEHAT Kemenkes
                </Text>
                <Badge className="bg-secondary/20 px-2 py-0.5 rounded-full border-0">
                  <BadgeText className="text-[10px] font-bold text-secondary">
                    Terhubung
                  </BadgeText>
                </Badge>
              </HStack>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                ID Praktisi dan status sinkronisasi belum tersedia dari server.
              </Text>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <HStack space="xs" className="items-center justify-between">
                <Text size="xs" bold className="text-foreground">
                  Notifikasi Sesi & Panggilan
                </Text>
                <Badge className="bg-primary/20 px-2 py-0.5 rounded-full border-0">
                  <BadgeText className="text-[10px] font-bold text-primary">
                    Aktif
                  </BadgeText>
                </Badge>
              </HStack>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                Pemberitahuan darurat dan antrian pasien prioritas tinggi.
              </Text>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <HStack space="xs" className="items-center justify-between">
                <Text size="xs" bold className="text-foreground">
                  Enkripsi Rekam Medis (AES-256)
                </Text>
                <Badge className="bg-secondary/20 px-2 py-0.5 rounded-full border-0">
                  <BadgeText className="text-[10px] font-bold text-secondary">
                    Aman
                  </BadgeText>
                </Badge>
              </HStack>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                Kerahasiaan catatan SOAP terjaga sesuai UU PDP No. 27/2022.
              </Text>
            </Box>
          </VStack>

          <Button
            size="default"
            onPress={onClose}
            className="w-full bg-primary h-11 rounded-xl mt-3"
          >
            <ButtonText className="text-xs font-bold text-primary-foreground">
              Tutup
            </ButtonText>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

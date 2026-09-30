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
/*                          PractitionerScheduleModal                         */
/* -------------------------------------------------------------------------- */
export interface PractitionerScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function PractitionerScheduleModal({
  isOpen,
  onClose,
  onSave,
}: PractitionerScheduleModalProps) {
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
              <Box className="w-8 h-8 rounded-xl bg-secondary/15 items-center justify-center">
                <Clock size={18} className="text-secondary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Jadwal Praktik & Kuota
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup jadwal praktik"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="sm">
            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <Text size="xs" bold className="text-foreground">
                Hari Praktik Aktif
              </Text>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                Senin s/d Jumat (Hari Kerja)
              </Text>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <Text size="xs" bold className="text-foreground">
                Jam Layanan Telekonsultasi
              </Text>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                09:00 – 17:00 WIB (Durasi 45 menit / sesi)
              </Text>
            </Box>

            <Box className="p-3 rounded-2xl bg-muted border border-border">
              <Text size="xs" bold className="text-foreground">
                Kuota Maksimal Sesi
              </Text>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px] mt-1"
              >
                8 Pasien per hari (Jeda istirahat 15 menit antar sesi)
              </Text>
            </Box>
          </VStack>

          <Button
            size="default"
            onPress={() => {
              haptics.success();
              if (onSave) onSave();
              onClose();
            }}
            className="w-full bg-secondary h-11 rounded-xl mt-3"
          >
            <ButtonText className="text-xs font-bold text-secondary-foreground">
              Simpan & Terapkan
            </ButtonText>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

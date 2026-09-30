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
/*                             ShareHistoryModal                              */
/* -------------------------------------------------------------------------- */
export interface ShareHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryUrl?: string;
}

export function ShareHistoryModal({
  isOpen,
  onClose,
  summaryUrl = "https://psikita.id/practitioner/nadia-p/summary-sept2026",
}: ShareHistoryModalProps) {
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
                <Share2 size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Bagikan Riwayat Praktik
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full active:bg-muted"
              accessibilityRole="button"
              accessibilityLabel="Tutup bagikan riwayat"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <Text
            size="xs"
            className="text-muted-foreground mb-3 leading-relaxed"
          >
            Ringkasan metrik klinis Anda (128 sesi terlaksana, kepatuhan RME
            100%, rating 4.9/5.0).
          </Text>

          <Box className="p-3 bg-muted rounded-2xl border border-border mb-3">
            <Text size="xs" className="font-mono text-foreground text-[11px]">
              {summaryUrl}
            </Text>
          </Box>

          <VStack space="xs">
            <Button
              size="default"
              isDisabled
              onPress={() => haptics.error()}
              accessibilityLabel="Salin tautan ringkasan belum tersedia"
              className="w-full bg-primary h-11 rounded-xl"
            >
              <ButtonIcon as={Copy} className="text-primary-foreground" />
              <ButtonText className="text-xs font-bold text-primary-foreground">
                Salin tautan belum tersedia
              </ButtonText>
            </Button>

            <Button
              size="default"
              variant="outline"
              onPress={onClose}
              className="w-full border-border bg-card h-11 rounded-xl mt-1"
            >
              <ButtonText className="text-xs font-semibold text-foreground">
                Tutup
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

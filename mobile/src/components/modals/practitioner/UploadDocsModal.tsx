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
/*                               UploadDocsModal                              */
/* -------------------------------------------------------------------------- */
export interface UploadDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocs: (fileName: string) => void;
}

export function UploadDocsModal({
  isOpen,
  onClose,
  onSelectDocs,
}: UploadDocsModalProps) {
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
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[90%] max-w-[380px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <Heading size="sm" bold className="text-foreground">
              Pilih Berkas STR & SIPP
            </Heading>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup berkas legalitas"
              className="p-1 rounded-full active:bg-muted"
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
            Pilih dokumen legalitas berformat PDF yang masih berlaku dari
            penyimpanan perangkat Anda:
          </Text>

          <VStack space="xs">
            <Pressable
              disabled
              onPress={() => haptics.error()}
              accessibilityRole="button"
              accessibilityLabel="Pilih berkas STR dan SIPP belum tersedia"
              className="p-3.5 rounded-2xl bg-muted border border-border opacity-60 flex-row items-center gap-3"
            >
              <FileCheck size={18} className="text-secondary" />
              <VStack className="flex-1">
                <Text size="xs" bold className="text-foreground">
                  Pilih berkas belum tersedia
                </Text>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Upload native belum memiliki kontrak server
                </Text>
              </VStack>
            </Pressable>

            <Button
              size="default"
              variant="outline"
              onPress={onClose}
              className="w-full border-border bg-card h-11 rounded-xl mt-2"
            >
              <ButtonText className="text-xs font-semibold text-foreground">
                Batal
              </ButtonText>
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

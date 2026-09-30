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
/*                            ExportSuccessModal                              */
/* -------------------------------------------------------------------------- */
export interface ExportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function ExportSuccessModal({
  isOpen,
  onClose,
  fileName = "riwayat_sesi_klinis_128_sesi.csv",
}: ExportSuccessModalProps) {
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
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[90%] max-w-[370px] items-center text-center">
        <Box className="w-14 h-14 rounded-2xl bg-warning/15 items-center justify-center mb-3 mt-1">
          <AlertTriangle size={28} className="text-warning" />
        </Box>
        <Heading size="sm" bold className="text-foreground text-center">
          Ekspor belum tersedia
        </Heading>
        <Text
          size="xs"
          className="text-muted-foreground text-center mt-1.5 leading-relaxed"
        >
          Tidak ada exporter native yang tervalidasi. Berkas{" "}
          <Text size="xs" bold className="text-foreground">
            {fileName}
          </Text>{" "}
          tidak dibuat.
        </Text>

        <Button
          size="default"
          onPress={onClose}
          className="w-full bg-secondary h-11 rounded-xl mt-4"
        >
          <ButtonText className="text-xs font-bold text-secondary-foreground">
            Selesai
          </ButtonText>
        </Button>
      </ModalContent>
    </Modal>
  );
}

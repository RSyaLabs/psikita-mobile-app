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
/*                          PractitionerNotifModal                            */
/* -------------------------------------------------------------------------- */
export interface PractitionerNotifModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueCount?: number;
  onOpenWarRoom: () => void;
}

export function PractitionerNotifModal({
  isOpen,
  onClose,
  queueCount,
  onOpenWarRoom,
}: PractitionerNotifModalProps) {
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
              <Bell size={18} className="text-secondary" />
              <Heading size="sm" bold className="text-foreground">
                Notifikasi Praktisi
              </Heading>
            </HStack>
            <Pressable onPress={onClose} className="p-1 rounded-full">
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="sm">
            <Box className="bg-muted p-3.5 rounded-2xl border border-border">
              <HStack space="xs" className="items-center mb-1">
                <Box className="w-2 h-2 rounded-full bg-secondary" />
                <Text size="xs" bold className="text-foreground">
                  {queueCount === undefined
                    ? "Jumlah antrian belum tersedia dari server"
                    : queueCount === 0
                      ? "Antrian server kosong"
                      : `Permintaan triase server: ${queueCount}`}
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground leading-relaxed">
                Data yang tampil berasal dari antrian triase yang dimuat dari
                server.
              </Text>
            </Box>

            <Box className="bg-muted p-3.5 rounded-2xl border border-border">
              <HStack space="xs" className="items-center mb-1">
                <CheckCircle2 size={14} className="text-secondary" />
                <Text size="xs" bold className="text-foreground">
                  Rujukan SATUSEHAT Kemenkes
                </Text>
              </HStack>
              <Text size="xs" className="text-muted-foreground leading-relaxed">
                Detail sinkronisasi rekam medis belum tersedia dari server.
              </Text>
            </Box>

            <Button
              size="default"
              isDisabled={queueCount === undefined || queueCount === 0}
              onPress={() => {
                haptics.medium();
                onOpenWarRoom();
              }}
              accessibilityState={{
                disabled: queueCount === undefined || queueCount === 0,
              }}
              className="w-full bg-secondary h-11 rounded-xl mt-2"
            >
              <ButtonText className="text-xs font-bold text-secondary-foreground">
                {queueCount === undefined
                  ? "Status antrian belum tersedia"
                  : queueCount === 0
                    ? "Antrian kosong"
                    : `Lihat antrian server (${queueCount})`}
              </ButtonText>
              <ButtonIcon as={ArrowRight} />
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

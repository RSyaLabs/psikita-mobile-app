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
/*                            MutationHistoryModal                            */
/* -------------------------------------------------------------------------- */
export interface MutationHistoryItem {
  id: string;
  desc: string;
  gross: string;
  net: string;
}

export interface MutationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: MutationHistoryItem[];
}

export function MutationHistoryModal({
  isOpen,
  onClose,
  items = [
    {
      id: "Sesi #PSY-184",
      desc: "6 Sep • Video • 50 mnt",
      gross: "+Rp150.000",
      net: "+Rp116.250",
    },
    {
      id: "Sesi #PSY-183",
      desc: "5 Sep • Chat • 45 mnt",
      gross: "+Rp120.000",
      net: "+Rp93.000",
    },
    {
      id: "Sesi #PSY-182",
      desc: "4 Sep • Video • 50 mnt",
      gross: "+Rp150.000",
      net: "+Rp116.250",
    },
    {
      id: "Penarikan Bank BCA",
      desc: "1 Sep • Berhasil ke ••4821",
      gross: "-Rp2.500.000",
      net: "-Rp2.500.000",
    },
  ],
}: MutationHistoryModalProps) {
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
              <FileText size={18} className="text-primary" />
              <Heading size="sm" bold className="text-foreground">
                Mutasi & Riwayat Sesi
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup mutasi saldo"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1 max-h-[380px]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space="sm">
              {items.map((item, idx) => (
                <Box
                  key={idx}
                  className="bg-muted p-3 rounded-2xl border border-border flex-row items-center justify-between"
                >
                  <VStack space="xs">
                    <Text size="xs" bold className="text-foreground">
                      {item.id}
                    </Text>
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[10px]"
                    >
                      {item.desc}
                    </Text>
                  </VStack>
                  <VStack space="xs" className="items-end">
                    <Text
                      size="xs"
                      bold
                      className={
                        item.gross.startsWith("+")
                          ? "text-secondary"
                          : "text-destructive"
                      }
                    >
                      {item.net}
                    </Text>
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[10px]"
                    >
                      Bruto: {item.gross}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </ScrollView>

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

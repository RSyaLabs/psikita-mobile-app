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
/*                           ScheduleFollowUpModal                            */
/* -------------------------------------------------------------------------- */
export interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string | null;
  onSelectOption?: (title: string) => void;
}

export function ScheduleFollowUpModal({
  isOpen,
  onClose,
  patientName,
  onSelectOption,
}: ScheduleFollowUpModalProps) {
  const followUpOptions = [
    {
      title: "Kontrol 1 Minggu (15 Sep 2026)",
      desc: "Evaluasi adaptasi awal medikasi",
    },
    {
      title: "Kontrol 2 Minggu (22 Sep 2026)",
      desc: "Evaluasi respons terapi psikologis standar",
    },
    {
      title: "Kontrol 1 Bulan (06 Okt 2026)",
      desc: "Pemantauan kestabilan remisi",
    },
  ];

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
              <Box className="w-8 h-8 rounded-xl bg-secondary/15 items-center justify-center">
                <Calendar size={18} className="text-secondary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Jadwal Kontrol
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full active:bg-muted"
              accessibilityRole="button"
              accessibilityLabel="Tutup jadwal kontrol"
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
            Jadwalkan sesi evaluasi lanjutan untuk pasien{" "}
            <Text size="xs" bold className="text-foreground">
              {patientName || "Pasien"}
            </Text>
            :
          </Text>

          <VStack space="xs" className="mb-3">
            {followUpOptions.map((opt, idx) => (
              <Pressable
                key={idx}
                disabled
                onPress={() => haptics.error()}
                accessibilityRole="button"
                accessibilityLabel={`Jadwal ${opt.title} belum tersedia`}
                className="p-3 rounded-2xl bg-muted border border-border opacity-60 flex-row items-center justify-between"
              >
                <VStack className="flex-1 pr-2">
                  <Text size="xs" bold className="text-foreground">
                    {opt.title}
                  </Text>
                  <Text
                    size="xs"
                    className="text-muted-foreground text-[11px] mt-0.5"
                  >
                    {opt.desc}
                  </Text>
                </VStack>
                <Clock size={16} className="text-muted-foreground" />
              </Pressable>
            ))}
          </VStack>

          <Button
            size="default"
            variant="outline"
            onPress={onClose}
            className="w-full border-border bg-card h-11 rounded-xl"
          >
            <ButtonText className="text-xs font-semibold text-foreground">
              Batal
            </ButtonText>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

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
/*                            PharmacyPartnerModal                            */
/* -------------------------------------------------------------------------- */
export interface PharmacyPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMaps?: () => void;
}

export function PharmacyPartnerModal({
  isOpen,
  onClose,
  onOpenMaps,
}: PharmacyPartnerModalProps) {
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
              <Box className="w-8 h-8 rounded-xl bg-secondary/10 items-center justify-center">
                <MapPin size={18} className="text-secondary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Apotek Mitra Rekanan
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup apotek rekanan"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            <VStack space="xs">
              <Heading size="xs" bold className="text-foreground">
                Apotek Sehat Medika
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                Jl. Salemba Raya No. 42, Senen, Jakarta Pusat
              </Text>
            </VStack>

            <Box className="bg-muted p-3 rounded-2xl border border-border">
              <HStack space="xs" className="items-center mb-1">
                <Clock size={14} className="text-secondary" />
                <Text size="xs" bold className="text-foreground text-[11px]">
                  Jam Buka: 08.00 - 22.00 WIB (Setiap Hari)
                </Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <CheckCircle2 size={14} className="text-secondary" />
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Stok Sertraline 50mg: Tersedia (20 strip)
                </Text>
              </HStack>
            </Box>

            <HStack space="sm">
              <Button
                size="default"
                variant="outline"
                onPress={onClose}
                className="flex-1 rounded-xl border-border bg-card h-11"
              >
                <ButtonText className="text-xs font-semibold text-foreground">
                  Tutup
                </ButtonText>
              </Button>
              <Button
                size="default"
                onPress={() => {
                  haptics.medium();
                  if (onOpenMaps) onOpenMaps();
                  else onClose();
                }}
                className="flex-1 bg-secondary rounded-xl h-11"
              >
                <ButtonIcon as={Navigation} />
                <ButtonText className="text-xs font-bold text-secondary-foreground">
                  Buka Rute Maps
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

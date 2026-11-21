import React from "react";
import { Linking } from "react-native";
import { AlertTriangle, PhoneCall, HeartHandshake } from "lucide-react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

interface CrisisHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueConsultation?: () => void;
  onBackToHome?: () => void;
}

export function CrisisHelpModal({
  isOpen,
  onClose,
  onContinueConsultation,
  onBackToHome,
}: CrisisHelpModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="w-full max-w-[420px] max-h-[85vh] p-5 rounded-3xl bg-card border border-border/80 shadow-lg">
        <ModalHeader className="pb-3 border-b border-border/70">
          <HStack space="sm" className="items-center">
            <Box className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center border border-destructive/20">
              <AlertTriangle size={22} color="#DC2626" />
            </Box>
            <VStack className="flex-1">
              <Heading size="md" bold className="text-foreground">
                Bantuan Segera
              </Heading>
              <Text size="sm" className="text-muted-foreground font-medium">
                Layanan Darurat & Krisis
              </Text>
            </VStack>
            <ModalCloseButton />
          </HStack>
        </ModalHeader>

        <ModalBody className="py-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space="md">
              <Heading size="sm" bold className="text-foreground">
                Kamu tidak harus menghadapi ini sendirian
              </Heading>
              <Text size="sm" className="text-muted-foreground leading-relaxed">
                Jika kamu merasa dalam kondisi krisis emosional berat, memiliki pikiran menyakiti diri, atau membutuhkan pertolongan darurat medis, segera hubungi layanan krisis resmi di bawah ini:
              </Text>

              {/* Hotline Card */}
              <Card className="bg-destructive/5 rounded-2xl p-4 border border-destructive/20 gap-3">
                <HStack space="sm" className="items-center">
                  <PhoneCall size={20} color="#DC2626" />
                  <VStack className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Hotline Krisis Kemenkes RI
                    </Text>
                    <Text size="sm" className="text-muted-foreground font-medium">
                      119 ext 8 (Bebas Pulsa • 24 Jam)
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  onPress={() => {
                    haptics.medium();
                    Linking.openURL("tel:119");
                  }}
                  className="w-full bg-destructive rounded-xl h-11 flex-row items-center justify-center shadow-xs"
                >
                  <PhoneCall size={16} color="#FFFFFF" />
                  <ButtonText className="text-sm font-bold text-white ml-2">
                    Telepon Sekarang
                  </ButtonText>
                </Button>
              </Card>

              {/* Trusted Contact Card */}
              <Card className="bg-card rounded-2xl p-4 border border-border/80 gap-3">
                <HStack space="sm" className="items-center">
                  <HeartHandshake size={20} color="#4A3B6B" />
                  <VStack className="flex-1">
                    <Text size="sm" bold className="text-foreground">
                      Hubungi Orang Tepercaya
                    </Text>
                    <Text size="sm" className="text-muted-foreground font-medium">
                      Keluarga, sahabat, atau orang terdekat
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => {
                    haptics.light();
                    Linking.openURL("tel:");
                  }}
                  className="w-full border-border/80 rounded-xl h-11"
                >
                  <ButtonText className="text-sm font-semibold text-foreground">
                    Buka Kontak Telepon
                  </ButtonText>
                </Button>
              </Card>

              <Text size="sm" className="text-muted-foreground leading-relaxed italic">
                Pencarian psikolog tetap bisa dilanjutkan, tetapi bukan pengganti bantuan darurat segera.
              </Text>
            </VStack>
          </ScrollView>
        </ModalBody>

        <ModalFooter className="flex-col gap-2 pt-3 border-t border-border/70">
          <Button
            size="sm"
            onPress={() => {
              haptics.light();
              if (onContinueConsultation) {
                onContinueConsultation();
              } else {
                onClose();
              }
            }}
            className="w-full bg-primary rounded-xl h-11"
          >
            <ButtonText className="text-sm font-bold text-white">
              Lanjut Cari Psikolog
            </ButtonText>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => {
              haptics.light();
              if (onBackToHome) {
                onBackToHome();
              } else {
                onClose();
              }
            }}
            className="w-full border-border/80 rounded-xl h-11"
          >
            <ButtonText className="text-sm font-semibold text-foreground">
              Kembali ke Beranda
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

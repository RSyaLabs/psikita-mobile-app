import React, { useState } from "react";
import { AlertTriangle, X, Send } from "lucide-react-native";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  HStack,
  VStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ButtonIcon,
} from "@/components/ui";
import { PractitionerResponseDto } from "@/types/api";
import { haptics } from "@/utils/haptics";

export interface RevisionRequestModalProps {
  practitioner: PractitionerResponseDto | null;
  onClose: () => void;
  onConfirmRevision: (
    practitioner: PractitionerResponseDto,
    reason: string,
  ) => void;
}

const REVISION_REASONS = [
  "STR kadaluarsa atau tidak aktif di Konsil",
  "SIP tidak sesuai faskes praktek aktif",
  "Pindaian berkas buram atau tidak terbaca jelas",
];

export function RevisionRequestModal({
  practitioner,
  onClose,
  onConfirmRevision,
}: RevisionRequestModalProps) {
  const [reviseReason, setReviseReason] = useState(REVISION_REASONS[0]);

  if (!practitioner) return null;

  return (
    <Modal isOpen={Boolean(practitioner)} onClose={onClose} size="md">
      <ModalBackdrop
        dataSet={{ backdrop: "true" }}
        className="bg-black/45 backdrop-blur-md"
        style={
          {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[390px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <AlertTriangle size={18} className="text-warning" />
              <Heading size="sm" bold className="text-foreground">
                Minta Revisi Berkas
              </Heading>
            </HStack>
            <Pressable onPress={onClose} className="p-1 rounded-full">
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            <Text size="xs" className="text-muted-foreground">
              Pilih alasan revisi yang akan dikirimkan ke{" "}
              <Text size="xs" bold className="text-foreground">
                {practitioner.fullName || "praktisi"}
              </Text>
              :
            </Text>

            <VStack space="xs">
              {REVISION_REASONS.map((reason, idx) => {
                const isSelected = reviseReason === reason;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setReviseReason(reason)}
                    className={`p-3 rounded-2xl border active:opacity-80 ${
                      isSelected
                        ? "bg-muted border-secondary"
                        : "bg-card border-border"
                    }`}
                  >
                    <Text
                      size="xs"
                      bold={isSelected}
                      className={
                        isSelected
                          ? "text-secondary font-bold"
                          : "text-foreground"
                      }
                    >
                      {reason}
                    </Text>
                  </Pressable>
                );
              })}
            </VStack>

            <HStack space="xs" className="pt-2">
              <Button
                size="default"
                variant="outline"
                onPress={onClose}
                className="flex-1 rounded-xl border-border bg-card h-11"
              >
                <ButtonText className="text-xs font-semibold text-foreground">
                  Batal
                </ButtonText>
              </Button>

              <Button
                size="default"
                onPress={() => {
                  haptics.success();
                  onConfirmRevision(practitioner, reviseReason);
                  onClose();
                }}
                className="flex-1 bg-warning rounded-xl h-11"
              >
                <ButtonIcon as={Send} />
                <ButtonText className="text-xs font-bold text-warning-foreground">
                  Kirim Revisi
                </ButtonText>
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

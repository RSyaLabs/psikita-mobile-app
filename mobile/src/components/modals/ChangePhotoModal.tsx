import React from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react-native";
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
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCamera?: () => void;
  onSelectGallery?: () => void;
}

export function ChangePhotoModal({
  isOpen,
  onClose,
  onSelectCamera,
  onSelectGallery,
}: ChangePhotoModalProps) {
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
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[90%] max-w-[370px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <Heading size="sm" bold className="text-foreground">
              Ubah Foto Profil
            </Heading>
            <Pressable onPress={onClose} className="p-1 rounded-full">
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>
        <ModalBody className="pt-3 pb-1">
          <VStack space="sm">
            <Pressable
              onPress={() => {
                haptics.medium();
                onSelectCamera?.();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-muted border border-border flex-row items-center gap-3 active:bg-muted/80"
            >
              <Camera size={18} className="text-secondary" />
              <Text size="xs" bold className="text-foreground">
                Ambil Foto Baru (Kamera)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                haptics.medium();
                onSelectGallery?.();
                onClose();
              }}
              className="p-3.5 rounded-2xl bg-muted border border-border flex-row items-center gap-3 active:bg-muted/80"
            >
              <ImageIcon size={18} className="text-primary" />
              <Text size="xs" bold className="text-foreground">
                Pilih dari Galeri Perangkat
              </Text>
            </Pressable>
            <Button
              size="default"
              variant="outline"
              onPress={onClose}
              className="w-full border-border bg-card h-11 rounded-xl mt-1"
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

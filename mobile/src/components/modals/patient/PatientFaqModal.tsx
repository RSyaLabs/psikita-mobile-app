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
/*                              PatientFaqModal                               */
/* -------------------------------------------------------------------------- */
export interface PatientFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PatientFaqModal({ isOpen, onClose }: PatientFaqModalProps) {
  const faqs = [
    {
      q: "Bagaimana cara konsultasi dengan BPJS?",
      a: "Minta surat rujukan Poli Jiwa dari Faskes 1 (Puskesmas/Klinik). Masukkan nomor rujukan saat memilih pembayaran BPJS untuk konsultasi tanpa biaya tambahan.",
    },
    {
      q: "Apakah data sesi konsultasi saya aman?",
      a: "Ya, seluruh percakapan dan dokumen rekam medis dilindungi enkripsi end-to-end sesuai regulasi Kementerian Kesehatan RI dan UU PDP No. 27/2022.",
    },
    {
      q: "Bagaimana jika koneksi internet terputus?",
      a: "Ruang konsultasi tetap aktif selama batas toleransi 15 menit. Anda dapat langsung masuk kembali ke ruang chat tanpa dikenakan biaya ulang.",
    },
    {
      q: "Cara menebus resep digital?",
      a: "Buka menu Resep Digital di profil Anda, tunjukkan kode QR resep ke apotek rekanan terdekat, atau unduh berkas PDF resep resmi ber-SIP.",
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
              <Box className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <HelpCircle size={18} className="text-primary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Pusat Bantuan & FAQ
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup FAQ"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1 max-h-[420px]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space="md">
              {faqs.map((faq, idx) => (
                <Box
                  key={idx}
                  className="bg-muted rounded-2xl p-3 border border-border"
                >
                  <Text size="xs" bold className="text-foreground mb-1">
                    {faq.q}
                  </Text>
                  <Text
                    size="xs"
                    className="text-muted-foreground leading-relaxed"
                  >
                    {faq.a}
                  </Text>
                </Box>
              ))}
            </VStack>
          </ScrollView>

          <Button
            size="default"
            variant="outline"
            onPress={onClose}
            className="w-full border-border bg-card h-11 rounded-xl mt-3"
          >
            <ButtonText className="text-xs font-semibold text-foreground">
              Tutup
            </ButtonText>
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

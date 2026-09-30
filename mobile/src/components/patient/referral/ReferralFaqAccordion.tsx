import React from "react";
import { ChevronDown, MapPin, CreditCard, Headphones } from "lucide-react-native";
import {
  VStack,
  Text,
  HStack,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContent,
  AccordionContentText,
  AccordionIcon,
} from "@/components/ui";

export function ReferralFaqAccordion() {
  return (
    <VStack space="xs" className="mb-4">
      <Text size="sm" className="font-bold text-foreground mb-1">
        Panduan Memakai Rujukan
      </Text>
      <Accordion
        type="single"
        defaultValue={["step-1"]}
        className="w-full bg-card rounded-2xl border border-border overflow-hidden"
      >
        <AccordionItem value="step-1">
          <AccordionHeader>
            <AccordionTrigger>
              <HStack space="sm" className="items-center flex-1">
                <MapPin size={18} className="text-secondary" />
                <AccordionTitleText>
                  1. Datang ke Faskes Tujuan
                </AccordionTitleText>
              </HStack>
              <AccordionIcon as={ChevronDown} />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>
              Tunjukkan nomor surat rujukan digital ini di loket pendaftaran rawat
              jalan poliklinik psikiatri faskes rujukan tingkat lanjut.
            </AccordionContentText>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-2">
          <AccordionHeader>
            <AccordionTrigger>
              <HStack space="sm" className="items-center flex-1">
                <CreditCard size={18} className="text-secondary" />
                <AccordionTitleText>
                  2. Bawa KTP & Kartu BPJS
                </AccordionTitleText>
              </HStack>
              <AccordionIcon as={ChevronDown} />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>
              Bawa kartu identitas asli (KTP/e-KTP) serta kartu BPJS fisik atau
              digital dari aplikasi Mobile JKN untuk verifikasi fingerprint loket
              RS.
            </AccordionContentText>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-3">
          <AccordionHeader>
            <AccordionTrigger>
              <HStack space="sm" className="items-center flex-1">
                <Headphones size={18} className="text-secondary" />
                <AccordionTitleText>
                  3. Pendampingan Antrean CS
                </AccordionTitleText>
              </HStack>
              <AccordionIcon as={ChevronDown} />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>
              Tim pendamping PsiKita Care dapat membantu proses administrasi di
              fasilitas kesehatan tujuan.
            </AccordionContentText>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
}

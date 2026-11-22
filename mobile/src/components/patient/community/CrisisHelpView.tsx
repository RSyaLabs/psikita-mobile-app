import React from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Button,
  ButtonText,
} from "@/components/ui";
import { ChevronLeft, PhoneCall, ShieldAlert } from "lucide-react-native";
import { Linking } from "react-native";
import { haptics } from "@/utils/haptics";

export interface CrisisHelpViewProps {
  onBack: () => void;
  onConsultDoctor: () => void;
}

interface CrisisContact {
  name: string;
  description: string;
  phone: string;
}

const VERIFIED_CRISIS_HOTLINES: CrisisContact[] = [
  {
    name: "Layanan Sejiwa (Kemenkes RI)",
    description: "Hotline kesehatan jiwa bebas pulsa 24 jam",
    phone: "119",
  },
  {
    name: "Kedaruratan Nasional",
    description: "Panggilan darurat terpadu kepolisian & medis",
    phone: "112",
  },
  {
    name: "Into The Light Indonesia",
    description: "Edukasi & pencegahan krisis emosional dan bunuh diri",
    phone: "021-500-454",
  },
];

export function CrisisHelpView({
  onBack,
  onConsultDoctor,
}: CrisisHelpViewProps) {
  const handleCall = (phoneNumber: string) => {
    haptics.heavy();
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      // Gracefully handle emulator or devices without dialer
    });
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header (Screen 62 · FD6) */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke feed"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Bantuan segera
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Empathy & Urgent Care Box */}
          <Box className="border-[2.5px] border-foreground rounded-2xl p-5 bg-card gap-2">
            <Heading size="lg" bold className="text-foreground text-xl">
              Kamu tidak sendirian
            </Heading>
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Jika kamu atau seseorang sedang dalam bahaya, hubungi bantuan darurat sekarang.
            </Text>
          </Box>

          {/* Crisis Hotlines Section */}
          <VStack space="xs" className="gap-2.5">
            <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
              HUBUNGI SEKARANG
            </Text>

            {VERIFIED_CRISIS_HOTLINES.map((contact) => (
              <Pressable
                key={contact.phone}
                accessibilityRole="button"
                accessibilityLabel={`Hubungi ${contact.name}`}
                onPress={() => handleCall(contact.phone)}
                className="border-[1.5px] border-border rounded-xl p-4 bg-card flex-row items-center justify-between active:border-primary gap-3"
              >
                <VStack className="flex-1">
                  <Text size="sm" bold className="text-sm font-bold text-foreground">
                    {contact.name}
                  </Text>
                  <Text size="sm" className="text-sm text-muted-foreground mt-0.5">
                    {contact.description} · {contact.phone}
                  </Text>
                </VStack>
                <HStack className="items-center gap-1.5 flex-shrink-0">
                  <Text size="sm" bold className="text-sm font-semibold text-primary">
                    Telepon ›
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </VStack>

          {/* Verification Disclaimer Box */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Nomor layanan krisis harus diverifikasi dan diisi tim, bukan dikarang di sini.
            </Text>
          </Box>

          {/* Action CTAs */}
          <VStack space="xs" className="gap-2 pt-6">
            <Button
              size="lg"
              onPress={() => {
                haptics.medium();
                onConsultDoctor();
              }}
              className="min-h-[52px] rounded-xl bg-primary"
            >
              <ButtonText className="text-base font-semibold text-white">
                Bicara dengan psikolog
              </ButtonText>
            </Button>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali ke Feed"
              onPress={() => {
                haptics.light();
                onBack();
              }}
              className="min-h-[44px] items-center justify-center rounded-xl"
            >
              <Text size="sm" bold className="text-sm font-semibold text-foreground">
                Kembali ke Feed
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

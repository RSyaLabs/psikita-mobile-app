import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, Check } from "lucide-react-native";

export interface TaxProfileAgreementViewProps {
  initialNpwp?: string;
  initialTaxStatus?: string;
  initialAgreed?: boolean;
  onSave: (data: {
    npwp: string;
    taxStatus: string;
    agreed: boolean;
  }) => void;
  onOpenTerms?: () => void;
  onBack: () => void;
}

export function TaxProfileAgreementView({
  initialNpwp = "",
  initialTaxStatus = "TK/0 - Tidak Kawin",
  initialAgreed = true,
  onSave,
  onOpenTerms,
  onBack,
}: TaxProfileAgreementViewProps) {
  const [npwp, setNpwp] = useState(initialNpwp);
  const [taxStatus, setTaxStatus] = useState(initialTaxStatus);
  const [agreed, setAgreed] = useState(initialAgreed);

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Pajak &amp; persetujuan
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card className="border border-border rounded-2xl p-4 bg-card gap-2">
          <Box className="self-start border border-foreground rounded-full px-3 py-0.5 bg-muted">
            <Text size="sm" bold className="text-foreground">
              {npwp ? "Lengkap" : "Belum dilengkapi"}
            </Text>
          </Box>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Dibutuhkan sebelum pencairan. Data mengikuti ketentuan yang berlaku.
          </Text>
        </Card>

        {/* Input NPWP */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            NPWP
          </Text>
          <Input className="h-[52px] rounded-xl border border-border bg-card px-4">
            <InputField
              placeholder="Contoh: 092542943407000"
              value={npwp}
              onChangeText={setNpwp}
              keyboardType="numeric"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        {/* Input Status Pajak */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            Status pajak
          </Text>
          <Input className="h-[52px] rounded-xl border border-border bg-card px-4">
            <InputField
              placeholder="Contoh: WP Pribadi (PPh 21)"
              value={taxStatus}
              onChangeText={setTaxStatus}
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        {/* Checkbox Persetujuan */}
        <HStack space="sm" className="items-start gap-3 pt-2">
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreed }}
            accessibilityLabel="Saya menyetujui perjanjian pencairan"
            onPress={() => setAgreed(!agreed)}
            className={`w-6 h-6 rounded-md border items-center justify-center mt-0.5 ${
              agreed ? "bg-foreground border-foreground" : "border-border bg-card"
            }`}
          >
            {agreed && <Check size={14} color="#ffffff" strokeWidth={3} />}
          </Pressable>
          <Text size="sm" className="text-foreground flex-1 leading-relaxed">
            Saya menyetujui perjanjian pencairan{" "}
            <Text
              size="sm"
              bold
              className="text-foreground underline"
              onPress={onOpenTerms}
            >
              Baca ketentuan
            </Text>
          </Text>
        </HStack>

        {/* Tax Policy Notice */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Pemotongan pajak pencairan diterapkan otomatis sesuai ketentuan PPh Pasal 21 yang berlaku.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSave({ npwp, taxStatus, agreed })}
        >
          <ButtonText className="text-background font-semibold">
            Simpan
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onBack}
        >
          <ButtonText className="text-foreground font-semibold">
            Nanti saja
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

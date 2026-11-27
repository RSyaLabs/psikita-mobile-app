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
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react-native";

export interface BankAccountFormViewProps {
  initialBankCode?: string;
  initialAccountNumber?: string;
  initialAccountName?: string;
  isVerified?: boolean;
  isSaving?: boolean;
  onSave: (data: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
  }) => void;
  onCancel: () => void;
}

const SUPPORTED_BANKS = [
  { code: "BCA", name: "Bank Central Asia (BCA)" },
  { code: "MANDIRI", name: "Bank Mandiri" },
  { code: "BNI", name: "Bank Negara Indonesia (BNI)" },
  { code: "BRI", name: "Bank Rakyat Indonesia (BRI)" },
];

export function BankAccountFormView({
  initialBankCode = "BCA",
  initialAccountNumber = "",
  initialAccountName = "",
  isVerified = false,
  isSaving = false,
  onSave,
  onCancel,
}: BankAccountFormViewProps) {
  const [bankCode, setBankCode] = useState(initialBankCode);
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const [accountName, setAccountName] = useState(initialAccountName);

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onCancel}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Rekening bank
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Status Card */}
        <Card className="border border-border rounded-2xl p-4 bg-card gap-2">
          <Box className="self-start border border-foreground rounded-full px-3 py-0.5 bg-muted">
            <Text size="sm" bold className="text-foreground">
              {isVerified ? "Terverifikasi" : "Menunggu verifikasi"}
            </Text>
          </Box>
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Rekening diperiksa sebelum pencairan pertama. Nama pemilik harus sesuai identitasmu.
          </Text>
        </Card>

        {/* Bank Selection */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            Bank
          </Text>
          <VStack space="xs" className="gap-2">
            {SUPPORTED_BANKS.map((b) => {
              const isSelected = bankCode === b.code;
              return (
                <Pressable
                  key={b.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={b.name}
                  onPress={() => setBankCode(b.code)}
                  className={`flex-row items-center p-3.5 rounded-2xl min-h-[56px] border-2 gap-3 ${
                    isSelected
                      ? "border-foreground bg-muted"
                      : "border-border bg-card"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 size={22} color="#262130" />
                  ) : (
                    <Circle size={22} color="#75618E" />
                  )}
                  <Text size="sm" bold={isSelected} className="text-foreground flex-1">
                    {b.name}
                  </Text>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>

        {/* Input Nomor Rekening */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            Nomor rekening
          </Text>
          <Input className="h-[52px] rounded-xl border border-border bg-card px-4">
            <InputField
              placeholder="Contoh: 8274012345"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
              className="text-foreground text-sm"
            />
          </Input>
        </VStack>

        {/* Input Nama Pemilik Rekening */}
        <VStack space="xs" className="gap-1.5">
          <Text size="sm" bold className="text-foreground">
            Nama pemilik rekening
          </Text>
          <Input className="h-[52px] rounded-xl border border-border bg-card px-4">
            <InputField
              placeholder="Nama lengkap sesuai buku tabungan & KTP"
              value={accountName}
              onChangeText={setAccountName}
              className="text-foreground text-sm"
            />
          </Input>
          <Text size="sm" className="text-muted-foreground mt-0.5">
            Tidak bisa diedit setelah diverifikasi.
          </Text>
        </VStack>

        {/* Bank Validation Notice */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Data rekening akan divalidasi oleh sistem pencairan dana sebelum transfer diproses.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Buttons */}
      <VStack className="p-4 border-t border-border bg-card gap-2">
        <Button
          isDisabled={isSaving}
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSave({ bankCode, accountNumber, accountName })}
        >
          <ButtonText className="text-background font-semibold">
            {isSaving ? "Menyimpan..." : "Simpan Rekening"}
          </ButtonText>
        </Button>
        <Button
          variant="outline"
          className="h-11 border-transparent rounded-xl"
          onPress={onCancel}
        >
          <ButtonText className="text-foreground font-semibold">
            Batal
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}

import React from "react";
import {
  Card,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from "@/components/ui";

export interface BpjsIntegrationSectionProps {
  bpjsNumber: string;
  onChangeBpjsNumber: (val: string) => void;
  faskes1: string;
  onChangeFaskes1: (val: string) => void;
}

export function BpjsIntegrationSection({
  bpjsNumber,
  onChangeBpjsNumber,
  faskes1,
  onChangeFaskes1,
}: BpjsIntegrationSectionProps) {
  return (
    <VStack space="xs" className="mb-4">
      <HStack space="xs" className="items-center justify-between px-1">
        <Heading size="xs" bold className="text-foreground">
          Integrasi JKN / BPJS Kesehatan
        </Heading>
        <Box className="bg-primary/10 px-3 py-1 rounded-full">
          <Text size="sm" bold className="text-primary text-sm font-bold">
            Aktif — Ditanggung
          </Text>
        </Box>
      </HStack>
      <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-bold text-foreground">
              Nomor Kartu BPJS Kesehatan
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-12 px-3.5">
            <InputField
              value={bpjsNumber}
              onChangeText={onChangeBpjsNumber}
              keyboardType="number-pad"
              placeholder="0000 1234 5678 90"
              className="text-foreground text-sm"
            />
          </Input>
          <FormControlHelper className="mt-1">
            <FormControlHelperText className="text-sm text-muted-foreground font-medium">
              Digunakan untuk klaim konsultasi gratis Rp0 melalui faskes rujukan
            </FormControlHelperText>
          </FormControlHelper>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Fasilitas Kesehatan Tingkat 1 (Faskes 1)
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={faskes1}
              onChangeText={onChangeFaskes1}
              placeholder="Contoh: Puskesmas Tebet"
              className="text-foreground text-xs"
            />
          </Input>
        </FormControl>
      </Card>
    </VStack>
  );
}

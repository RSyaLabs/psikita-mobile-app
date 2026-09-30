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
        <Box className="bg-secondary/15 px-2 py-0.5 rounded-full">
          <Text size="xs" bold className="text-secondary text-[10px]">
            Aktif — Ditanggung
          </Text>
        </Box>
      </HStack>
      <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Nomor Kartu BPJS Kesehatan
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={bpjsNumber}
              onChangeText={onChangeBpjsNumber}
              keyboardType="number-pad"
              placeholder="0000 1234 5678 90"
              className="text-foreground text-xs"
            />
          </Input>
          <FormControlHelper className="mt-1">
            <FormControlHelperText className="text-[11px] text-muted-foreground">
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

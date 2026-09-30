import React from "react";
import {
  Card,
  VStack,
  Heading,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui";

export interface EmergencyContactSectionProps {
  emergencyContactName: string;
  onChangeEmergencyContactName: (val: string) => void;
  emergencyPhone: string;
  onChangeEmergencyPhone: (val: string) => void;
}

export function EmergencyContactSection({
  emergencyContactName,
  onChangeEmergencyContactName,
  emergencyPhone,
  onChangeEmergencyPhone,
}: EmergencyContactSectionProps) {
  return (
    <VStack space="xs" className="mb-4">
      <Heading size="xs" bold className="text-foreground px-1">
        Kontak Darurat Keluarga
      </Heading>
      <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Nama Keluarga / Wali
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={emergencyContactName}
              onChangeText={onChangeEmergencyContactName}
              placeholder="Nama kontak darurat"
              className="text-foreground text-xs"
            />
          </Input>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-bold text-foreground">
              No. Telepon / WhatsApp Darurat
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={emergencyPhone}
              onChangeText={onChangeEmergencyPhone}
              keyboardType="phone-pad"
              className="text-foreground text-xs"
            />
          </Input>
        </FormControl>
      </Card>
    </VStack>
  );
}

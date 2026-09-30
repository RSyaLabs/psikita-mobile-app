import React from "react";
import {
  Card,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Pressable,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface MedicalHistorySectionProps {
  bloodType: string;
  onChangeBloodType: (val: string) => void;
  allergies: string;
  onChangeAllergies: (val: string) => void;
}

const BLOOD_TYPES = ["A", "B", "AB", "O"];

export function MedicalHistorySection({
  bloodType,
  onChangeBloodType,
  allergies,
  onChangeAllergies,
}: MedicalHistorySectionProps) {
  return (
    <VStack space="xs" className="mb-4">
      <Heading size="xs" bold className="text-foreground px-1">
        Informasi Medis & Alergi
      </Heading>
      <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
        <VStack space="xs">
          <Text size="xs" bold className="text-foreground">
            Golongan Darah
          </Text>
          <HStack space="sm">
            {BLOOD_TYPES.map((bt) => {
              const isSelected = bloodType === bt;
              return (
                <Pressable
                  key={bt}
                  onPress={() => {
                    haptics.light();
                    onChangeBloodType(bt);
                  }}
                  className={`flex-1 py-2 rounded-xl items-center justify-center border ${
                    isSelected
                      ? "bg-secondary border-secondary"
                      : "bg-background border-border"
                  }`}
                >
                  <Text
                    size="xs"
                    bold
                    className={
                      isSelected
                        ? "text-secondary-foreground"
                        : "text-foreground"
                    }
                  >
                    {bt}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-xs font-bold text-foreground">
              Riwayat Alergi Obat / Makanan
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={allergies}
              onChangeText={onChangeAllergies}
              placeholder="Contoh: Alergi Amoksisilin"
              className="text-foreground text-xs"
            />
          </Input>
        </FormControl>
      </Card>
    </VStack>
  );
}

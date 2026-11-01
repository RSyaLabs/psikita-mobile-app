import React from "react";
import { ShieldCheck } from "lucide-react-native";
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
  FormControlHelper,
  FormControlHelperText,
  Pressable,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface PersonalIdentitySectionProps {
  fullName: string;
  onChangeFullName: (val: string) => void;
  nik: string;
  onChangeNik: (val: string) => void;
  birthDate: string;
  onChangeBirthDate: (val: string) => void;
  gender: "FEMALE" | "MALE";
  onChangeGender: (val: "FEMALE" | "MALE") => void;
  phone: string;
  onChangePhone: (val: string) => void;
}

export function PersonalIdentitySection({
  fullName,
  onChangeFullName,
  nik,
  onChangeNik,
  birthDate,
  onChangeBirthDate,
  gender,
  onChangeGender,
  phone,
  onChangePhone,
}: PersonalIdentitySectionProps) {
  return (
    <VStack space="xs" className="mb-4">
      <HStack space="xs" className="items-center justify-between px-1">
        <Heading size="xs" bold className="text-foreground">
          Data Pribadi Pasien
        </Heading>
        <HStack
          space="xs"
          className="items-center bg-primary/10 px-3 py-1 rounded-full"
        >
          <ShieldCheck size={14} color="#4A3B6B" />
          <Text size="sm" bold className="text-primary text-sm font-bold">
            Satu Sehat Terhubung
          </Text>
        </HStack>
      </HStack>
      <Card className="bg-card rounded-2xl p-4 border border-border gap-3">
        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-bold text-foreground">
              Nama Lengkap (Sesuai KTP)
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-12 px-3.5">
            <InputField
              value={fullName}
              onChangeText={onChangeFullName}
              placeholder="Nama lengkap"
              className="text-foreground text-sm"
            />
          </Input>
        </FormControl>

        <FormControl>
          <FormControlLabel>
            <HStack space="xs" className="items-center justify-between w-full">
              <FormControlLabelText className="text-sm font-bold text-foreground">
                NIK KTP (16 Digit)
              </FormControlLabelText>
              <Text size="sm" className="text-primary text-sm font-bold">
                Integrasi Kemenkes
              </Text>
            </HStack>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-12 px-3.5">
            <InputField
              value={nik}
              onChangeText={onChangeNik}
              placeholder="Contoh: 3174051209900001"
              keyboardType="numeric"
              maxLength={16}
              className="text-foreground text-sm"
            />
          </Input>
          <FormControlHelper className="mt-1">
            <FormControlHelperText className="text-sm text-muted-foreground font-medium">
              Digunakan untuk validasi rekam medis Satu Sehat Kemenkes
            </FormControlHelperText>
          </FormControlHelper>
        </FormControl>

        <HStack space="sm">
          <FormControl className="flex-1">
            <FormControlLabel>
              <FormControlLabelText className="text-sm font-bold text-foreground">
                Tanggal Lahir
              </FormControlLabelText>
            </FormControlLabel>
            <Input className="rounded-xl border-border bg-background h-11 px-3">
              <InputField
                value={birthDate}
                onChangeText={onChangeBirthDate}
                placeholder="12/05/1998"
                className="text-foreground text-sm"
              />
            </Input>
          </FormControl>

          <VStack space="xs" className="flex-1">
            <Text size="sm" bold className="text-foreground mb-1">
              Jenis Kelamin
            </Text>
            <HStack space="xs">
              <Pressable
                onPress={() => {
                  haptics.light();
                  onChangeGender("FEMALE");
                }}
                className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                  gender === "FEMALE"
                    ? "bg-secondary border-secondary"
                    : "bg-background border-border"
                }`}
              >
                <Text
                  size="sm"
                  bold
                  className={
                    gender === "FEMALE"
                      ? "text-secondary-foreground"
                      : "text-foreground"
                  }
                >
                  Wanita
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  haptics.light();
                  onChangeGender("MALE");
                }}
                className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                  gender === "MALE"
                    ? "bg-secondary border-secondary"
                    : "bg-background border-border"
                }`}
              >
                <Text
                  size="sm"
                  bold
                  className={
                    gender === "MALE"
                      ? "text-secondary-foreground"
                      : "text-foreground"
                  }
                >
                  Pria
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </HStack>

        <FormControl>
          <FormControlLabel>
            <FormControlLabelText className="text-sm font-bold text-foreground">
              No. WhatsApp Aktif
            </FormControlLabelText>
          </FormControlLabel>
          <Input className="rounded-xl border-border bg-background h-11 px-3">
            <InputField
              value={phone}
              onChangeText={onChangePhone}
              keyboardType="phone-pad"
              className="text-foreground text-sm"
            />
          </Input>
        </FormControl>
      </Card>
    </VStack>
  );
}

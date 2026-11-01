import React from "react";
import { FileText, MapPin, Clock, User } from "lucide-react-native";
import {
  Card,
  VStack,
  HStack,
  Box,
  Text,
  Heading,
} from "@/components/ui";
import { AppIcon } from "@/components/common/AppIcon";

interface ReferralHospitalCardProps {
  hospitalName?: string;
  department?: string;
  doctorName?: string;
  validityPeriod?: string;
  diagnosisIcd?: string;
  referralNumber?: string;
}

export function ReferralHospitalCard({
  hospitalName = "Rujukan rumah sakit belum tersedia",
  department = "Poliklinik belum tersedia",
  doctorName = "Dokter penunjuk belum tersedia",
  validityPeriod = "Masa berlaku belum tersedia",
  diagnosisIcd = "Kode diagnosis belum tersedia",
  referralNumber = "Nomor rujukan belum tersedia",
}: ReferralHospitalCardProps) {
  return (
    <Card className="bg-card rounded-3xl p-5 mb-3.5 border border-border">
      <VStack space="md">
        <HStack space="md" className="items-center justify-between pb-3 border-b border-border">
          <HStack space="sm" className="items-center">
            <Box className="w-10 h-10 rounded-2xl bg-muted items-center justify-center">
              <AppIcon icon={FileText} size={20} tone="primary" />
            </Box>
            <VStack space="xs">
              <Text size="sm" bold className="text-foreground">
                Surat Rujukan Digital
              </Text>
              <Text size="sm" className="text-muted-foreground font-medium">
                No: {referralNumber}
              </Text>
            </VStack>
          </HStack>
          <Box className="bg-primary/10 px-3 py-1 rounded-full">
            <Text size="sm" bold className="text-primary font-bold">
              Aktif
            </Text>
          </Box>
        </HStack>

        {/* Hospital & Department */}
        <VStack space="xs">
          <Text size="sm" className="text-muted-foreground font-medium">
            Fasilitas Kesehatan Tujuan
          </Text>
          <HStack space="xs" className="items-center">
            <AppIcon icon={MapPin} size={16} tone="primary" />
            <Heading size="sm" bold className="text-foreground">
              {hospitalName}
            </Heading>
          </HStack>
          <Text size="sm" className="text-muted-foreground pl-6 font-medium">
            {department}
          </Text>
        </VStack>

        {/* Doctor & Date */}
        <HStack space="md" className="justify-between pt-2 border-t border-border">
          <VStack space="xs">
            <Text size="sm" className="text-muted-foreground font-medium">
              Dokter Perujuk
            </Text>
            <HStack space="xs" className="items-center">
              <AppIcon icon={User} size={15} tone="muted" />
              <Text size="sm" bold className="text-foreground font-semibold">
                {doctorName}
              </Text>
            </HStack>
          </VStack>

          <VStack space="xs" className="items-end">
            <Text size="sm" className="text-muted-foreground font-medium">
              Masa Berlaku
            </Text>
            <HStack space="xs" className="items-center">
              <AppIcon icon={Clock} size={15} tone="muted" />
              <Text size="sm" bold className="text-foreground font-semibold">
                {validityPeriod}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* ICD-10 Diagnosis Box */}
        <Box className="bg-muted rounded-2xl p-3.5 border border-border">
          <Text size="sm" className="text-muted-foreground font-medium mb-1">
            Diagnosa Indikasi Rujukan
          </Text>
          <Text size="sm" bold className="text-foreground font-bold">
            {diagnosisIcd}
          </Text>
        </Box>
      </VStack>
    </Card>
  );
}

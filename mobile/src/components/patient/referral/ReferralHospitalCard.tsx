import React from "react";
import { FileText, MapPin, Clock, User, QrCode } from "lucide-react-native";
import {
  Card,
  VStack,
  HStack,
  Box,
  Text,
  Heading,
} from "@/components/ui";

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
            <Box className="w-10 h-10 rounded-2xl bg-secondary/15 items-center justify-center">
              <FileText size={20} className="text-secondary" />
            </Box>
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Surat Rujukan Digital
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                No: {referralNumber}
              </Text>
            </VStack>
          </HStack>
          <Box className="bg-primary/10 px-2.5 py-1 rounded-full">
            <Text size="xs" bold className="text-primary text-[10px]">
              Aktif
            </Text>
          </Box>
        </HStack>

        {/* Hospital & Department */}
        <VStack space="xs">
          <Text size="xs" className="text-muted-foreground text-[11px]">
            Fasilitas Kesehatan Tujuan
          </Text>
          <HStack space="xs" className="items-center">
            <MapPin size={14} className="text-secondary" />
            <Heading size="xs" bold className="text-foreground">
              {hospitalName}
            </Heading>
          </HStack>
          <Text size="xs" className="text-muted-foreground pl-5 text-[11px]">
            {department}
          </Text>
        </VStack>

        {/* Doctor & Date */}
        <HStack space="md" className="justify-between pt-2 border-t border-border">
          <VStack space="xs">
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Dokter Perujuk
            </Text>
            <HStack space="xs" className="items-center">
              <User size={12} className="text-muted-foreground" />
              <Text size="xs" bold className="text-foreground text-[11px]">
                {doctorName}
              </Text>
            </HStack>
          </VStack>

          <VStack space="xs" className="items-end">
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Masa Berlaku
            </Text>
            <HStack space="xs" className="items-center">
              <Clock size={12} className="text-muted-foreground" />
              <Text size="xs" bold className="text-foreground text-[11px]">
                {validityPeriod}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* ICD-10 Diagnosis Box */}
        <Box className="bg-muted rounded-2xl p-3 border border-border">
          <Text size="xs" className="text-muted-foreground text-[10px] mb-0.5">
            Diagnosa Indikasi Rujukan
          </Text>
          <Text size="xs" bold className="text-foreground">
            {diagnosisIcd}
          </Text>
        </Box>
      </VStack>
    </Card>
  );
}

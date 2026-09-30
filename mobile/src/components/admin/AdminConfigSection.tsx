import React from "react";
import { Text, Card, VStack, HStack, Badge, BadgeText } from "@/components/ui";

export function AdminConfigSection() {
  return (
    <>
      {/* Pricing Section */}
      <VStack space="xs" className="px-5 pt-4">
        <Text size="md" className="font-semibold text-foreground mb-1">
          Pengaturan Tarif Layanan
        </Text>

        {/* Biaya konsultasi dasar */}
        <Card className="bg-card px-3.5 py-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <Text size="xs" className="text-muted-foreground">
              Biaya konsultasi reguler
            </Text>
            <Text size="xs" className="font-semibold text-foreground">
              Rp 30.000 – 150.000
            </Text>
          </HStack>
        </Card>

        {/* Biaya admin */}
        <Card className="bg-card px-3.5 py-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <Text size="xs" className="text-muted-foreground">
              Biaya administrasi sistem
            </Text>
            <Text size="xs" className="font-semibold text-foreground">
              Rp 5.000
            </Text>
          </HStack>
        </Card>

        {/* Overtime 15 menit */}
        <Card className="bg-card px-3.5 py-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <Text size="xs" className="text-muted-foreground">
              Perpanjangan sesi (+15 mnt)
            </Text>
            <Text size="xs" className="font-semibold text-foreground">
              Rp 35.000
            </Text>
          </HStack>
        </Card>

        {/* Komisi platform */}
        <Card className="bg-card px-3.5 py-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <Text size="xs" className="text-muted-foreground">
              Bagi hasil operasional
            </Text>
            <Text size="xs" className="font-semibold text-foreground">
              15%
            </Text>
          </HStack>
        </Card>
      </VStack>

      {/* Integrations */}
      <VStack space="xs" className="px-5 pt-4">
        <Text size="md" className="font-semibold text-foreground mb-1">
          Status Integrasi API Nasional
        </Text>

        {/* SATUSEHAT */}
        <Card className="bg-card p-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Kemenkes SATUSEHAT
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                FHIR HL7 Rekam Medis
              </Text>
            </VStack>
            <Badge
              variant="outline"
              className="bg-secondary/15 border-secondary/30 px-2.5 py-0.5 rounded-full border"
            >
              <BadgeText className="text-[10px] font-bold text-secondary">
                ● Terhubung
              </BadgeText>
            </Badge>
          </HStack>
        </Card>

        {/* BPJS API */}
        <Card className="bg-card p-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                BPJS Kesehatan VClaim
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                Verifikasi Kepesertaan & Rujukan
              </Text>
            </VStack>
            <Badge
              variant="outline"
              className="bg-secondary/15 border-secondary/30 px-2.5 py-0.5 rounded-full border"
            >
              <BadgeText className="text-[10px] font-bold text-secondary">
                ● Terhubung
              </BadgeText>
            </Badge>
          </HStack>
        </Card>

        {/* Dukcapil API */}
        <Card className="bg-card p-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Dukcapil Kemendagri
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                Validasi NIK Identitas
              </Text>
            </VStack>
            <Badge
              variant="outline"
              className="bg-secondary/15 border-secondary/30 px-2.5 py-0.5 rounded-full border"
            >
              <BadgeText className="text-[10px] font-bold text-secondary">
                ● Terhubung
              </BadgeText>
            </Badge>
          </HStack>
        </Card>

        {/* Kimia Farma API */}
        <Card className="bg-card p-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Apotek Jejaring (Kimia Farma)
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                Penebusan Resep Digital
              </Text>
            </VStack>
            <Badge
              variant="outline"
              className="bg-muted px-2.5 py-0.5 rounded-full border border-border"
            >
              <BadgeText className="text-[10px] font-bold text-foreground">
                ● Uji Coba
              </BadgeText>
            </Badge>
          </HStack>
        </Card>

        {/* Midtrans */}
        <Card className="bg-card p-3 rounded-xl border border-border">
          <HStack space="md" className="items-center justify-between">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Midtrans Payment Gateway
              </Text>
              <Text size="xs" className="text-muted-foreground text-[10px]">
                QRIS, VA & E-Wallet
              </Text>
            </VStack>
            <Badge
              variant="outline"
              className="bg-secondary/15 border-secondary/30 px-2.5 py-0.5 rounded-full border"
            >
              <BadgeText className="text-[10px] font-bold text-secondary">
                ● Produksi
              </BadgeText>
            </Badge>
          </HStack>
        </Card>
      </VStack>
    </>
  );
}

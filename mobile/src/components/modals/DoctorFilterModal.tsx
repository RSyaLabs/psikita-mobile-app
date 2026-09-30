import React from "react";
import { SlidersHorizontal, X, CheckCircle2 } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface DoctorFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFilter: string;
  setSelectedFilter: (role: string) => void;
  filterOnlineOnly: boolean;
  setFilterOnlineOnly: (val: boolean) => void;
  filterBpjsOnly: boolean;
  setFilterBpjsOnly: (val: boolean) => void;
  filterPriceRange?: string;
  setFilterPriceRange?: (val: string) => void;
  onApply: () => void;
  onReset: () => void;
}

export function DoctorFilterModal({
  isOpen,
  onClose,
  selectedFilter,
  setSelectedFilter,
  filterOnlineOnly,
  setFilterOnlineOnly,
  filterBpjsOnly,
  setFilterBpjsOnly,
  filterPriceRange = "Semua",
  setFilterPriceRange,
  onApply,
  onReset,
}: DoctorFilterModalProps) {
  const roles = [
    "Semua",
    "Psikolog Klinis",
    "Psikiater (Sp.KJ)",
    "Konseling Remaja",
    "BPJS",
  ];
  const priceRanges = ["Semua", "< 150rb", "150rb - 250rb", "> 250rb"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop
        dataSet={{ backdrop: "true" }}
        className="bg-black/45 backdrop-blur-md"
        style={
          {
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            transition: "none",
          } as any
        }
      />
      <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[390px]">
        <ModalHeader className="pb-3 border-b border-border/50">
          <HStack space="xs" className="items-center justify-between w-full">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-secondary/15 items-center justify-center">
                <SlidersHorizontal size={18} className="text-secondary" />
              </Box>
              <Heading size="sm" bold className="text-foreground">
                Filter Praktisi
              </Heading>
            </HStack>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Tutup filter"
              className="p-1 rounded-full active:bg-muted"
            >
              <X size={18} className="text-muted-foreground" />
            </Pressable>
          </HStack>
        </ModalHeader>

        <ModalBody className="pt-3 pb-1">
          <VStack space="md">
            {/* Category / Role Filter */}
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Jenis Praktisi
              </Text>
              <HStack space="xs" className="flex-wrap gap-1.5 pt-1">
                {roles.map((role) => {
                  const isSel = selectedFilter === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => {
                        haptics.light();
                        setSelectedFilter(role);
                      }}
                      className={`px-3 py-1.5 rounded-full border ${
                        isSel
                          ? "bg-primary border-primary"
                          : "bg-muted border-border"
                      }`}
                    >
                      <Text
                        size="xs"
                        className={
                          isSel
                            ? "font-bold text-primary-foreground"
                            : "font-medium text-foreground"
                        }
                      >
                        {role}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Status Online Filter */}
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Ketersediaan Waktu
              </Text>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setFilterOnlineOnly(!filterOnlineOnly);
                }}
                className={`p-3 rounded-2xl border flex-row items-center justify-between ${
                  filterOnlineOnly
                    ? "bg-secondary/15 border-secondary"
                    : "bg-muted border-border"
                }`}
              >
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Sedang Online Saja
                  </Text>
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    Hanya tampilkan dokter yang siap sesi instan
                  </Text>
                </VStack>
                <Box
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    filterOnlineOnly
                      ? "bg-secondary border-secondary"
                      : "border-border"
                  }`}
                >
                  {filterOnlineOnly && (
                    <CheckCircle2
                      size={14}
                      className="text-secondary-foreground"
                    />
                  )}
                </Box>
              </Pressable>
            </VStack>

            {/* BPJS Filter */}
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground">
                Penjaminan
              </Text>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setFilterBpjsOnly(!filterBpjsOnly);
                }}
                className={`p-3 rounded-2xl border flex-row items-center justify-between ${
                  filterBpjsOnly
                    ? "bg-primary/10 border-primary"
                    : "bg-muted border-border"
                }`}
              >
                <VStack space="xs">
                  <Text size="xs" bold className="text-foreground">
                    Dukungan BPJS Kesehatan
                  </Text>
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    Konsultasi terhubung dengan rujukan Faskes 1
                  </Text>
                </VStack>
                <Box
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    filterBpjsOnly
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {filterBpjsOnly && (
                    <CheckCircle2
                      size={14}
                      className="text-primary-foreground"
                    />
                  )}
                </Box>
              </Pressable>
            </VStack>

            {/* Price Range Filter */}
            {setFilterPriceRange && (
              <VStack space="xs">
                <Text size="xs" bold className="text-foreground">
                  Rentang Biaya Konsultasi
                </Text>
                <HStack space="xs" className="flex-wrap gap-1.5 pt-1">
                  {priceRanges.map((price) => {
                    const isSel = filterPriceRange === price;
                    return (
                      <Pressable
                        key={price}
                        onPress={() => {
                          haptics.light();
                          setFilterPriceRange(price);
                        }}
                        className={`px-3 py-1.5 rounded-full border ${
                          isSel
                            ? "bg-primary border-primary"
                            : "bg-muted border-border"
                        }`}
                      >
                        <Text
                          size="xs"
                          className={
                            isSel
                              ? "font-bold text-primary-foreground"
                              : "font-medium text-foreground"
                          }
                        >
                          {price}
                        </Text>
                      </Pressable>
                    );
                  })}
                </HStack>
              </VStack>
            )}

            {/* Actions */}
            <VStack space="xs" className="pt-2">
              <Button
                size="default"
                onPress={() => {
                  haptics.medium();
                  onApply();
                }}
                className="w-full bg-secondary h-11 rounded-xl"
              >
                <ButtonText className="text-xs font-bold text-secondary-foreground">
                  Terapkan Filter
                </ButtonText>
              </Button>
              <Button
                size="default"
                variant="outline"
                onPress={() => {
                  haptics.light();
                  onReset();
                }}
                className="w-full border-border bg-card h-11 rounded-xl"
              >
                <ButtonText className="text-xs font-semibold text-foreground">
                  Reset Filter
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

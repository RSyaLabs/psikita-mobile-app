import React, { useState } from "react";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Button,
  ButtonText,
} from "@/components/ui";
import { TextInput } from "react-native";
import { ChevronLeft, CheckCircle2, AlertTriangle } from "lucide-react-native";
import { haptics } from "@/utils/haptics";

export interface CreatePostViewProps {
  isSubmitting?: boolean;
  submissionError?: string | null;
  onBack: () => void;
  onSubmit: (data: { type: "EXPERIENCE" | "EDUCATION"; content: string }) => void;
  onOpenCrisis: () => void;
}

export function CreatePostView({
  isSubmitting = false,
  submissionError = null,
  onBack,
  onSubmit,
  onOpenCrisis,
}: CreatePostViewProps) {
  const [selectedType, setSelectedType] = useState<"EXPERIENCE" | "EDUCATION">("EXPERIENCE");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim() || isSubmitting) {
      haptics.error();
      return;
    }
    haptics.medium();
    onSubmit({
      type: selectedType,
      content: content.trim().slice(0, 280),
    });
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Batal buat posting"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Buat posting
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Jenis Posting Section */}
          <VStack space="xs" className="gap-2">
            <Text size="sm" bold className="text-foreground text-sm font-bold">
              Jenis posting
            </Text>

            {/* Experience Option */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedType === "EXPERIENCE" }}
              accessibilityLabel="Jenis Pengalaman"
              onPress={() => {
                haptics.selection();
                setSelectedType("EXPERIENCE");
              }}
              className={`flex-row items-center gap-3 min-h-[60px] px-4 rounded-xl border ${
                selectedType === "EXPERIENCE"
                  ? "border-[2.5px] border-foreground bg-[#EEEEEE]"
                  : "border-[1.5px] border-border bg-card"
              }`}
            >
              <Box
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedType === "EXPERIENCE"
                    ? "border-foreground bg-foreground"
                    : "border-muted-foreground bg-transparent"
                }`}
              >
                {selectedType === "EXPERIENCE" && (
                  <Box className="w-2 h-2 rounded-full bg-white" />
                )}
              </Box>
              <VStack className="flex-1">
                <Text size="sm" bold className="text-sm font-semibold text-foreground">
                  Pengalaman
                </Text>
                <Text size="sm" className="text-sm text-muted-foreground">
                  Ceritakan yang kamu alami
                </Text>
              </VStack>
            </Pressable>

            {/* Education Option */}
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedType === "EDUCATION" }}
              accessibilityLabel="Jenis Edukasi"
              onPress={() => {
                haptics.selection();
                setSelectedType("EDUCATION");
              }}
              className={`flex-row items-center gap-3 min-h-[60px] px-4 rounded-xl border ${
                selectedType === "EDUCATION"
                  ? "border-[2.5px] border-foreground bg-[#EEEEEE]"
                  : "border-[1.5px] border-border bg-card"
              }`}
            >
              <Box
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedType === "EDUCATION"
                    ? "border-foreground bg-foreground"
                    : "border-muted-foreground bg-transparent"
                }`}
              >
                {selectedType === "EDUCATION" && (
                  <Box className="w-2 h-2 rounded-full bg-white" />
                )}
              </Box>
              <VStack className="flex-1">
                <Text size="sm" bold className="text-sm font-semibold text-foreground">
                  Edukasi
                </Text>
                <Text size="sm" className="text-sm text-muted-foreground">
                  Bagikan informasi yang bermanfaat
                </Text>
              </VStack>
            </Pressable>
          </VStack>

          {/* Isi Posting Textarea */}
          <VStack space="xs" className="gap-1.5">
            <Text size="sm" bold className="text-foreground text-sm font-semibold">
              Isi posting
            </Text>
            <Box className="border-[1.5px] border-border rounded-xl p-3 bg-card min-h-[160px]">
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Tulis di sini…"
                placeholderTextColor="#75618E"
                multiline
                numberOfLines={7}
                maxLength={280}
                style={{ textAlignVertical: "top", fontSize: 15, color: "#262130", minHeight: 140 }}
              />
            </Box>
            <Text size="sm" className="text-sm text-muted-foreground text-right pr-1">
              [{content.length}] / 280
            </Text>
          </VStack>

          {/* Privacy Disclaimer Box */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Jangan membagikan data pribadi (nomor telepon, alamat, nama psikolog) atau data medis.
            </Text>
          </Box>

          {/* Emergency Crisis Notice Box */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60 gap-1">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Sedang dalam kondisi darurat? Posting tidak dibaca langsung.{" "}
              <Text
                size="sm"
                bold
                onPress={() => {
                  haptics.medium();
                  onOpenCrisis();
                }}
                className="text-sm font-bold text-foreground underline"
              >
                Lihat bantuan segera
              </Text>
            </Text>
          </Box>

          {/* Error Banner Fallback */}
          {submissionError && (
            <Box className="border-[1.5px] border-dashed border-red-500 rounded-xl p-3.5 bg-red-50/50 flex-row items-center gap-2">
              <AlertTriangle size={18} color="#EF4444" />
              <Text size="sm" className="text-sm text-red-700 leading-relaxed flex-1">
                Posting belum terkirim. Isinya aman, coba lagi.
              </Text>
            </Box>
          )}

          {/* Action CTAs */}
          <VStack space="xs" className="gap-2 pt-4">
            <Button
              size="lg"
              disabled={!content.trim() || isSubmitting}
              onPress={handleSubmit}
              className={`min-h-[52px] rounded-xl ${
                content.trim() ? "bg-primary" : "bg-muted"
              }`}
            >
              <ButtonText className="text-base font-semibold text-white">
                {isSubmitting ? "Mengirim..." : "Kirim Posting"}
              </ButtonText>
            </Button>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Batal"
              onPress={() => {
                haptics.light();
                onBack();
              }}
              className="min-h-[44px] items-center justify-center rounded-xl"
            >
              <Text size="sm" bold className="text-sm font-semibold text-foreground">
                Batal
              </Text>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}

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
import { ChevronLeft } from "lucide-react-native";
import { PostDto } from "@/api/community.service";
import { haptics } from "@/utils/haptics";

export interface EditPostViewProps {
  post: PostDto;
  isSaving?: boolean;
  onBack: () => void;
  onSave: (newContent: string) => void;
}

export function EditPostView({
  post,
  isSaving = false,
  onBack,
  onSave,
}: EditPostViewProps) {
  const [content, setContent] = useState(post.content || "");
  const categoryLabel = (post.category || "PENGALAMAN").toUpperCase();

  const handleSave = () => {
    if (!content.trim() || isSaving) {
      haptics.error();
      return;
    }
    haptics.medium();
    onSave(content.trim().slice(0, 280));
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Batal ubah posting"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Ubah posting
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Category Immutable Info (Screen 60 · FD4) */}
          <HStack className="items-center gap-2 flex-wrap">
            <Text size="sm" className="text-sm text-muted-foreground">
              Jenis posting:
            </Text>
            <Box className="border-[1.5px] border-[#333333] rounded-xl px-2.5 py-0.5 bg-background">
              <Text size="sm" bold className="text-sm text-foreground font-bold tracking-wider">
                {categoryLabel}
              </Text>
            </Box>
            <Text size="sm" className="text-sm text-muted-foreground">
              tidak bisa diubah.
            </Text>
          </HStack>

          {/* Isi Posting Textarea */}
          <VStack space="xs" className="gap-1.5">
            <Text size="sm" bold className="text-foreground text-sm font-semibold">
              Isi posting
            </Text>
            <Box className="border-[1.5px] border-border rounded-xl p-3 bg-card min-h-[180px]">
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Tulis di sini…"
                placeholderTextColor="#75618E"
                multiline
                numberOfLines={8}
                maxLength={280}
                style={{ textAlignVertical: "top", fontSize: 15, color: "#262130", minHeight: 160 }}
              />
            </Box>
            <Text size="sm" className="text-sm text-muted-foreground text-right pr-1">
              [{content.length}] / 280
            </Text>
          </VStack>

          {/* Notice Box */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Hanya isi yang bisa diubah. Hanya penulis yang bisa mengubah atau menghapus postingnya.
            </Text>
          </Box>

          {/* Action CTAs */}
          <VStack space="xs" className="gap-2 pt-6">
            <Button
              size="lg"
              disabled={!content.trim() || isSaving}
              onPress={handleSave}
              className={`min-h-[52px] rounded-xl ${
                content.trim() ? "bg-primary" : "bg-muted"
              }`}
            >
              <ButtonText className="text-base font-semibold text-white">
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
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

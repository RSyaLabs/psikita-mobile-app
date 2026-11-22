import React from "react";
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
import { MessageSquare, RefreshCw } from "lucide-react-native";
import { haptics } from "@/utils/haptics";

export interface CommunityEmptyViewProps {
  isError?: boolean;
  onRetry?: () => void;
  onCreatePost: () => void;
}

export function CommunityEmptyView({
  isError = false,
  onRetry,
  onCreatePost,
}: CommunityEmptyViewProps) {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="md" className="max-w-[640px] w-full self-center">
        {/* Header (Screen 63 · FD7) */}
        <VStack space="xs" className="pt-2">
          <Heading size="xl" bold className="text-foreground text-2xl">
            Feed
          </Heading>
          <Text size="sm" className="text-sm text-muted-foreground">
            Cerita dan diskusi komunitas.
          </Text>
        </VStack>

        {/* Empty State Center Card */}
        <VStack className="items-center justify-center text-center mt-12 gap-3.5 px-4">
          <Box className="w-[72px] height-[72px] h-[72px] rounded-full border-[2.5px] border-dashed border-[#555555] items-center justify-center bg-card">
            <MessageSquare size={32} color="#75618E" />
          </Box>

          <Heading size="lg" bold className="text-foreground text-xl text-center mt-2">
            Belum ada posting
          </Heading>

          <Text size="sm" className="text-sm text-muted-foreground text-center max-w-[280px]">
            Jadilah yang pertama membuka percakapan.
          </Text>

          <Button
            size="lg"
            onPress={() => {
              haptics.medium();
              onCreatePost();
            }}
            className="min-h-[52px] rounded-xl bg-primary w-full mt-4"
          >
            <ButtonText className="text-base font-semibold text-white">
              Buat Posting Pertama
            </ButtonText>
          </Button>
        </VStack>

        {/* Offline / Unavailable Fallback Box */}
        <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60 gap-2 mt-8">
          <Text size="sm" className="text-sm text-foreground leading-relaxed">
            Feed sedang tidak tersedia. Coba lagi nanti. Fitur lain tetap bisa dipakai.
          </Text>
          {onRetry && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Coba lagi muat feed"
              onPress={() => {
                haptics.selection();
                onRetry();
              }}
              className="flex-row items-center gap-1.5 pt-1"
            >
              <RefreshCw size={14} color="#4A3B6B" />
              <Text size="sm" bold className="text-sm font-semibold text-primary">
                Coba Lagi
              </Text>
            </Pressable>
          )}
        </Box>
      </VStack>
    </ScrollView>
  );
}

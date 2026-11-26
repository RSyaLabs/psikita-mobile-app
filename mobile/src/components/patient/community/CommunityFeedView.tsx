import React from "react";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { Plus, ChevronRight, AlertCircle, Heart } from "lucide-react-native";
import { PostDto } from "@/api/community.service";
import { haptics } from "@/utils/haptics";

export interface CommunityFeedViewProps {
  posts: PostDto[];
  isLoading?: boolean;
  activeFilter?: "semua" | "postinganmu";
  onFilterChange?: (filter: "semua" | "postinganmu") => void;
  onSelectPost: (post: PostDto) => void;
  onCreatePost: () => void;
  onOpenCrisis: () => void;
  onLoadMore?: () => void;
}

export function CommunityFeedView({
  posts,
  isLoading = false,
  activeFilter = "semua",
  onFilterChange,
  onSelectPost,
  onCreatePost,
  onOpenCrisis,
  onLoadMore,
}: CommunityFeedViewProps) {
  const displayPosts = posts ?? [];

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack space="md" className="max-w-[640px] w-full self-center">
        {/* Header (Screen 57 · FD1) */}
        <HStack className="items-start justify-between gap-2 pt-2">
          <VStack space="xs" className="flex-1">
            <Heading size="xl" bold className="text-foreground text-2xl">
              Feed
            </Heading>
            <Text size="sm" className="text-sm text-muted-foreground">
              Cerita dan edukasi komunitas.
            </Text>
          </VStack>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buat posting baru"
            onPress={() => {
              haptics.medium();
              onCreatePost();
            }}
            className="flex-row items-center justify-center min-h-[44px] px-4 rounded-full bg-primary border-[1.5px] border-primary active:opacity-80"
          >
            <Plus size={16} color="#FFFFFF" className="mr-1.5" />
            <Text size="sm" className="text-sm font-semibold text-white">
              Posting
            </Text>
          </Pressable>
        </HStack>

        {/* Filter Pills */}
        <HStack space="xs" className="gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilkan semua posting"
            onPress={() => {
              haptics.selection();
              onFilterChange?.("semua");
            }}
            className={`min-h-[40px] px-4 rounded-full items-center justify-center ${
              activeFilter === "semua"
                ? "bg-[#EEEEEE] border-2 border-foreground"
                : "bg-card border-[1.5px] border-border"
            }`}
          >
            <Text
              size="sm"
              className={`text-sm ${
                activeFilter === "semua"
                  ? "font-bold text-foreground"
                  : "font-semibold text-muted-foreground"
              }`}
            >
              Semua
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilkan postingan saya"
            onPress={() => {
              haptics.selection();
              onFilterChange?.("postinganmu");
            }}
            className={`min-h-[40px] px-4 rounded-full items-center justify-center ${
              activeFilter === "postinganmu"
                ? "bg-[#EEEEEE] border-2 border-foreground"
                : "bg-card border-[1.5px] border-border"
            }`}
          >
            <Text
              size="sm"
              className={`text-sm ${
                activeFilter === "postinganmu"
                  ? "font-bold text-foreground"
                  : "font-semibold text-muted-foreground"
              }`}
            >
              Postinganmu
            </Text>
          </Pressable>
        </HStack>

        {/* Clinical Disclaimer Notice Box */}
        <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60">
          <Text size="sm" className="text-sm text-foreground leading-relaxed">
            Isi Feed adalah cerita dan edukasi dari pengguna, bukan nasihat klinis atau pengganti konsultasi.
          </Text>
        </Box>

        {/* Post List */}
        <VStack space="sm" className="gap-3">
          {displayPosts.map((post) => {
            const isCrisisPost = post.id === "post-3" || post.content.toLowerCase().includes("krisis") || post.content.toLowerCase().includes("darurat");
            const categoryLabel = (post.category || "PENGALAMAN").toUpperCase();

            return (
              <Pressable
                key={post.id}
                accessibilityRole="button"
                accessibilityLabel={`Posting dari ${post.authorName || "Pengguna"}`}
                onPress={() => {
                  haptics.light();
                  if (isCrisisPost) {
                    onOpenCrisis();
                  } else {
                    onSelectPost(post);
                  }
                }}
                className="bg-card border-[1.5px] border-border rounded-2xl p-4 active:border-primary"
              >
                {/* Author Info & Category Badge */}
                <HStack className="items-center justify-between gap-2 mb-2.5">
                  <HStack className="items-center gap-2.5 flex-1">
                    <Box className="w-8 h-8 rounded-full border-[1.5px] border-dashed border-[#555555] bg-muted/30 items-center justify-center">
                      <Text size="sm" bold className="text-sm text-foreground">
                        {(post.authorName || "P").charAt(0).toUpperCase()}
                      </Text>
                    </Box>
                    <VStack className="flex-1">
                      <Text size="sm" bold className="text-sm text-foreground" numberOfLines={1}>
                        {post.authorName || "Anonim"}
                      </Text>
                      <Text size="sm" className="text-sm text-muted-foreground">
                        {post.createdAt || "Baru saja"}
                      </Text>
                    </VStack>
                  </HStack>
                  <Box className="border-[1.5px] border-[#333333] rounded-xl px-2.5 py-0.5 bg-background">
                    <Text size="sm" bold className="text-sm text-foreground font-bold tracking-wider">
                      {categoryLabel}
                    </Text>
                  </Box>
                </HStack>

                {/* Post Body (Max 280 Chars) */}
                <Text size="sm" className="text-sm text-foreground leading-relaxed mb-3">
                  {post.content}
                </Text>

                {/* Footer Action */}
                <HStack className="items-center justify-between border-t border-border/40 pt-2.5">
                  <Text size="sm" className="text-sm font-semibold text-muted-foreground">
                    Lihat balasan ›
                  </Text>
                  {isCrisisPost && (
                    <HStack className="items-center gap-1">
                      <AlertCircle size={14} color="#75618E" />
                      <Text size="sm" className="text-sm font-medium text-primary">
                        Bantuan Segera
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </Pressable>
            );
          })}
        </VStack>

        {/* Load More Button */}
        {onLoadMore && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Muat lebih banyak posting"
            onPress={() => {
              haptics.light();
              onLoadMore();
            }}
            className="min-h-[44px] items-center justify-center rounded-xl bg-card border border-border mt-2 active:bg-muted"
          >
            <Text size="sm" bold className="text-sm text-foreground font-semibold">
              Muat lebih banyak
            </Text>
          </Pressable>
        )}
      </VStack>
    </ScrollView>
  );
}

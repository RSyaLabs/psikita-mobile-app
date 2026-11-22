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
import { ChevronLeft, Plus, Trash2, Edit3, Eye } from "lucide-react-native";
import { PostDto } from "@/api/community.service";
import { haptics } from "@/utils/haptics";

export interface MyPostsViewProps {
  posts: PostDto[];
  isLoading?: boolean;
  onBack: () => void;
  onViewPost: (post: PostDto) => void;
  onEditPost: (post: PostDto) => void;
  onDeletePost: (postId: string) => void;
  onCreatePost: () => void;
}

export function MyPostsView({
  posts,
  isLoading = false,
  onBack,
  onViewPost,
  onEditPost,
  onDeletePost,
  onCreatePost,
}: MyPostsViewProps) {
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const confirmDelete = (postId: string) => {
    haptics.medium();
    onDeletePost(postId);
    setDeletingPostId(null);
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header (Screen 61 · FD5) */}
      <HStack className="items-center gap-2 px-5 pt-3 pb-2 border-b border-border bg-card">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke feed"
          onPress={() => {
            haptics.light();
            onBack();
          }}
          className="w-10 h-10 rounded-full border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground text-lg">
          Postinganmu
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {posts.length === 0 ? (
            /* Empty state */
            <Box className="border-[1.5px] border-dashed border-border rounded-2xl p-8 items-center justify-center bg-card gap-3 mt-6">
              <Text size="sm" bold className="text-foreground text-center text-base">
                Kamu belum punya posting
              </Text>
              <Text size="sm" className="text-muted-foreground text-center leading-relaxed">
                Ceritakan pengalamanmu atau bagikan edukasi kesehatan mental untuk komunitas.
              </Text>
            </Box>
          ) : (
            posts.map((post) => {
              const categoryLabel = (post.category || "PENGALAMAN").toUpperCase();
              const isConfirmingDelete = deletingPostId === post.id;

              return (
                <Box
                  key={post.id}
                  className="border-[1.5px] border-border rounded-2xl p-4 bg-card gap-2.5"
                >
                  <HStack className="items-center justify-between">
                    <Box className="border-[1.5px] border-[#333333] rounded-xl px-2.5 py-0.5 bg-background">
                      <Text size="sm" bold className="text-sm text-foreground font-bold tracking-wider">
                        {categoryLabel}
                      </Text>
                    </Box>
                    <Text size="sm" className="text-sm text-muted-foreground">
                      {post.createdAt || "Baru saja"}
                    </Text>
                  </HStack>

                  <Text size="sm" className="text-sm text-foreground leading-relaxed">
                    {post.content}
                  </Text>

                  {/* Inline Delete Confirmation Alert */}
                  {isConfirmingDelete ? (
                    <Box className="border-2 border-foreground rounded-xl p-3 bg-muted/20 gap-2 mt-1">
                      <Text size="sm" bold className="text-sm font-bold text-foreground">
                        Hapus posting ini?
                      </Text>
                      <Text size="sm" className="text-sm text-muted-foreground">
                        Tidak bisa dibatalkan.
                      </Text>
                      <HStack space="xs" className="gap-2 pt-1">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Konfirmasi hapus posting"
                          onPress={() => confirmDelete(post.id)}
                          className="flex-1 min-h-[44px] rounded-xl bg-foreground items-center justify-center"
                        >
                          <Text size="sm" bold className="text-sm font-semibold text-white">
                            Hapus
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Batal hapus posting"
                          onPress={() => {
                            haptics.light();
                            setDeletingPostId(null);
                          }}
                          className="flex-1 min-h-[44px] rounded-xl border border-border bg-card items-center justify-center"
                        >
                          <Text size="sm" bold className="text-sm font-semibold text-foreground">
                            Batal
                          </Text>
                        </Pressable>
                      </HStack>
                    </Box>
                  ) : (
                    /* Action Links */
                    <HStack space="xs" className="items-center justify-end gap-1 border-t border-border/40 pt-2">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Lihat posting"
                        onPress={() => {
                          haptics.light();
                          onViewPost(post);
                        }}
                        className="px-3 py-2 min-h-[44px] items-center justify-center"
                      >
                        <Text size="sm" bold className="text-sm font-semibold text-foreground">
                          Lihat
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Ubah posting"
                        onPress={() => {
                          haptics.selection();
                          onEditPost(post);
                        }}
                        className="px-3 py-2 min-h-[44px] items-center justify-center"
                      >
                        <Text size="sm" bold className="text-sm font-semibold text-foreground">
                          Ubah
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Hapus posting"
                        onPress={() => {
                          haptics.selection();
                          setDeletingPostId(post.id);
                        }}
                        className="px-3 py-2 min-h-[44px] items-center justify-center"
                      >
                        <Text size="sm" bold className="text-sm font-semibold text-foreground">
                          Hapus
                        </Text>
                      </Pressable>
                    </HStack>
                  )}
                </Box>
              );
            })
          )}

          {/* Bottom Clarification Notice */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-xl p-3.5 bg-card/60">
            <Text size="sm" className="text-sm text-foreground leading-relaxed">
              Daftar ini hanya memuat postinganmu. Kosong? Tampilkan "Kamu belum punya posting" dan tombol Buat Posting.
            </Text>
          </Box>
        </VStack>
      </ScrollView>

      {/* Bottom Sticky Action CTA */}
      <Box className="border-t border-border bg-card px-5 py-3.5">
        <Button
          size="lg"
          onPress={() => {
            haptics.medium();
            onCreatePost();
          }}
          className="min-h-[52px] rounded-xl bg-primary max-w-[640px] w-full self-center"
        >
          <ButtonText className="text-base font-semibold text-white">
            + Buat Posting
          </ButtonText>
        </Button>
      </Box>
    </VStack>
  );
}

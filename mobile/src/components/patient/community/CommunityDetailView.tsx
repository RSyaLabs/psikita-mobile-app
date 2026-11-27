import React, { useState } from "react";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Input,
  InputField,
} from "@/components/ui";
import { ChevronLeft, Send, ArrowRight } from "lucide-react-native";
import { PostDto, PostReplyDto } from "@/api/community.service";
import { haptics } from "@/utils/haptics";

export interface CommunityDetailViewProps {
  post: PostDto;
  replies: PostReplyDto[];
  currentUserId?: string;
  isSendingReply?: boolean;
  onBack: () => void;
  onSendReply: (content: string) => void;
  onEditPost?: (post: PostDto) => void;
  onDeletePost?: (postId: string) => void;
  onConsultDoctor: () => void;
}

export function CommunityDetailView({
  post,
  replies,
  currentUserId,
  isSendingReply = false,
  onBack,
  onSendReply,
  onEditPost,
  onDeletePost,
  onConsultDoctor,
}: CommunityDetailViewProps) {
  const [replyInput, setReplyInput] = useState("");
  const isAuthor =
    Boolean(currentUserId) &&
    (currentUserId === post.authorId || post.authorId === "current-user");
  const displayReplies = replies ?? [];
  const categoryLabel = (post.category || "PENGALAMAN").toUpperCase();

  const handleSend = () => {
    if (!replyInput.trim() || isSendingReply) {
      haptics.error();
      return;
    }
    haptics.medium();
    onSendReply(replyInput.trim());
    setReplyInput("");
  };

  return (
    <VStack className="flex-1 bg-background">
      {/* Top Header */}
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
          Posting
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="md" className="max-w-[640px] w-full self-center gap-4">
          {/* Main Article Post Card (Screen 58 · FD2) */}
          <Box className="border-[2.5px] border-foreground rounded-2xl p-4 bg-card">
            {/* Author info & Category */}
            <HStack className="items-center justify-between gap-2 mb-3">
              <HStack className="items-center gap-2.5 flex-1">
                <Box className="w-9 h-9 rounded-full border-[1.5px] border-dashed border-[#555555] bg-muted/40 items-center justify-center">
                  <Text size="sm" bold className="text-sm text-foreground">
                    {(post.authorName || "P").charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <VStack className="flex-1">
                  <Text size="sm" bold className="text-sm text-foreground">
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

            {/* Post Content */}
            <Text size="sm" className="text-sm text-foreground leading-relaxed mb-3">
              {post.content}
            </Text>

            {/* Self-post Actions Bar */}
            {isAuthor && (
              <HStack className="items-center justify-between border-t border-dashed border-border pt-2.5">
                <Text size="sm" className="text-sm text-muted-foreground flex-1 pr-2">
                  Tombol di kanan hanya tampil di postinganmu sendiri
                </Text>
                <HStack space="xs" className="items-center">
                  {onEditPost && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Ubah posting ini"
                      onPress={() => {
                        haptics.selection();
                        onEditPost(post);
                      }}
                      className="px-2.5 py-1.5"
                    >
                      <Text size="sm" bold className="text-sm font-semibold text-foreground">
                        Ubah
                      </Text>
                    </Pressable>
                  )}
                  {onDeletePost && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Hapus posting ini"
                      onPress={() => {
                        haptics.selection();
                        onDeletePost(post.id);
                      }}
                      className="px-2.5 py-1.5"
                    >
                      <Text size="sm" bold className="text-sm font-semibold text-foreground">
                        Hapus
                      </Text>
                    </Pressable>
                  )}
                </HStack>
              </HStack>
            )}
          </Box>

          {/* Balasan (Replies) Section */}
          <VStack space="sm" className="gap-2.5">
            <Text size="sm" bold className="text-sm font-bold text-muted-foreground tracking-wider uppercase">
              BALASAN
            </Text>

            {displayReplies.map((reply) => (
              <Box
                key={reply.id}
                className="border-[1.5px] border-border rounded-xl p-3 bg-card"
              >
                <HStack className="items-center gap-1.5 mb-1">
                  <Text size="sm" bold className="text-sm text-foreground">
                    {reply.authorName || "Anonim"}
                  </Text>
                  <Text size="sm" className="text-sm text-muted-foreground">
                    · {reply.createdAt || "Baru saja"}
                  </Text>
                </HStack>
                <Text size="sm" className="text-sm text-foreground leading-relaxed">
                  {reply.content}
                </Text>
              </Box>
            ))}

            {displayReplies.length === 0 && (
              <Box className="border-[1.5px] border-dashed border-border rounded-xl p-3 items-center justify-center bg-card/60">
                <Text size="sm" className="text-sm text-muted-foreground text-center">
                  Belum ada balasan? Tulis yang pertama.
                </Text>
              </Box>
            )}
          </VStack>

          {/* Clinical Referral Box */}
          <Box className="border-[1.5px] border-dashed border-[#555555] rounded-2xl p-4 bg-card/60 gap-2">
            <Heading size="sm" bold className="text-foreground text-base">
              Butuh bicara dengan profesional?
            </Heading>
            <Text size="sm" className="text-sm text-muted-foreground leading-relaxed">
              Diskusi di sini tidak menggantikan konsultasi. Kamu bisa mulai dengan psikolog kapan saja.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Bicara dengan psikolog"
              onPress={() => {
                haptics.medium();
                onConsultDoctor();
              }}
              className="flex-row items-center gap-1.5 pt-1"
            >
              <Text size="sm" bold className="text-sm font-semibold text-foreground">
                Bicara dengan psikolog ›
              </Text>
            </Pressable>
          </Box>
        </VStack>
      </ScrollView>

      {/* Bottom Reply Input Bar */}
      <Box className="border-t border-border bg-card px-4 py-3">
        <HStack className="items-center gap-2 max-w-[640px] w-full self-center">
          <Box className="flex-1 min-h-[50px] border-[1.5px] border-border rounded-full px-4 justify-center bg-background">
            <Input className="border-0 bg-transparent h-full">
              <InputField
                value={replyInput}
                onChangeText={setReplyInput}
                placeholder="Tulis balasan…"
                maxLength={280}
                className="text-sm text-foreground py-0"
              />
            </Input>
          </Box>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kirim balasan"
            disabled={!replyInput.trim() || isSendingReply}
            onPress={handleSend}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              replyInput.trim() ? "bg-primary" : "bg-muted"
            }`}
          >
            <Send size={18} color={replyInput.trim() ? "#FFFFFF" : "#75618E"} />
          </Pressable>
        </HStack>
        <Box className="max-w-[640px] w-full self-center pt-1.5 pr-2">
          <Text size="sm" className="text-sm text-muted-foreground text-right">
            {replyInput.length} / 280
          </Text>
        </Box>
      </Box>
    </VStack>
  );
}

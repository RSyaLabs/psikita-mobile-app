import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  User,
  Heart,
  MessageSquare,
  Send,
  Shield,
} from "lucide-react-native";
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
  Badge,
  BadgeText,
  Spinner,
  Input,
  InputField,
} from "@/components/ui";
import {
  useCommunityPostDetail,
  useCommunityReplies,
  useCreateReply,
} from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [replyText, setReplyText] = useState("");

  const { data: post, isLoading: isPostLoading } = useCommunityPostDetail(id);
  const { data: replies, isLoading: isRepliesLoading } = useCommunityReplies(id);
  const createReplyMutation = useCreateReply();

  const handleSendReply = () => {
    if (!id || !replyText.trim()) {
      haptics.error();
      return;
    }
    haptics.medium();
    createReplyMutation.mutate(
      {
        postId: id,
        payload: { content: replyText.trim() },
      },
      {
        onSuccess: () => {
          setReplyText("");
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <HStack space="sm" className="items-center justify-between px-5 pt-3.5 pb-2 bg-card border-b border-border">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PATIENT.COMMUNITY);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Diskusi Cerita
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {isPostLoading ? (
          <Box className="py-20 items-center justify-center">
            <Spinner size="large" />
            <Text size="xs" className="text-muted-foreground mt-3">
              Membuka utas diskusi...
            </Text>
          </Box>
        ) : !post ? (
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Cerita tidak ditemukan
            </Text>
          </Card>
        ) : (
          <VStack space="md">
            {/* Main Post Card */}
            <Card className="bg-card rounded-2xl p-4 border border-border">
              <HStack space="xs" className="items-center justify-between mb-2">
                <HStack space="xs" className="items-center">
                  <Box className="w-9 h-9 rounded-full bg-muted items-center justify-center">
                    <User size={18} color="#4B4656" />
                  </Box>
                  <VStack space="xs">
                    <Text size="sm" bold className="text-foreground font-bold">
                      {post.isAnonymous ? "Sahabat SeraPhany" : post.authorName ?? "Pengguna"}
                    </Text>
                    <Text size="sm" className="text-muted-foreground font-medium">
                      {post.category ?? "Cerita Harian"}
                    </Text>
                  </VStack>
                </HStack>
                <HStack space="xs" className="items-center">
                  <Shield size={14} color="#4A3B6B" />
                  <Text size="sm" bold className="text-primary font-bold">
                    Privat & Aman
                  </Text>
                </HStack>
              </HStack>

              <Heading size="md" bold className="text-foreground mt-2 mb-2">
                {post.title}
              </Heading>
              <Text size="sm" className="text-foreground leading-relaxed font-medium">
                {post.content}
              </Text>

              <HStack space="lg" className="items-center mt-4 pt-3 border-t border-border/50">
                <HStack space="xs" className="items-center">
                  <Heart size={16} color="#4B4656" />
                  <Text size="sm" className="text-muted-foreground font-medium">
                    {post.likesCount ?? 0} Dukungan
                  </Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <MessageSquare size={16} color="#4B4656" />
                  <Text size="sm" className="text-muted-foreground font-medium">
                    {(replies ?? []).length} Balasan
                  </Text>
                </HStack>
              </HStack>
            </Card>

            {/* Replies Section */}
            <Heading size="sm" bold className="text-foreground px-1 mt-3">
              Tanggapan Komunitas ({(replies ?? []).length})
            </Heading>

            {isRepliesLoading ? (
              <Box className="py-6 items-center">
                <Spinner size="small" />
              </Box>
            ) : (replies ?? []).length === 0 ? (
              <Card className="p-6 items-center bg-card rounded-2xl border border-border">
                <Text size="sm" className="text-muted-foreground text-center font-medium">
                  Belum ada tanggapan. Kirimkan kata-kata penyemangat pertama!
                </Text>
              </Card>
            ) : (
              <VStack space="sm">
                {(replies ?? []).map((reply) => (
                  <Card key={reply.id} className="bg-card rounded-2xl p-4 border border-border">
                    <HStack space="xs" className="items-center mb-2">
                      <Box className="w-7 h-7 rounded-full bg-muted items-center justify-center mr-1">
                        <User size={14} color="#4B4656" />
                      </Box>
                      <Text size="sm" bold className="text-foreground font-bold">
                        {reply.authorName ?? "Sahabat SeraPhany"}
                      </Text>
                      {reply.authorRole === "practitioner" && (
                        <Badge variant="solid" action="success" className="rounded-md px-2 py-0.5 bg-primary ml-1.5">
                          <BadgeText className="text-sm font-bold text-white">
                            Psikolog
                          </BadgeText>
                        </Badge>
                      )}
                    </HStack>
                    <Text size="xs" className="text-foreground leading-relaxed pl-8">
                      {reply.content}
                    </Text>
                  </Card>
                ))}
              </VStack>
            )}
          </VStack>
        )}
      </ScrollView>

      {/* Sticky Bottom Input Field */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
        <HStack space="xs" className="items-center">
          <Input className="flex-1 h-11 bg-muted rounded-2xl border-border px-3.5">
            <InputField
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Tulis pesan penyemangat..."
              className="text-xs text-foreground"
            />
          </Input>
          <Button
            size="sm"
            isDisabled={createReplyMutation.isPending || !replyText.trim()}
            onPress={handleSendReply}
            className="w-11 h-11 rounded-full bg-secondary items-center justify-center p-0"
          >
            <Send size={16} className="text-white" />
          </Button>
        </HStack>
      </Box>
    </SafeAreaView>
  );
}

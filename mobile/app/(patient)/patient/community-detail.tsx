import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box, Spinner, Text } from "@/components/ui";
import {
  CommunityDetailView,
  EditPostView,
  FALLBACK_FEED_POSTS,
  FALLBACK_REPLIES,
} from "@/components/patient/community";
import {
  useCommunityPostDetail,
  useCommunityReplies,
  useCreateReply,
  useUpdatePost,
  useDeletePost,
} from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PostDto } from "@/api/community.service";

export default function CommunityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; step?: string; guest?: string }>();
  const postId = params.id || "post-1";

  const [currentMode, setCurrentMode] = useState<"detail" | "edit">(
    params.step === "edit" ? "edit" : "detail",
  );

  const { data: postData, isLoading: isPostLoading } = useCommunityPostDetail(postId);
  const { data: repliesData, isLoading: isRepliesLoading } = useCommunityReplies(postId);
  const createReplyMutation = useCreateReply();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // Find fallback post if API returns null
  const post: PostDto =
    postData ??
    FALLBACK_FEED_POSTS.find((p) => p.id === postId) ??
    FALLBACK_FEED_POSTS[0];

  const replies = repliesData && repliesData.length > 0 ? repliesData : FALLBACK_REPLIES;

  const handleSendReply = (content: string) => {
    createReplyMutation.mutate(
      {
        postId,
        payload: { content },
      },
      {
        onSuccess: () => {
          haptics.success();
        },
        onError: () => {
          haptics.error();
        },
      },
    );
  };

  const handleSaveEdit = (newContent: string) => {
    updatePostMutation.mutate(
      {
        id: postId,
        content: newContent,
      },
      {
        onSuccess: () => {
          haptics.success();
          setCurrentMode("detail");
        },
        onError: () => {
          haptics.error();
        },
      },
    );
  };

  const handleDeletePost = (id: string) => {
    deletePostMutation.mutate(id, {
      onSuccess: () => {
        haptics.success();
        safeNavigateBack(router, ROUTES.PATIENT.COMMUNITY);
      },
      onError: () => {
        haptics.error();
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {isPostLoading && !post ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text size="sm" className="text-muted-foreground mt-3">
            Membuka posting...
          </Text>
        </Box>
      ) : currentMode === "edit" ? (
        <EditPostView
          post={post}
          isSaving={updatePostMutation.isPending}
          onBack={() => setCurrentMode("detail")}
          onSave={handleSaveEdit}
        />
      ) : (
        <CommunityDetailView
          post={post}
          replies={replies}
          currentUserId="usr-1"
          isSendingReply={createReplyMutation.isPending}
          onBack={() => safeNavigateBack(router, ROUTES.PATIENT.COMMUNITY)}
          onSendReply={handleSendReply}
          onEditPost={() => setCurrentMode("edit")}
          onDeletePost={handleDeletePost}
          onConsultDoctor={() => {
            haptics.medium();
            router.push(ROUTES.PATIENT.TRIAGE as never);
          }}
        />
      )}
    </SafeAreaView>
  );
}

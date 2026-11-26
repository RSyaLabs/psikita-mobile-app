import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box, Button, ButtonText, Spinner, Text } from "@/components/ui";
import {
  CommunityDetailView,
  EditPostView,
} from "@/components/patient/community";
import {
  useCommunityPostDetail,
  useCommunityReplies,
  useCreateReply,
  useUpdatePost,
  useDeletePost,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PostDto } from "@/api/community.service";

export default function CommunityDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id?: string; step?: string; guest?: string }>();
  const isGuest = params.guest === "true";
  const postId = params.id || (isGuest ? "post-1" : "");

  const [currentMode, setCurrentMode] = useState<"detail" | "edit">(
    params.step === "edit" ? "edit" : "detail",
  );

  useEffect(() => {
    setCurrentMode(params.step === "edit" ? "edit" : "detail");
  }, [params.step]);

  const { data: postData, isLoading: isPostLoading } = useCommunityPostDetail(postId);
  const { data: repliesData } = useCommunityReplies(postId);
  const createReplyMutation = useCreateReply();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  const post: PostDto | undefined = postData ?? undefined;
  const replies = repliesData ?? [];

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
          Alert.alert("Gagal Mengirim Balasan", "Balasan Anda belum terkirim ke server.");
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
          Alert.alert("Gagal Menyimpan Perubahan", "Perubahan postingan belum tersimpan.");
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
        Alert.alert("Gagal Menghapus Postingan", "Coba hapus kembali beberapa saat lagi.");
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
      ) : !post ? (
        <Box className="flex-1 items-center justify-center px-6 gap-4">
          <Text size="md" bold className="text-foreground text-center">
            Postingan tidak ditemukan atau telah dihapus.
          </Text>
          <Button
            className="bg-primary rounded-xl px-6 h-11"
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.COMMUNITY)}
          >
            <ButtonText className="text-primary-foreground font-semibold text-sm">
              Kembali ke Komunitas
            </ButtonText>
          </Button>
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
          currentUserId={user?.id || (isGuest ? "usr-1" : "")}
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

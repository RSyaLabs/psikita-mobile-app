import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import {
  CommunityFeedView,
  CreatePostView,
  MyPostsView,
  CrisisHelpView,
  CommunityEmptyView,
  FALLBACK_FEED_POSTS,
} from "@/components/patient/community";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  useCommunityPosts,
  useCreatePost,
  useDeletePost,
} from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PostDto } from "@/api/community.service";

export default function CommunityFeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ step?: string; guest?: string }>();

  // Step state: "feed" (FD1) | "create" (FD3) | "my-posts" (FD5) | "crisis" (FD6) | "empty" (FD7)
  const initialStep =
    params.step === "create"
      ? "create"
      : params.step === "my-posts"
        ? "my-posts"
        : params.step === "crisis"
          ? "crisis"
          : params.step === "empty"
            ? "empty"
            : "feed";

  const [currentStep, setCurrentStep] = useState<
    "feed" | "create" | "my-posts" | "crisis" | "empty"
  >(initialStep);

  const [activeFilter, setActiveFilter] = useState<"semua" | "postinganmu">("semua");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { data: postsData, isLoading, isError, refetch } = useCommunityPosts();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();

  const posts = postsData && postsData.length > 0 ? postsData : FALLBACK_FEED_POSTS;
  // Current user's own posts filter
  const myPosts = posts.filter(
    (p) => p.authorId === "usr-1" || p.authorId === "current-user" || p.id === "post-1",
  );

  const handleSelectPost = (post: PostDto) => {
    haptics.light();
    router.push({
      pathname: ROUTES.PATIENT.COMMUNITY_DETAIL,
      params: { id: post.id, guest: params.guest },
    } as any);
  };

  const handleCreatePost = (data: { type: "EXPERIENCE" | "EDUCATION"; content: string }) => {
    setSubmissionError(null);
    createPostMutation.mutate(
      {
        content: data.content,
        type: data.type,
      },
      {
        onSuccess: () => {
          haptics.success();
          setCurrentStep("feed");
        },
        onError: () => {
          haptics.error();
          setSubmissionError("Posting belum terkirim. Isinya aman, coba lagi.");
        },
      },
    );
  };

  const handleDeletePost = (postId: string) => {
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        haptics.success();
      },
      onError: () => {
        haptics.error();
      },
    });
  };

  const handleFilterChange = (filter: "semua" | "postinganmu") => {
    setActiveFilter(filter);
    if (filter === "postinganmu") {
      setCurrentStep("my-posts");
    } else {
      setCurrentStep("feed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "left", "right"]}>
      {currentStep === "create" ? (
        <CreatePostView
          isSubmitting={createPostMutation.isPending}
          submissionError={submissionError}
          onBack={() => {
            setSubmissionError(null);
            setCurrentStep("feed");
          }}
          onSubmit={handleCreatePost}
          onOpenCrisis={() => setCurrentStep("crisis")}
        />
      ) : currentStep === "my-posts" ? (
        <MyPostsView
          posts={myPosts}
          isLoading={isLoading}
          onBack={() => {
            setActiveFilter("semua");
            setCurrentStep("feed");
          }}
          onViewPost={handleSelectPost}
          onEditPost={(post) => {
            router.push({
              pathname: ROUTES.PATIENT.COMMUNITY_DETAIL,
              params: { id: post.id, step: "edit", guest: params.guest },
            } as any);
          }}
          onDeletePost={handleDeletePost}
          onCreatePost={() => setCurrentStep("create")}
        />
      ) : currentStep === "crisis" ? (
        <CrisisHelpView
          onBack={() => setCurrentStep("feed")}
          onConsultDoctor={() => {
            haptics.medium();
            router.push(ROUTES.PATIENT.TRIAGE as never);
          }}
        />
      ) : currentStep === "empty" ? (
        <Box className="flex-1">
          <CommunityEmptyView
            isError={isError}
            onRetry={() => refetch()}
            onCreatePost={() => setCurrentStep("create")}
          />
          <PatientTabBar activeTab="feed" />
        </Box>
      ) : (
        <Box className="flex-1">
          <CommunityFeedView
            posts={posts}
            isLoading={isLoading}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onSelectPost={handleSelectPost}
            onCreatePost={() => setCurrentStep("create")}
            onOpenCrisis={() => setCurrentStep("crisis")}
            onLoadMore={() => {
              // Trigger refetch or pagination
            }}
          />
          <PatientTabBar activeTab="feed" />
        </Box>
      )}
    </SafeAreaView>
  );
}

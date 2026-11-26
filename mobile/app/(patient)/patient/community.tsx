import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Box } from "@/components/ui";
import {
  CommunityFeedView,
  CreatePostView,
  MyPostsView,
  CrisisHelpView,
  CommunityEmptyView,
} from "@/components/patient/community";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  useCommunityPosts,
  useCreatePost,
  useDeletePost,
} from "@/hooks/useApiQueries";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";
import { PostDto } from "@/api/community.service";

type CommunityStep = "feed" | "create" | "my-posts" | "crisis" | "empty";

function resolveCommunityStep(params: {
  step?: string;
  action?: string;
  tab?: string;
}): CommunityStep {
  if (params.action === "create" || params.step === "create") return "create";
  if (params.step === "my-posts") return "my-posts";
  if (
    params.step === "crisis" ||
    params.tab === "crisis" ||
    params.tab === "krisis"
  ) {
    return "crisis";
  }
  if (params.step === "empty") return "empty";
  return "feed";
}

export default function CommunityFeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    step?: string;
    action?: string;
    tab?: string;
    guest?: string;
  }>();

  const isGuest = params.guest === "true";

  // Step state: "feed" (FD1) | "create" (FD3) | "my-posts" (FD5) | "crisis" (FD6) | "empty" (FD7)
  const [currentStep, setCurrentStep] = useState<CommunityStep>(() =>
    resolveCommunityStep(params),
  );

  useEffect(() => {
    setCurrentStep(resolveCommunityStep(params));
  }, [params.step, params.action, params.tab]);

  const [activeFilter, setActiveFilter] = useState<"semua" | "postinganmu">("semua");
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { data: postsData, isLoading, isError, refetch } = useCommunityPosts();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();

  const posts = postsData ?? [];
  const myPosts = posts.filter((p) => (user?.id ? p.authorId === user.id : false));

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
        Alert.alert(
          "Gagal Menghapus",
          "Postingan tidak dapat dihapus saat ini. Silakan coba lagi.",
        );
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
      ) : currentStep === "empty" || (!isGuest && !isLoading && posts.length === 0) ? (
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
              void refetch();
            }}
          />
          <PatientTabBar activeTab="feed" />
        </Box>
      )}
    </SafeAreaView>
  );
}

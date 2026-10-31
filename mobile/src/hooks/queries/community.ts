import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  communityService,
  PostDto,
  PostReplyDto,
  CreatePostPayload,
  CreateReplyPayload,
} from "@/api/community.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useCommunityPosts(category?: string) {
  return useQuery<PostDto[]>({
    queryKey: queryKeys.community.list(category),
    queryFn: ({ signal }) => callWithSignal(communityService.getPosts, signal, category),
    staleTime: 30 * 1000,
  });
}

export function useCommunityPostDetail(postId?: string) {
  return useQuery<PostDto | null>({
    queryKey: queryKeys.community.detail(postId ?? ""),
    queryFn: ({ signal }) =>
      postId ? callWithSignal(communityService.getPostById, signal, postId) : Promise.resolve(null),
    enabled: !!postId,
  });
}

export function useCommunityReplies(postId?: string) {
  return useQuery<PostReplyDto[]>({
    queryKey: queryKeys.community.replies(postId ?? ""),
    queryFn: ({ signal }) =>
      postId ? callWithSignal(communityService.getReplies, signal, postId) : Promise.resolve([]),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => communityService.createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all });
    },
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: CreateReplyPayload }) =>
      communityService.createReply(postId, payload),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.replies(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.community.detail(postId) });
    },
  });
}

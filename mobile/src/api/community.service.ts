import { apiRequest } from "./client";
import { isRecord } from "./response";

export interface PostReplyDto {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
}

export interface PostDto {
  id: string;
  authorId: string;
  authorName?: string;
  authorRole?: string;
  category?: string;
  title: string;
  content: string;
  isAnonymous?: boolean;
  likesCount?: number;
  repliesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  category?: string;
  isAnonymous?: boolean;
}

export interface CreateReplyPayload {
  content: string;
}

export const communityService = {
  getPosts: async (category?: string, signal?: AbortSignal): Promise<PostDto[]> => {
    const query = category && category !== "Semua" ? `?category=${encodeURIComponent(category)}` : "";
    const response = await apiRequest<unknown>(`/posts${query}`, { signal });
    if (Array.isArray(response)) {
      return response as PostDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as PostDto[];
    }
    return [];
  },

  getPostById: async (id: string, signal?: AbortSignal): Promise<PostDto> => {
    return apiRequest<PostDto>(`/posts/${id}`, { signal });
  },

  getReplies: async (postId: string, signal?: AbortSignal): Promise<PostReplyDto[]> => {
    const response = await apiRequest<unknown>(`/posts/${postId}/replies`, { signal });
    if (Array.isArray(response)) {
      return response as PostReplyDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as PostReplyDto[];
    }
    return [];
  },

  createPost: async (payload: CreatePostPayload): Promise<PostDto> => {
    return apiRequest<PostDto>("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createReply: async (postId: string, payload: CreateReplyPayload): Promise<PostReplyDto> => {
    return apiRequest<PostReplyDto>(`/posts/${postId}/replies`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  deletePost: async (id: string): Promise<void> => {
    await apiRequest<void>(`/posts/${id}`, {
      method: "DELETE",
    });
  },
};

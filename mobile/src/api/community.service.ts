import { apiRequest } from "./client";
import { isRecord, noContentAdapter } from "./response";

export interface PostReplyDto {
  id: string;
  postId?: string;
  replyToId?: string | null;
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
  title?: string;
  content: string;
  category?: string;
  isAnonymous?: boolean;
  type?: "EDUCATION" | "EXPERIENCE";
}

export interface CreateReplyPayload {
  content: string;
}

export const communityService = {
  getPosts: async (category?: string, signal?: AbortSignal): Promise<PostDto[]> => {
    const response = await apiRequest<unknown>("/posts", { signal, adapter: (v) => v });
    const rawList = Array.isArray(response)
      ? (response as PostDto[])
      : isRecord(response) && Array.isArray((response as any).data)
        ? ((response as any).data as PostDto[])
        : [];
    if (category && category !== "Semua") {
      return rawList.filter((item) => !item.category || item.category === category);
    }
    return rawList;
  },

  getPostById: async (id: string, signal?: AbortSignal): Promise<PostDto> => {
    return apiRequest<PostDto>(`/posts/${id}`, { signal, adapter: (v) => v as PostDto });
  },

  getReplies: async (postId: string, signal?: AbortSignal): Promise<PostReplyDto[]> => {
    const response = await apiRequest<unknown>(`/posts/${postId}/replies`, { signal, adapter: (v) => v });
    if (Array.isArray(response)) {
      return response as PostReplyDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as PostReplyDto[];
    }
    return [];
  },

  createPost: async (payload: CreatePostPayload): Promise<{ message: string; id?: string }> => {
    const fullContent = payload.title?.trim()
      ? `${payload.title.trim()}\n\n${payload.content.trim()}`
      : payload.content.trim();
    const content = fullContent.slice(0, 280);
    const type: "EDUCATION" | "EXPERIENCE" =
      payload.type ?? (payload.category === "Edukasi" ? "EDUCATION" : "EXPERIENCE");

    return apiRequest<{ message: string; id?: string }>("/posts", {
      method: "POST",
      body: JSON.stringify({
        content,
        type,
      }),
      adapter: (v) => v as { message: string; id?: string },
    });
  },

  createReply: async (postId: string, payload: CreateReplyPayload): Promise<{ message: string; id?: string }> => {
    return apiRequest<{ message: string; id?: string }>("/posts", {
      method: "POST",
      body: JSON.stringify({
        content: payload.content.trim().slice(0, 280),
        type: "EXPERIENCE",
        replyToId: postId,
      }),
      adapter: (v) => v as { message: string; id?: string },
    });
  },

  updatePost: async (id: string, payload: { content: string }): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        content: payload.content.trim().slice(0, 280),
      }),
      adapter: (v) => v as { message: string },
    });
  },

  deletePost: async (id: string): Promise<void> => {
    await apiRequest<void>(`/posts/${id}`, {
      method: "DELETE",
      adapter: noContentAdapter,
    });
  },
};

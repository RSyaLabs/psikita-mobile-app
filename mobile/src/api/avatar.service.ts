import { apiRequest } from "./client";
import { isRecord, noContentAdapter } from "./response";

export interface AvatarResponseDto {
  avatarUrl: string;
  url?: string | null;
  key?: string;
  updatedAt?: string;
}

function avatarAdapter(value: unknown): AvatarResponseDto {
  const rec = isRecord(value) ? value : {};
  const resolvedUrl =
    typeof rec.avatarUrl === "string"
      ? rec.avatarUrl
      : typeof rec.url === "string"
        ? rec.url
        : "";
  return {
    avatarUrl: resolvedUrl,
    url: typeof rec.url === "string" ? rec.url : resolvedUrl || null,
    key: typeof rec.key === "string" ? rec.key : undefined,
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : undefined,
  };
}

export const avatarService = {
  getMyAvatar: async (signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", {
      signal,
      adapter: avatarAdapter,
    });
  },

  getAvatarByUserId: async (userId: string, signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>(`/avatar/${encodeURIComponent(userId)}`, {
      signal,
      adapter: avatarAdapter,
    });
  },

  uploadAvatar: async (formData: FormData): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", {
      method: "POST",
      body: formData,
      adapter: avatarAdapter,
    });
  },

  deleteAvatar: async (): Promise<void> => {
    await apiRequest<void>("/avatar/me", {
      method: "DELETE",
      adapter: noContentAdapter,
    });
  },
};

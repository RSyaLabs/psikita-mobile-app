import { apiRequest } from "./client";
import { noContentAdapter } from "./response";

export interface AvatarResponseDto {
  avatarUrl: string;
  updatedAt?: string;
}

export const avatarService = {
  getMyAvatar: async (signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", {
      signal,
      adapter: (v) => v as AvatarResponseDto,
    });
  },

  getAvatarByUserId: async (userId: string, signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>(`/avatar/${userId}`, {
      signal,
      adapter: (v) => v as AvatarResponseDto,
    });
  },

  uploadAvatar: async (formData: FormData): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", {
      method: "POST",
      body: formData,
      adapter: (v) => v as AvatarResponseDto,
    });
  },

  deleteAvatar: async (): Promise<void> => {
    await apiRequest<void>("/avatar/me", {
      method: "DELETE",
      adapter: noContentAdapter,
    });
  },
};

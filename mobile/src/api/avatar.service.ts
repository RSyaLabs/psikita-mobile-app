import { apiRequest } from "./client";

export interface AvatarResponseDto {
  avatarUrl: string;
  updatedAt?: string;
}

export const avatarService = {
  getMyAvatar: async (signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", { signal });
  },

  getAvatarByUserId: async (userId: string, signal?: AbortSignal): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>(`/avatar/${userId}`, { signal });
  },

  uploadAvatar: async (formData: FormData): Promise<AvatarResponseDto> => {
    return apiRequest<AvatarResponseDto>("/avatar/me", {
      method: "POST",
      body: formData,
    });
  },

  deleteAvatar: async (): Promise<void> => {
    await apiRequest<void>("/avatar/me", {
      method: "DELETE",
    });
  },
};

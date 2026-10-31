import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { avatarService, AvatarResponseDto } from "@/api/avatar.service";
import { queryKeys } from "../useQueryKeys";

export function useMyAvatar() {
  return useQuery({
    queryKey: queryKeys.avatar.my(),
    queryFn: ({ signal }) => avatarService.getMyAvatar(signal),
  });
}

export function useUserAvatar(userId: string) {
  return useQuery({
    queryKey: queryKeys.avatar.byUser(userId),
    queryFn: ({ signal }) => avatarService.getAvatarByUserId(userId, signal),
    enabled: Boolean(userId),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => avatarService.uploadAvatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avatar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => avatarService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.avatar.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { avatarService } from "@/api/avatar.service";
import { queryKeys } from "../useQueryKeys";

export function useMyAvatar() {
  return useQuery({
    queryKey: queryKeys.avatar.my(),
    queryFn: ({ signal }) => avatarService.getMyAvatar(signal),
  });
}

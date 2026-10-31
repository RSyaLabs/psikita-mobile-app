import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  followUpService,
  FollowUpDto,
  FollowUpSlotDto,
} from "@/api/followup.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useMyFollowUps() {
  return useQuery<FollowUpDto[]>({
    queryKey: queryKeys.followUps.my(),
    queryFn: ({ signal }) => callWithSignal(followUpService.getMyFollowUps, signal),
    staleTime: 60 * 1000,
  });
}

export function useFollowUpSlots(followUpId?: string) {
  return useQuery<FollowUpSlotDto[]>({
    queryKey: queryKeys.followUps.slots(followUpId ?? ""),
    queryFn: ({ signal }) =>
      followUpId
        ? callWithSignal(followUpService.getFollowUpSlots, signal, followUpId)
        : Promise.resolve([]),
    enabled: !!followUpId,
  });
}

export function useBookFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ followUpId, slotId }: { followUpId: string; slotId: string }) =>
      followUpService.bookFollowUpSlot(followUpId, slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.followUps.all });
    },
  });
}

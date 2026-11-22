import { useQuery } from "@tanstack/react-query";
import {
  followUpService,
  FollowUpDto,
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

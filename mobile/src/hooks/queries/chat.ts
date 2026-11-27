import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { PaginatedResult } from "@/api/response";
import {
  consultationService,
} from "@/api";
import { chatSocketClient } from "@/services/chat-socket";
import {
  MessageResponseDto,
} from "@/types/api";
import {
  queryKeys,
  type RoomMessageParams,
} from "../useQueryKeys";

/**
 * chat queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
  getJitteredInterval,
  shouldPollRoom,
} from "./shared";

/**
 * Hook to retrieve encrypted chat messages for a consultation room with Smart Adaptive Polling
 */
export function useRoomMessages(
  roomId?: string,
  consultationStatus?: string,
  params?: RoomMessageParams,
) {
  const normalizedRoomId = roomId?.trim() || "";
  const query = useQuery<PaginatedResult<MessageResponseDto>, Error>({
    queryKey: queryKeys.consultations.roomMessages(normalizedRoomId, params),
    queryFn: ({ signal }) =>
      callWithSignal(
        consultationService.getRoomMessages,
        signal,
        normalizedRoomId,
        params,
      ),
    enabled: Boolean(normalizedRoomId),
    staleTime: 3000,
    refetchInterval: (query) => {
      // A finished or unavailable room stops polling for good. An ERROR does not:
      // returning false here froze the chat list permanently on one transient
      // 500 or dropped connection, until a remount or a manual refetch.
      if (!shouldPollRoom(normalizedRoomId, consultationStatus)) {
        return false;
      }
      if (query.state.status === "error") {
        // Back off rather than hammering a failing endpoint, but keep the poller
        // armed so recovery does not require leaving the screen.
        return getJitteredInterval(30000);
      }
      return getJitteredInterval(7000); // 6-8s dengan jitter
    },
    refetchIntervalInBackground: false,
  });

  return {
    ...query,
    data: query.data?.data,
    meta: query.data?.meta,
  };
}

/**
 * Subscribe to Socket.IO room updates and keep React Query messages synchronized.
 */
export function useRoomRealtimeSync(
  roomId?: string,
  consultationStatus?: string,
) {
  const queryClient = useQueryClient();
  const normalizedRoomId = roomId?.trim() || "";
  const isActive = shouldPollRoom(normalizedRoomId, consultationStatus);

  useEffect(() => {
    if (!isActive || !normalizedRoomId) return;

    let cancelled = false;
    chatSocketClient.joinRoom(normalizedRoomId).catch(() => {
      // Fallback adaptive polling in useRoomMessages continues safely if socket fails.
    });

    const unsubscribe = chatSocketClient.subscribeMessages((payload) => {
      if (cancelled) return;
      if (
        payload &&
        typeof payload === "object" &&
        "roomId" in payload &&
        (payload as { roomId?: unknown }).roomId === normalizedRoomId
      ) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.consultations.roomMessages(normalizedRoomId),
        });
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      void chatSocketClient.leaveRoom(normalizedRoomId);
    };
  }, [isActive, normalizedRoomId, queryClient]);
}

/**
 * Mutation hook to send a consultation message through the Socket.IO gateway.
 */
export function useSendRoomMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roomId,
      dto,
    }: {
      roomId: string;
      dto: {
        content: string;
        contentType?: "TEXT" | "IMAGE" | "DOCUMENT" | "AUDIO";
        senderRole?: "PATIENT" | "PRACTITIONER";
        clientMessageId?: string;
      };
    }) => consultationService.sendMessage(roomId, dto),
    onSuccess: (_data, { roomId }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.roomMessages(roomId.trim()),
      });
    },
  });
}

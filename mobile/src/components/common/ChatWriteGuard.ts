import { useMutation, useQueryClient } from "@tanstack/react-query";
import { consultationService } from "@/api";
import { assertCapabilityLive, getCapability } from "@/config/capabilities";
import { queryKeys } from "@/hooks/useQueryKeys";

export const CHAT_WRITE_UNAVAILABLE_MESSAGE =
  "Pengiriman pesan belum tersedia. Sesi ini dalam mode hanya baca.";

export type ChatWriteInput = {
  content: string;
  contentType?: "TEXT" | "IMAGE" | "DOCUMENT" | "AUDIO";
  senderRole?: "PATIENT" | "PRACTITIONER";
};

export function useChatWriteGuard() {
  const available = getCapability("chatWrite") === "live";

  return {
    available,
    message: CHAT_WRITE_UNAVAILABLE_MESSAGE,
    requireAvailable: () => available,
  };
}

export function useGuardedSendMessage(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: ChatWriteInput) => {
      assertCapabilityLive("chatWrite");

      return consultationService.sendMessage(roomId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.consultations.roomMessages(roomId),
        exact: true,
      });
    },
  });
}

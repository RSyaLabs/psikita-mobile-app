import fs from "fs";
import path from "path";
import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../utils/test-utils";
import { consultationService } from "@/api";
import {
  useChatWriteGuard,
  useGuardedSendMessage,
} from "@/components/common/ChatWriteGuard";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("chat write capability boundary", () => {
  it("keeps demo mode on Expo-supported direct env access", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../../src/config/demoMode.ts"),
      "utf8",
    );

    expect(source).toContain("process.env.EXPO_PUBLIC_DEMO_MODE");
    expect(source).not.toContain("Reflect.get");
    expect(source).not.toMatch(/\benv\s*:/);
  });

  it("exposes chat as unavailable and blocks write attempts", () => {
    const { result } = renderHook(() => useChatWriteGuard(), { wrapper });

    expect(result.current.available).toBe(false);
    expect(result.current.requireAvailable()).toBe(false);
  });

  it("does not optimistically append a message when chatWrite is unavailable", async () => {
    const queryClient = createTestQueryClient();
    const roomMessageKeys = [
      ["room", "room_1", "messages"],
      ["consultations", "room", "room_1", "messages"],
    ];
    const existingMessage = {
      id: "server_1",
      roomId: "room_1",
      senderId: "doctor_1",
      senderRole: "PRACTITIONER" as const,
      content: "Pesan dari server",
      contentType: "TEXT" as const,
      createdAt: "10.00",
    };
    roomMessageKeys.forEach((queryKey) => {
      queryClient.setQueryData(queryKey, [existingMessage]);
    });

    const sendMessage = jest
      .spyOn(consultationService, "sendMessage")
      .mockRejectedValue(new Error("chat service must not be called"));

    const { result } = renderHook(() => useGuardedSendMessage("room_1"), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({
        content: "Pesan yang tidak boleh dibuat lokal",
        senderRole: "PATIENT",
        contentType: "TEXT",
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(sendMessage).not.toHaveBeenCalled();
    roomMessageKeys.forEach((queryKey) => {
      expect(queryClient.getQueryData(queryKey)).toEqual([existingMessage]);
    });

    sendMessage.mockRestore();
  });
});

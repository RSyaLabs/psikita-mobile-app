/**
 * SeraPhany Mobile — Socket.IO Realtime Chat Transport
 *
 * Connects to Core API MessagingGateway (`/messaging` namespace) using the
 * server's dynamic Socket.IO path (`/core/socket.io`) and Bearer JWT auth.
 */

import { io, type Socket } from "socket.io-client";
import { API_BASE_URL, ApiError, getAuthToken } from "@/api/client";
import { requireServerId } from "@/api/response";

interface SocketSendMessageInput {
  roomId: string;
  clientMessageId: string;
  ciphertext: string;
  metadata?: Record<string, unknown>;
}

function resolveMessagingSocketTarget(): { namespaceUrl: string; path: string } {
  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  try {
    const parsed = new URL(normalizedBase);
    const prefix = parsed.pathname.replace(/\/+$/, "");
    return {
      namespaceUrl: `${parsed.origin}/messaging`,
      path: `${prefix}/socket.io`,
    };
  } catch {
    return {
      namespaceUrl: "https://api.staging.seraphany.id/messaging",
      path: "/core/socket.io",
    };
  }
}

function extractWsExceptionMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const msg = (payload as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (Array.isArray(msg) && msg.length > 0 && typeof msg[0] === "string") {
      return msg[0];
    }
  }
  return fallback;
}

class ChatSocketClient {
  private socket: Socket | null = null;
  private activeToken: string | null = null;
  private joinedRooms = new Set<string>();
  private desiredRooms = new Set<string>();
  private messageListeners = new Set<(message: unknown) => void>();

  private async ensureConnected(): Promise<Socket> {
    const token = await getAuthToken();
    if (!token) {
      throw new ApiError("Sesi login diperlukan untuk mengirim pesan.", 401, "UNAUTHORIZED");
    }

    if (this.socket && this.socket.connected && this.activeToken === token) {
      return this.socket;
    }

    if (this.socket && this.activeToken !== token) {
      this.disconnect();
    }

    const { namespaceUrl, path } = resolveMessagingSocketTarget();
    const socket = io(namespaceUrl, {
      path,
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("message_received", (payload: unknown) => {
      this.messageListeners.forEach((listener) => listener(payload));
    });

    socket.on("disconnect", () => {
      this.joinedRooms.clear();
    });

    socket.on("connect", () => {
      this.desiredRooms.forEach((roomId) => {
        if (!this.joinedRooms.has(roomId)) {
          socket.emit("join_room", { roomId }, (ack?: { status?: string }) => {
            if (ack?.status === "JOINED") {
              this.joinedRooms.add(roomId);
            }
          });
        }
      });
    });

    this.socket = socket;
    this.activeToken = token;

    if (socket.connected) {
      return socket;
    }

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(
          new ApiError(
            "Koneksi chat real-time timeout. Periksa jaringan Anda.",
            504,
            "SOCKET_CONNECT_TIMEOUT",
          ),
        );
      }, 10000);

      const onConnect = () => {
        cleanup();
        resolve();
      };

      const onError = (err: Error) => {
        cleanup();
        reject(
          new ApiError(
            err?.message || "Gagal menyambungkan layanan chat real-time.",
            503,
            "SOCKET_CONNECT_ERROR",
          ),
        );
      };

      const cleanup = () => {
        clearTimeout(timer);
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onError);
    });

    return socket;
  }

  async joinRoom(roomId: string): Promise<void> {
    const normalizedRoomId = requireServerId(roomId, "roomId");
    this.desiredRooms.add(normalizedRoomId);
    const socket = await this.ensureConnected();

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        clearTimeout(timer);
        socket.off("exception", onException);
      };
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new ApiError("Gagal bergabung ke ruang konsultasi.", 504, "JOIN_ROOM_TIMEOUT"));
      }, 8000);

      const onException = (errPayload: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(
          new ApiError(
            extractWsExceptionMessage(errPayload, "Akses ruang konsultasi ditolak server."),
            403,
            "JOIN_ROOM_FAILED",
          ),
        );
      };

      socket.once("exception", onException);
      socket.emit("join_room", { roomId: normalizedRoomId }, (ack?: { status?: string; message?: string }) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (ack?.status === "JOINED") {
          this.joinedRooms.add(normalizedRoomId);
          resolve();
          return;
        }
        reject(
          new ApiError(
            ack?.message || "Akses ruang konsultasi ditolak server.",
            403,
            "JOIN_ROOM_FAILED",
          ),
        );
      });
    });
  }

  async leaveRoom(roomId: string): Promise<void> {
    const normalizedRoomId = roomId.trim();
    this.desiredRooms.delete(normalizedRoomId);
    if (!normalizedRoomId || !this.socket?.connected) {
      this.joinedRooms.delete(normalizedRoomId);
      return;
    }

    this.joinedRooms.delete(normalizedRoomId);
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, 1500);
      this.socket?.emit("leave_room", { roomId: normalizedRoomId }, () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  async sendMessage(input: SocketSendMessageInput): Promise<unknown> {
    const normalizedRoomId = requireServerId(input.roomId, "roomId");
    const socket = await this.ensureConnected();

    if (!this.joinedRooms.has(normalizedRoomId)) {
      await this.joinRoom(normalizedRoomId);
    }

    return await new Promise<unknown>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        clearTimeout(timer);
        socket.off("exception", onException);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(
          new ApiError(
            "Pengiriman pesan melebihi batas waktu. Coba kirim ulang.",
            504,
            "SEND_MESSAGE_TIMEOUT",
          ),
        );
      }, 10000);

      const onException = (errPayload: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(
          new ApiError(
            extractWsExceptionMessage(errPayload, "Pesan ditolak oleh server."),
            403,
            "CHAT_SEND_FAILED",
          ),
        );
      };

      socket.once("exception", onException);
      socket.emit(
        "send_message",
        {
          roomId: normalizedRoomId,
          clientMessageId: input.clientMessageId,
          ciphertext: input.ciphertext,
          metadata: input.metadata ?? {},
        },
        (ack: unknown) => {
          if (settled) return;
          settled = true;
          cleanup();
          if (ack && typeof ack === "object" && "id" in ack) {
            resolve(ack);
            return;
          }
          const msg =
            ack && typeof ack === "object" && "message" in ack && typeof (ack as { message?: unknown }).message === "string"
              ? (ack as { message: string }).message
              : "Pesan tidak dikonfirmasi oleh server.";
          reject(new ApiError(msg, 409, "CHAT_SEND_FAILED"));
        },
      );
    });
  }

  subscribeMessages(listener: (message: unknown) => void): () => void {
    this.messageListeners.add(listener);
    return () => {
      this.messageListeners.delete(listener);
    };
  }

  disconnect(): void {
    this.joinedRooms.clear();
    this.desiredRooms.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeToken = null;
  }
}

export const chatSocketClient = new ChatSocketClient();

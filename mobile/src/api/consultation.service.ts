import { z } from "zod";
import { CONSULTATION_STATUSES } from "@/constants/enums";
import { ApiError, apiRequest } from "./client";
import {
  noContentAdapter,
  paginatedAdapter,
  requireServerId,
  withQueryParams,
  zodAdapter,
  type PaginatedResult,
} from "./response";
import {
  ActiveConsultationContext,
  CreateConsultationDto,
  ConsultationResponseDto,
  MessageResponseDto,
  RtcConfigurationResponseDto,
} from "@/types/api";

const consultationParticipantSchema = z.object({
  id: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  role: z.enum(["PATIENT", "PRACTITIONER"]),
  joinedAt: z.string().nullable().optional(),
  leftAt: z.string().nullable().optional(),
});

const consultationSchema = z.object({
  id: z.string().trim().min(1),
  patientId: z.string().trim().min(1),
  practitionerId: z.string().trim().min(1),
  durationMinutes: z.number().int().min(30).max(60),
  status: z.enum(CONSULTATION_STATUSES),
  participants: z.array(consultationParticipantSchema),
  roomId: z.string().trim().min(1).optional(),
  room: z.object({ id: z.string().trim().min(1) }).optional(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  cancelledAt: z.string().nullable().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  billingOrderId: z.string().trim().min(1).optional(),
  fee: z.number().optional(),
  practitionerName: z.string().optional(),
  practitionerTitle: z.string().optional(),
  practitionerSpecialization: z.string().optional(),
  practitionerAvatar: z.string().optional(),
  patientName: z.string().optional(),
  patientAvatar: z.string().optional(),
  icdCode: z.string().optional(),
  note: z.string().optional(),
});

let trustedConsultationContexts = new WeakSet<object>();

function registerActiveConsultationContext(
  context: ActiveConsultationContext,
): void {
  trustedConsultationContexts.add(context);
}

export function clearTrustedConsultationContexts(): void {
  trustedConsultationContexts = new WeakSet<object>();
}

export function isTrustedConsultationContext(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    trustedConsultationContexts.has(value)
  );
}

function mintActiveConsultationContext(
  consultation: z.infer<typeof consultationSchema>,
): ActiveConsultationContext | undefined {
  const roomId = consultation.roomId ?? consultation.room?.id;
  if (!roomId) {
    return undefined;
  }

  const context: ActiveConsultationContext = Object.freeze({
    consultationId: consultation.id,
    roomId,
    patientId: consultation.patientId,
    practitionerId: consultation.practitionerId,
    status: consultation.status,
  });
  registerActiveConsultationContext(context);
  return context;
}

const consultationAdapter =
  (
    expectedConsultationId?: string,
    expectedPractitionerId?: string,
    attachContext = true,
  ) =>
  (value: unknown): ConsultationResponseDto => {
    const consultation = consultationSchema.parse(value);
    if (
      expectedConsultationId !== undefined &&
      consultation.id !== expectedConsultationId.trim()
    ) {
      throw new Error(
        "Consultation response does not belong to the requested consultation",
      );
    }
    if (
      expectedPractitionerId !== undefined &&
      consultation.practitionerId !== expectedPractitionerId.trim()
    ) {
      throw new Error(
        "Consultation response does not belong to the submitted practitioner",
      );
    }

    const result: ConsultationResponseDto = {
      id: consultation.id,
      patientId: consultation.patientId,
      practitionerId: consultation.practitionerId,
      durationMinutes: consultation.durationMinutes,
      status: consultation.status,
      participants: consultation.participants,
      roomId: consultation.roomId ?? consultation.room?.id,
      startedAt: consultation.startedAt ?? undefined,
      finishedAt: consultation.finishedAt ?? undefined,
      cancelledAt: consultation.cancelledAt ?? undefined,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
      fee: consultation.fee,
      practitionerName: consultation.practitionerName,
      practitionerTitle: consultation.practitionerTitle,
      practitionerSpecialization: consultation.practitionerSpecialization,
      practitionerAvatar: consultation.practitionerAvatar,
      patientName: consultation.patientName,
      patientAvatar: consultation.patientAvatar,
      icdCode: consultation.icdCode,
      note: consultation.note,
    };

    // No server payment context is minted from a consultation response. The
    // contract does not document a billingOrderId on the consultation schema,
    // and the private minter is deliberately unreachable from here: a payment
    // context has to come from a documented billing-order response validated
    // against the consultation, which is adaptValidatedBillingOrderContext.

    if (attachContext) {
      const context = mintActiveConsultationContext(consultation);
      if (context) {
        result.activeConsultation = context;
      }
    }
    return result;
  };

const messageSchema = z.object({
  id: z.string().trim().min(1),
  roomId: z.string().trim().min(1),
  senderId: z.string().trim().min(1),
  clientMessageId: z.string().trim().min(1),
  ciphertext: z.string().min(1),
  senderRole: z.enum(["PATIENT", "PRACTITIONER", "SYSTEM"]).optional(),
  contentType: z.enum(["TEXT", "IMAGE", "DOCUMENT", "AUDIO"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  deliveryStatus: z.enum(["PENDING", "DELIVERED", "FAILED"]),
  readStatus: z.enum(["UNREAD", "READ"]),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

function messageAdapter(expectedRoomId: string) {
  return (value: unknown): MessageResponseDto => {
    const message = messageSchema.parse(value);
    if (message.roomId !== expectedRoomId) {
      throw new Error("Message room does not match the requested room");
    }
    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderRole: message.senderRole ?? "UNKNOWN",
      content: message.ciphertext,
      contentType: message.contentType ?? "UNKNOWN",
      createdAt: message.createdAt,
    };
  };
}

const rtcConfigurationSchema = z.object({
  iceServers: z.array(
    z.object({
      urls: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
      username: z.string().optional(),
      credential: z.string().optional(),
    }),
  ),
});

const createConsultationRequestSchema = z.object({
  practitionerId: z.string().trim().min(1),
  matchingRequestId: z.string().trim().min(1).optional(),
  durationMinutes: z.number().int().min(30).max(60).optional(),
});

function parseCreateRequest(dto: CreateConsultationDto) {
  try {
    return createConsultationRequestSchema.parse({
      practitionerId: dto.practitionerId,
      ...(dto.matchingRequestId === undefined
        ? {}
        : { matchingRequestId: dto.matchingRequestId }),
      ...(dto.durationMinutes === undefined
        ? {}
        : { durationMinutes: dto.durationMinutes }),
    });
  } catch {
    throw new ApiError("Invalid consultation request", 400, "INVALID_REQUEST");
  }
}

export const consultationService = {
  /** Create a consultation and accept only a validated server response. */
  async create(dto: CreateConsultationDto): Promise<ConsultationResponseDto> {
    const payload = parseCreateRequest(dto);
    return apiRequest<ConsultationResponseDto>("/consultations", {
      method: "POST",
      body: JSON.stringify(payload),
      adapter: consultationAdapter(undefined, payload.practitionerId),
    });
  },

  async createConsultation(
    dto: CreateConsultationDto,
  ): Promise<ConsultationResponseDto> {
    return this.create(dto);
  },

  /** Finish is confirmed only by the documented no-content success response. */
  async finish(consultationId: string): Promise<void> {
    const normalizedId = requireServerId(consultationId, "consultationId");
    return apiRequest<void>(
      `/consultations/${encodeURIComponent(normalizedId)}/finish`,
      {
        method: "POST",
        adapter: noContentAdapter,
      },
    );
  },

  async getRoomMessages(
    roomId: string,
    params?: {
      page?: number;
      limit?: number;
      before?: string;
      after?: string;
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<MessageResponseDto>> {
    const normalizedRoomId = requireServerId(roomId, "roomId");
    const path = withQueryParams(
      `/rooms/${encodeURIComponent(normalizedRoomId)}/messages`,
      {
        page: params?.page,
        limit: params?.limit,
        before: params?.before,
        after: params?.after,
      },
    );
    return apiRequest<PaginatedResult<MessageResponseDto>>(path, {
      adapter: paginatedAdapter(messageAdapter(normalizedRoomId)),
      signal,
    });
  },

  async getIceServers(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<RtcConfigurationResponseDto> {
    const normalizedRoomId = requireServerId(roomId, "roomId");
    return apiRequest<RtcConfigurationResponseDto>(
      `/rooms/${encodeURIComponent(normalizedRoomId)}/ice-servers`,
      { adapter: zodAdapter(rtcConfigurationSchema), signal },
    );
  },

  async getConsultations(
    _signal?: AbortSignal,
  ): Promise<ConsultationResponseDto[]> {
    // The contract has no collection endpoint for consultations. GET
    // /practitioner/me/consultations was checked against the live staging
    // document and does not exist, so calling one would be inventing a route.
    throw new ApiError(
      "Daftar konsultasi belum tersedia",
      501,
      "CAPABILITY_UNAVAILABLE",
    );
  },

  async getById(
    id: string,
    signal?: AbortSignal,
  ): Promise<ConsultationResponseDto> {
    const normalizedId = requireServerId(id, "consultationId");
    return apiRequest<ConsultationResponseDto>(
      `/consultations/${encodeURIComponent(normalizedId)}`,
      {
        adapter: consultationAdapter(normalizedId),
        signal,
      },
    );
  },

  /**
   * The checked-in contract has no message POST. Keep the method as a typed
   * failing boundary for old callers instead of inventing an endpoint.
   */
  async sendMessage(
    _roomId: string,
    _dto: {
      content: string;
      contentType?: "TEXT" | "IMAGE" | "DOCUMENT" | "AUDIO";
      senderRole?: "PATIENT" | "PRACTITIONER";
    },
  ): Promise<MessageResponseDto> {
    throw new ApiError(
      "Pengiriman pesan belum tersedia",
      501,
      "CHAT_WRITE_UNAVAILABLE",
    );
  },
};

export type { CreateConsultationDto };

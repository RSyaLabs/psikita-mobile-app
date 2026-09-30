import { z } from "zod";
import { apiRequest } from "./client";
import { asRecordOrUndefined, requireServerId } from "./response";
import { isConsultationStatus } from "@/constants/enums";
import {
  ActiveConsultationContext,
  WaitingRoomStatusDto,
  MatchingResponseDto,
} from "@/types/api";

const waitingRoomSchema = z.object({
  matchingRequestId: z.string().trim().min(1),
  status: z.string().trim().min(1),
  queuePosition: z.number().int().nonnegative(),
  estimatedWaitMinutes: z.number().finite().nonnegative(),
  assignedDoctor: z
    .object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      title: z.string().trim().min(1),
      rating: z.number(),
      avatar: z.string().optional(),
    })
    .optional(),
});

const waitingRoomAdapter = (value: unknown): WaitingRoomStatusDto => {
  const room = waitingRoomSchema.parse(value);
  return {
    matchingRequestId: room.matchingRequestId,
    status: room.status,
    position: room.queuePosition,
    estimatedWaitSeconds: Math.round(room.estimatedWaitMinutes * 60),
    assignedDoctor: room.assignedDoctor,
  };
};

const nullableReferenceSchema = z.union([
  z.string(),
  z.record(z.string(), z.unknown()),
  z.null(),
]);

const matchingResponseSchema = z.object({
  id: z.string().trim().min(1),
  patientId: z.string().trim().min(1),
  triageId: z.string().trim().min(1),
  requiredLevel: z.enum(["level_1", "level_2", "level_3", "level_4"]),
  status: z.record(z.string(), z.unknown()),
  candidatePractitionerIds: z.array(z.string().trim().min(1)),
  assignedPractitionerId: nullableReferenceSchema,
  deadlineAt: nullableReferenceSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  consultationId: z.string().trim().min(1).optional(),
  roomId: z.string().trim().min(1).optional(),
  practitionerId: z.string().trim().min(1).optional(),
  consultation: z.record(z.string(), z.unknown()).optional(),
});

let trustedMatchingConsultationContexts = new WeakSet<object>();


function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStatus(
  value: unknown,
): ActiveConsultationContext["status"] | undefined {
  if (isConsultationStatus(value)) {
    return value;
  }

  const record = asRecordOrUndefined(value);
  const nested = record?.value;
  return isConsultationStatus(nested) ? nested : undefined;
}

function registerActiveConsultationContext(
  context: ActiveConsultationContext,
): void {
  trustedMatchingConsultationContexts.add(context);
}

export function clearTrustedMatchingConsultationContexts(): void {
  trustedMatchingConsultationContexts = new WeakSet<object>();
}

export function isTrustedMatchingConsultationContext(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    trustedMatchingConsultationContexts.has(value)
  );
}

function mintMatchingClaimResponseContext(
  matching: z.infer<typeof matchingResponseSchema>,
  expectedMatchingRequestId: string,
): ActiveConsultationContext | undefined {
  if (matching.id !== expectedMatchingRequestId.trim()) {
    throw new Error(
      "Matching response does not belong to the requested matching request",
    );
  }

  const nested = asRecordOrUndefined(matching.consultation);
  if (!nested) {
    return undefined;
  }

  const consultationId =
    asNonEmptyString(nested.consultationId) ?? asNonEmptyString(nested.id);
  const declaredConsultationId = asNonEmptyString(matching.consultationId);
  if (
    declaredConsultationId &&
    consultationId &&
    declaredConsultationId !== consultationId
  ) {
    throw new Error(
      "Matching response contains conflicting consultation identifiers",
    );
  }

  const nestedDeclaredId = asNonEmptyString(nested.consultationId);
  const nestedRecordId = asNonEmptyString(nested.id);
  if (
    nestedDeclaredId &&
    nestedRecordId &&
    nestedDeclaredId !== nestedRecordId
  ) {
    throw new Error(
      "Matching response contains conflicting consultation identifiers",
    );
  }

  const responsePatientId = asNonEmptyString(matching.patientId);
  const consultationPatientId = asNonEmptyString(nested.patientId);
  if (responsePatientId && consultationPatientId !== responsePatientId) {
    return undefined;
  }

  const assignedRecord = asRecordOrUndefined(matching.assignedPractitionerId);
  const responsePractitionerId =
    asNonEmptyString(matching.practitionerId) ??
    asNonEmptyString(matching.assignedPractitionerId) ??
    asNonEmptyString(assignedRecord?.id);
  const consultationPractitionerId = asNonEmptyString(nested.practitionerId);
  if (
    responsePractitionerId &&
    (!consultationPractitionerId ||
      consultationPractitionerId !== responsePractitionerId)
  ) {
    return undefined;
  }

  const room = asRecordOrUndefined(nested.room);
  const roomId = asNonEmptyString(nested.roomId) ?? asNonEmptyString(room?.id);
  const status = asStatus(nested.status);
  if (
    !consultationId ||
    !roomId ||
    !consultationPatientId ||
    !consultationPractitionerId ||
    !status
  ) {
    return undefined;
  }

  const context: ActiveConsultationContext = Object.freeze({
    consultationId,
    roomId,
    patientId: consultationPatientId,
    practitionerId: consultationPractitionerId,
    status,
  });
  registerActiveConsultationContext(context);
  return context;
}

const matchingResponseAdapter =
  (expectedMatchingRequestId: string) =>
  (value: unknown): MatchingResponseDto => {
    const matching = matchingResponseSchema.parse(value);
    const context = mintMatchingClaimResponseContext(
      matching,
      expectedMatchingRequestId,
    );
    const assignedId =
      typeof matching.assignedPractitionerId === "string"
        ? matching.assignedPractitionerId
        : matching.assignedPractitionerId &&
            typeof matching.assignedPractitionerId.id === "string"
          ? matching.assignedPractitionerId.id
          : undefined;
    const deadline =
      typeof matching.deadlineAt === "string"
        ? matching.deadlineAt
        : matching.deadlineAt &&
            typeof matching.deadlineAt.timestamp === "string"
          ? matching.deadlineAt.timestamp
          : matching.deadlineAt === null
            ? null
            : undefined;

    const result: MatchingResponseDto = {
      id: matching.id,
      patientId: matching.patientId,
      practitionerId: assignedId,
      status: matching.status,
      createdAt: matching.createdAt,
      triageId: matching.triageId,
      requiredLevel: matching.requiredLevel,
      candidatePractitionerIds: matching.candidatePractitionerIds,
      assignedPractitionerId:
        assignedId ??
        (matching.assignedPractitionerId === null ? null : undefined),
      deadlineAt: deadline,
      updatedAt: matching.updatedAt,
    };

    if (context) {
      result.activeConsultation = context;
    }
    return result;
  };

export const matchingService = {
  async getMyWaitingRoomStatus(
    signal?: AbortSignal,
  ): Promise<WaitingRoomStatusDto> {
    return apiRequest<WaitingRoomStatusDto>(
      "/matching-requests/waiting-room/me",
      {
        adapter: waitingRoomAdapter,
        signal,
      },
    );
  },

  /** Claim the exact matching request returned by the server/queue. */
  async claimMatchingRequest(
    matchingRequestId: string,
  ): Promise<MatchingResponseDto> {
    const normalizedId = requireServerId(
      matchingRequestId,
      "matchingRequestId",
    );
    return apiRequest<MatchingResponseDto>(
      `/matching-requests/${encodeURIComponent(normalizedId)}/claim`,
      {
        method: "POST",
        adapter: matchingResponseAdapter(normalizedId),
      },
    );
  },
};

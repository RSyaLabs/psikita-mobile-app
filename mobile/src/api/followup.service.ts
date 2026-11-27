import { apiRequest } from "./client";
import { isRecord, withQueryParams } from "./response";

export interface FollowUpSlotDto {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface FollowUpDto {
  id: string;
  consultationId: string;
  patientId: string;
  practitionerId: string;
  practitionerName?: string;
  reason: string;
  recommendedIntervalDays: number;
  scheduledDate?: string;
  status: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

export const followUpService = {
  getMyFollowUps: async (signal?: AbortSignal): Promise<FollowUpDto[]> => {
    const response = await apiRequest<unknown>("/follow-ups/me", { signal, adapter: (v) => v });
    const rawList = Array.isArray(response)
      ? response
      : isRecord(response) && Array.isArray((response as any).data)
        ? (response as any).data
        : [];
    return rawList.filter(isRecord).map((item: Record<string, unknown>) => {
      const rawStatus = String(item.status ?? "PENDING").toUpperCase();
      const status: FollowUpDto["status"] =
        rawStatus === "BOOKED" || rawStatus === "CONFIRMED" || rawStatus === "SCHEDULED"
          ? "SCHEDULED"
          : rawStatus === "COMPLETED" || rawStatus === "FINISHED"
            ? "COMPLETED"
            : rawStatus === "CANCELLED" || rawStatus === "EXPIRED" || rawStatus === "REVOKED"
              ? "CANCELLED"
              : "PENDING";
      return {
        id: String(item.id ?? ""),
        consultationId: String(item.originConsultationId ?? item.consultationId ?? ""),
        patientId: String(item.patientId ?? ""),
        practitionerId: String(item.practitionerId ?? ""),
        practitionerName:
          typeof item.practitionerName === "string" ? item.practitionerName : undefined,
        reason:
          typeof item.reason === "string" && item.reason
            ? item.reason
            : "Sesi Tindak Lanjut Klinis",
        recommendedIntervalDays:
          typeof item.recommendedIntervalDays === "number" ? item.recommendedIntervalDays : 7,
        scheduledDate:
          typeof item.scheduledDate === "string"
            ? item.scheduledDate
            : typeof item.scheduledAt === "string"
              ? item.scheduledAt
              : undefined,
        status,
        notes: typeof item.notes === "string" ? item.notes : undefined,
        createdAt: String(item.createdAt ?? item.validFrom ?? ""),
      };
    });
  },

  getFollowUpSlots: async (
    followUpId: string,
    date?: string,
    signal?: AbortSignal,
  ): Promise<FollowUpSlotDto[]> => {
    const searchDate = date || new Date().toISOString().slice(0, 10);
    const path = withQueryParams(`/follow-ups/${followUpId}/slots`, { date: searchDate });
    const response = await apiRequest<unknown>(path, { signal, adapter: (v) => v });
    if (Array.isArray(response)) {
      return response as FollowUpSlotDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as FollowUpSlotDto[];
    }
    return [];
  },

  bookFollowUpSlot: async (
    followUpId: string,
    slotStartOrId: string,
  ): Promise<{ success: boolean }> => {
    const slotStart = slotStartOrId.includes("T")
      ? slotStartOrId
      : new Date().toISOString();
    return apiRequest<{ success: boolean }>(`/follow-ups/${followUpId}/book`, {
      method: "POST",
      headers: {
        "Idempotency-Key": `book-${followUpId}-${Date.now()}`,
      },
      body: JSON.stringify({ slotStart }),
      adapter: (v) => (isRecord(v) ? (v as any) : { success: true }),
    });
  },
};

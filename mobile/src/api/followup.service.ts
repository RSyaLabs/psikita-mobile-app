import { apiRequest } from "./client";
import { isRecord } from "./response";

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
    const response = await apiRequest<unknown>("/follow-ups/me", { signal });
    if (Array.isArray(response)) {
      return response as FollowUpDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as FollowUpDto[];
    }
    return [];
  },

  getFollowUpSlots: async (followUpId: string, signal?: AbortSignal): Promise<FollowUpSlotDto[]> => {
    const response = await apiRequest<unknown>(`/follow-ups/${followUpId}/slots`, { signal });
    if (Array.isArray(response)) {
      return response as FollowUpSlotDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as FollowUpSlotDto[];
    }
    return [];
  },

  bookFollowUpSlot: async (followUpId: string, slotId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/follow-ups/${followUpId}/book`, {
      method: "POST",
      body: JSON.stringify({ slotId }),
    });
  },
};

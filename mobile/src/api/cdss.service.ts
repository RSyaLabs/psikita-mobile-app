import { apiRequest } from "./client";
import { isRecord } from "./response";

export interface CdssAlertDto {
  id: string;
  patientId: string;
  ruleId: string;
  ruleTitle?: string;
  severity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  category?: string;
  message: string;
  recommendations: string[];
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
}

export interface CdssEvaluatePayload {
  patientId: string;
  consultationId?: string;
  observedSymptoms?: string[];
  gadScore?: number;
  phqScore?: number;
}

export interface CdssInsightDto {
  evaluatedSeverity: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  suggestedDiagnoses: Array<{
    code: string;
    description: string;
    confidenceScore: number;
  }>;
  alerts: CdssAlertDto[];
  cautionNotes: string[];
}

export const cdssService = {
  getAlerts: async (signal?: AbortSignal): Promise<CdssAlertDto[]> => {
    const response = await apiRequest<unknown>("/cdss/alerts", { signal });
    if (Array.isArray(response)) {
      return response as CdssAlertDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as CdssAlertDto[];
    }
    return [];
  },

  getPatientAlerts: async (patientId: string, signal?: AbortSignal): Promise<CdssAlertDto[]> => {
    const response = await apiRequest<unknown>(`/cdss/patients/${patientId}/alerts`, { signal });
    if (Array.isArray(response)) {
      return response as CdssAlertDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as CdssAlertDto[];
    }
    return [];
  },

  evaluatePatientContext: async (payload: CdssEvaluatePayload): Promise<CdssInsightDto> => {
    return apiRequest<CdssInsightDto>("/cdss/evaluate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  acknowledgeAlert: async (alertId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/cdss/alerts/${alertId}/acknowledge`, {
      method: "POST",
    });
  },

  resolveAlert: async (alertId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/cdss/alerts/${alertId}/resolve`, {
      method: "POST",
    });
  },
};

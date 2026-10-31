import { apiRequest } from "./client";

export interface CarePlanIntervention {
  title: string;
  description: string;
  frequency?: string;
}

export interface CarePlanDto {
  id?: string;
  consultationId: string;
  patientId?: string;
  practitionerId?: string;
  diagnosisSummary?: string;
  goals: string[];
  interventions: CarePlanIntervention[];
  notes?: string;
  targetReviewDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCarePlanPayload {
  goals: string[];
  interventions: CarePlanIntervention[];
  diagnosisSummary?: string;
  notes?: string;
  targetReviewDate?: string;
}

export const carePlanService = {
  getCarePlanByConsultation: async (
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<CarePlanDto | null> => {
    try {
      return await apiRequest<CarePlanDto>(
        `/consultation/${consultationId}/care-plan`,
        { signal },
      );
    } catch {
      return null;
    }
  },

  createCarePlan: async (
    consultationId: string,
    payload: CreateCarePlanPayload,
  ): Promise<CarePlanDto> => {
    return apiRequest<CarePlanDto>(`/consultation/${consultationId}/care-plan`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

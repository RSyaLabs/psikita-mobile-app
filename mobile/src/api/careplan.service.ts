import { apiRequest } from "./client";
import { isRecord } from "./response";

interface CarePlanIntervention {
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

function adaptCarePlanResponse(consultationId: string) {
  return (raw: unknown): CarePlanDto => {
    const rec = isRecord(raw) ? raw : {};
    const rawGoals = Array.isArray(rec.goals) ? rec.goals : [];
    const goals: string[] = rawGoals
      .map((g) => {
        if (typeof g === "string") return g;
        if (isRecord(g) && typeof g.description === "string") return g.description;
        return "";
      })
      .filter(Boolean);

    const interventions: CarePlanIntervention[] = Array.isArray(rec.interventions)
      ? (rec.interventions as CarePlanIntervention[])
      : [
          ...(Array.isArray(rec.exercises)
            ? rec.exercises
                .filter(isRecord)
                .map((ex) => ({
                  title: String(ex.name || "Latihan"),
                  description: String(ex.instructions || ""),
                }))
            : []),
          ...(Array.isArray(rec.homework)
            ? rec.homework
                .filter(isRecord)
                .map((hw, idx) => ({
                  title: `Tugas ${idx + 1}`,
                  description: String(hw.description || ""),
                }))
            : []),
        ];

    return {
      id: typeof rec.id === "string" ? rec.id : undefined,
      consultationId:
        typeof rec.consultationId === "string" ? rec.consultationId : consultationId,
      patientId: typeof rec.patientId === "string" ? rec.patientId : undefined,
      practitionerId:
        typeof rec.practitionerId === "string" ? rec.practitionerId : undefined,
      diagnosisSummary:
        typeof rec.diagnosisSummary === "string" ? rec.diagnosisSummary : undefined,
      goals,
      interventions,
      notes: typeof rec.notes === "string" ? rec.notes : undefined,
      targetReviewDate:
        typeof rec.targetReviewDate === "string" ? rec.targetReviewDate : undefined,
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : undefined,
      updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : undefined,
    };
  };
}

export const carePlanService = {
  getCarePlanByConsultation: async (
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<CarePlanDto | null> => {
    try {
      return await apiRequest<CarePlanDto>(
        `/consultation/${consultationId}/care-plan`,
        { signal, adapter: adaptCarePlanResponse(consultationId) },
      );
    } catch {
      return null;
    }
  },

  createCarePlan: async (
    consultationId: string,
    payload: CreateCarePlanPayload,
  ): Promise<CarePlanDto> => {
    const dueDate =
      payload.targetReviewDate || new Date(Date.now() + 30 * 86400000).toISOString();
    const apiBody = {
      homework: payload.interventions.map((item) => ({
        description: `${item.title}${item.description ? ` (${item.description})` : ""}`,
      })),
      exercises: payload.interventions.map((item) => ({
        name: item.title,
        instructions: item.description || item.frequency || "Lakukan sesuai arahan praktisi.",
      })),
      goals: (payload.goals.length > 0 ? payload.goals : ["Pemantauan progres pasien"]).map(
        (desc) => ({
          description: desc,
          dueDate,
        }),
      ),
    };

    return apiRequest<CarePlanDto>(`/consultation/${consultationId}/care-plan`, {
      method: "POST",
      body: JSON.stringify(apiBody),
      adapter: adaptCarePlanResponse(consultationId),
    });
  },
};

import { z } from "zod";
import { apiRequest } from "./client";
import { requireServerId, zodAdapter } from "./response";

const evidenceSchema = z.object({
  id: z.string().min(1),
  typeCode: z.string().min(1),
  typeVersion: z.number().int().positive(),
  completedAt: z.string().nullable(),
  totalScore: z.number().finite().nullable(),
  dimensionScores: z.record(z.string(), z.number().finite()),
  severity: z.record(z.string(), z.string()),
  hasRedFlags: z.boolean(),
});

export type ClinicalAssessmentEvidenceDto = z.infer<typeof evidenceSchema>;

export const clinicalAssessmentEvidenceService = {
  byConsultation: (consultationId: string, signal?: AbortSignal) =>
    apiRequest<ClinicalAssessmentEvidenceDto[]>(
      `/consultations/${encodeURIComponent(requireServerId(consultationId, "consultationId"))}/patient-assessments`,
      { signal, adapter: zodAdapter(z.array(evidenceSchema)) },
    ),
};

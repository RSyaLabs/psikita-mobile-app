import { z } from "zod";
import { apiRequest } from "./client";
import { requireServerId, zodAdapter } from "./response";

const assignmentSchema = z.object({
  id: z.string().min(1),
  consultationId: z.string().min(1),
  typeCode: z.string().min(1),
  typeVersion: z.number().int().positive(),
  status: z.enum(["ASSIGNED", "COMPLETED", "CANCELLED", "DECLINED"]),
  engineVersion: z.number().int().positive().nullable(),
  totalScore: z.number().finite().nullable(),
  dimensionScores: z.record(z.string(), z.number().finite()).nullable(),
  severity: z.record(z.string(), z.string()).nullable(),
  hasRedFlags: z.boolean().nullable(),
  redFlagItems: z.array(z.string()).nullable(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
});

export type ConsultationAssessmentDto = z.infer<typeof assignmentSchema>;
export type AssessmentPreference = "stress" | "anxiety" | "depression";

function base(consultationId: string): string {
  return `/consultations/${encodeURIComponent(requireServerId(consultationId, "consultationId"))}/assessments`;
}

export const consultationAssessmentService = {
  list: (consultationId: string, signal?: AbortSignal) =>
    apiRequest<ConsultationAssessmentDto[]>(base(consultationId), {
      signal,
      adapter: zodAdapter(z.array(assignmentSchema)),
    }),
  get: (consultationId: string, assessmentId: string, signal?: AbortSignal) =>
    apiRequest<ConsultationAssessmentDto>(
      `${base(consultationId)}/${encodeURIComponent(requireServerId(assessmentId, "assessmentId"))}`,
      { signal, adapter: zodAdapter(assignmentSchema) },
    ),
  cancel: (consultationId: string, assessmentId: string, reason: string) =>
    apiRequest<ConsultationAssessmentDto>(
      `${base(consultationId)}/${encodeURIComponent(requireServerId(assessmentId, "assessmentId"))}/cancel`,
      { method: "POST", body: JSON.stringify({ reason }), adapter: zodAdapter(assignmentSchema) },
    ),
  decline: (consultationId: string, assessmentId: string, reason: string) =>
    apiRequest<ConsultationAssessmentDto>(
      `${base(consultationId)}/${encodeURIComponent(requireServerId(assessmentId, "assessmentId"))}/decline`,
      { method: "POST", body: JSON.stringify({ reason }), adapter: zodAdapter(assignmentSchema) },
    ),
  assign: (consultationId: string, input: { typeCode: string; version: number }) =>
    apiRequest<ConsultationAssessmentDto>(base(consultationId), {
      method: "POST",
      body: JSON.stringify(input),
      adapter: zodAdapter(assignmentSchema),
    }),
  answer: (consultationId: string, assessmentId: string, answers: Record<string, number>) =>
    apiRequest<ConsultationAssessmentDto>(
      `${base(consultationId)}/${encodeURIComponent(requireServerId(assessmentId, "assessmentId"))}/answers`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
        adapter: zodAdapter(assignmentSchema),
      },
    ),
};

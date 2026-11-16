import { z } from "zod";
import { apiRequest } from "./client";
import { requireServerId, zodAdapter } from "./response";

const resultSchema = z.object({
  typeCode: z.string(),
  typeVersion: z.number().int().positive(),
  engineVersion: z.number().int().positive(),
  totalScore: z.number().finite().nullable(),
  dimensionScores: z.record(z.string(), z.number()),
  severity: z.record(z.string(), z.string()),
  hasRedFlags: z.boolean(),
  redFlagItems: z.array(z.string()),
  normalizedAnswers: z.record(z.string(), z.number()),
});
const assessmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  typeCode: z.string().min(1),
  typeVersion: z.number().int().positive(),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]),
  result: resultSchema.nullable(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});
export type PatientAssessmentDto = z.infer<typeof assessmentSchema>;
const base = "/patient/me/assessments";
const path = (id: string) => `${base}/${encodeURIComponent(requireServerId(id, "assessmentId"))}`;

export const patientAssessmentService = {
  list: (signal?: AbortSignal) =>
    apiRequest<PatientAssessmentDto[]>(base, { signal, adapter: zodAdapter(z.array(assessmentSchema)) }),
  get: (id: string, signal?: AbortSignal) =>
    apiRequest<PatientAssessmentDto>(path(id), { signal, adapter: zodAdapter(assessmentSchema) }),
  start: (typeCode: string, version: number) =>
    apiRequest<PatientAssessmentDto>(base, {
      method: "POST", body: JSON.stringify({ typeCode, version }), adapter: zodAdapter(assessmentSchema),
    }),
  submit: (id: string, answers: Record<string, number>) =>
    apiRequest<PatientAssessmentDto>(`${path(id)}/answers`, {
      method: "POST", body: JSON.stringify({ answers }), adapter: zodAdapter(assessmentSchema),
    }),
  cancel: (id: string) =>
    apiRequest<{ status: "CANCELLED" }>(`${path(id)}/cancel`, {
      method: "POST", adapter: zodAdapter(z.object({ status: z.literal("CANCELLED") })),
    }),
};

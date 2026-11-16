import { z } from "zod";
import { apiRequest } from "./client";
import { requireServerId, zodAdapter } from "./response";

const diagnosisSchema = z.object({
  id: z.string().min(1),
  consultationId: z.string().min(1),
  code: z.string().nullable().optional(),
  system: z.enum(["ICD10", "DSM5", "MANUAL"]),
  label: z.string().min(1),
  isManual: z.boolean(),
  clinicalNotes: z.string().nullable().optional(),
  needsPrescription: z.boolean(),
  needsReferral: z.boolean(),
  referralPriority: z.boolean(),
  createdBy: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});
export type ClinicalDiagnosisDto = z.infer<typeof diagnosisSchema>;

const diagnosisInputSchema = z.object({
  code: z.string().min(1),
  system: z.literal("ICD10"),
  label: z.string().min(1),
  isManual: z.literal(false),
  needsPrescription: z.boolean(),
  needsReferral: z.boolean(),
  referralPriority: z.boolean(),
});
export type ClinicalDiagnosisInput = z.infer<typeof diagnosisInputSchema>;

const submitResultInputSchema = z.object({
  patientFacingAdvice: z.string().trim().min(5),
  followUp: z.object({
    required: z.boolean(),
    windowDays: z.number().int().min(1).max(60).optional(),
    durationMinutes: z.union([z.literal(30), z.literal(60)]).optional(),
    reason: z.string().trim().min(10).optional(),
  }),
}).superRefine((input, ctx) => {
  if (input.followUp.required) {
    if (!input.followUp.windowDays || !input.followUp.durationMinutes) {
      ctx.addIssue({ code: "custom", message: "Follow-up window and duration are required", path: ["followUp"] });
    }
  } else if (!input.followUp.reason) {
    // This also satisfies the stricter high-risk no-follow-up rationale gate.
    ctx.addIssue({ code: "custom", message: "No-follow-up decision requires a reason", path: ["followUp", "reason"] });
  }
});
export type ClinicalResultInput = z.infer<typeof submitResultInputSchema>;

const resultResponseSchema = z.object({
  id: z.string().min(1),
  status: z.literal("FINISHED"),
  resultStatus: z.literal("RESULT_SUBMITTED"),
  patientFacingAdvice: z.string().min(5),
});
export type ClinicalResultResponse = z.infer<typeof resultResponseSchema>;

const resource = (consultationId: string) =>
  `/consultations/${encodeURIComponent(requireServerId(consultationId, "consultationId"))}`;

export const clinicalResultService = {
  async getDiagnosis(consultationId: string, signal?: AbortSignal): Promise<ClinicalDiagnosisDto | null> {
    try {
      const id = requireServerId(consultationId, "consultationId");
      return await apiRequest<ClinicalDiagnosisDto>(`${resource(id)}/diagnosis`, {
        signal,
        adapter: (value) => {
          const data = diagnosisSchema.parse(value);
          if (data.consultationId !== id) throw new Error("Incorrect diagnosis consultation");
          return data;
        },
      });
    } catch (error) {
      if (error && typeof error === "object" && "statusCode" in error && error.statusCode === 404) return null;
      throw error;
    }
  },

  async saveDiagnosis(consultationId: string, input: ClinicalDiagnosisInput, update: boolean): Promise<ClinicalDiagnosisDto> {
    const id = requireServerId(consultationId, "consultationId");
    const payload = diagnosisInputSchema.parse(input);
    return apiRequest<ClinicalDiagnosisDto>(`${resource(id)}/diagnosis`, {
      method: update ? "PUT" : "POST",
      body: JSON.stringify(payload),
      adapter: (value) => {
        const record = diagnosisSchema.parse(value);
        if (record.consultationId !== id) throw new Error("Incorrect diagnosis consultation");
        return record;
      },
    });
  },

  async submitResult(consultationId: string, input: ClinicalResultInput): Promise<ClinicalResultResponse> {
    const id = requireServerId(consultationId, "consultationId");
    const payload = submitResultInputSchema.parse(input);
    return apiRequest<ClinicalResultResponse>(`${resource(id)}/result/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
      adapter: (value) => {
        const response = resultResponseSchema.parse(value);
        if (response.id !== id) throw new Error("Incorrect result consultation");
        return response;
      },
    });
  },
};

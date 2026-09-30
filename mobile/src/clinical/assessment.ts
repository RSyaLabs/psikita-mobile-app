import { z } from "zod";

export const ASSESSMENT_UNAVAILABLE_MESSAGE =
  "Asesmen tidak tersedia. Hasil hanya dapat ditampilkan setelah server mengonfirmasi data assessment.";

export const assessmentResultSchema = z.object({
  id: z.string().trim().min(1),
  patientId: z.string().trim().min(1),
  assessedBy: z.string().trim().min(1),
  assessmentType: z.enum(["SELF_ASSESSMENT", "PRACTITIONER_ASSESSMENT"]),
  score: z.number().finite(),
  hasRedFlags: z.boolean(),
  level: z.enum(["GREEN", "YELLOW", "RED"]),
  disposition: z.enum(["PENDING", "COUNSELING", "CRISIS", "COMPLETED"]),
  answers: z.record(z.string(), z.unknown()),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type ValidatedAssessmentResult = z.infer<typeof assessmentResultSchema>;

export function validateAssessmentResult(
  value: unknown,
): ValidatedAssessmentResult {
  return assessmentResultSchema.parse(value);
}

export function isAssessmentResult(
  value: unknown,
): value is ValidatedAssessmentResult {
  return assessmentResultSchema.safeParse(value).success;
}

import { z } from "zod";
import { apiRequest } from "./client";
import { zodAdapter, withQueryParams } from "./response";

/** Psychometrics owns instrument definitions; callers select a context. */
export type PsychometricContext = "TRIAGE" | "CONSULTATION";

const optionSchema = z.object({
  value: z.number().finite(),
  label: z.string().trim().min(1),
});
const instrumentSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  version: z.number().int().positive(),
  description: z.string().optional(),
  contexts: z.array(z.enum(["TRIAGE", "CONSULTATION"])),
  supportedDimensions: z.array(z.enum(["stress", "anxiety", "depression"])),
});
const questionSchema = z.object({
  code: z.string().trim().min(1),
  order: z.number().int(),
  text: z.string().trim().min(1),
  dimension: z.enum(["STRESS", "ANXIETY", "DEPRESSION"]).optional(),
});
const formSchema = z.object({
  typeCode: z.string().trim().min(1),
  version: z.number().int().positive(),
  name: z.string().trim().min(1),
  description: z.string().optional(),
  responseOptions: z.array(optionSchema).min(1),
  questions: z.array(questionSchema).min(1),
}).superRefine((form, ctx) => {
  const questionCodes = new Set(form.questions.map((question) => question.code));
  const optionValues = new Set(form.responseOptions.map((option) => option.value));
  if (questionCodes.size !== form.questions.length || optionValues.size !== form.responseOptions.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate questionnaire code or option" });
  }
});
const scoreSchema = z.object({
  typeCode: z.string().trim().min(1),
  typeVersion: z.number().int().positive(),
  engineVersion: z.number().int().positive(),
  totalScore: z.number().finite().nullable().optional(),
  dimensionScores: z.record(z.string(), z.unknown()),
  severity: z.object({
    code: z.string().optional(),
    label: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  hasRedFlags: z.boolean(),
  redFlagItems: z.array(z.string()),
  normalizedAnswers: z.record(z.string(), z.number()),
});

export type PsychometricInstrumentDto = z.infer<typeof instrumentSchema>;
export type PsychometricQuestionDto = z.infer<typeof questionSchema>;
export type PsychometricFormDto = z.infer<typeof formSchema>;
export type ScoreResultResponseDto = z.infer<typeof scoreSchema>;
export interface ScoreAnswersRequestDto {
  answers: Record<string, number>;
  version?: number;
}

export const psychometricsService = {
  /** Returns active instruments allowed for the requested clinical context. */
  getInstruments: (
    context: PsychometricContext,
    signal?: AbortSignal,
  ): Promise<PsychometricInstrumentDto[]> =>
    apiRequest<PsychometricInstrumentDto[]>(
      withQueryParams("/psychometrics/types", { context }),
      { adapter: zodAdapter(z.array(instrumentSchema)), signal },
    ),

  getInstrumentForm: (
    code: string,
    version?: number,
    signal?: AbortSignal,
  ): Promise<PsychometricFormDto> => {
    const path = withQueryParams(
      `/psychometrics/types/${encodeURIComponent(code)}/form`,
      { version },
    );
    return apiRequest<PsychometricFormDto>(path, {
      signal,
      adapter: (value) => {
        const form = formSchema.parse(value);
        if (form.typeCode !== code || (version !== undefined && form.version !== version)) {
          throw new Error("Unexpected instrument or version");
        }
        return form;
      },
    });
  },

  /** Management-only diagnostic scoring. Not a patient assessment submission. */
  dryRunScore: (
    code: string,
    dto: ScoreAnswersRequestDto,
    signal?: AbortSignal,
  ): Promise<ScoreResultResponseDto> =>
    apiRequest<ScoreResultResponseDto>(
      `/psychometrics/score/dry-run/${encodeURIComponent(code)}`,
      {
        method: "POST",
        body: JSON.stringify(dto),
        adapter: zodAdapter(scoreSchema),
        signal,
      },
    ),
};

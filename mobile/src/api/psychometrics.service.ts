import { apiRequest } from "./client";
import { isRecord } from "./response";

export interface PsychometricQuestionDto {
  id: string;
  questionText: string;
  orderIndex: number;
  options: Array<{
    value: number;
    label: string;
  }>;
}

export interface PsychometricInstrumentDto {
  code: string;
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  totalQuestions: number;
}

export interface PsychometricFormDto extends PsychometricInstrumentDto {
  questions: PsychometricQuestionDto[];
}

export interface ScoreAnswersRequestDto {
  answers: Record<string, number>;
  version?: number;
}

export interface ScoreResultResponseDto {
  typeCode: string;
  typeVersion: number;
  engineVersion: number;
  totalScore?: number | null;
  dimensionScores?: Record<string, unknown>;
  severity?: {
    code?: string;
    label?: string;
    description?: string;
  };
  hasRedFlags: boolean;
  redFlagItems: string[];
  normalizedAnswers: Record<string, number>;
}

const INSTRUMENT_COUNTS: Record<string, { questions: number; minutes: number }> = {
  DASS21: { questions: 21, minutes: 5 },
  "DASS-21": { questions: 21, minutes: 5 },
  PHQ9: { questions: 9, minutes: 3 },
  "PHQ-9": { questions: 9, minutes: 3 },
  GAD7: { questions: 7, minutes: 2 },
  "GAD-7": { questions: 7, minutes: 2 },
};

function normalizeInstrument(raw: Record<string, unknown>): PsychometricInstrumentDto {
  const code = String(raw.code ?? "");
  const defaults = INSTRUMENT_COUNTS[code.toUpperCase()];
  const totalQuestions =
    typeof raw.totalQuestions === "number" && raw.totalQuestions > 0
      ? raw.totalQuestions
      : defaults?.questions ?? 10;
  const estimatedMinutes =
    typeof raw.estimatedMinutes === "number" && raw.estimatedMinutes > 0
      ? raw.estimatedMinutes
      : defaults?.minutes ?? Math.max(2, Math.ceil(totalQuestions / 4));
  const dims = Array.isArray(raw.supportedDimensions)
    ? raw.supportedDimensions.map((d) => String(d)).join(", ")
    : "";

  return {
    code,
    title: String(raw.title || raw.name || code),
    description: String(raw.description || ""),
    category: String(raw.category || dims || "Skrining Klinis"),
    totalQuestions,
    estimatedMinutes,
  };
}

export const psychometricsService = {
  getInstruments: async (signal?: AbortSignal): Promise<PsychometricInstrumentDto[]> => {
    const response = await apiRequest<unknown>("/psychometrics/types", {
      signal,
      adapter: (v) => v,
    });
    const list = Array.isArray(response)
      ? response
      : isRecord(response) && Array.isArray((response as any).data)
        ? ((response as any).data as unknown[])
        : [];
    return list.filter(isRecord).map(normalizeInstrument);
  },

  getInstrumentForm: async (code: string, signal?: AbortSignal): Promise<PsychometricFormDto> => {
    return apiRequest<PsychometricFormDto>(`/psychometrics/types/${code}/form`, {
      signal,
      adapter: (v) => v as PsychometricFormDto,
    });
  },

  dryRunScore: async (
    code: string,
    dto: ScoreAnswersRequestDto,
    signal?: AbortSignal,
  ): Promise<ScoreResultResponseDto> => {
    return apiRequest<ScoreResultResponseDto>(
      `/psychometrics/score/dry-run/${encodeURIComponent(code)}`,
      {
        method: "POST",
        body: JSON.stringify(dto),
        signal,
        adapter: (v) => v as ScoreResultResponseDto,
      },
    );
  },
};

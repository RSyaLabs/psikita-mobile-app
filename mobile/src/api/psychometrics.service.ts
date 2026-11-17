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

export const psychometricsService = {
  getInstruments: async (signal?: AbortSignal): Promise<PsychometricInstrumentDto[]> => {
    const response = await apiRequest<unknown>("/psychometrics/types", {
      signal,
      adapter: (v) => v,
    });
    if (Array.isArray(response)) {
      return response as PsychometricInstrumentDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as PsychometricInstrumentDto[];
    }
    return [];
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

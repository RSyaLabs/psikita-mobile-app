import { apiRequest } from "./client";
import { z } from "zod";
import { zodAdapter } from "./response";
import { withQueryParams } from "./response";

export interface DiagnosisCodeItemDto {
  id: string;
  code: string;
  system: "ICD10" | "DSM5";
  label: string;
  category: string;
  description?: string | null;
}

const diagnosisCodesResponseSchema = z.object({
  data: z.array(z.object({
    id: z.string().min(1),
    code: z.string().min(1),
    system: z.enum(["ICD10", "DSM5"]),
    label: z.string().min(1),
    category: z.string(),
    description: z.string().nullable().optional(),
  })),
  meta: z.object({
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export interface PaginatedDiagnosisCodesResponseDto {
  data: DiagnosisCodeItemDto[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const diagnosisCodesService = {
  getDiagnosisCodes: async (
    params?: {
      search?: string;
      system?: "ICD10" | "DSM5";
      page?: number;
      limit?: number;
    },
    signal?: AbortSignal,
  ): Promise<DiagnosisCodeItemDto[]> => {
    const query = params
      ? withQueryParams("/diagnosis-codes", params)
      : "/diagnosis-codes";
    const res = await apiRequest<PaginatedDiagnosisCodesResponseDto>(query, {
      signal,
      adapter: zodAdapter(diagnosisCodesResponseSchema),
    });
    return res?.data ?? [];
  },
};

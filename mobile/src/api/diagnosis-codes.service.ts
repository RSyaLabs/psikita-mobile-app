import { apiRequest } from "./client";
import { withQueryParams } from "./response";

export interface DiagnosisCodeItemDto {
  id: string;
  code: string;
  system: "ICD10" | "DSM5";
  label: string;
  category: string;
  description?: string | null;
}

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
    });
    return res?.data ?? [];
  },
};

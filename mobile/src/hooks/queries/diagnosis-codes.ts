import { useQuery } from "@tanstack/react-query";
import {
  diagnosisCodesService,
  DiagnosisCodeItemDto,
} from "@/api/diagnosis-codes.service";
import { queryKeys } from "../useQueryKeys";

export function useDiagnosisCodes(params?: {
  system?: "ICD10" | "DSM5";
  search?: string;
  limit?: number;
}) {
  return useQuery<DiagnosisCodeItemDto[]>({
    queryKey: queryKeys.diagnosisCodes.list(params),
    queryFn: ({ signal }) =>
      diagnosisCodesService.getDiagnosisCodes(params, signal),
    staleTime: 60 * 60 * 1000,
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clinicalResultService,
  type ClinicalDiagnosisInput,
  type ClinicalResultInput,
} from "@/api/clinical-result.service";
import { queryKeys } from "../useQueryKeys";

export function useClinicalDiagnosis(consultationId?: string) {
  const id = consultationId?.trim() ?? "";
  return useQuery({
    queryKey: ["consultationDiagnosis", id],
    queryFn: ({ signal }) => clinicalResultService.getDiagnosis(id, signal),
    enabled: Boolean(id),
    staleTime: 1000,
  });
}

export function useSaveClinicalDiagnosis() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { consultationId: string; input: ClinicalDiagnosisInput; update: boolean }) =>
      clinicalResultService.saveDiagnosis(args.consultationId, args.input, args.update),
    onSuccess: (_data, args) => {
      void qc.invalidateQueries({ queryKey: ["consultationDiagnosis", args.consultationId] });
    },
  });
}

export function useSubmitClinicalResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { consultationId: string; input: ClinicalResultInput }) =>
      clinicalResultService.submitResult(args.consultationId, args.input),
    onSuccess: (_data, args) => {
      void qc.invalidateQueries({ queryKey: queryKeys.consultations.detail(args.consultationId) });
      void qc.invalidateQueries({ queryKey: queryKeys.consultations.all });
    },
  });
}

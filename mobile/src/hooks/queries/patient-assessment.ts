import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientAssessmentService } from "@/api/patient-assessment.service";
import { queryKeys } from "../useQueryKeys";

export function useMyAssessments() {
  return useQuery({
    queryKey: queryKeys.assessments.mine(),
    queryFn: ({ signal }) => patientAssessmentService.list(signal),
    staleTime: 5000,
  });
}
export function usePatientAssessment(id: string) {
  return useQuery({
    queryKey: queryKeys.assessments.detail(id),
    queryFn: ({ signal }) => patientAssessmentService.get(id, signal),
    enabled: !!id,
  });
}
export function useStartPatientAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ typeCode, version }: { typeCode: string; version: number }) =>
      patientAssessmentService.start(typeCode, version),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.assessments.all }); },
  });
}
export function useSavePatientAssessmentDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Record<string, number> }) =>
      patientAssessmentService.saveDraft(id, answers),
    onSuccess: (_data, variables) => {
      void qc.invalidateQueries({ queryKey: queryKeys.assessments.detail(variables.id) });
    },
  });
}
export function useSubmitPatientAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: Record<string, number> }) =>
      patientAssessmentService.submit(id, answers),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.assessments.all }); },
  });
}
export function useCancelPatientAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientAssessmentService.cancel(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: queryKeys.assessments.all }); },
  });
}

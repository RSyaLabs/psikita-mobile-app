import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { consultationAssessmentService } from "@/api/consultation-assessment.service";
import { queryKeys } from "../useQueryKeys";

export function useConsultationAssessments(consultationId?: string, active = false) {
  const normalized = consultationId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.consultations.assessments(normalized),
    queryFn: ({ signal }) => consultationAssessmentService.list(normalized, signal),
    enabled: Boolean(normalized),
    staleTime: 3000,
    refetchInterval: active ? 7000 : false,
    refetchIntervalInBackground: false,
  });
}

export function useAssignConsultationAssessment() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: { consultationId: string; typeCode: string; version: number }) =>
      consultationAssessmentService.assign(input.consultationId, { typeCode: input.typeCode, version: input.version }),
    onSuccess: (_data, input) => {
      void cache.invalidateQueries({ queryKey: queryKeys.consultations.assessments(input.consultationId) });
    },
  });
}

export function useAnswerConsultationAssessment() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: { consultationId: string; assessmentId: string; answers: Record<string, number> }) =>
      consultationAssessmentService.answer(input.consultationId, input.assessmentId, input.answers),
    onSuccess: (_data, input) => {
      void cache.invalidateQueries({ queryKey: queryKeys.consultations.assessments(input.consultationId) });
    },
  });
}

export function useCloseConsultationAssessment() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      consultationId: string;
      assessmentId: string;
      reason: string;
      action: "cancel" | "decline";
    }) => input.action === "cancel"
      ? consultationAssessmentService.cancel(input.consultationId, input.assessmentId, input.reason)
      : consultationAssessmentService.decline(input.consultationId, input.assessmentId, input.reason),
    onSuccess: (_data, input) => {
      void cache.invalidateQueries({ queryKey: queryKeys.consultations.assessments(input.consultationId) });
    },
  });
}

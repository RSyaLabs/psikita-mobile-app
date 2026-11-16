import { useQuery } from "@tanstack/react-query";
import { clinicalAssessmentEvidenceService } from "@/api/clinical-assessment-evidence.service";
import { queryKeys } from "../useQueryKeys";

export function useConsultationPatientAssessments(consultationId?: string) {
  const id = consultationId?.trim() ?? "";
  return useQuery({
    queryKey: queryKeys.consultations.patientAssessmentEvidence(id),
    queryFn: ({ signal }) => clinicalAssessmentEvidenceService.byConsultation(id, signal),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

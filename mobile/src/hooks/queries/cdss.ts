import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cdssService,
  CdssAlertDto,
  CdssEvaluatePayload,
  CdssInsightDto,
} from "@/api/cdss.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useCdssAlerts() {
  return useQuery<CdssAlertDto[]>({
    queryKey: queryKeys.cdss.alerts(),
    queryFn: ({ signal }) => callWithSignal(cdssService.getAlerts, signal),
    staleTime: 30 * 1000,
  });
}

export function useCdssPatientAlerts(patientId?: string) {
  return useQuery<CdssAlertDto[]>({
    queryKey: queryKeys.cdss.patientAlerts(patientId ?? ""),
    queryFn: ({ signal }) =>
      patientId ? callWithSignal(cdssService.getPatientAlerts, signal, patientId) : Promise.resolve([]),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

export function useEvaluateCdss() {
  return useMutation<CdssInsightDto, Error, CdssEvaluatePayload>({
    mutationFn: (payload: CdssEvaluatePayload) => cdssService.evaluatePatientContext(payload),
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => cdssService.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cdss.all });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { cdssService, CdssAlertDto } from "@/api/cdss.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useCdssPatientAlerts(patientId?: string) {
  return useQuery<CdssAlertDto[]>({
    queryKey: queryKeys.cdss.patientAlerts(patientId ?? ""),
    queryFn: ({ signal }) =>
      patientId ? callWithSignal(cdssService.getPatientAlerts, signal, patientId) : Promise.resolve([]),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  carePlanService,
  CarePlanDto,
  CreateCarePlanPayload,
} from "@/api/careplan.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useCarePlan(consultationId?: string) {
  return useQuery<CarePlanDto | null>({
    queryKey: queryKeys.carePlan.byConsultation(consultationId ?? ""),
    queryFn: ({ signal }) =>
      consultationId
        ? callWithSignal(carePlanService.getCarePlanByConsultation, signal, consultationId)
        : Promise.resolve(null),
    enabled: !!consultationId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCarePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      consultationId,
      payload,
    }: {
      consultationId: string;
      payload: CreateCarePlanPayload;
    }) => carePlanService.createCarePlan(consultationId, payload),
    onSuccess: (_data, { consultationId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.carePlan.byConsultation(consultationId),
      });
    },
  });
}

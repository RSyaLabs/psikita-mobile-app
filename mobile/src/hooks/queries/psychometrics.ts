import { useQuery, useMutation } from "@tanstack/react-query";
import {
  psychometricsService,
  ScoreAnswersRequestDto,
} from "@/api/psychometrics.service";
import { queryKeys } from "../useQueryKeys";

export function usePsychometricInstruments() {
  return useQuery({
    queryKey: queryKeys.psychometrics.instruments(),
    queryFn: ({ signal }) => psychometricsService.getInstruments(signal),
    staleTime: 60 * 60 * 1000,
  });
}

export function usePsychometricForm(code: string) {
  return useQuery({
    queryKey: queryKeys.psychometrics.form(code),
    queryFn: ({ signal }) => psychometricsService.getInstrumentForm(code, signal),
    enabled: Boolean(code),
    staleTime: 30 * 60 * 1000,
  });
}

export function usePsychometricDryRun() {
  return useMutation({
    mutationFn: ({
      code,
      dto,
    }: {
      code: string;
      dto: ScoreAnswersRequestDto;
    }) => psychometricsService.dryRunScore(code, dto),
  });
}

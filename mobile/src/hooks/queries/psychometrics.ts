import { useQuery, useMutation } from "@tanstack/react-query";
import {
  psychometricsService,
  PsychometricInstrumentDto,
  PsychometricFormDto,
  ScoreAnswersRequestDto,
  ScoreResultResponseDto,
} from "@/api/psychometrics.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function usePsychometricInstruments() {
  return useQuery<PsychometricInstrumentDto[]>({
    queryKey: queryKeys.psychometrics.instruments(),
    queryFn: ({ signal }) => callWithSignal(psychometricsService.getInstruments, signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePsychometricForm(code?: string) {
  return useQuery<PsychometricFormDto | null>({
    queryKey: queryKeys.psychometrics.form(code ?? ""),
    queryFn: ({ signal }) =>
      code ? callWithSignal(psychometricsService.getInstrumentForm, signal, code) : Promise.resolve(null),
    enabled: !!code,
  });
}

export function useScorePsychometricDryRun() {
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: ScoreAnswersRequestDto }) =>
      psychometricsService.dryRunScore(code, dto),
  });
}

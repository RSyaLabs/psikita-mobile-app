import { useQuery, useMutation } from "@tanstack/react-query";
import {
  psychometricsService,
  type PsychometricContext,
  type ScoreAnswersRequestDto,
} from "@/api/psychometrics.service";
import { queryKeys } from "../useQueryKeys";

export function usePsychometricInstruments(context: PsychometricContext = "TRIAGE", enabled = true) {
  return useQuery({
    queryKey: queryKeys.psychometrics.instruments(context),
    queryFn: ({ signal }) => psychometricsService.getInstruments(context, signal),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function usePsychometricForm(code: string, version?: number) {
  return useQuery({
    queryKey: queryKeys.psychometrics.form(code, version),
    queryFn: ({ signal }) => psychometricsService.getInstrumentForm(code, version, signal),
    enabled: Boolean(code),
    staleTime: 5 * 60 * 1000,
  });
}

/** Only authorized clinical users may invoke the non-persistent dry run. */
export function usePsychometricDryRun() {
  return useMutation({
    mutationFn: ({ code, dto }: { code: string; dto: ScoreAnswersRequestDto }) =>
      psychometricsService.dryRunScore(code, dto),
  });
}

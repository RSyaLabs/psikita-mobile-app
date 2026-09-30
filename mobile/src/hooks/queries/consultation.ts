import { useCallback, useRef } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type MutateOptions,
} from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  isActiveConsultationContext,
  requireActiveConsultationContext,
} from "@/clinical/activeConsultation";
import {
  notesService,
  consultationService,
} from "@/api";
import {
  ConsultationResponseDto,
} from "@/types/api";
import type { ActiveConsultationContext } from "@/clinical/activeConsultation";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * consultation queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
} from "./shared";

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (dto: import("@/types/api").CreateConsultationDto) =>
      consultationService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.matching.all });
    },
  });
  // Creating a consultation is a write with real consequences, and a render-time
  // isDisabled is not a latch: two taps in the same frame, before React re-renders,
  // both reach the mutation. This matches the other guarded writes in this file.
  const pendingRef = useRef(false);

  const mutate = useCallback(
    (
      dto: import("@/types/api").CreateConsultationDto,
      options?: MutateOptions<
        ConsultationResponseDto,
        Error,
        import("@/types/api").CreateConsultationDto
      >,
    ) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      mutation.mutate(dto, {
        ...options,
        onSettled: (...args: any[]) => {
          pendingRef.current = false;
          (
            options?.onSettled as ((...settledArgs: any[]) => void) | undefined
          )?.(...args);
        },
      });
    },
    [mutation],
  );

  return { ...mutation, mutate };
}

/**
 * Mutation hook to conclude/finish an active consultation session
 */
export function useFinishConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (context: ActiveConsultationContext) => {
      const validatedContext = requireActiveConsultationContext(context);
      if (
        validatedContext.status !== "ACTIVE" &&
        validatedContext.status !== "WAITING"
      ) {
        throw new ApiError(
          "Sesi tidak dapat diselesaikan pada status ini",
          409,
          "CONSULTATION_NOT_ACTIVE",
        );
      }
      return consultationService.finish(validatedContext.consultationId);
    },
    onSuccess: (_result, context) => {
      const detailKey = queryKeys.consultations.detail(context.consultationId);
      queryClient.removeQueries({ queryKey: detailKey, exact: true });
      queryClient.invalidateQueries({ queryKey: queryKeys.patient.me() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.prescriptions.list(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations.all });
    },
  });
}

/**
 * Hook to retrieve consultation history with native select transformation
 */
export function useConsultations<T = ConsultationResponseDto[]>(options?: {
  select?: (data: ConsultationResponseDto[]) => T;
}) {
  return useQuery({
    queryKey: queryKeys.consultations.list(),
    queryFn: ({ signal }) => consultationService.getConsultations(signal),
    select: options?.select,
  });
}

/**
 * Hook to retrieve a single consultation by ID
 */
export function useConsultation(id: string) {
  return useQuery({
    queryKey: queryKeys.consultations.detail(id),
    queryFn: ({ signal }) =>
      callWithSignal(consultationService.getById, signal, id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Resolve a route lookup ID back to a server-issued context. The route value
 * is only a lookup key; it is never accepted as consultation/room context.
 */
export function useActiveConsultation(consultationId?: string) {
  const normalizedId = consultationId?.trim() || "";
  const query = useConsultation(normalizedId);
  const responseContext =
    query.isSuccess && query.data?.id === normalizedId
      ? query.data.activeConsultation
      : undefined;
  const context = isActiveConsultationContext(responseContext)
    ? responseContext
    : undefined;

  return { ...query, context };
}

/**
 * Hook to retrieve clinical notes (SOAP) for a consultation
 */
export function useConsultationNotes(consultationId: string) {
  return useQuery({
    queryKey: queryKeys.consultations.notes(consultationId),
    queryFn: ({ signal }) =>
      callWithSignal(
        notesService.getNotesByConsultation,
        signal,
        consultationId,
      ),
    enabled: !!consultationId,
    staleTime: 10 * 60 * 1000,
  });
}

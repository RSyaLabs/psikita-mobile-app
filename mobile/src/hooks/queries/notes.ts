import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import {
  isActiveConsultationContext,
  requireActiveConsultationContext,
} from "@/clinical/activeConsultation";
import {
  notesService,
} from "@/api";
import {
  CreateSoapNoteDto,
} from "@/types/api";
import type { ActiveConsultationContext } from "@/clinical/activeConsultation";
import {
  queryKeys,
} from "../useQueryKeys";


/**
 * Mutation hook for creating structured SOAP note
 */
export function useCreateSoapNote() {
  const queryClient = useQueryClient();
  type SoapNoteVariables =
    | { context: ActiveConsultationContext; dto: CreateSoapNoteDto }
    | { consultationId: string; dto: CreateSoapNoteDto };

  return useMutation({
    mutationFn: (variables: SoapNoteVariables) => {
      if (
        !("context" in variables) ||
        !isActiveConsultationContext(variables.context)
      ) {
        throw new ApiError(
          "Konteks konsultasi server belum tersedia",
          400,
          "CONSULTATION_CONTEXT_UNAVAILABLE",
        );
      }
      const validatedContext = requireActiveConsultationContext(
        variables.context,
      );
      return notesService.createSoapNote(
        validatedContext.consultationId,
        variables.dto,
      );
    },
    onSuccess: (_result, variables) => {
      if ("context" in variables && variables.context?.consultationId) {
        const consultationId = variables.context.consultationId;
        // This used to invalidate consultations.detail, but the notes list is
        // keyed consultations.notes. Different segment, so no prefix match, and a
        // saved SOAP note never refreshed the list that reads it.
        queryClient.invalidateQueries({
          queryKey: queryKeys.consultations.notes(consultationId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.consultations.detail(consultationId),
        });
      }
    },
  });
}

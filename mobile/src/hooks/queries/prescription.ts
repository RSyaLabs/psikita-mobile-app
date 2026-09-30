import {
  useQuery,
} from "@tanstack/react-query";
import type { PaginatedResult } from "@/api/response";
import {
  prescriptionService,
} from "@/api";
import {
  PrescriptionResponseDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * prescription queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  PrescriptionListParams,
  callWithSignal,
} from "./shared";

/**
 * Hook to get digital prescriptions
 */
export function usePrescriptions(params?: PrescriptionListParams) {
  const query = useQuery<PaginatedResult<PrescriptionResponseDto>, Error>({
    queryKey: queryKeys.prescriptions.list(params),
    queryFn: ({ signal }) =>
      callWithSignal(prescriptionService.getPrescriptions, signal, params),
  });

  return {
    ...query,
    data: query.data?.data,
    meta: query.data?.meta,
  };
}

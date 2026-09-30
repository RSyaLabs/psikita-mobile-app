import {
  useQueryClient,
} from "@tanstack/react-query";
import {
  practitionerService,
  articleService,
} from "@/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * prefetch queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  callWithSignal,
} from "./shared";

/**
 * Enterprise Prefetching Helper: Mengambil data detail di background sebelum pengguna mengklik
 * Memberikan pengalaman navigasi 0ms seketika tanpa loading spinner
 */
export function usePrefetchData() {
  const queryClient = useQueryClient();
  return {
    prefetchPractitioner: (id?: string) => {
      if (!id) return;
      queryClient.prefetchQuery({
        queryKey: queryKeys.practitioner.detail(id),
        queryFn: ({ signal }) =>
          callWithSignal(practitionerService.getById, signal, id),
        staleTime: 10 * 60 * 1000,
      });
    },
    prefetchArticle: (id?: string) => {
      if (!id) return;
      queryClient.prefetchQuery({
        queryKey: queryKeys.articles.detail(id),
        queryFn: ({ signal }) =>
          callWithSignal(articleService.getArticleById, signal, id),
        staleTime: 15 * 60 * 1000,
      });
    },
  };
}

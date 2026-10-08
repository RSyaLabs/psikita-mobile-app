import {
  useQuery,
} from "@tanstack/react-query";
import {
  articleService,
} from "@/api";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * articles queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  toListData,
  callWithSignal,
} from "./shared";

/**
 * Hook to retrieve psychoeducation articles with native select option & smooth transitions
 */
export function useArticles<T = any[]>(
  category?: string,
  query?: string,
  options?: {
    select?: (data: any[]) => T;
  },
) {
  return useQuery({
    queryKey: queryKeys.articles.list(category, query),
    queryFn: async ({ signal }) =>
      toListData(
        await callWithSignal(
          articleService.getArticles,
          signal,
          category,
          query,
        ),
      ),
    staleTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    select: options?.select,
  });
}


/**
 * Hook to retrieve a single article by ID
 */
export function useArticle(id?: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(id),
    queryFn: ({ signal }) =>
      id ? callWithSignal(articleService.getArticleById, signal, id) : null,
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
}

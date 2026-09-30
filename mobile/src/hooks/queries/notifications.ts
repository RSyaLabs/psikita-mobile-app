import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { getCapability } from "@/config/capabilities";
import {
  notificationService,
} from "@/api";
import type { NotificationDto } from "@/api/notification.service";
import {
  queryKeys,
} from "../useQueryKeys";

/**
 * notifications queries.
 *
 * Moved verbatim out of the former single-file useApiQueries.ts.
 */

import {
  toListData,
  callWithSignal,
} from "./shared";

/**
 * Hook to retrieve user notifications via TanStack Query
 */
export function useNotifications(category?: string) {
  return useQuery({
    queryKey: queryKeys.notifications.list(category),
    queryFn: async ({ signal }) =>
      toListData(
        await callWithSignal(
          notificationService.getNotifications,
          signal,
          category,
        ),
      ),
    staleTime: 2 * 60 * 1000,
  });
}

type NotificationItemVersion = {
  cacheKey: string;
  itemId: string;
  version: number;
};

type NotificationSnapshot = {
  queryKey: readonly unknown[];
  data: NotificationDto[] | undefined;
  itemVersions: NotificationItemVersion[];
};

const notificationItemVersions = new Map<string, number>();

function notificationItemVersionKey(
  queryKey: readonly unknown[],
  itemId: string,
): string {
  return JSON.stringify([queryKey, itemId]);
}

function notificationSnapshots(
  queryClient: QueryClient,
  category: string | undefined,
): NotificationSnapshot[] {
  if (category !== undefined) {
    const queryKey = queryKeys.notifications.list(category);
    return [
      {
        queryKey,
        data: queryClient.getQueryData<NotificationDto[]>(queryKey),
        itemVersions: [],
      },
    ];
  }

  return queryClient
    .getQueriesData<NotificationDto[]>({
      queryKey: queryKeys.notifications.all,
    })
    .filter(
      ([queryKey]) => queryKey[0] === "notifications" && queryKey[1] === "list",
    )
    .map(([queryKey, data]) => ({ queryKey, data, itemVersions: [] }));
}

function withNotificationItemVersions(
  snapshot: NotificationSnapshot,
  id?: string,
): NotificationSnapshot {
  const itemVersions = (snapshot.data ?? [])
    .filter((item) => id === undefined || item.id === id)
    .map((item) => {
      const cacheKey = notificationItemVersionKey(snapshot.queryKey, item.id);
      const version = (notificationItemVersions.get(cacheKey) ?? 0) + 1;
      notificationItemVersions.set(cacheKey, version);
      return { cacheKey, itemId: item.id, version };
    });

  return { ...snapshot, itemVersions };
}

async function cancelNotificationSnapshots(
  queryClient: QueryClient,
  snapshots: NotificationSnapshot[],
): Promise<void> {
  await Promise.all(
    snapshots.map(({ queryKey }) =>
      queryClient.cancelQueries({ queryKey, exact: true }),
    ),
  );
}

function restoreNotificationSnapshots(
  queryClient: QueryClient,
  snapshots: NotificationSnapshot[],
): void {
  for (const { queryKey, data, itemVersions } of snapshots) {
    const current = queryClient.getQueryData<NotificationDto[]>(queryKey);
    if (!data || !current) continue;

    const restorableIds = new Set(
      itemVersions
        .filter(
          ({ cacheKey, version }) =>
            notificationItemVersions.get(cacheKey) === version,
        )
        .map(({ itemId }) => itemId),
    );
    if (restorableIds.size === 0) continue;

    const originalById = new Map(data.map((item) => [item.id, item]));
    queryClient.setQueryData(
      queryKey,
      current.map((item) =>
        restorableIds.has(item.id) ? (originalById.get(item.id) ?? item) : item,
      ),
    );
  }
}

function markNotificationsRead(
  data: NotificationDto[] | undefined,
  id?: string,
): NotificationDto[] | undefined {
  if (!data) return data;
  return data.map((item) =>
    id === undefined || item.id === id ? { ...item, isUnread: false } : item,
  );
}

/**
 * Mutation hook to mark single notification as read with OPTIMISTIC UPDATE
 */
export function useMarkNotificationRead(category: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      if (getCapability("notifications") !== "demo") {
        return { snapshots: [] };
      }
      const snapshots = notificationSnapshots(queryClient, category).map(
        (snapshot) => withNotificationItemVersions(snapshot, id),
      );
      await cancelNotificationSnapshots(queryClient, snapshots);
      for (const { queryKey } of snapshots) {
        queryClient.setQueryData<NotificationDto[]>(queryKey, (current) =>
          current ? markNotificationsRead(current, id) : current,
        );
      }
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      if (context?.snapshots) {
        restoreNotificationSnapshots(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      // The optimistic write above only runs when the notifications capability is
      // "demo". On a live capability the request still mutates the server, and
      // without this the cache was never reconciled. With refetchOnWindowFocus
      // disabled the unread badge stayed wrong until the staleTime lapsed.
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

/**
 * Mutation hook to mark all notifications as read
 */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      if (getCapability("notifications") !== "demo") {
        return { snapshots: [] };
      }
      const snapshots = notificationSnapshots(queryClient, undefined).map(
        (snapshot) => withNotificationItemVersions(snapshot),
      );
      await cancelNotificationSnapshots(queryClient, snapshots);
      for (const { queryKey } of snapshots) {
        queryClient.setQueryData<NotificationDto[]>(queryKey, (current) =>
          current ? markNotificationsRead(current) : current,
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshots) {
        restoreNotificationSnapshots(queryClient, context.snapshots);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

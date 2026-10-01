import React from "react";
import { render } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GluestackUIProvider } from "@/components/ui";
import { AuthProvider } from "@/providers/AuthProvider";

/**
 * Creates an isolated QueryClient instance with retries disabled for tests.
 *
 * gcTime must be Infinity on BOTH queries and mutations. TanStack schedules a
 * real setTimeout for gc on whatever it disposes; the default 5 minutes left a
 * live handle that kept a Jest worker from exiting.
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

interface CustomRenderOptions {
  queryClient?: QueryClient;
}

/**
 * Renders UI wrapped in isolated QueryClientProvider and GluestackUIProvider.
 *
 * The nesting order is deliberately identical to app/_layout.tsx and is not a
 * cosmetic choice. Gluestack's OverlayProvider sits inside
 * GluestackUIProvider, and its portal mounts Modal content as siblings of
 * `props.children`, so anything a provider below GluestackUIProvider supplies is
 * invisible to Modal children: a Modal child calling useMutation throws
 * "No QueryClient set" and, in the real app, takes the entire screen down with it.
 *
 * This helper used to nest the client BELOW Gluestack, which meant the suite
 * asserted a tree the app never runs. Every modal test passed while the shipped
 * forgot-password flow crashed in a browser. QueryClientProvider stays outermost
 * here, and
 * __tests__/providers/modal-query-context.test.tsx fails if this order and the
 * root layout ever diverge again.
 */
export function renderWithClient(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  const queryClient = options?.queryClient || createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

/**
 * Same provider order as renderWithClient and as the root layout, plus the auth
 * provider: query client outermost, then auth, Gluestack innermost.
 */
export function renderWithAuth(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  const queryClient = options?.queryClient || createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GluestackUIProvider mode="light">{children}</GluestackUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper }),
    queryClient,
  };
}

// Re-export testing library utilities
export * from "@testing-library/react-native";

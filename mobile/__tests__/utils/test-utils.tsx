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
 * Renders UI wrapped in isolated QueryClientProvider and GluestackUIProvider
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

export function renderWithAuth(
  ui: React.ReactElement,
  options?: CustomRenderOptions,
) {
  return renderWithClient(<AuthProvider>{ui}</AuthProvider>, options);
}

// Re-export testing library utilities
export * from "@testing-library/react-native";

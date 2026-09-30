import React from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";

// 1. Mobile AppState & Window Focus Lifecycle
focusManager.setEventListener((handleFocus) => {
  if (Platform.OS !== "web") {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        handleFocus(status === "active");
      },
    );
    return () => subscription.remove();
  } else if (typeof window !== "undefined") {
    const onFocus = () => handleFocus(true);
    const onBlur = () => handleFocus(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }
  return () => {};
});

// 2. Online / Offline Connectivity Detection
if (Platform.OS === "web" && typeof window !== "undefined") {
  onlineManager.setEventListener((setOnline) => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  });
}

// 3. Centralized Enterprise QueryClient with Global Caches
type ErrorMetadata = {
  name: string;
  code: string;
  statusCode: number;
};

function getErrorMetadata(error: unknown): ErrorMetadata {
  const record =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : {};

  return {
    name: typeof record.name === "string" ? record.name : "UnknownError",
    code:
      typeof record.code === "string" || typeof record.code === "number"
        ? String(record.code)
        : "UNKNOWN",
    statusCode:
      typeof record.statusCode === "number" ? record.statusCode : 0,
  };
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Menangkap error level kueri secara terpusat
      if (__DEV__) {
        const metadata = getErrorMetadata(error);
        console.warn(
          `[TanStack Query Error] Hash: ${query.queryHash} Name: ${metadata.name} Code: ${metadata.code} Status: ${metadata.statusCode}`,
        );
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (__DEV__) {
        const metadata = getErrorMetadata(error);
        console.warn(
          `[TanStack Mutation Error] Name: ${metadata.name} Code: ${metadata.code} Status: ${metadata.statusCode}`,
        );
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit cache freshness
      gcTime: 1000 * 60 * 30, // 30 menit persistent memory
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false;
        // No retry on a client error, nor on 501 which this client uses to mean
        // "the backend does not support this capability". Both come from the same
        // metadata extractor the error logger uses, so the two cannot drift.
        const statusCode = getErrorMetadata(error).statusCode;
        if (statusCode >= 400 && statusCode < 500) return false;
        if (statusCode === 501) return false;
        return true;
      },
      refetchOnWindowFocus: false, // Hindari badai request berulang ke VPS saat user mobile toggle aplikasi
      refetchOnReconnect: true, // Auto-sync saat koneksi internet kembali aktif
    },
    mutations: {
      retry: 0, // Mutasi finansial/transaksional tidak boleh di-retry otomatis
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

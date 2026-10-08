import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../utils/test-utils";
import { useRequestWithdrawal } from "@/hooks/useApiQueries";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("unavailable high-risk mutations", () => {
  it("rejects withdrawal instead of creating a local success receipt", async () => {
    const { result } = renderHook(() => useRequestWithdrawal(), { wrapper });

    result.current.mutate({ amount: 2500000, bank: "BCA" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});

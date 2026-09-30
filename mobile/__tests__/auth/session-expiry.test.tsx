import React from "react";
import { Text } from "react-native";
import { render, screen, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { getAuthToken } from "@/api/client";
import { secureStorage } from "@/utils/storage";

/**
 * Reproduction for an unhandled session expiry.
 *
 * Staging issues a one hour access token, and its /auth/refresh cannot renew
 * it: POST with only a refreshToken answers 401, and with both it answers 500.
 * An expired session can only be abandoned, not renewed.
 *
 * Hydration checked only that a token string existed and that the stored user
 * blob parsed. The token's exp was never read, so an hour after signing in a
 * cold start restored a full authenticated state: the dashboard rendered, every
 * panel requested, and every request came back 401 with nothing able to act on
 * it. The user was left looking at a screen that could never fill.
 */

jest.mock("@/api/client", () => ({
  getAuthToken: jest.fn(),
  invalidateAuthContext: jest.fn(),
  setAuthToken: jest.fn(),
}));

jest.mock("@/api/auth.service", () => ({
  authService: {
    loginWithPassword: jest.fn(),
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock("@/utils/storage", () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockGetAuthToken = getAuthToken as jest.MockedFunction<
  typeof getAuthToken
>;
const mockGetItem = secureStorage.getItem as jest.MockedFunction<
  typeof secureStorage.getItem
>;
const mockRemoveItem = secureStorage.removeItem as jest.MockedFunction<
  typeof secureStorage.removeItem
>;

const STORED_USER = JSON.stringify({
  version: 1,
  user: {
    id: "user-1",
    email: "siti.rahayu@psikita.com",
    role: "patient",
    isActive: true,
  },
});

/** A token shaped like the ones the server issues, with a chosen expiry. */
function tokenExpiringIn(seconds: number): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "user-1",
      sid: "sid-1",
      email: "siti.rahayu@psikita.com",
      role: "USER",
      isActive: true,
      iat: Math.floor(Date.now() / 1000) - 60,
      exp: Math.floor(Date.now() / 1000) + seconds,
    }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

function Probe() {
  const { status } = useAuth();
  return <Text testID="status">{status}</Text>;
}

function renderProvider() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

const status = () => screen.getByTestId("status").props.children;

describe("expired access token is not restored as a live session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(STORED_USER);
  });

  it("signs the user out when the stored token expired an hour ago", async () => {
    mockGetAuthToken.mockResolvedValue(tokenExpiringIn(-3600));

    renderProvider();

    await waitFor(() => expect(status()).toBe("unauthenticated"));
    expect(mockRemoveItem).toHaveBeenCalled();
  });

  it("keeps the session when the stored token is still valid", async () => {
    mockGetAuthToken.mockResolvedValue(tokenExpiringIn(3600));

    renderProvider();

    await waitFor(() => expect(status()).toBe("authenticated"));
  });

  it("signs the user out when the token cannot be decoded at all", async () => {
    mockGetAuthToken.mockResolvedValue("not-a-jwt");

    renderProvider();

    await waitFor(() => expect(status()).toBe("unauthenticated"));
  });
});

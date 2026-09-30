import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth, type AuthContextValue } from "@/hooks/useAuth";
import { useLogin } from "@/hooks/useApiQueries";
import {
  getAuthToken,
  invalidateAuthContext,
  setAuthToken,
} from "@/api/client";
import { authService } from "@/api/auth.service";
import * as activeConsultation from "@/clinical/activeConsultation";
import { secureStorage } from "@/utils/storage";
import type { TokenResponseDto } from "@/types/api";

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
const mockInvalidateAuthContext = invalidateAuthContext as jest.MockedFunction<
  typeof invalidateAuthContext
>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<
  typeof setAuthToken
>;
const mockGetItem = secureStorage.getItem as jest.MockedFunction<
  typeof secureStorage.getItem
>;
const mockSetItem = secureStorage.setItem as jest.MockedFunction<
  typeof secureStorage.setItem
>;
const mockRemoveItem = secureStorage.removeItem as jest.MockedFunction<
  typeof secureStorage.removeItem
>;
const mockLogout = authService.logout as jest.MockedFunction<
  typeof authService.logout
>;
const mockLogin = authService.loginWithPassword as jest.MockedFunction<
  typeof authService.loginWithPassword
>;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/**
 * Builds a token shaped like the ones the server actually issues. The old
 * fixture used `access-${id}`, which is not a JWT, so it could never have come
 * from a real login. The app now reads the role out of the token payload, so
 * the fixture has to be a real one.
 *
 * Deterministic on purpose: assertions compare the stored token against a
 * freshly built one, so the timestamps must not move between calls.
 */
function fakeJwt(
  id: string,
  role: string,
  email: string,
  isActive = true,
): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: id,
      sid: `sid-${id}`,
      email,
      role,
      isActive,
      iat: 1790385870,
      exp: 4102444800,
    }),
  ).toString("base64url");
  return `header.${payload}.signature`;
}

function responseFor(
  id: string,
  role: "ADMIN" | "USER" | "PSYCHIATRIST" | "PSYCHOLOGIST",
  username = "account",
): TokenResponseDto {
  return {
    accessToken: fakeJwt(id, role, `${id}@example.test`),
    refreshToken: `refresh-${id}`,
    user: {
      id,
      username,
      email: `${id}@example.test`,
      role,
      isActive: true,
    },
  };
}

function persistedSessionFor(
  id: string,
  role: "patient" | "practitioner" | "admin",
) {
  return JSON.stringify({
    version: 1,
    user: {
      id,
      email: `${id}@example.test`,
      role,
      isActive: true,
    },
  });
}

let currentAuth: AuthContextValue;
let currentLogin: ReturnType<typeof useLogin>;

function AuthProbe() {
  currentAuth = useAuth();
  return null;
}

function LoginProbe() {
  currentLogin = useLogin();
  return null;
}

function renderAuthProvider(queryClient = createQueryClient()) {
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );

  return { ...result, queryClient };
}

function renderAuthProviderWithLogin(queryClient = createQueryClient()) {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthProbe />
        <LoginProbe />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("auth session lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAuthToken.mockResolvedValue(null);
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
  });

  it("hydrates only a versioned persisted user paired with a server token", async () => {
    mockGetAuthToken.mockResolvedValue("header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzIiwiZW1haWwiOiJhQGIuYyIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImV4cCI6NDEwMjQ0NDgwMH0.signature");
    mockGetItem.mockResolvedValue(persistedSessionFor("patient-1", "patient"));

    renderAuthProvider();

    expect(currentAuth.status).toBe("loading");

    await waitFor(() => {
      expect(currentAuth.status).toBe("authenticated");
    });

    expect(currentAuth.user).toEqual({
      id: "patient-1",
      email: "patient-1@example.test",
      role: "patient",
      isActive: true,
    });
    expect(currentAuth.homeRoute).toBe("/patient/dashboard");
  });

  it("rejects an unversioned or otherwise permissive persisted role", async () => {
    mockGetAuthToken.mockResolvedValue("header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzIiwiZW1haWwiOiJhQGIuYyIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImV4cCI6NDEwMjQ0NDgwMH0.signature");
    mockGetItem.mockResolvedValue(
      JSON.stringify({
        id: "patient-1",
        email: "patient-1@example.test",
        role: "patient",
        isActive: true,
      }),
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(null);
  });

  it("rejects incomplete or lowercase-role server responses", async () => {
    renderAuthProvider();

    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });
    mockSetAuthToken.mockClear();

    const incomplete = {
      accessToken: "not-a-jwt-at-all",
      user: { id: "user-1", role: "USER" },
    } as TokenResponseDto;
    const lowercaseRole = {
      ...responseFor("user-2", "USER"),
      user: {
        ...responseFor("user-2", "USER").user,
        role: "admin" as any,
      },
    } as TokenResponseDto;

    expect(() => currentAuth.acceptSession(incomplete)).toThrow();
    expect(() => currentAuth.acceptSession(lowercaseRole)).toThrow();
    expect(currentAuth.status).toBe("unauthenticated");
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("uses only the server role and never elevates a username", () => {
    renderAuthProvider();

    act(() => {
      currentAuth.acceptSession(
        responseFor("user-1", "USER", "admin-looking-account"),
      );
    });

    expect(currentAuth.user?.role).toBe("patient");
    expect(currentAuth.hasRole("admin")).toBe(false);
    expect(currentAuth.homeRoute).toBe("/patient/dashboard");
  });

  it("does not let a pending hydration overwrite a newly accepted login", async () => {
    let resolveToken: (token: string | null) => void = () => undefined;
    mockGetAuthToken.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveToken = resolve;
      }),
    );
    mockGetItem.mockResolvedValue(persistedSessionFor("old-user", "patient"));

    renderAuthProvider();
    act(() => {
      currentAuth.acceptSession(responseFor("new-user", "PSYCHOLOGIST"));
    });

    resolveToken("old-access");
    await waitFor(() => {
      expect(currentAuth.status).toBe("authenticated");
    });

    expect(currentAuth.user?.id).toBe("new-user");
    expect(currentAuth.user?.role).toBe("practitioner");
  });

  it("does not let a pending hydration resurrect a session after logout", async () => {
    let resolveToken: (token: string | null) => void = () => undefined;
    mockGetAuthToken.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveToken = resolve;
      }),
    );
    mockGetItem.mockResolvedValue(persistedSessionFor("old-user", "patient"));

    renderAuthProvider();
    await act(async () => {
      await currentAuth.signOut();
    });

    resolveToken("old-access");
    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });
    expect(currentAuth.user).toBeNull();
  });

  it("rejects a stale pre-signout login and preserves a newer login accepted before logout completion", async () => {
    let resolveStaleLogin: (response: TokenResponseDto) => void = () =>
      undefined;
    let resolveNewLogin: (response: TokenResponseDto) => void = () => undefined;
    let resolveLogout: () => void = () => undefined;

    const staleLogin = new Promise<TokenResponseDto>((resolve) => {
      resolveStaleLogin = resolve;
    });
    const newerLogin = new Promise<TokenResponseDto>((resolve) => {
      resolveNewLogin = resolve;
    });
    const pendingLogout = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });
    mockLogin.mockReturnValueOnce(staleLogin).mockReturnValueOnce(newerLogin);
    mockLogout.mockReturnValueOnce(pendingLogout);

    renderAuthProviderWithLogin();
    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });

    act(() => {
      currentAuth.acceptSession(responseFor("existing-user", "USER"));
      currentLogin.mutate({ username: "account", password: "test-password" });
    });
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));

    let signOutPromise: Promise<void>;
    act(() => {
      signOutPromise = currentAuth.signOut();
    });

    expect(currentAuth.status).toBe("unauthenticated");
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(
      responseFor("existing-user", "USER").accessToken,
    );

    resolveStaleLogin(responseFor("stale-user", "ADMIN"));
    await waitFor(() => {
      expect(currentLogin.isError).toBe(true);
    });
    expect(currentAuth.user).toBeNull();
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(
      responseFor("existing-user", "USER").accessToken,
    );

    act(() => {
      currentLogin.mutate({
        username: "new-account",
        password: "test-password",
      });
    });
    resolveNewLogin(responseFor("newer-user", "PSYCHOLOGIST"));
    await waitFor(() => {
      expect(currentAuth.user?.id).toBe("newer-user");
    });

    resolveLogout();
    await act(async () => {
      await signOutPromise!;
    });

    expect(currentAuth.status).toBe("authenticated");
    expect(currentAuth.user?.id).toBe("newer-user");
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(
      responseFor("newer-user", "PSYCHOLOGIST").accessToken,
    );
  });

  it("accepts a post-signout login when its response arrives after logout cleanup", async () => {
    let resolveLogin: (response: TokenResponseDto) => void = () => undefined;
    let resolveLogout: () => void = () => undefined;
    const loginPromise = new Promise<TokenResponseDto>((resolve) => {
      resolveLogin = resolve;
    });
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    mockLogout.mockReturnValueOnce(logoutPromise);

    renderAuthProviderWithLogin();
    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });

    let signOutPromise: Promise<void>;
    act(() => {
      signOutPromise = currentAuth.signOut();
      currentLogin.mutate({
        username: "post-logout-account",
        password: "test-password",
      });
    });

    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));
    resolveLogout();
    await act(async () => {
      await signOutPromise!;
    });
    expect(currentAuth.status).toBe("unauthenticated");

    resolveLogin(responseFor("post-logout-user", "USER"));
    await waitFor(() => {
      expect(currentAuth.status).toBe("authenticated");
    });

    expect(currentAuth.user?.id).toBe("post-logout-user");
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(
      responseFor("post-logout-user", "USER").accessToken,
    );
  });

  it("registers a queued login attempt before sign-out can invalidate it", async () => {
    let resolveLogin: (response: TokenResponseDto) => void = () => undefined;
    let resolveLogout: () => void = () => undefined;
    const loginPromise = new Promise<TokenResponseDto>((resolve) => {
      resolveLogin = resolve;
    });
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });
    mockLogin.mockReturnValueOnce(loginPromise);
    mockLogout.mockReturnValueOnce(logoutPromise);

    renderAuthProviderWithLogin();
    await waitFor(() => {
      expect(currentAuth.status).toBe("unauthenticated");
    });

    let signOutPromise: Promise<void>;
    act(() => {
      currentLogin.mutate({
        username: "queued-account",
        password: "test-password",
      });
      signOutPromise = currentAuth.signOut();
    });

    expect(mockLogin).not.toHaveBeenCalled();
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));

    resolveLogin(responseFor("queued-user", "ADMIN"));
    await waitFor(() => {
      expect(currentLogin.isError).toBe(true);
    });
    expect(currentAuth.status).toBe("unauthenticated");
    expect(currentAuth.user).toBeNull();
    expect(mockSetAuthToken).not.toHaveBeenLastCalledWith(
      responseFor("queued-user", "USER").accessToken,
    );

    resolveLogout();
    await act(async () => {
      await signOutPromise!;
    });
  });

  it("clears the clinical context cache when the authenticated identity changes", async () => {
    const clearContextCache = jest.spyOn(
      activeConsultation,
      "clearActiveConsultationContextCache",
    );
    renderAuthProvider();
    await waitFor(() => expect(currentAuth.status).toBe("unauthenticated"));
    clearContextCache.mockClear();

    act(() => {
      currentAuth.acceptSession(responseFor("new-user", "USER"));
    });

    expect(clearContextCache).toHaveBeenCalledTimes(1);
    clearContextCache.mockRestore();
  });

  it("cancels and clears the previous user's query data before accepting a session", () => {
    const queryClient = createQueryClient();
    const cancelQueries = jest.spyOn(queryClient, "cancelQueries");
    renderAuthProvider(queryClient);
    queryClient.setQueryData(["patient", "me"], { id: "old-user" });

    act(() => {
      currentAuth.acceptSession(responseFor("new-user", "USER"));
    });

    expect(cancelQueries).toHaveBeenCalled();
    expect(queryClient.getQueryData(["patient", "me"])).toBeUndefined();
    expect(currentAuth.user?.id).toBe("new-user");
  });

  it("clears the previous user's query data before a second login", () => {
    const queryClient = createQueryClient();
    renderAuthProvider(queryClient);
    queryClient.setQueryData(["patient", "me"], { id: "first-user" });

    const firstSession = responseFor("first-user", "USER");
    const secondSession = responseFor("second-user", "PSYCHOLOGIST");

    act(() => {
      currentAuth.acceptSession(firstSession);
    });
    expect(queryClient.getQueryData(["patient", "me"])).toBeUndefined();

    queryClient.setQueryData(["practitioner", "me"], { id: "second-user" });
    act(() => {
      currentAuth.acceptSession(secondSession);
    });

    expect(queryClient.getQueryData(["practitioner", "me"])).toBeUndefined();
    expect(currentAuth.user?.id).toBe("second-user");
    expect(currentAuth.user?.role).toBe("practitioner");
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(
      secondSession.accessToken,
    );
  });

  it("invalidates in-flight request provenance before awaiting logout", async () => {
    let resolveLogout: () => void = () => undefined;
    mockLogout.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLogout = resolve;
      }),
    );
    renderAuthProvider();
    act(() => {
      currentAuth.acceptSession(responseFor("patient-1", "USER"));
    });
    mockInvalidateAuthContext.mockClear();

    let signOutPromise: Promise<void>;
    act(() => {
      signOutPromise = currentAuth.signOut();
    });

    expect(mockInvalidateAuthContext).toHaveBeenCalledTimes(1);
    expect(mockLogout).toHaveBeenCalledTimes(1);

    resolveLogout();
    await act(async () => {
      await signOutPromise!;
    });
  });

  it("clears token, user session, and query data even when logout fails", async () => {
    const queryClient = createQueryClient();
    renderAuthProvider(queryClient);

    act(() => {
      currentAuth.acceptSession(responseFor("patient-1", "USER"));
    });
    queryClient.setQueryData(["patient", "me"], { id: "patient-1" });
    mockLogout.mockRejectedValueOnce(new Error("offline"));

    await act(async () => {
      await currentAuth.signOut();
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockSetAuthToken).toHaveBeenLastCalledWith(null);
    expect(mockRemoveItem).toHaveBeenCalled();
    expect(queryClient.getQueryData(["patient", "me"])).toBeUndefined();
    expect(currentAuth.status).toBe("unauthenticated");
    expect(currentAuth.user).toBeNull();
  });
});

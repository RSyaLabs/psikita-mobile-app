import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { LoadingState } from "@/components/common";
import { decodeAccessToken, isTokenExpired } from "@/utils/jwt";
import { authService } from "@/api/auth.service";
import { clearActiveConsultationContextCache } from "@/clinical/activeConsultation";
import {
  getAuthToken,
  invalidateAuthContext,
  setAuthToken,
} from "@/api/client";
import { secureStorage } from "@/utils/storage";
import {
  AuthContext,
  appRoleFromPersistedRole,
  getHomeRouteForRole,
  parseServerSession,
  type AppRole,
  type AuthAttempt,
  type AuthContextValue,
  type AuthStatus,
  type AuthUser,
} from "@/hooks/useAuth";
import type { TokenResponseDto } from "@/types/api";

export const AUTH_USER_STORAGE_KEY = "psikita_auth_user";
export const AUTH_SESSION_VERSION = 1 as const;

const persistedSessionSchema = z.object({
  version: z.literal(AUTH_SESSION_VERSION),
  user: z.object({
    id: z.string().trim().min(1),
    email: z.string().trim().min(1),
    role: z.enum(["patient", "practitioner", "admin"]),
    isActive: z.literal(true),
  }),
});

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};

function readPersistedUser(value: string | null): AuthUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = persistedSessionSchema.safeParse(JSON.parse(value));
    if (!parsed.success) {
      return null;
    }

    const role = appRoleFromPersistedRole(parsed.data.user.role);
    if (!role) {
      return null;
    }

    return {
      id: parsed.data.user.id,
      email: parsed.data.user.email,
      role,
      isActive: true,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    status: "loading",
    user: null,
  });
  const sessionVersionRef = useRef(0);
  const nextAttemptIdRef = useRef(0);
  const latestAcceptedAttemptIdRef = useRef(0);
  const explicitMutationRef = useRef(false);
  const storageQueueRef = useRef<Promise<void>>(Promise.resolve());
  const tokenCleanupRef = useRef<Promise<void>>(Promise.resolve());

  const enqueueStorage = useCallback((operation: () => Promise<void>) => {
    const next = storageQueueRef.current.then(operation, operation);
    storageQueueRef.current = next.catch(() => undefined);
  }, []);

  const invalidateAuthAttempts = useCallback(() => {
    invalidateAuthContext();
    clearActiveConsultationContextCache();
    sessionVersionRef.current += 1;
    explicitMutationRef.current = true;
    setState((prev) => {
      if (prev.status === "unauthenticated" && prev.user === null) return prev;
      return { status: "unauthenticated", user: null };
    });
    return sessionVersionRef.current;
  }, []);

  const beginAuthAttempt = useCallback((): AuthAttempt => {
    const id = ++nextAttemptIdRef.current;
    return { id, epoch: sessionVersionRef.current };
  }, []);

  const clearLocalSession = useCallback(() => {
    queryClient.clear();
    tokenCleanupRef.current = Promise.resolve(setAuthToken(null));
    enqueueStorage(() => secureStorage.removeItem(AUTH_USER_STORAGE_KEY));
    setState((prev) => {
      if (prev.status === "unauthenticated" && prev.user === null) return prev;
      return { status: "unauthenticated", user: null };
    });
  }, [enqueueStorage, queryClient]);

  const clearSession = useCallback(() => {
    invalidateAuthAttempts();
    clearLocalSession();
  }, [clearLocalSession, invalidateAuthAttempts]);

  const acceptSession = useCallback(
    (response: TokenResponseDto, attempt?: AuthAttempt) => {
      if (
        attempt &&
        (attempt.epoch !== sessionVersionRef.current ||
          attempt.id < latestAcceptedAttemptIdRef.current)
      ) {
        throw new Error("Stale authentication attempt");
      }

      const session = parseServerSession(response);
      if (!session) {
        // The server issued a valid accessToken, but the contract documents no
        // user object on the login response and no endpoint that returns the
        // caller's role, so there is no way to learn whether this account is a
        // patient or a practitioner. Saying so beats surfacing a raw internal
        // string. Needs a server endpoint, not a client workaround.
        throw new Error(
          "Login berhasil, tetapi server belum mengembalikan data akun. " +
            "Aplikasi belum bisa menentukan apakah akun ini pasien atau praktisi.",
        );
      }

      invalidateAuthContext();
      clearActiveConsultationContextCache();
      sessionVersionRef.current += 1;
      explicitMutationRef.current = true;
      latestAcceptedAttemptIdRef.current =
        attempt?.id ?? nextAttemptIdRef.current;
      const cancellation = queryClient.cancelQueries();
      if (cancellation && typeof cancellation.catch === "function") {
        void cancellation.catch(() => undefined);
      }
      // invalidateQueries rather than clear().
      //
      // clear() empties the query cache AND the mutation cache while this
      // sign-in mutation is still executing. Per-call callbacks such as the
      // onSuccess that performs the post-sign-in navigation are delivered by
      // MutationObserver._notify, which fires them only while the observer
      // still has listeners; clearing the cache from inside the running
      // mutation destroys the very state the callback depends on, so the
      // navigation never happened and the user stayed on the login screen.
      //
      // invalidateQueries() is the documented operation for "the session
      // changed, cached data is stale": it marks queries stale and refetches
      // the active ones, without removing the mutation that is running.
      // Clear the query cache directly rather than through queryClient.clear().
      //
      // queryClient.clear() empties BOTH caches, and emptying the mutation
      // cache while this sign-in mutation is still executing removes the very
      // state the post-sign-in callback depends on: MutationObserver delivers
      // per-call onSuccess only while the observer still has listeners, so the
      // navigation never ran and the user stayed on the login screen.
      //
      // queryCache.clear() removes every cached query and nothing else, so the
      // previous user's data is gone before any screen can read it, which is
      // what these tests require, and the running mutation is untouched.
      queryClient.getQueryCache().clear();
      setAuthToken(session.accessToken);
      enqueueStorage(() =>
        secureStorage.setItem(
          AUTH_USER_STORAGE_KEY,
          JSON.stringify({
            version: AUTH_SESSION_VERSION,
            user: session.user,
          }),
        ),
      );
      setState({ status: "authenticated", user: session.user });
    },
    [enqueueStorage, queryClient],
  );

  const signOut = useCallback(async () => {
    const signOutEpoch = invalidateAuthAttempts();
    queryClient.clear();

    try {
      await authService.logout();
    } catch {
      // Local session cleanup is mandatory even when the server is unavailable.
    }

    if (sessionVersionRef.current !== signOutEpoch) {
      return;
    }

    clearLocalSession();
    await Promise.all([storageQueueRef.current, tokenCleanupRef.current]);
  }, [clearLocalSession, invalidateAuthAttempts, queryClient]);

  useEffect(() => {
    let active = true;

    if (explicitMutationRef.current) {
      return () => {
        active = false;
      };
    }

    const hydrationVersion = sessionVersionRef.current;
    const hydrate = async () => {
      try {
        const [token, storedUser] = await Promise.all([
          getAuthToken(),
          secureStorage.getItem(AUTH_USER_STORAGE_KEY),
        ]);

        if (
          !active ||
          explicitMutationRef.current ||
          sessionVersionRef.current !== hydrationVersion
        ) {
          return;
        }

        if (!token || !token.trim()) {
          clearSession();
          return;
        }

        // The stored access token has to still be usable. Staging issues a one
        // hour token and its /auth/refresh cannot renew one, so an expired
        // session can only be abandoned. Reading only the token's presence
        // meant an hour after signing in, a cold start restored a full
        // authenticated state: the dashboard rendered, every panel requested,
        // and every request came back 401 with nothing able to act on it.
        const claims = decodeAccessToken(token);
        if (!claims || isTokenExpired(claims)) {
          clearSession();
          return;
        }

        const user = readPersistedUser(storedUser);
        if (!user) {
          clearSession();
          return;
        }

        setState({ status: "authenticated", user });
      } catch {
        if (active && !explicitMutationRef.current) {
          clearSession();
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [clearSession]);

  const hasRole = useCallback(
    (role: AppRole) => state.user?.role === role,
    [state.user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      user: state.user,
      isAuthenticated: state.status === "authenticated" && state.user !== null,
      acceptSession,
      beginAuthAttempt,
      signOut,
      clearSession,
      hasRole,
      homeRoute: state.user ? getHomeRouteForRole(state.user.role) : null,
    }),
    [acceptSession, beginAuthAttempt, clearSession, hasRole, signOut, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

export function AuthLoadingState() {
  return (
    <LoadingState
      testID="auth-loading"
      label="Memuat sesi"
      className="flex-1 rounded-none border-0 !bg-background"
    />
  );
}

export { AuthContext };
export type { AppRole, AuthAttempt, AuthContextValue, AuthStatus, AuthUser };
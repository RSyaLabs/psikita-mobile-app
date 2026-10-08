import { useCallback } from "react";
import {
  useMutation,
  useQueryClient,
  type MutateOptions,
  type UseMutationResult,
  type MutationFunctionContext,
} from "@tanstack/react-query";
import {
  practitionerService,
  authService,
} from "@/api";
import {
  TokenResponseDto,
  PasswordLoginDto,
  PasswordRegisterDto,
  GoogleLoginDto,
  CreatePractitionerDto,
  RequestOtpDto,
  VerifyOtpDto,
} from "@/types/api";
import {
  queryKeys,
} from "../useQueryKeys";
import { useAuth, type AuthAttempt } from "../useAuth";


/**
 * Mutation hook for Password Login
 */
type AuthMutationInput<TVariables extends object> = {
  variables: TVariables;
  attempt: AuthAttempt;
};

type AuthMutateOptions<TVariables extends object> = MutateOptions<
  TokenResponseDto,
  Error,
  TVariables
>;

type AuthMutationResult<TVariables extends object> = UseMutationResult<
  TokenResponseDto,
  Error,
  TVariables
>;

function mapAuthMutationOptions<TVariables extends object>(
  variables: TVariables,
  options: AuthMutateOptions<TVariables> | undefined,
) {
  if (!options) {
    return undefined;
  }

  return {
    onSuccess: (
      response: TokenResponseDto,
      _input: AuthMutationInput<TVariables>,
      context: unknown,
      mutationContext: MutationFunctionContext,
    ) => options.onSuccess?.(response, variables, context, mutationContext),
    onError: (
      error: Error,
      _input: AuthMutationInput<TVariables>,
      context: unknown,
      mutationContext: MutationFunctionContext,
    ) => options.onError?.(error, variables, context, mutationContext),
    onSettled: (
      response: TokenResponseDto | undefined,
      error: Error | null,
      _input: AuthMutationInput<TVariables>,
      context: unknown,
      mutationContext: MutationFunctionContext,
    ) =>
      options.onSettled?.(response, error, variables, context, mutationContext),
  };
}



function useAuthLoginMutation<TVariables extends object>(
  login: (variables: TVariables) => Promise<TokenResponseDto>,
): AuthMutationResult<TVariables> {
  const auth = useAuth();
  const mutation = useMutation<
    TokenResponseDto,
    Error,
    AuthMutationInput<TVariables>
  >({
    mutationFn: async ({ variables, attempt }) => {
      const response = await login(variables);
      auth.acceptSession(response, attempt);
      return response;
    },
  });

  const mutate = useCallback(
    (variables: TVariables, options?: AuthMutateOptions<TVariables>) => {
      mutation.mutate(
        { variables, attempt: auth.beginAuthAttempt() },
        mapAuthMutationOptions(variables, options),
      );
    },
    [auth, mutation],
  );

  const mutateAsync = useCallback(
    (variables: TVariables, options?: AuthMutateOptions<TVariables>) => {
      return mutation.mutateAsync(
        { variables, attempt: auth.beginAuthAttempt() },
        mapAuthMutationOptions(variables, options),
      );
    },
    [auth, mutation],
  );

  return {
    ...mutation,
    variables: mutation.variables?.variables,
    mutate,
    mutateAsync,
  } as AuthMutationResult<TVariables>;
}

export function useLogin() {
  return useAuthLoginMutation((dto: PasswordLoginDto) =>
    authService.loginWithPassword(dto),
  );
}

export function useGoogleLogin() {
  return useAuthLoginMutation((dto: GoogleLoginDto) =>
    authService.loginWithGoogle(dto),
  );
}

/**
 * Mutation hook for Patient Registration
 */
export function useRegisterPatient() {
  return useMutation({
    mutationFn: (dto: PasswordRegisterDto) =>
      authService.registerWithPassword(dto),
  });
}

/**
 * Mutation hook for registering a new practitioner profile
 */
export function useRegisterPractitioner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePractitionerDto) =>
      practitionerService.createProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.practitioner.all });
    },
  });
}

/**
 * Mutation hook for requesting an email OTP
 */
export function useRequestOtp() {
  return useMutation({
    mutationFn: (dto: RequestOtpDto) => authService.requestOtp(dto),
  });
}

/**
 * Mutation hook for verifying an OTP code
 */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: (dto: VerifyOtpDto) => authService.verifyOtp(dto),
  });
}
import { apiRequest, setAuthToken } from "@/api/client";
import { authService } from "@/api/auth.service";

jest.mock("@/api/client", () => ({
  apiRequest: jest.fn(),
  setAuthToken: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;
const mockSetAuthToken = setAuthToken as jest.MockedFunction<
  typeof setAuthToken
>;

function responseFor(role: "USER" | "PSYCHOLOGIST" | "ADMIN") {
  return {
    accessToken: `service-access-${role}`,
    user: {
      id: `service-user-${role}`,
      username: "account",
      email: "account@example.test",
      role,
      isActive: true,
    },
  };
}

describe("auth service session boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue(responseFor("USER") as any);
  });

  it("returns validated password login data without writing the token", async () => {
    const result = await authService.loginWithPassword({
      username: "account",
      password: "test-password",
    });

    expect(result.user?.role).toBe("USER");
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("returns validated Google login data without writing the token", async () => {
    const testGoogleToken = "fixture";
    const result = await authService.loginWithGoogle({
      idToken: testGoogleToken,
    });

    expect(result.user?.role).toBe("USER");
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("does not turn password-reset OTP verification into a session", async () => {
    // The contract types /auth/otp/verify 200 as TokenResponseDto, which has
    // no `message`. This test previously asserted a `{ message }` body, which
    // locked in an adapter that could never parse a conforming response.
    mockApiRequest.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    } as any);

    const result = await authService.verifyOtp({
      email: "account@example.test",
      otp: "4820",
    });

    expect(result).toEqual({ accessToken: "a", refreshToken: "r" });
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });

  it("leaves token cleanup to AuthProvider when logout fails", async () => {
    mockApiRequest.mockRejectedValue(new Error("offline"));

    await expect(authService.logout()).rejects.toThrow("offline");
    expect(mockSetAuthToken).not.toHaveBeenCalled();
  });
});

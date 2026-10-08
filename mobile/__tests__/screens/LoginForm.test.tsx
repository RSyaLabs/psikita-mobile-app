import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithAuth } from "../utils/test-utils";
import LoginScreen from "../../app/(auth)/login";
import { mockRouter } from "../../jest.setup";
import { authService } from "@/api/auth.service";
import { signInWithGooglePopup } from "@/config/firebaseAuth";
import { setAuthToken } from "@/api/client";
import { secureStorage } from "@/utils/storage";
import { useAuth, type AuthContextValue } from "@/hooks/useAuth";

jest.mock("@/config/firebaseAuth", () => ({
  signInWithGooglePopup: jest.fn(),
  getFirebaseAuth: jest.fn(),
}));

jest.mock("@/api/auth.service", () => ({
  authService: {
    loginWithPassword: jest.fn(),
    loginWithGoogle: jest.fn(),
    registerWithPassword: jest.fn(),
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockLogin = authService.loginWithPassword as jest.MockedFunction<
  typeof authService.loginWithPassword
>;
const mockGoogleLogin = authService.loginWithGoogle as jest.MockedFunction<
  typeof authService.loginWithGoogle
>;
const mockRequestOtp = authService.requestOtp as jest.MockedFunction<
  typeof authService.requestOtp
>;
const mockVerifyOtp = authService.verifyOtp as jest.MockedFunction<
  typeof authService.verifyOtp
>;
const mockSignInWithGooglePopup = signInWithGooglePopup as jest.MockedFunction<
  typeof signInWithGooglePopup
>;

type ServerRole = "ADMIN" | "USER" | "PSYCHIATRIST" | "PSYCHOLOGIST";

/**
 * A real-shaped JWT, because the app now reads the role out of the token
 * payload. The previous fixture used `test-access-${role}`, which is not a
 * token the server could ever have issued.
 */
function serverResponse(role: ServerRole) {
  const id = `test-user-${role}`;
  const email = "account@example.test";
  const payload = Buffer.from(
    JSON.stringify({
      sub: id,
      sid: `sid-${id}`,
      email,
      role,
      isActive: true,
      iat: 1790385870,
      exp: 4102444800,
    }),
  ).toString("base64url");
  return {
    accessToken: `header.${payload}.signature`,
    user: { id, username: "account", email, role, isActive: true },
  } as any;
}

let authValue: AuthContextValue;

function AuthProbe() {
  authValue = useAuth();
  return null;
}

function renderLogin() {
  return renderWithAuth(
    <>
      <LoginScreen />
      <AuthProbe />
    </>,
  );
}

async function waitForCleanSession() {
  await waitFor(() => {
    expect(authValue.status).toBe("unauthenticated");
  });
}

function openLoginModal() {
  fireEvent.press(screen.getByText("Masuk dengan Akun"));
}

describe("LoginScreen safe authentication flow", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    setAuthToken(null);
    await secureStorage.removeItem("psikita_auth_user");
    mockLogin.mockResolvedValue(serverResponse("USER"));
    mockGoogleLogin.mockResolvedValue(serverResponse("USER"));
    mockRequestOtp.mockResolvedValue({ message: "OTP sent" });
    mockVerifyOtp.mockResolvedValue(serverResponse("USER"));
  });

  it("renders safe empty inputs without demo presets or default credentials", () => {
    renderLogin();
    openLoginModal();

    const usernameInput = screen.getByPlaceholderText("username atau email");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    expect(usernameInput.props.value).toBe("");
    expect(passwordInput.props.value).toBe("");
    expect(screen.queryByText("Demo Cepat")).toBeNull();
    expect(screen.queryByText("Pasien (Siti)")).toBeNull();
    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("does not call the login service for empty credentials", () => {
    renderLogin();
    openLoginModal();
    fireEvent.press(screen.getByText("Masuk Sekarang"));

    expect(
      screen.getByText("Masukkan username/email dan kata sandi."),
    ).toBeTruthy();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("authenticates with Google and navigates when popup succeeds", async () => {
    mockSignInWithGooglePopup.mockResolvedValue("test-google-id-token");
    mockGoogleLogin.mockResolvedValue(serverResponse("USER"));

    renderLogin();
    fireEvent.press(screen.getByText("Lanjutkan dengan Google"));

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledWith({
        idToken: "test-google-id-token",
      });
      expect(mockRouter.replace).toHaveBeenCalledWith("/patient/dashboard");
    });
  });

  it("shows cancellation notice when Google popup is cancelled", async () => {
    const cancelError = new Error("Popup closed");
    (cancelError as any).code = "auth/popup-closed-by-user";
    mockSignInWithGooglePopup.mockRejectedValue(cancelError);

    renderLogin();
    fireEvent.press(screen.getByText("Lanjutkan dengan Google"));

    await waitFor(() => {
      expect(screen.getByText("Masuk dengan Google dibatalkan.")).toBeTruthy();
    });
    expect(mockGoogleLogin).not.toHaveBeenCalled();
  });

  it.each([
    ["USER", "/patient/dashboard"],
    ["PSYCHOLOGIST", "/practitioner/dashboard"],
    ["ADMIN", "/admin/dashboard"],
  ] as const)(
    "routes a validated %s response to its role home",
    async (role, home) => {
      mockLogin.mockResolvedValue(serverResponse(role));
      renderLogin();
      openLoginModal();
      fireEvent.changeText(
        screen.getByPlaceholderText("username atau email"),
        "account@example.test",
      );
      fireEvent.changeText(
        screen.getByPlaceholderText("••••••••"),
        "test-password",
      );
      fireEvent.press(screen.getByText("Masuk Sekarang"));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(home);
      });
    },
  );

  it("does not accept a password-reset OTP response as a login session", async () => {
    renderLogin();
    await waitForCleanSession();
    openLoginModal();
    fireEvent.press(screen.getAllByText("Lupa kata sandi?")[0]);
    fireEvent.changeText(
      screen.getByPlaceholderText("email terdaftar"),
      "account@example.test",
    );
    fireEvent.press(screen.getByText("Kirim Kode Verifikasi"));

    await waitFor(() => {
      expect(screen.getByText("Verifikasi & Sandi Baru")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText("0 0 0 0"), "4820");
    fireEvent.changeText(
      screen.getByPlaceholderText("Minimal 6 karakter"),
      "new-test-password",
    );
    fireEvent.press(screen.getByText("Simpan Sandi & Selesai"));

    await waitFor(() => {
      expect(authValue.status).toBe("unauthenticated");
    });
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

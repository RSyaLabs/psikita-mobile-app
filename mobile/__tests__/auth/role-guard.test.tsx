import React from "react";
import { render, screen, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";
import { getAuthToken } from "@/api/client";
import { secureStorage } from "@/utils/storage";
import { ROUTES } from "@/constants/routes";
import PatientLayout from "../../app/(patient)/_layout";
import PractitionerLayout from "../../app/(practitioner)/_layout";
import AdminLayout from "../../app/(admin)/_layout";

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};
const mockSegments: string[] = [];
const mockParams: Record<string, string> = {};

jest.mock("expo-router", () => {
  const createElement = require("react").createElement;
  const Stack = (props: { children?: unknown }) =>
    createElement(
      "ProtectedStack",
      { testID: "protected-stack" },
      props.children,
    );
  Stack.Screen = () => null;
  return {
    useRouter: () => mockRouter,
    useSegments: () => mockSegments,
    useLocalSearchParams: () => mockParams,
    Stack,
  };
});

jest.mock("@/api/client", () => ({
  getAuthToken: jest.fn(),
  invalidateAuthContext: jest.fn(),
  setAuthToken: jest.fn(),
}));

jest.mock("@/api/auth.service", () => ({
  authService: {
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

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function persistedUser(id: string, role: "patient" | "practitioner" | "admin") {
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

function renderLayout(Layout: React.ComponentType) {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

function expectRedirect(href: string) {
  return waitFor(() => {
    expect(mockRouter.replace).toHaveBeenCalledWith(href);
  });
}

describe("protected role guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSegments.splice(0, mockSegments.length);
    Object.keys(mockParams).forEach((key) => delete mockParams[key]);
    mockGetAuthToken.mockResolvedValue(null);
    mockGetItem.mockResolvedValue(null);
  });

  it.each([
    ["patient", PatientLayout],
    ["practitioner", PractitionerLayout],
    ["admin", AdminLayout],
  ] as const)(
    "does not render the %s group without a session",
    async (_role, Layout) => {
      renderLayout(Layout);

      await expectRedirect(ROUTES.AUTH.LOGIN);
      expect(screen.queryByTestId("protected-stack")).toBeNull();
    },
  );

  it("shows an explicit loading state while the session hydrates", async () => {
    let resolveToken: (token: string | null) => void = () => undefined;
    mockGetAuthToken.mockReturnValue(
      new Promise<string | null>((resolve) => {
        resolveToken = resolve;
      }),
    );

    renderLayout(PatientLayout);

    expect(screen.getByTestId("auth-loading")).toBeTruthy();
    expect(screen.queryByTestId("protected-stack")).toBeNull();
    expect(mockRouter.replace).not.toHaveBeenCalled();

    resolveToken(null);
    await expectRedirect(ROUTES.AUTH.LOGIN);
  });

  it.each(["triage", "assessment-result"])(
    "allows the documented guest %s route without a session",
    async (leaf) => {
      mockSegments.push(leaf);
      mockParams.guest = "true";

      renderLayout(PatientLayout);

      await waitFor(() =>
        expect(screen.getByTestId("protected-stack")).toBeTruthy(),
      );
      expect(mockRouter.replace).not.toHaveBeenCalled();
    },
  );

  it("keeps non-guest triage protected", async () => {
    mockSegments.push("triage");

    renderLayout(PatientLayout);

    await expectRedirect(ROUTES.AUTH.LOGIN);
    expect(screen.queryByTestId("protected-stack")).toBeNull();
  });

  it("allows public practitioner registration without a session", async () => {
    mockSegments.push("register");

    renderLayout(PractitionerLayout);

    await waitFor(() =>
      expect(screen.getByTestId("protected-stack")).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it.each([
    ["patient", PatientLayout, "USER", ROUTES.PATIENT.DASHBOARD],
    [
      "practitioner",
      PractitionerLayout,
      "PSYCHOLOGIST",
      ROUTES.PRACTITIONER.DASHBOARD,
    ],
    ["admin", AdminLayout, "ADMIN", ROUTES.ADMIN.DASHBOARD],
  ] as const)(
    "renders %s only for its matching server role",
    async (_role, Layout, serverRole, _home) => {
      mockGetAuthToken.mockResolvedValue("header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzIiwiZW1haWwiOiJhQGIuYyIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImV4cCI6NDEwMjQ0NDgwMH0.signature");
      mockGetItem.mockResolvedValue(
        persistedUser(
          `${_role}-1`,
          serverRole === "USER"
            ? "patient"
            : serverRole === "PSYCHOLOGIST"
              ? "practitioner"
              : "admin",
        ),
      );

      renderLayout(Layout);

      await waitFor(() =>
        expect(screen.getByTestId("protected-stack")).toBeTruthy(),
      );
      expect(mockRouter.replace).not.toHaveBeenCalled();
    },
  );

  it.each([
    [PatientLayout, "ADMIN", ROUTES.ADMIN.DASHBOARD],
    [PractitionerLayout, "USER", ROUTES.PATIENT.DASHBOARD],
    [AdminLayout, "PSYCHOLOGIST", ROUTES.PRACTITIONER.DASHBOARD],
  ] as const)(
    "redirects a wrong-role user to their own home route",
    async (Layout, serverRole, home) => {
      mockGetAuthToken.mockResolvedValue("header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzIiwiZW1haWwiOiJhQGIuYyIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImV4cCI6NDEwMjQ0NDgwMH0.signature");
      mockGetItem.mockResolvedValue(
        persistedUser(
          "wrong-role",
          serverRole === "ADMIN"
            ? "admin"
            : serverRole === "USER"
              ? "patient"
              : "practitioner",
        ),
      );

      renderLayout(Layout);

      await expectRedirect(home);
      expect(screen.queryByTestId("protected-stack")).toBeNull();
    },
  );

  it("does not infer admin access from a username that says admin", async () => {
    mockGetAuthToken.mockResolvedValue("header.eyJzdWIiOiJ1c2VyLTEiLCJzaWQiOiJzIiwiZW1haWwiOiJhQGIuYyIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImV4cCI6NDEwMjQ0NDgwMH0.signature");
    mockGetItem.mockResolvedValue(persistedUser("patient-1", "patient"));

    renderLayout(PatientLayout);

    await waitFor(() =>
      expect(screen.getByTestId("protected-stack")).toBeTruthy(),
    );
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});

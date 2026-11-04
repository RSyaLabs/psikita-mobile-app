// jest.setup.ts
import "@testing-library/react-native";

// Unit tests must never reach a real network. Individual tests may override this mock explicitly.
global.fetch = jest.fn(() =>
  Promise.reject(new Error("Network access is disabled in unit tests")),
) as typeof fetch;

// Mock Expo Haptics
jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));

// Mock Expo Secure Store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

// Mock Expo Router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => true),
  setParams: jest.fn(),
};

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: "Link",
}));

// Mock Didit Native React Native SDK
jest.mock("@didit-protocol/sdk-react-native", () => ({
  startVerification: jest.fn(async (sessionToken: string) => {
    if (!sessionToken) {
      return {
        type: "failed",
        error: { type: "apiError", message: "Missing session token" },
      };
    }
    return {
      type: "completed",
      session: {
        sessionId: "mock_session_id",
        status: "Approved",
      },
    };
  }),
  VerificationStatus: {
    Approved: "Approved",
    Pending: "Pending",
    Declined: "Declined",
  },
}));

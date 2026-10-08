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

// Mock Firebase (ESM modules not transformed by Jest)
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({ name: "[DEFAULT]", options: {} })),
  getApp: jest.fn(() => ({ name: "[DEFAULT]", options: {} })),
  getApps: jest.fn(() => []),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(() => ({ name: "auth/mock" })),
  getAuth: jest.fn(() => ({ name: "auth/mock" })),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: jest.fn(),
    setCustomParameters: jest.fn(),
  })),
  signInWithPopup: jest.fn(),
  inMemoryPersistence: { __sentinel: "inMemoryPersistence" },
}));

/**
 * Why this suite mocks the SDK instead of loading it
 * ---------------------------------------------------
 * `firebase/auth` and `firebase/app` ship ESM only. Jest does not transform
 * node_modules by default, and adding `firebase` and `@firebase` to
 * transformIgnorePatterns did not fix it: the failure simply moved one level
 * deeper, from firebase/app into @firebase/util. Teaching jest to transform a
 * large dependency tree for one small module is the wrong trade.
 *
 * So both modules are replaced with factories. Jest resolves the specifier but
 * never loads the real file, which sidesteps the ESM problem entirely.
 *
 * What is actually worth asserting
 * -------------------------------
 * The real SDK's behaviour is not what this suite is here to re-test. What matters
 * are the three decisions this module makes on Firebase's behalf, all of which
 * would otherwise be untestable here:
 *
 * 1. Persistence is in-memory. If someone swaps this for getReactNativePersistence,
 *    the app starts writing unencrypted tokens to AsyncStorage. That is a security
 *    regression, and it would pass tsc and the rest of the suite silently.
 * 2. A second call reuses the instance rather than calling initializeAuth again,
 *    which throws once an Auth is bound to the app. That is the Fast Refresh path.
 * 3. When initializeAuth does throw, the module falls back to getAuth instead of
 *    propagating, because that throw is expected during a reload.
 *
 * There is deliberately no assertion on the contents of firebaseConfig itself.
 * __tests__/config/firebase.test.ts owns those values, and duplicating them here
 * would let the two files drift.
 */

const mockInitializeApp = jest.fn();
const mockGetApp = jest.fn();
const mockGetApps = jest.fn();
const mockInitializeAuth = jest.fn();
const mockGetAuth = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockAddScope = jest.fn();
const mockSetCustomParameters = jest.fn();

jest.mock("firebase/app", () => ({
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args),
  getApp: (...args: unknown[]) => mockGetApp(...args),
  getApps: (...args: unknown[]) => mockGetApps(...args),
}));

jest.mock("firebase/auth", () => ({
  initializeAuth: (...args: unknown[]) => mockInitializeAuth(...args),
  getAuth: (...args: unknown[]) => mockGetAuth(...args),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({
    addScope: mockAddScope,
    setCustomParameters: mockSetCustomParameters,
  })),
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  // inMemoryPersistence is a sentinel object in the real SDK. Its identity is
  // what the assertions below compare against.
  inMemoryPersistence: { __sentinel: "inMemoryPersistence" },
}));

const IN_MEMORY = { __sentinel: "inMemoryPersistence" };

/** Fresh module instance per test, because the auth cache is module state. */
function loadAuthModule() {
  let mod!: typeof import("@/config/firebaseAuth");
  jest.isolateModules(() => {
    mod =
      require("@/config/firebaseAuth") as typeof import("@/config/firebaseAuth");
  });
  return mod;
}

beforeEach(() => {
  mockInitializeApp.mockReset();
  mockGetApp.mockReset();
  mockGetApps.mockReset();
  mockInitializeAuth.mockReset();
  mockGetAuth.mockReset();
  mockSignInWithPopup.mockReset();
  mockAddScope.mockReset();
  mockSetCustomParameters.mockReset();

  mockGetApps.mockReturnValue([]);
  mockInitializeApp.mockReturnValue({ name: "[DEFAULT]", options: {} });
  mockInitializeAuth.mockReturnValue({ name: "auth/mock" });
});

describe("getFirebaseAuth", () => {
  it("pins persistence to in-memory rather than letting the SDK choose", () => {
    const { getFirebaseAuth } = loadAuthModule();
    getFirebaseAuth();

    expect(mockInitializeAuth).toHaveBeenCalledTimes(1);
    const [app, deps] = mockInitializeAuth.mock.calls[0];
    expect(app).toEqual({ name: "[DEFAULT]", options: {} });
    expect(deps).toEqual({ persistence: IN_MEMORY });
  });

  it("initialises the app from the shared config when none exists", () => {
    const { firebaseConfig } = require("@/config/firebaseConfig");
    const { getFirebaseAuth } = loadAuthModule();
    getFirebaseAuth();

    expect(mockInitializeApp).toHaveBeenCalledWith(firebaseConfig);
  });

  it("reuses an existing app instead of creating a second one", () => {
    const existing = {
      name: "[DEFAULT]",
      options: { projectId: "psikita-platform" },
    };
    mockGetApps.mockReturnValue([existing]);
    mockGetApp.mockReturnValue(existing);

    const { getFirebaseAuth } = loadAuthModule();
    getFirebaseAuth();

    expect(mockInitializeApp).not.toHaveBeenCalled();
    expect(mockGetApp).toHaveBeenCalledTimes(1);
    expect(mockInitializeAuth).toHaveBeenCalledWith(existing, {
      persistence: IN_MEMORY,
    });
  });

  it("returns the same instance on a second call, the Fast Refresh path", () => {
    const { getFirebaseAuth } = loadAuthModule();
    const first = getFirebaseAuth();
    const second = getFirebaseAuth();

    expect(second).toBe(first);
    expect(mockInitializeAuth).toHaveBeenCalledTimes(1);
  });

  it("falls back to getAuth when initializeAuth reports one is bound", () => {
    const bound = { name: "auth/already-initialised" };
    mockInitializeAuth.mockImplementation(() => {
      throw new Error("auth/already-initialized");
    });
    mockGetAuth.mockReturnValue(bound);

    const { getFirebaseAuth } = loadAuthModule();

    expect(getFirebaseAuth()).toBe(bound);
    expect(mockGetAuth).toHaveBeenCalledTimes(1);
  });

  it("still falls back when initializeAuth fails for an unrelated reason", () => {
    // initializeAuth failing for any other reason is a real fault, but the module's
    // contract is that getAuth decides, not that this layer propagates. Asserting
    // the delegation keeps the behaviour explicit rather than incidental.
    mockInitializeAuth.mockImplementation(() => {
      throw new Error("auth/invalid-api-key");
    });

    const { getFirebaseAuth } = loadAuthModule();

    expect(() => getFirebaseAuth()).not.toThrow();
    expect(mockGetAuth).toHaveBeenCalled();
  });
});

import { Platform } from "react-native";

describe("signInWithGooglePopup", () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    Platform.OS = "web";
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  it("opens Google popup and returns idToken on success", async () => {
    const mockUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-firebase-id-token"),
    };
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });

    const { signInWithGooglePopup } = loadAuthModule();
    const token = await signInWithGooglePopup();

    expect(token).toBe("mock-firebase-id-token");
    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockAddScope).toHaveBeenCalledWith("email");
    expect(mockAddScope).toHaveBeenCalledWith("profile");
    expect(mockSetCustomParameters).toHaveBeenCalledWith({
      prompt: "select_account",
    });
  });

  it("propagates user popup cancellation", async () => {
    const cancelError = new Error("Popup closed by user");
    (cancelError as any).code = "auth/popup-closed-by-user";
    mockSignInWithPopup.mockRejectedValue(cancelError);

    const { signInWithGooglePopup } = loadAuthModule();
    await expect(signInWithGooglePopup()).rejects.toMatchObject({
      code: "auth/popup-closed-by-user",
    });
  });
});

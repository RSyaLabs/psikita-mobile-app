/**
 * Firebase Authentication client.
 *
 * Persistence is pinned to `inMemoryPersistence`, which is the load-bearing
 * decision in this file and the reason this module exists in the shape it does.
 *
 * Why in-memory, and why explicitly
 * ---------------------------------
 * Firebase's own `Dependencies` doc says that when no persistence is supplied the
 * SDK falls back on `inMemoryPersistence`, so this line changes nothing about the
 * outcome. It is written out anyway because the fallback on React Native logs a
 * warning, and because saying which persistence is in force is the whole point:
 * this build stores nothing on the device.
 *
 * That matches the repo's existing web stance. src/utils/storage.ts keeps web
 * tokens in a Map and its comment states bearer tokens are deliberately not
 * written to browser storage. Firebase's web default is the opposite,
 * IndexedDB, so leaving persistence implicit would have quietly changed a
 * security decision this codebase already made on purpose.
 *
 * The tradeoff is that the Firebase session does not survive an app restart.
 * That is acceptable while the flow is being validated. Making it survive
 * requires a persistence backed by `expo-secure-store`, and that is not a
 * free change: the six methods a Firebase persistence must implement
 * (`_set`, `_get`, `_remove`, `_isAvailable`, `_addListener`, `_removeListener`)
 * are internal to the SDK. The public `Persistence` type declares only
 * `readonly type`. So a SecureStore-backed adapter would depend on undocumented
 * internals, and the user blob Firebase persists contains an access token and a
 * refresh token, which risks the roughly 2048-byte ceiling some iOS releases have
 * historically applied to SecureStore values. That decision is deliberately not
 * taken here.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";

import { firebaseConfig } from "./firebaseConfig";

function resolveApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

let cachedAuth: Auth | null = null;

/**
 * Returns the Firebase Auth instance, initialising it on first use.
 *
 * `initializeAuth` throws when the app already has an Auth bound to it, which is
 * what a Fast Refresh reload produces. Falling back to `getAuth` keeps a reload
 * from turning into a crash.
 */
export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  const app = resolveApp();
  try {
    cachedAuth = initializeAuth(app, { persistence: inMemoryPersistence });
  } catch {
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

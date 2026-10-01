/**
 * The single Firebase app instance.
 *
 * Scope is deliberately narrow: only `firebase/app` and `firebase/auth` are ever
 * imported from this project. Two exclusions are load-bearing, not stylistic:
 *
 * - Firestore is not imported. It is disabled in project `psikita-platform` anyway,
 *   and pulling it in drags `@grpc/grpc-js`, which npm audit flags at high
 *   severity for a certificate-validation flaw in its Node client path. A static
 *   walk of the require graph from `firebase/app` and `firebase/auth` reaches only
 *   nine @firebase packages, none of them Firestore or gRPC, and the Firestore
 *   entry points are separate bundles in the package.
 * - Analytics is not imported. It requires a native module, which would make Expo
 *   Go unusable, and Expo Go is a hard requirement for this project.
 *
 * The configuration itself lives in ./firebaseConfig so that it can be asserted
 * without loading this runtime.
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

import { firebaseConfig } from "./firebaseConfig";

let cached: FirebaseApp | null = null;

/**
 * Returns the Firebase app, initialising it on first use.
 *
 * `getApps()` is consulted first so a Fast Refresh reload cannot throw the
 * duplicate-name error that a bare initializeApp would raise on the second pass.
 */
export function getFirebaseApp(): FirebaseApp {
  if (cached) return cached;
  cached = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return cached;
}

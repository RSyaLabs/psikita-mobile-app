/**
 * Firebase project coordinates, as a plain object with no SDK import.
 *
 * This module is deliberately free of any `firebase/*` import. Two reasons:
 *
 * 1. Firebase publishes ESM only. Jest does not transform it by default, and
 *    making it transform a large dependency tree is fragile: the chain runs
 *    firebase -> @firebase/app -> @firebase/component -> @firebase/util, and each
 *    hop is another chance for a file shape the preset does not handle. The config
 *    is data, so the tests that pin it should not have to load a runtime.
 * 2. Keeping the literal separate means a test can assert the values without
 *    initialising an app, and without touching the network.
 *
 * Why these values are hardcoded instead of read from an environment variable:
 * this object is public by design. Firebase ships it to every browser that loads
 * the app, so it is not a secret and an env var would only move it, not protect
 * it. What must never enter this repository is a *service account key* — that file
 * is a full admin credential for the entire project and belongs in a secret store.
 *
 * The values were read back from the project itself, not from a screenshot:
 *   firebase projects:list -> id psikita-platform, project number 689134964183
 *   firebase auth:export   -> zero users in that project
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

/** Web app registration for project `psikita-platform`. */
export const firebaseConfig: FirebaseClientConfig = {
  apiKey: "AIzaSyAuSb7oMtsAXg5DD8HKKHeeEo0wXQX6ze0",
  authDomain: "psikita-platform.firebaseapp.com",
  projectId: "psikita-platform",
  storageBucket: "psikita-platform.firebasestorage.app",
  messagingSenderId: "689134964183",
  appId: "1:689134964183:web:1d5c2e8e6aad6e6bd70f92",
  measurementId: "G-035ZV1E3PE",
};

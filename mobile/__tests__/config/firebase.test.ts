import { firebaseConfig } from "@/config/firebaseConfig";

/**
 * Why this suite exists
 * ---------------------
 * The Firebase web config is a literal transcribed from a console screenshot. Two
 * failure modes are silent and would both surface far from their cause:
 *
 * 1. A mistyped project. `psikita-platform` shares a billing account and a Google
 *    Cloud project with the backend image in Artifact Registry, so pointing this
 *    app at a neighbouring tenant would authenticate real users into the wrong
 *    place rather than fail loudly. The projectId and appId assertions pin the
 *    values that were read back from the CLI, not from the screen:
 *      firebase projects:list -> id psikita-platform, number 689134964183
 *      firebase auth:export   -> zero users in that project
 *    An empty tenant is therefore the correct target, and changing either id has
 *    to be deliberate. appId embeds the project number, so that one assertion also
 *    pins 689134964183.
 * 2. A truncated or padded apiKey. Firebase rejects a malformed key with the
 *    misleading "API key not valid", which reads like a permissions problem
 *    rather than a transcription problem. This exact mistake happened once during
 *    the work that introduced this file: XQQ6ze0 was read where the value is
 *    XQX6ze0. The shape assertion below would not have caught that one, so the
 *    load-bearing check stays the round trip against the real API, recorded in the
 *    commit message. What this suite guarantees is the surrounding shape.
 *
 * This suite makes no network call. Reachability is a separate fact from
 * configuration validity, and a gate that depends on googleapis.com fails whenever
 * the network does.
 */

describe("firebase client config", () => {
  it("targets the intended project, not a neighbouring tenant", () => {
    expect(firebaseConfig.projectId).toBe("psikita-platform");
  });

  it("carries the appId of the registered web app", () => {
    expect(firebaseConfig.appId).toBe(
      "1:689134964183:web:1d5c2e8e6aad6e6bd70f92",
    );
  });

  it("serves the API key and auth domain the SDK requires", () => {
    expect(firebaseConfig.apiKey).toMatch(/^AIza[0-9A-Za-z_-]{35,}$/);
    expect(firebaseConfig.authDomain).toBe("psikita-platform.firebaseapp.com");
  });

  it("keeps the storage bucket the console emitted", () => {
    // Present because the console always emits it, but the bucket itself answered
    // 404 when probed, so nothing resolves there yet. If that changes, this
    // assertion is the place to say so deliberately.
    expect(firebaseConfig.storageBucket).toBe(
      "psikita-platform.firebasestorage.app",
    );
  });

  it("carries no service account credential", () => {
    // The single most damaging thing that could be added to this file is a
    // service account key, which is full admin access to the project. Admin keys
    // live under private_key, client_email and project_id as PEM and JSON fields,
    // so asserting the exact key set makes any addition a failing test rather
    // than a committed secret.
    expect(Object.keys(firebaseConfig).sort()).toEqual([
      "apiKey",
      "appId",
      "authDomain",
      "measurementId",
      "messagingSenderId",
      "projectId",
      "storageBucket",
    ]);
  });
});

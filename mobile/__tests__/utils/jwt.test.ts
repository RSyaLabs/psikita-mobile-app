import { decodeAccessToken, isTokenExpired } from "@/utils/jwt";

/**
 * These payloads are the real JWT middle segments captured from staging
 * /auth/password/login responses, re-encoded so nothing is lost to
 * transcription. The claims are exactly what the server signed:
 *
 *   { sub, sid, email, role, isActive, iat, exp }
 *
 * The role was never absent from the system. The client just was not reading
 * it, then concluded the backend had no role to give.
 */
const PATIENT =
  "eyJzdWIiOiIwMU0zNE1RWjMwS05ESDRQQUtNUzlSM0RISCIsInNpZCI6IjAxTTNETjBOV1RTMlg0MFJNUVhQV00zWlFCIiwiZW1haWwiOiJzaXRpLnJhaGF5dUBwc2lraXRhLmNvbSIsInJvbGUiOiJVU0VSIiwiaXNBY3RpdmUiOnRydWUsImlhdCI6MTc5MDM4NTg3MCwiZXhwIjoxNzkwMzg5NDcwfQ";
const PSYCHOLOGIST =
  "eyJzdWIiOiIwMU0zNE1RWjMwUDVHRTc1N0QzMTc4UkI0VyIsInNpZCI6IjAxTTNETjBQMFc0SFpYRUFYU0pEVkc1V0NOIiwiZW1haWwiOiJyaW5hLmFtZWxpYUBwc2lraXRhLmNvbSIsInJvbGUiOiJQU1lDSE9MT0dJU1QiLCJpc0FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzkwMzg1ODcwLCJleHAiOjE3OTAzODk0NzB9";
const ADMIN =
  "eyJzdWIiOiIwMU0zNE0wV01HMVM4WlBQOEJBUFoxMEJXVyIsInNpZCI6IjAxTTNETjBQNFdDNFdDN0NCMUcwOUFFNjg5IiwiZW1haWwiOiJhZG1pbkBwc2lraXRhLmNvbSIsInJvbGUiOiJBRE1JTiIsImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3OTAzODU4NzEsImV4cCI6MTc5MDM4OTQ3MX0";

const token = (payload: string) => `header.${payload}.signature`;
const ROLES = ["ADMIN", "USER", "PSYCHIATRIST", "PSYCHOLOGIST"] as const;

describe("decodeAccessToken", () => {
  it("reads the role out of a real patient token", () => {
    expect(decodeAccessToken(token(PATIENT))?.role).toBe("USER");
  });

  it("reads the role out of a real practitioner token", () => {
    expect(decodeAccessToken(token(PSYCHOLOGIST))?.role).toBe("PSYCHOLOGIST");
  });

  it("reads the role out of a real admin token", () => {
    expect(decodeAccessToken(token(ADMIN))?.role).toBe("ADMIN");
  });

  it("exposes the subject, email and activity flag", () => {
    const claims = decodeAccessToken(token(PATIENT));
    expect(claims?.sub).toBe("01M34MQZ30KNDH4PAKMS9R3DHH");
    expect(claims?.email).toBe("siti.rahayu@psikita.com");
    expect(claims?.isActive).toBe(true);
  });

  it("exposes the expiry so an expired session can be detected", () => {
    const claims = decodeAccessToken(token(PATIENT));
    expect(typeof claims?.exp).toBe("number");
    expect(claims?.exp).toBe(1790389470);
  });

  it("returns null for a token that is not three segments", () => {
    expect(decodeAccessToken("")).toBeNull();
    expect(decodeAccessToken("onlyonepart")).toBeNull();
    expect(decodeAccessToken("two.parts")).toBeNull();
  });

  it("returns null when the payload is not base64url JSON", () => {
    expect(decodeAccessToken("header.!!!notbase64!!!.signature")).toBeNull();
  });

  it("returns null when the role is missing or not a known value", () => {
    const noRole = Buffer.from(
      JSON.stringify({ sub: "x", email: "a@b.c" }),
    ).toString("base64url");
    expect(decodeAccessToken(token(noRole))).toBeNull();

    const weirdRole = Buffer.from(
      JSON.stringify({ sub: "x", email: "a@b.c", role: "SUPERWIZARD" }),
    ).toString("base64url");
    expect(decodeAccessToken(token(weirdRole))).toBeNull();
  });

  it("returns null when the subject or email is absent", () => {
    const noSub = Buffer.from(
      JSON.stringify({ email: "a@b.c", role: "USER" }),
    ).toString("base64url");
    expect(decodeAccessToken(token(noSub))).toBeNull();

    const noEmail = Buffer.from(
      JSON.stringify({ sub: "x", role: "USER" }),
    ).toString("base64url");
    expect(decodeAccessToken(token(noEmail))).toBeNull();
  });

  it("rejects a role value outside the known set", () => {
    for (const role of ["admin", "", "USER ADMIN", "PATIENT", "root"]) {
      const bad = Buffer.from(
        JSON.stringify({ sub: "x", email: "a@b.c", role }),
      ).toString("base64url");
      expect(decodeAccessToken(token(bad))).toBeNull();
    }
  });

  it("accepts every documented role", () => {
    for (const role of ROLES) {
      const good = Buffer.from(
        JSON.stringify({ sub: "x", email: "a@b.c", role }),
      ).toString("base64url");
      expect(decodeAccessToken(token(good))?.role).toBe(role);
    }
  });
});

describe("isTokenExpired", () => {
  it("treats a past expiry as expired", () => {
    const past = Buffer.from(
      JSON.stringify({ sub: "x", email: "a@b.c", role: "USER", exp: 1000 }),
    ).toString("base64url");
    expect(isTokenExpired(decodeAccessToken(token(past)))).toBe(true);
  });

  it("treats a future expiry as live", () => {
    const future = Buffer.from(
      JSON.stringify({
        sub: "x",
        email: "a@b.c",
        role: "USER",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url");
    expect(isTokenExpired(decodeAccessToken(token(future)))).toBe(false);
  });

  it("does not guess when the token carries no expiry", () => {
    const noExp = Buffer.from(
      JSON.stringify({ sub: "x", email: "a@b.c", role: "USER" }),
    ).toString("base64url");
    const noExpClaims = decodeAccessToken(token(noExp));

    // A token with no exp must never be reported expired, at any skew.
    expect(isTokenExpired(noExpClaims)).toBe(false);
    expect(isTokenExpired(noExpClaims, 0)).toBe(false);
    expect(isTokenExpired(noExpClaims, 86_400)).toBe(false);

    // Zero skew must still expire a token that genuinely carries a past exp, so
    // the assertions above are not passing only because the clock was ignored.
    const past = Buffer.from(
      JSON.stringify({ sub: "x", email: "a@b.c", role: "USER", exp: 1000 }),
    ).toString("base64url");
    expect(isTokenExpired(decodeAccessToken(token(past)), 0)).toBe(true);
    expect(isTokenExpired(null, 0)).toBe(false);
  });
});

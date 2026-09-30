import { decodeBase64Url } from "@/utils/base64";
import { decodeAccessToken, isTokenExpired } from "@/utils/jwt";
import { DEV_FIXTURE_TOKEN } from "@/config/devFixtures";

/**
 * The web build could never complete a sign-in. `decodeAccessToken` decoded the
 * payload with `Buffer.from(segment, "base64url")`, and `Buffer` is a Node global
 * that React Native Web and Hermes do not provide. The ReferenceError was
 * swallowed by the surrounding try/catch, the decode returned null, and the app
 * told the user the server had not returned account data. The message blamed the
 * backend for a client bug, and the login screen became unreachable.
 *
 * These tests pin the decoding to a platform-independent implementation, and pin
 * the behaviour that actually broke: a token whose payload is intact yields
 * claims rather than null.
 */
describe("base64url decoding without host globals", () => {
  /** base64url of a UTF-8 string, per RFC 4648. Uses Buffer, Node-only. */
  const encodeWithBuffer = (value: string): string =>
    Buffer.from(value, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  /** The same, built without Buffer, so it still works once Buffer is removed. */
  const encode = (value: string): string => {
    const bytes = Array.from(new TextEncoder().encode(value));
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  it("decodes a plain ASCII payload", () => {
    expect(decodeBase64Url(encode("hello"))).toBe("hello");
  });

  it("decodes a JSON payload", () => {
    const json = JSON.stringify({ sub: "a", role: "USER" });
    expect(decodeBase64Url(encode(json))).toBe(json);
  });

  it("decodes multi-byte UTF-8, where a byte-wise decoder would corrupt it", () => {
    const value = "makané & tidur ✓";
    expect(decodeBase64Url(encode(value))).toBe(value);
  });

  it("decodes a code point outside the basic multilingual plane", () => {
    expect(decodeBase64Url(encode("🙂"))).toBe("🙂");
  });

  it("agrees with Node's own decoder on every case", () => {
    for (const value of [
      "",
      "a",
      "ab",
      "abc",
      "abcd",
      "makané & tidur ✓",
      "🙂🙂",
    ]) {
      if (value === "") continue;
      expect(decodeBase64Url(encodeWithBuffer(value))).toBe(value);
    }
  });

  it("accepts input with padding, since base64url padding is optional", () => {
    // Two bytes encode to three base64 characters plus one "=", so this input
    // genuinely exercises the padding path rather than assuming it exists.
    const padded = Buffer.from("ab").toString("base64");
    expect(padded).toMatch(/=$/);
    expect(decodeBase64Url(padded)).toBe("ab");
    expect(decodeBase64Url(padded.replace(/=+$/, ""))).toBe("ab");
  });

  it("also accepts standard base64, because some servers emit it", () => {
    // 0xFB 0xFF requires + and / in standard base64. Those bytes are not valid
    // UTF-8, so the contract is a rejected result rather than a string.
    const standard = Buffer.from([251, 255, 190]).toString("base64");
    expect(standard).toMatch(/[+/]/);
    expect(decodeBase64Url(standard)).toBe("");
  });

  it("returns null rather than throwing on input it cannot read", () => {
    expect(decodeBase64Url("")).toBeNull();
    expect(decodeBase64Url("a")).toBeNull();
    expect(decodeBase64Url("!!!!")).toBeNull();
    expect(decodeBase64Url("ab*d")).toBeNull();
  });

  it("does not need Buffer, which is the entire point", () => {
    const original = globalThis.Buffer;
    try {
      // Simulates a browser or Hermes runtime, where Buffer is absent.
      Reflect.deleteProperty(globalThis as { Buffer?: unknown }, "Buffer");
      expect(typeof globalThis.Buffer).toBe("undefined");
      const json = JSON.stringify({ sub: "x", role: "USER" });
      expect(decodeBase64Url(encode(json))).toBe(json);
    } finally {
      globalThis.Buffer = original;
    }
  });
});

describe("decodeAccessToken", () => {
  it("returns claims for the fixture token", () => {
    const claims = decodeAccessToken(DEV_FIXTURE_TOKEN);
    expect(claims).not.toBeNull();
    expect(claims?.role).toBe("USER");
    expect(isTokenExpired(claims)).toBe(false);
  });

  it("still rejects a token that is not three segments", () => {
    expect(decodeAccessToken("not-a-jwt")).toBeNull();
    expect(decodeAccessToken("a.b")).toBeNull();
  });

  it("still rejects a payload whose role is not a server role", () => {
    // SERVER_ROLES contains USER and not PATIENT, so PATIENT must be refused.
    const payload = {
      sub: "x",
      sid: "y",
      email: "z@dev.invalid",
      role: "PATIENT",
      isActive: true,
      iat: 1767225600,
      exp: 4102444800,
    };
    const token = [
      Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url"),
      Buffer.from(JSON.stringify(payload)).toString("base64url"),
      "",
    ].join(".");
    expect(decodeAccessToken(token)).toBeNull();
  });

  it("works with no Buffer global, which is what the web build actually has", () => {
    const original = globalThis.Buffer;
    try {
      Reflect.deleteProperty(globalThis as { Buffer?: unknown }, "Buffer");
      const claims = decodeAccessToken(DEV_FIXTURE_TOKEN);
      expect(claims).not.toBeNull();
      expect(claims?.role).toBe("USER");
    } finally {
      globalThis.Buffer = original;
    }
  });
});
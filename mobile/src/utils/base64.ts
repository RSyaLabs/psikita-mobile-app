/**
 * Base64url decoding that assumes nothing about the host.
 *
 * Why this exists
 * ---------------
 * `decodeAccessToken` in `utils/jwt.ts` used `Buffer.from(segment, "base64url")`.
 * `Buffer` is a Node global. It is not provided by Hermes and not provided by
 * React Native Web, so on any web build that call threw a ReferenceError, the
 * surrounding try/catch turned it into a null decode, sign-in reported that the
 * server had not returned account data, and the user could never get past the
 * login screen. That is a total failure of authentication on web, hidden behind
 * a message that blamed the backend.
 *
 * `atob` was not used as the primary path either: it is absent from older
 * Hermes builds unless a polyfill is installed, and relying on it would move the
 * failure rather than remove it. A short explicit decoder works identically in
 * Node, Hermes and the browser, and needs no global beyond `String` and
 * `JSON.parse`.
 *
 * References
 * ----------
 * RFC 7519 section 2, the JWT header, defines base64url as the encoding of the
 * header and payload segments: https://www.rfc-editor.org/rfc/rfc7519#section-2
 * RFC 4648 section 5 defines the base64url alphabet and padding rules:
 * https://www.rfc-editor.org/rfc/rfc4648#section-5
 * `Buffer` is a Node API and is not part of any browser standard:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Buffer
 */

const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Reverse lookup table, -1 for characters outside the base64url alphabet. */
const LOOKUP = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < BASE64URL_ALPHABET.length; i += 1) {
    table[BASE64URL_ALPHABET.charCodeAt(i)] = i;
  }
  // RFC 4648 section 5: base64url is base64 with + and / replaced, and padding
  // optional. Standard base64 is accepted too, since some servers emit it.
  table["+".charCodeAt(0)] = 62;
  table["/".charCodeAt(0)] = 63;
  return table;
})();

/**
 * Decodes a base64url segment to a UTF-8 string.
 *
 * Returns null for input that is not valid base64url, so callers get the same
 * "cannot read this token" answer they already handle.
 */
export function decodeBase64Url(segment: string): string | null {
  if (typeof segment !== "string" || segment.length === 0) return null;

  // RFC 4648: padding is optional in base64url, so a trailing = is tolerated
  // and then ignored.
  const cleaned = segment.replace(/=+$/, "");
  if (cleaned.length % 4 === 1) return null;

  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < cleaned.length; i += 1) {
    const code = cleaned.charCodeAt(i);
    const value = code < 128 ? LOOKUP[code] : -1;
    if (value < 0) return null;

    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return utf8Decode(bytes);
}

/**
 * UTF-8 decode by hand, because TextDecoder is not guaranteed on Hermes and its
 * absence would reintroduce the same class of bug.
 */
function utf8Decode(bytes: number[]): string {
  let result = "";
  for (let i = 0; i < bytes.length; ) {
    const first = bytes[i];
    let codePoint: number;
    let size: number;

    if (first < 0x80) {
      codePoint = first;
      size = 1;
    } else if ((first & 0xe0) === 0xc0) {
      codePoint = first & 0x1f;
      size = 2;
    } else if ((first & 0xf0) === 0xe0) {
      codePoint = first & 0x0f;
      size = 3;
    } else if ((first & 0xf8) === 0xf0) {
      codePoint = first & 0x07;
      size = 4;
    } else {
      // A leading byte that matches no UTF-8 pattern is not valid input.
      return "";
    }

    if (i + size > bytes.length) return "";
    for (let k = 1; k < size; k += 1) {
      const continuation = bytes[i + k];
      if ((continuation & 0xc0) !== 0x80) return "";
      codePoint = (codePoint << 6) | (continuation & 0x3f);
    }

    result += String.fromCodePoint(codePoint);
    i += size;
  }
  return result;
}
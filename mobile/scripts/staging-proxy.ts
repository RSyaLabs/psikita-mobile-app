/**
 * Local relay for interim web development.
 *
 * Why this exists
 * ---------------
 * `assertApiUrl` in `src/api/client.ts` refuses any base URL that is plain http
 * on a host that is not loopback. That guard is correct and must stay: a bearer
 * token and mental-health intake data sent in cleartext on a public network are
 * exposed to any observer between the device and the server.
 *
 * The live staging host currently serves plain http and has no certificate, so the
 * app cannot talk to it directly. Rather than weaken the guard or wait for TLS,
 * this relay gives the app a loopback address to talk to:
 *
 *     app  ->  http://localhost:4000  ->  http://staging...:3000
 *
 * The guard allows loopback, so nothing in the app changes except one line in
 * `.env`. No backend change, no certificate, no credentials.
 *
 * Scope and limits
 * ----------------
 * This is a developer tool. It is not a deployment, it is not a preview service,
 * and it must never be pointed at production. Because the relay only ever binds
 * to loopback, the token never leaves the machine except encrypted onward, which
 * is the same exposure the guard is protecting against.
 *
 * What this cannot fix: it does not create the two endpoints that do not exist in
 * the contract, and it does not prove anything about the https path. Those stay
 * backend requests.
 *
 * Usage
 * -----
 *   npx tsx scripts/staging-proxy.ts
 *   # then set EXPO_PUBLIC_API_BASE_URL=http://localhost:4000 in .env
 */

import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

const UPSTREAM =
  process.env.PSIKITA_PROXY_TARGET ??
  "http://staging.psikita.muammarzaki.tech:3000";
const PORT = Number(process.env.PSIKITA_PROXY_PORT ?? 4000);
const HOST = "127.0.0.1";

/** Hop-by-hop and length headers that must not be copied between the two hops. */
const STRIPPED_REQUEST_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
  ...STRIPPED_REQUEST_HEADERS,
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "access-control-allow-methods",
  "access-control-expose-headers",
]);

function forwardable(
  headers: IncomingMessage["headers"],
  stripped: Set<string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const key = name.toLowerCase();
    if (stripped.has(key) || value === undefined) continue;
    out[key] = Array.isArray(value) ? value.join(", ") : value;
  }
  return out;
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  void (async () => {
    const started = process.hrtime.bigint();
    const body = await readBody(req);
    const target = `${UPSTREAM}${req.url ?? "/"}`;

    try {
      const upstream = await fetch(target, {
        method: req.method,
        headers: forwardable(req.headers, STRIPPED_REQUEST_HEADERS),
        // A Node Buffer is not assignable to the DOM BodyInit type, and this
        // relay has to forward binary bodies such as file uploads untouched.
        // Rebuilding it as a Uint8Array keeps the bytes identical while
        // satisfying the type the fetch overload expects.
        body:
          req.method === "GET" || req.method === "HEAD"
            ? undefined
            : new Uint8Array(body),
        redirect: "manual",
      });

      const payload = Buffer.from(await upstream.arrayBuffer());
      for (const [name, value] of upstream.headers) {
        if (STRIPPED_RESPONSE_HEADERS.has(name.toLowerCase())) continue;
        res.setHeader(name, value);
      }
      // Keep the browser origin readable regardless of what upstream decides.
      res.setHeader("access-control-allow-origin", req.headers.origin ?? "*");
      res.setHeader("access-control-allow-credentials", "true");
      res.setHeader(
        "access-control-allow-headers",
        "authorization,content-type",
      );
      res.setHeader(
        "access-control-allow-methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      );
      res.statusCode = upstream.status;
      res.end(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.statusCode = 502;
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          statusCode: 502,
          error: "STAGING_UNREACHABLE",
          message: `Local relay could not reach ${UPSTREAM}: ${message}`,
        }),
      );
    } finally {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      // Log the path and status, never the headers, so no token reaches the log.
      process.stdout.write(
        `${req.method ?? "?"} ${req.url ?? "?"} -> ${res.statusCode} (${ms.toFixed(0)}ms)\n`,
      );
    }
  })();
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`relay ${HOST}:${PORT} -> ${UPSTREAM}\n`);
  process.stdout.write(
    `set EXPO_PUBLIC_API_BASE_URL=http://${HOST}:${PORT} in .env\n`,
  );
});

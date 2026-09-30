import { ApiError, apiRequest } from "@/api/client";

const acceptResponse = (value: unknown): unknown => value;

const originalFetch = global.fetch;

function response({
  status = 200,
  body,
  contentType = "application/json",
}: {
  status?: number;
  body?: unknown;
  contentType?: string;
}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => contentType },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === "string" ? body : ""),
  } as unknown as Response;
}

describe("apiRequest failure propagation", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it("propagates network failures without returning data", async () => {
    const failure = new Error("network unavailable");
    global.fetch = jest
      .fn()
      .mockRejectedValue(failure) as unknown as typeof fetch;

    await expect(
      apiRequest("/network", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toBe(failure);
  });

  it("converts a timed-out request to a typed API error", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
    ) as unknown as typeof fetch;

    const request = apiRequest("/timeout", {
      skipAuth: true,
      timeoutMs: 25,
      adapter: acceptResponse,
    });
    jest.advanceTimersByTime(25);

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 408,
    });
  });

  it("preserves HTTP failures as typed API errors", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 502, body: { message: "upstream failed" } }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest("/http", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toMatchObject<ApiError>({
      name: "ApiError",
      statusCode: 502,
      message: "upstream failed",
    });
  });

  it("propagates malformed JSON failures", async () => {
    const parseFailure = new SyntaxError("Unexpected token");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: jest.fn().mockRejectedValue(parseFailure),
    } as unknown as Response) as unknown as typeof fetch;

    await expect(
      apiRequest("/malformed", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toBe(parseFailure);
  });
});

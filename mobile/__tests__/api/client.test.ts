import { ApiError, apiRequest, checkBackendHealth } from "@/api/client";
import { noContentAdapter } from "@/api/response";

const acceptResponse = (value: unknown): unknown => value;

const webStorage = jest.requireActual("../../src/utils/storage.ts") as {
  secureStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
};

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

function abortError(): Error {
  const error = new Error("aborted");
  error.name = "AbortError";
  return error;
}

describe("apiRequest contract boundary", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
  });

  it("preserves HTTP 401 status and message", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 401, body: { message: "Authentication required" } }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest("/unauthorized", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 401,
      message: "Authentication required",
    });
  });

  it("rejects a bodyless HTTP error before no-content handling", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ...response({ status: 401 }),
      body: null,
    } as unknown as Response) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
        adapter: noContentAdapter,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 401,
      message: "HTTP 401",
    });
  });

  it("preserves a safe HTTP 422 validation message without retaining the body", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        status: 422,
        body: {
          message: ["Email is required", "Password is too short"],
          debugPayload: "do-not-expose",
        },
      }),
    ) as unknown as typeof fetch;

    let thrown: unknown;
    try {
      await apiRequest("/invalid", { skipAuth: true, adapter: acceptResponse });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect(thrown).toMatchObject({
      statusCode: 422,
      message: "Email is required, Password is too short",
    });
    expect((thrown as ApiError).details).toBeUndefined();
  });

  it("propagates network failures", async () => {
    const failure = new Error("network unavailable");
    global.fetch = jest
      .fn()
      .mockRejectedValue(failure) as unknown as typeof fetch;

    await expect(
      apiRequest("/network", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toBe(failure);
  });

  it("propagates malformed JSON responses", async () => {
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

  it("converts only the internal timeout into HTTP 408", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(abortError()));
        }),
    ) as unknown as typeof fetch;

    const request = apiRequest("/timeout", {
      skipAuth: true,
      timeoutMs: 25,
      adapter: acceptResponse,
    });
    await Promise.resolve();
    jest.advanceTimersByTime(25);

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 408,
    });
    expect(jest.getTimerCount()).toBe(0);
  });

  it("keeps caller cancellation distinct from a server timeout", async () => {
    const caller = new AbortController();
    let fetchSignal: AbortSignal | undefined;

    global.fetch = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          fetchSignal = init?.signal ?? undefined;
          fetchSignal?.addEventListener("abort", () => reject(abortError()));
        }),
    ) as unknown as typeof fetch;

    const request = apiRequest("/cancelled", {
      skipAuth: true,
      signal: caller.signal,
      adapter: acceptResponse,
    });
    await Promise.resolve();
    caller.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchSignal?.aborted).toBe(true);
  });

  it("validates successful JSON with a supplied adapter", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 200, body: { id: 42 } }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest<{ id: string }>("/shape", {
        skipAuth: true,
        adapter: (value) => {
          if (
            !value ||
            typeof value !== "object" ||
            !("id" in value) ||
            typeof value.id !== "string"
          ) {
            throw new Error("invalid shape");
          }
          return { id: value.id };
        },
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects a non-JSON successful response as INVALID_RESPONSE", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 200, body: "not-json", contentType: "text/plain" }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest("/non-json", { skipAuth: true, adapter: acceptResponse }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects a non-local cleartext URL before fetching", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(response({ body: { ok: true } }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      apiRequest("http://api.example.test/records", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 0,
      error: "INSECURE_API_URL",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows HTTPS URLs", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ body: { ok: true } }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("rejects a successful request without an explicit runtime adapter", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(response({ body: { ok: true } }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
      } as never),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "MISSING_RESPONSE_ADAPTER",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects redirects instead of allowing an HTTPS downgrade", async () => {
    const redirectFailure = new TypeError("redirect blocked");
    const fetchMock = jest.fn(
      (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.redirect !== "error") {
          return Promise.resolve(response({ body: { ok: true } }));
        }
        return Promise.reject(redirectFailure);
      },
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toBe(redirectFailure);
  });

  it("rejects a reported redirect into cleartext even if fetch ignores the mode", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ...response({ body: { ok: true } }),
      redirected: true,
      url: "http://api.example.test/records",
    } as unknown as Response) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 0,
      error: "INSECURE_API_URL",
    });
  });

  it("cleans the caller listener and timeout after a successful request", async () => {
    jest.useFakeTimers();
    const caller = new AbortController();
    const removeListener = jest.spyOn(caller.signal, "removeEventListener");
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ body: { ok: true } }),
      ) as unknown as typeof fetch;

    await apiRequest("https://api.example.test/records", {
      skipAuth: true,
      signal: caller.signal,
      adapter: acceptResponse,
    });

    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(jest.getTimerCount()).toBe(0);
    removeListener.mockRestore();
  });

  it("rejects a successful empty 201 response for a non-no-content adapter", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 201, body: undefined }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/created-empty", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("accepts a successful empty 201 response with the explicit no-content adapter", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ status: 201, body: undefined }),
      ) as unknown as typeof fetch;

    await expect(
      apiRequest<void>("https://api.example.test/created-empty", {
        skipAuth: true,
        adapter: noContentAdapter,
      }),
    ).resolves.toBeUndefined();
  });

  it("parses no-content responses only through the explicit no-content adapter", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response({ status: 204 })) as unknown as typeof fetch;

    await expect(
      apiRequest<void>("https://api.example.test/no-content", {
        skipAuth: true,
        adapter: noContentAdapter,
      }),
    ).resolves.toBeUndefined();
  });

  it("accepts the documented no-content health response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response({ status: 204 })) as unknown as typeof fetch;

    await expect(checkBackendHealth()).resolves.toBe(true);
  });

  it("keeps health checks boolean and does not expose request errors", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new Error("private backend detail"),
      ) as unknown as typeof fetch;

    await expect(checkBackendHealth()).resolves.toBe(false);
  });
});

describe("web storage", () => {
  it("keeps bearer tokens in memory instead of browser localStorage", async () => {
    const localStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    const previousWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { localStorage },
    });

    try {
      await webStorage.secureStorage.setItem(
        "psikita_access_token",
        "test-token",
      );
      await expect(
        webStorage.secureStorage.getItem("psikita_access_token"),
      ).resolves.toBe("test-token");
      await webStorage.secureStorage.removeItem("psikita_access_token");
      await expect(
        webStorage.secureStorage.getItem("psikita_access_token"),
      ).resolves.toBeNull();
      expect(localStorage.getItem).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    } finally {
      if (previousWindow) {
        Object.defineProperty(globalThis, "window", previousWindow);
      } else {
        delete (globalThis as { window?: unknown }).window;
      }
    }
  });
});

const mockStorageReads: Array<(value: string | null) => void> = [];
const originalFetch = global.fetch;

jest.mock("@/utils/storage", () => ({
  secureStorage: {
    getItem: jest.fn(
      () =>
        new Promise<string | null>((resolve) => {
          mockStorageReads.push(resolve);
        }),
    ),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

function loadClient() {
  jest.resetModules();
  return require("@/api/client") as typeof import("@/api/client");
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    redirected: false,
    url: "",
    body: {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
  } as unknown as Response;
}

describe("API client token hydration ordering", () => {
  beforeEach(() => {
    mockStorageReads.length = 0;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("does not let an old eager read overwrite a newly accepted token", async () => {
    const client = await loadClient();
    expect(mockStorageReads).toHaveLength(1);

    client.setAuthToken("new-session");
    mockStorageReads[0]("old-session");
    await flushPromises();

    await expect(client.getAuthToken()).resolves.toBe("new-session");
  });

  it("does not let an old lazy read restore a token after logout", async () => {
    const client = await loadClient();
    mockStorageReads[0](null);
    await flushPromises();

    const pendingRead = client.getAuthToken();
    await flushPromises();
    expect(mockStorageReads).toHaveLength(2);
    client.setAuthToken(null);
    mockStorageReads[1]("old-session");

    await expect(pendingRead).resolves.toBeNull();
  });

  it("does not adapt a response that resolves after the auth context changes", async () => {
    const client = await loadClient();
    mockStorageReads[0]("old-session");
    await flushPromises();
    client.setAuthToken("old-session");

    let resolveFetch: (value: Response) => void = () => undefined;
    global.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    ) as unknown as typeof fetch;
    const adapter = jest.fn((value: unknown) => value);

    const request = client.apiRequest("/patient/me", { adapter });
    await flushPromises();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    client.invalidateAuthContext();
    resolveFetch(jsonResponse({ id: "old-session-response" }));

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      error: "AUTH_CONTEXT_CHANGED",
    });
    expect(adapter).not.toHaveBeenCalled();
  });

  it("does not adapt a request started during logout after token cleanup", async () => {
    const client = await loadClient();
    mockStorageReads[0]("old-session");
    await flushPromises();
    client.setAuthToken("old-session");
    client.invalidateAuthContext();

    let resolveFetch: (value: Response) => void = () => undefined;
    global.fetch = jest.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    ) as unknown as typeof fetch;
    const adapter = jest.fn((value: unknown) => value);

    const request = client.apiRequest("/patient/me", { adapter });
    await flushPromises();
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await client.setAuthToken(null);
    resolveFetch(jsonResponse({ id: "old-session-response" }));

    await expect(request).rejects.toMatchObject({
      name: "ApiError",
      error: "AUTH_CONTEXT_CHANGED",
    });
    expect(adapter).not.toHaveBeenCalled();
  });
});

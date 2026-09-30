import { authService } from "@/api/auth.service";

/**
 * These tests pin the client to staging-openapi.json, the contract of record.
 *
 * Before this file existed, the zod schemas in auth.service.ts had zero
 * coverage. Every auth test in the suite mocked apiRequest or the service
 * itself, so a response that no server can produce still passed CI. That is
 * how a client requiring a `user` field survived against a contract whose
 * TokenResponseDto has only accessToken and refreshToken.
 *
 * The bodies below are copied field-for-field from staging-openapi.json.
 */

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => "application/json" },
    text: async () => JSON.stringify(body),
    json: async () => body,
  }) as unknown as Response;

const originalFetch = global.fetch;

function mockFetchOnce(response: Response) {
  const fetchMock = jest.fn().mockResolvedValue(response);
  (global as unknown as { fetch: unknown }).fetch = fetchMock;
  return fetchMock;
}

/** Shape from staging-openapi.json#/components/schemas/TokenResponseDto */
const CONTRACT_TOKEN_RESPONSE = {
  accessToken: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMU0zIn0.signature",
  refreshToken: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
};

describe("authService against the contract of record", () => {
  afterEach(() => {
    (global as unknown as { fetch: unknown }).fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("accepts the login response the contract actually specifies", async () => {
    // staging-openapi.json TokenResponseDto: { accessToken, refreshToken }.
    // There is no `user` property, and both token fields are required.
    mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE));

    const res = await authService.loginWithPassword({
      username: "ADMIN_LOCAL",
      password: "secret",
    });

    expect(res.accessToken).toBe(CONTRACT_TOKEN_RESPONSE.accessToken);
    expect(res.refreshToken).toBe(CONTRACT_TOKEN_RESPONSE.refreshToken);
  });

  it("sends the field name the login DTO requires and no other", async () => {
    const fetchMock = mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE));

    await authService.loginWithPassword({
      username: "ADMIN_LOCAL",
      password: "secret",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(Object.keys(body).sort()).toEqual(["password", "username"]);
  });

  it("reaches the same success whether the caller says username or usernameOrEmail", async () => {
    // The real login form sends `username`. The integration harness used to
    // send `usernameOrEmail`, which the service forwarded verbatim, and the
    // server answered 422 {"username":{"message":"Invalid username format"}}.
    mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE));
    await authService.loginWithPassword({
      usernameOrEmail: "ADMIN_LOCAL",
      password: "secret",
    });
    const viaLegacyField = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );

    (global as unknown as { fetch: unknown }).fetch = originalFetch;
    mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE));
    await authService.loginWithPassword({
      username: "ADMIN_LOCAL",
      password: "secret",
    });
    const viaUsername = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );

    expect(viaLegacyField).toEqual(viaUsername);
  });

  it("sends `otp` on verify, which is the field the contract names", async () => {
    // staging-openapi.json VerifyOtpDto: { email, otp }. Sending `code`
    // returned 422 {"otp":{"message":"OTP code must consist of digits only"}},
    // proving the server read `otp` and found it missing.
    const fetchMock = mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE, 200));

    await authService.verifyOtp({
      email: "patient@example.com",
      otp: "123456",
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.otp).toBe("123456");
    expect(body).not.toHaveProperty("code");
  });

  it("parses the verify response the contract specifies", async () => {
    // staging-openapi.json /auth/otp/verify 200 -> TokenResponseDto, which has
    // no `message`. The old adapter required { message }, so a successful
    // verification would surface as 502 INVALID_RESPONSE.
    mockFetchOnce(jsonResponse(CONTRACT_TOKEN_RESPONSE));

    const res = await authService.verifyOtp({
      email: "patient@example.com",
      otp: "123456",
    });

    expect(res).toMatchObject({
      accessToken: CONTRACT_TOKEN_RESPONSE.accessToken,
    });
  });
});

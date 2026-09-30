import {
  ApiError,
  noContentAdapter,
  parseApiData,
  requireServerId,
} from "@/api/response";

describe("parseApiData", () => {
  it("returns the value produced by a valid adapter", () => {
    const adapter = jest.fn((value: unknown) => {
      if (
        !value ||
        typeof value !== "object" ||
        !("id" in value) ||
        typeof value.id !== "string"
      ) {
        throw new Error("invalid payload");
      }
      return { id: value.id };
    });

    expect(parseApiData({ id: "record-1" }, adapter)).toEqual({
      id: "record-1",
    });
    expect(adapter).toHaveBeenCalledWith({ id: "record-1" });
  });

  it("rejects invalid values with a safe typed error", () => {
    let thrown: unknown;

    try {
      parseApiData({ id: 42 }, () => {
        throw new Error("raw payload must not escape");
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(ApiError);
    expect(thrown).toMatchObject({
      name: "ApiError",
      message: "INVALID_RESPONSE",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
    expect((thrown as ApiError).details).toBeUndefined();
  });
});

describe("noContentAdapter", () => {
  it("accepts only an absent response body", () => {
    expect(noContentAdapter(undefined)).toBeUndefined();
    expect(() => noContentAdapter({ ok: true })).toThrow();
  });
});

describe("requireServerId", () => {
  it("returns trimmed string on valid input", () => {
    expect(requireServerId("  consultation_123  ", "consultationId")).toBe(
      "consultation_123",
    );
  });

  it("throws ApiError 400 when input is empty or whitespace", () => {
    expect(() => requireServerId("", "consultationId")).toThrow(ApiError);
    expect(() => requireServerId("   ", "roomId")).toThrow(
      "roomId is required",
    );

    try {
      requireServerId("", "testId");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(400);
      expect((err as ApiError).error).toBe("INVALID_REQUEST");
    }
  });
});

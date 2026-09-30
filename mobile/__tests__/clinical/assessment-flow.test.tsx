import React from "react";
import { triageService } from "@/api/triage.service";
import {
  ASSESSMENT_UNAVAILABLE_MESSAGE,
  isAssessmentResult,
  validateAssessmentResult,
} from "@/clinical/assessment";

const originalFetch = global.fetch;

/**
 * Mutable route params. The previous version of the guest case read
 * triage.tsx and assessment-result.tsx off disk and asserted the strings
 * "score: 14", "12 / 21", "Tingkat Kecemasan Sedang" and "RM-2026-8821" were
 * absent from the source. That passed regardless of what the screen rendered.
 * This renders both screens and asserts on the text that reaches the page.
 */
const mockParams: Record<string, string> = {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));
jest.mock("@/utils/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "",
    body: body === undefined ? null : {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
  } as unknown as Response;
}

const validServerResult = {
  id: "triage-server-1",
  patientId: "patient-server-1",
  assessedBy: "patient-server-1",
  assessmentType: "SELF_ASSESSMENT",
  score: 8,
  hasRedFlags: false,
  level: "YELLOW",
  disposition: "COUNSELING",
  answers: { frequency: "Sering" },
  notes: "Catatan dari server",
  createdAt: "2026-09-24T00:00:00.000Z",
  updatedAt: "2026-09-24T00:00:00.000Z",
};

/** Every string the screen actually put on the page. */
function renderText(
  screenPath: string,
  params: Record<string, string>,
): string {
  Object.keys(mockParams).forEach((k) => delete mockParams[k]);
  Object.assign(mockParams, params);

  const { QueryClientProvider } = require("@tanstack/react-query");
  const { createTestQueryClient } = require("../utils/test-utils");
  const { render } = require("@testing-library/react-native");
  const Screen = require(screenPath).default;

  const queryClient = createTestQueryClient();
  const { toJSON } = render(
    <QueryClientProvider client={queryClient}>
      <Screen />
    </QueryClientProvider>,
  );

  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (node === null || node === undefined) return;
    if (typeof node === "string") {
      if (node.trim()) out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const children = (node as { children?: unknown }).children;
    if (children) walk(children);
  };
  walk(toJSON());
  return out.join(" · ");
}

describe("clinical assessment flow", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("rejects missing clinical request data instead of inventing score, flags, or type", async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await expect(
      triageService.submitTriage({ answers: {} } as never),
    ).rejects.toMatchObject({
      name: "ApiError",
      error: "INVALID_REQUEST",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("maps only a complete server assessment response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response(validServerResult, 201),
      ) as unknown as typeof fetch;

    const result = await triageService.submitTriage({
      score: 8,
      hasRedFlags: false,
      assessmentType: "SELF_ASSESSMENT",
      answers: { frequency: "Sering" },
    });

    expect(result).toMatchObject({
      id: validServerResult.id,
      score: validServerResult.score,
      hasRedFlags: false,
      assessmentType: "SELF_ASSESSMENT",
      level: "YELLOW",
    });
    const [, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(request.body)).toEqual({
      score: 8,
      hasRedFlags: false,
      assessmentType: "SELF_ASSESSMENT",
      answers: { frequency: "Sering" },
    });
  });

  it("rejects a triage detail response for another requested ID", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ ...validServerResult, id: "triage-other" }),
      ) as unknown as typeof fetch;

    await expect(
      triageService.getById("triage-server-1"),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("treats incomplete or fabricated assessment data as unknown", () => {
    expect(() =>
      validateAssessmentResult({ ...validServerResult, score: undefined }),
    ).toThrow();
    expect(() =>
      validateAssessmentResult({
        ...validServerResult,
        hasRedFlags: undefined,
      }),
    ).toThrow();
    expect(() =>
      validateAssessmentResult({
        ...validServerResult,
        assessmentType: undefined,
      }),
    ).toThrow();
    expect(isAssessmentResult({ score: 14, hasRedFlags: false })).toBe(false);
  });

  it("renders no invented score, severity label or record number to a guest", () => {
    expect(ASSESSMENT_UNAVAILABLE_MESSAGE).toMatch(/tidak tersedia/i);

    const triage = renderText("../../app/(patient)/patient/triage", {
      guest: "true",
    });
    const result = renderText("../../app/(patient)/patient/assessment-result", {
      guest: "true",
    });

    for (const fabricated of [
      "score: 14",
      "Asesmen mandiri mobile",
      "12 / 21",
      "Tingkat Kecemasan Sedang",
      "RM-2026-8821",
      "Generalized Anxiety Disorder",
    ]) {
      expect(triage).not.toContain(fabricated);
      expect(result).not.toContain(fabricated);
    }

    expect(triage).toContain("Asesmen");
    expect(result.toLowerCase()).toContain("belum tersedia");
  });
});

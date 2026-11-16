import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import { paginatedAdapter, requireServerId } from "./response";
import {
  assessmentResultSchema,
  validateAssessmentResult,
} from "@/clinical/assessment";
import { SubmitTriageDto, TriageResponseDto } from "@/types/api";

const triageRequestSchema = z.object({
  questionnaireType: z.literal("PHQ_9").optional(),
  assessmentType: z.enum(["SELF_ASSESSMENT", "PRACTITIONER_ASSESSMENT"]),
  answers: z.record(z.string(), z.number().int().nonnegative()),
  complaintContextTags: z.array(z.enum(["WORK", "STUDY", "FAMILY", "RELATIONSHIP", "HEALTH", "FINANCIAL", "OTHER"])).optional(),
  functionalImpact: z.enum(["NONE", "MILD", "MODERATE", "SEVERE"]).optional(),
  symptomDurationBand: z.enum(["LT_2_WEEKS", "W2_TO_3_MONTHS", "GT_3_MONTHS"]).optional(),
  urgencySelfRating: z.number().int().min(0).max(10).optional(),
  notes: z.string().optional(),
});

function parseRequest(value: SubmitTriageDto) {
  try {
    return triageRequestSchema.parse({
      questionnaireType: value.questionnaireType ?? "PHQ_9",
      assessmentType: value.assessmentType ?? "SELF_ASSESSMENT",
      answers: value.answers,
      ...(value.notes === undefined ? {} : { notes: value.notes }),
      ...(value.complaintContextTags === undefined ? {} : { complaintContextTags: value.complaintContextTags }),
      ...(value.functionalImpact === undefined ? {} : { functionalImpact: value.functionalImpact }),
      ...(value.symptomDurationBand === undefined ? {} : { symptomDurationBand: value.symptomDurationBand }),
      ...(value.urgencySelfRating === undefined ? {} : { urgencySelfRating: value.urgencySelfRating }),
    });
  } catch {
    throw new ApiError(
      "Invalid triage assessment request",
      400,
      "INVALID_REQUEST",
    );
  }
}

const triageAdapter = (expectedId?: string) => {
  const normalizedExpectedId = expectedId?.trim();

  return (value: unknown): TriageResponseDto => {
    const result = validateAssessmentResult(value);
    if (
      normalizedExpectedId !== undefined &&
      result.id.trim() !== normalizedExpectedId
    ) {
      throw new Error(
        "Triage response does not belong to the requested record",
      );
    }
    return result;
  };
};

export const triageService = {
  /** Submit a complete triage intake; scoring and disposition are server-owned. */
  async submitTriage(dto: SubmitTriageDto): Promise<TriageResponseDto> {
    const payload = parseRequest(dto);

    return apiRequest<TriageResponseDto>("/triage", {
      method: "POST",
      body: JSON.stringify(payload),
      adapter: triageAdapter(),
    });
  },

  /** Read a server-confirmed triage decision by its server-issued ID. */
  async getById(id: string, signal?: AbortSignal): Promise<TriageResponseDto> {
    const normalizedId = requireServerId(id, "triageId");
    return apiRequest<TriageResponseDto>(
      `/triage/${encodeURIComponent(normalizedId)}`,
      {
        adapter: triageAdapter(normalizedId),
        signal,
      },
    );
  },

  /** Patient-scoped triage intake history. */
  async getMyHistory(page = 1, limit = 10, signal?: AbortSignal) {
    return apiRequest<import("./response").PaginatedResult<TriageResponseDto>>(
      `/triage/me/history?page=${Math.max(1, Math.floor(page))}&limit=${Math.min(100, Math.max(1, Math.floor(limit)))}`,
      { signal, adapter: paginatedAdapter(triageAdapter()) },
    );
  },

  /** Patient's most recent triage intake, not necessarily their current care episode. */
  async getMyLatest(signal?: AbortSignal): Promise<TriageResponseDto> {
    return apiRequest<TriageResponseDto>("/triage/me/latest", {
      signal, adapter: triageAdapter(),
    });
  },

  /** List the server-confirmed triage queue. */
  async getTriageQueue(signal?: AbortSignal): Promise<import("./response").PaginatedResult<TriageResponseDto>> {
    return apiRequest<import("./response").PaginatedResult<TriageResponseDto>>("/triage/queue", {
      adapter: paginatedAdapter(triageAdapter()),
      signal,
    });
  },
};

export { assessmentResultSchema };

import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import { arrayAdapter, requireServerId } from "./response";
import {
  assessmentResultSchema,
  validateAssessmentResult,
} from "@/clinical/assessment";
import { SubmitTriageDto, TriageResponseDto } from "@/types/api";

const triageRequestSchema = z.object({
  score: z.number().finite(),
  hasRedFlags: z.boolean(),
  assessmentType: z.enum(["SELF_ASSESSMENT", "PRACTITIONER_ASSESSMENT"]),
  answers: z.record(z.string(), z.unknown()),
  notes: z.string().optional(),
});

function parseRequest(value: SubmitTriageDto) {
  try {
    return triageRequestSchema.parse({
      score: value.score,
      hasRedFlags: value.hasRedFlags,
      assessmentType: value.assessmentType,
      answers: value.answers,
      ...(value.notes === undefined ? {} : { notes: value.notes }),
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
  /** Submit a complete, explicitly supplied assessment to the server. */
  async submitTriage(dto: SubmitTriageDto): Promise<TriageResponseDto> {
    const payload = parseRequest(dto);

    return apiRequest<TriageResponseDto>("/triage", {
      method: "POST",
      body: JSON.stringify(payload),
      adapter: triageAdapter(),
    });
  },

  /** Read a server-confirmed assessment by its server-issued ID. */
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

  /** List the server-confirmed triage queue. */
  async getTriageQueue(signal?: AbortSignal): Promise<TriageResponseDto[]> {
    return apiRequest<TriageResponseDto[]>("/triage/queue", {
      adapter: arrayAdapter(triageAdapter()),
      signal,
    });
  },
};

export { assessmentResultSchema };

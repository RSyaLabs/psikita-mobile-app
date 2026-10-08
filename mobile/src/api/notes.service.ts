import { z } from "zod";
import { ApiError, apiRequest } from "./client";
import { collectionAdapter, requireServerId } from "./response";
import { CreateSoapNoteDto, NoteResponseDto } from "@/types/api";

const noteSchema = z
  .object({
    id: z.string().trim().min(1),
    consultationId: z.string().trim().min(1),
    messageIds: z.array(z.string().trim().min(1)).optional(),
    contentType: z.enum(["text", "soap"]),
    text: z.string().optional(),
    soap: z
      .object({
        subjective: z.string().trim().min(1),
        objective: z.string().trim().min(1),
        assessment: z.string().trim().min(1),
        plan: z.string().trim().min(1),
      })
      .optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .superRefine((note, ctx) => {
    if (note.contentType === "soap" && !note.soap) {
      ctx.addIssue({
        code: "custom",
        path: ["soap"],
        message: "SOAP content is required",
      });
    }
    if (note.contentType === "text" && note.text === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["text"],
        message: "Text content is required",
      });
    }
  });

function noteAdapter(expectedConsultationId: string) {
  return (value: unknown): NoteResponseDto => {
    const note = noteSchema.parse(value);
    if (note.consultationId !== expectedConsultationId) {
      throw new Error(
        "SOAP note does not belong to the requested consultation",
      );
    }
    const type = note.contentType === "soap" ? "SOAP" : "FREE_TEXT";
    return {
      id: note.id,
      consultationId: note.consultationId,
      contentType: note.contentType,
      text: note.text,
      soap: note.soap,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // Compatibility projections are derived only from validated response data.
      type,
      content: note.text,
      soapData: note.soap,
    };
  };
}

const soapRequestSchema = z.object({
  subjective: z.string().trim().min(1),
  objective: z.string().trim().min(1),
  assessment: z.string().trim().min(1),
  plan: z.string().trim().min(1),
  messageIds: z.array(z.string().trim().min(1)).optional(),
});

function parseSoapRequest(dto: CreateSoapNoteDto) {
  try {
    return soapRequestSchema.parse({
      subjective: dto.subjective,
      objective: dto.objective,
      assessment: dto.assessment,
      plan: dto.plan,
      ...(dto.messageIds === undefined ? {} : { messageIds: dto.messageIds }),
    });
  } catch {
    throw new ApiError("Invalid SOAP request", 400, "INVALID_REQUEST");
  }
}

export const notesService = {
  /** Save a SOAP note; this write is independent from finishing a consultation. */
  async createSoapNote(
    consultationId: string,
    dto: CreateSoapNoteDto,
  ): Promise<NoteResponseDto> {
    const normalizedId = requireServerId(consultationId, "consultationId");
    const payload = parseSoapRequest(dto);
    return apiRequest<NoteResponseDto>(
      `/consultation/${encodeURIComponent(normalizedId)}/soap`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        adapter: noteAdapter(normalizedId),
      },
    );
  },

  async getNotesByConsultation(
    consultationId: string,
    signal?: AbortSignal,
  ): Promise<NoteResponseDto[]> {
    const normalizedId = requireServerId(consultationId, "consultationId");
    return apiRequest<NoteResponseDto[]>(
      `/consultation/${encodeURIComponent(normalizedId)}/notes`,
      {
        adapter: collectionAdapter(noteAdapter(normalizedId)),
        signal,
      },
    );
  },
};

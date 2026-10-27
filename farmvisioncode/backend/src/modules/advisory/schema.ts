import { z } from "zod";

const idSchema = z.string().uuid();
const optionalMessage = z.string().trim().max(1000).optional();

export const farmAccessRequestSchema = z.object({
  farmId: idSchema,
}).strict();

export const farmAccessActionSchema = z.object({
  action: z.enum(["APPROVE", "DECLINE", "REVOKE"]),
  message: z.string().trim().max(500).optional(),
}).strict();

export const advisoryNoteCreateSchema = z.object({
  farmId: idSchema,
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(5000),
  readingIds: z.array(idSchema).max(20).default([]),
  recommendationIds: z.array(idSchema).max(20).default([]),
}).strict().superRefine((value, context) => {
  if (value.readingIds.length + value.recommendationIds.length === 0) {
    context.addIssue({
      code: "custom",
      message: "Select at least one telemetry reading or recommendation as evidence.",
      path: ["readingIds"],
    });
  }
  if (new Set(value.readingIds).size !== value.readingIds.length) {
    context.addIssue({
      code: "custom",
      message: "A telemetry reading may be selected only once.",
      path: ["readingIds"],
    });
  }
  if (new Set(value.recommendationIds).size !== value.recommendationIds.length) {
    context.addIssue({
      code: "custom",
      message: "A recommendation may be selected only once.",
      path: ["recommendationIds"],
    });
  }
});

export const recommendationReviewRequestSchema = z.object({
  recommendationId: idSchema,
  agronomistId: idSchema,
  submissionNote: optionalMessage,
}).strict();

export const recommendationReviewActionSchema = z.object({
  action: z.enum([
    "APPROVE",
    "REQUEST_CHANGES",
    "NOT_RECOMMENDED",
    "ACCEPT",
    "DECLINE",
  ]),
  message: optionalMessage,
}).strict();

export type FarmAccessRequestInput = z.infer<typeof farmAccessRequestSchema>;
export type FarmAccessActionInput = z.infer<typeof farmAccessActionSchema>;
export type AdvisoryNoteCreateInput = z.infer<typeof advisoryNoteCreateSchema>;
export type RecommendationReviewRequestInput = z.infer<typeof recommendationReviewRequestSchema>;
export type RecommendationReviewActionInput = z.infer<typeof recommendationReviewActionSchema>;

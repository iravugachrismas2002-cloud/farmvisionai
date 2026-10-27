import { z } from "zod";

export const intelligenceRangeSchema = z.enum(["7d", "30d"]);

export const intelligenceQuerySchema = z
  .object({
    range: intelligenceRangeSchema.default("30d"),
    farmId: z.string().uuid().optional(),
    deviceId: z.string().uuid().optional(),
  })
  .strict()
  .superRefine((query, context) => {
    if (query.deviceId && !query.farmId) {
      context.addIssue({
        code: "custom",
        path: ["farmId"],
        message: "Select an owned farm when requesting device intelligence.",
      });
    }
  });

export type IntelligenceQuery = z.infer<typeof intelligenceQuerySchema>;

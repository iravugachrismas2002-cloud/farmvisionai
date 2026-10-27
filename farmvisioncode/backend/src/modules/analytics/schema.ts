import { z } from "zod";

export const analyticsRangePresetSchema = z.enum(["24h", "7d", "30d", "custom"]);

export const analyticsQuerySchema = z
  .object({
    range: analyticsRangePresetSchema.default("24h"),
    farmId: z.string().uuid().optional(),
    deviceId: z.string().uuid().optional(),
    start: z.string().datetime({ offset: true }).optional(),
    end: z.string().datetime({ offset: true }).optional(),
  })
  .strict()
  .superRefine((query, context) => {
    if (query.range === "custom" && (!query.start || !query.end)) {
      context.addIssue({
        code: "custom",
        path: ["start", "end"],
        message: "Custom ranges require both start and end timestamps with a timezone offset.",
      });
    }

    if (query.range !== "custom" && (query.start || query.end)) {
      context.addIssue({
        code: "custom",
        path: ["range"],
        message: "Start and end timestamps are allowed only for the custom range.",
      });
    }

    if (query.start && query.end && Date.parse(query.end) <= Date.parse(query.start)) {
      context.addIssue({
        code: "custom",
        path: ["end"],
        message: "The end timestamp must be later than the start timestamp.",
      });
    }
  });

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

import { z } from "zod";

export const deviceSourceSchema = z.enum(["HARDWARE", "SIMULATOR"]);

export const registerDeviceSchema = z
  .object({
    farmId: z.string().uuid("Choose a valid farm."),
    name: z.string().trim().min(1, "Enter a device name.").max(120),
    source: deviceSourceSchema,
  })
  .strict();

export const telemetryPayloadSchema = z
  .object({
    schemaVersion: z.literal(1),
    deviceId: z.string().trim().min(4).max(64).regex(/^fv_[A-Za-z0-9_-]+$/),
    messageId: z.string().trim().min(1).max(128),
    timestamp: z.string().datetime({ offset: true }),
    temperatureC: z.number().finite().min(-40).max(85).optional(),
    humidityPercent: z.number().finite().min(0).max(100).optional(),
    feedLevelPercent: z.number().finite().min(0).max(100).optional(),
    waterLevelPercent: z.number().finite().min(0).max(100).optional(),
    feedWeightGrams: z.number().finite().min(0).max(5_000_000).optional(),
  })
  .strict()
  .refine(
    ({ temperatureC, humidityPercent, feedLevelPercent, waterLevelPercent, feedWeightGrams }) =>
      [temperatureC, humidityPercent, feedLevelPercent, waterLevelPercent, feedWeightGrams]
        .some((value) => value !== undefined),
    { message: "Include at least one sensor measurement." },
  );

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type TelemetryPayload = z.infer<typeof telemetryPayloadSchema>;

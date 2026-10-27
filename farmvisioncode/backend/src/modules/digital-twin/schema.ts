import { z } from "zod";

export const twinRangeSchema = z.enum(["7d", "30d"]);

export const twinScenarioSchema = z
  .object({
    horizonDays: z.number().int().min(1).max(30).default(7),
    feedStartLevelAssumptionPercent: z.number().finite().min(0).max(100).optional(),
    feedDailyDrawdownAssumptionPercentagePoints: z.number().finite().min(0).max(100).optional(),
    waterStartLevelAssumptionPercent: z.number().finite().min(0).max(100).optional(),
    waterDailyDrawdownAssumptionPercentagePoints: z.number().finite().min(0).max(100).optional(),
    temperatureAtHorizonAssumptionC: z.number().finite().min(-40).max(85).optional(),
    humidityAtHorizonAssumptionPercent: z.number().finite().min(0).max(100).optional(),
  })
  .strict();

export type TwinScenarioInput = z.infer<typeof twinScenarioSchema>;

import { estimateLevelDepletion } from "./forecast";
import type { IntelligenceReading, WaterIntelligence } from "./types";

export function evaluateWaterIntelligence(readings: readonly IntelligenceReading[]): WaterIntelligence {
  return { level: estimateLevelDepletion(readings, "waterLevelPercent") };
}

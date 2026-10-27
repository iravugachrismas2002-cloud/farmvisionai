import { describe, expect, it } from "vitest";
import { buildIntelligenceReviewPrompts } from "@/modules/intelligence/evidence";
import { estimateLevelDepletion } from "@/modules/intelligence/forecast";
import { intelligenceQuerySchema } from "@/modules/intelligence/schema";
import type { IntelligenceReading } from "@/modules/intelligence/types";

const start = Date.parse("2026-10-01T00:00:00.000Z");

function reading(hours: number, feedLevelPercent: number): IntelligenceReading {
  const time = new Date(start + hours * 60 * 60 * 1000);
  return { observedAt: time, receivedAt: time, source: "HARDWARE", temperatureC: null, humidityPercent: null, feedLevelPercent, waterLevelPercent: null, feedWeightGrams: null };
}

describe("intelligence evidence and query contract", () => {
  it("includes source, calculation window, formula version, units, counts, and limitations in a proposed prompt", () => {
    const forecast = estimateLevelDepletion([
      reading(0, 80), reading(12, 75), reading(24, 70), reading(36, 65), reading(48, 60),
    ], "feedLevelPercent");
    const prompts = buildIntelligenceReviewPrompts({
      feed: forecast,
      water: { ...forecast, status: "INSUFFICIENT_DATA", currentLevelPercent: null, dailyDeclinePercentagePoints: null, daysUntilZero: null, estimatedZeroAt: null, asOf: null, calculationStart: null, source: null },
      range: { preset: "30d", start: new Date(start - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date(start + 48 * 60 * 60 * 1000).toISOString() },
    });
    expect(prompts).toHaveLength(1);
    expect(prompts[0]).toMatchObject({ id: "FEED_TREND_REVIEW", status: "PROPOSED", persisted: false });
    expect(prompts[0]?.evidence).toMatchObject({
      metric: "feedLevelPercent",
      currentValue: 60,
      currentUnit: "%",
      rateUnit: "percentage points/day",
      source: "HARDWARE",
      sampleCount: 5,
      declineIntervalCount: 4,
      formulaVersion: "directional-depletion-v1",
      confidence: "NOT_CALIBRATED",
    });
    expect(prompts[0]?.evidence.periodStart).toBe(new Date(start).toISOString());
    expect(prompts[0]?.evidence.limitations.length).toBeGreaterThan(0);
  });

  it("does not create prompts when the estimate is unavailable", () => {
    const forecast = estimateLevelDepletion([reading(0, 80)], "feedLevelPercent");
    expect(buildIntelligenceReviewPrompts({
      feed: forecast,
      water: forecast,
      range: { preset: "7d", start: new Date(start).toISOString(), end: new Date(start + 7 * 24 * 60 * 60 * 1000).toISOString() },
    })).toEqual([]);
  });

  it("defaults to 30 days and rejects a device without an explicitly selected farm", () => {
    expect(intelligenceQuerySchema.parse({})).toEqual({ range: "30d" });
    expect(intelligenceQuerySchema.safeParse({ deviceId: "2c2d2e2f-1111-4222-8333-444455556666" }).success).toBe(false);
  });

  it("accepts a paired farm/device selection and rejects unknown query keys", () => {
    const selection = { farmId: "2c2d2e2f-1111-4222-8333-444455556666", deviceId: "3c2d2e2f-1111-4222-8333-444455556666", range: "7d" };
    expect(intelligenceQuerySchema.parse(selection)).toEqual(selection);
    expect(intelligenceQuerySchema.safeParse({ ...selection, ownerId: "not-client-selectable" }).success).toBe(false);
  });
});

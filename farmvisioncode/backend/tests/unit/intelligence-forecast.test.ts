import { describe, expect, it } from "vitest";
import { evaluateFeedIntelligence } from "@/modules/intelligence/feed-engine";
import { estimateLevelDepletion } from "@/modules/intelligence/forecast";
import { evaluateWaterIntelligence } from "@/modules/intelligence/water-engine";
import type { IntelligenceReading } from "@/modules/intelligence/types";

const start = Date.parse("2026-10-01T00:00:00.000Z");

type Values = Partial<Pick<IntelligenceReading, "feedLevelPercent" | "waterLevelPercent" | "feedWeightGrams">>;

function reading(hours: number, values: Values = {}, source: IntelligenceReading["source"] = "SIMULATOR"): IntelligenceReading {
  const observedAt = new Date(start + hours * 60 * 60 * 1000);
  return {
    observedAt,
    receivedAt: observedAt,
    source,
    temperatureC: null,
    humidityPercent: null,
    feedLevelPercent: null,
    waterLevelPercent: null,
    feedWeightGrams: null,
    ...values,
  };
}

describe("directional feed and water intelligence", () => {
  it("estimates median percentage-point declines and a directional zero crossing from enough ordered history", () => {
    const input = [
      reading(48, { feedLevelPercent: 60, waterLevelPercent: 42 }),
      reading(12, { feedLevelPercent: 75, waterLevelPercent: 48 }),
      reading(0, { feedLevelPercent: 80, waterLevelPercent: 50 }),
      reading(36, { feedLevelPercent: 65, waterLevelPercent: 44 }),
      reading(24, { feedLevelPercent: 70, waterLevelPercent: 46 }),
    ];

    const feed = evaluateFeedIntelligence(input).level;
    const water = evaluateWaterIntelligence(input).level;
    expect(feed).toMatchObject({ status: "ESTIMATED", currentLevelPercent: 60, sampleCount: 5, declineIntervalCount: 4, coverageHours: 48, confidence: "NOT_CALIBRATED" });
    expect(feed.dailyDeclinePercentagePoints).toBeCloseTo(10);
    expect(feed.daysUntilZero).toBeCloseTo(6);
    expect(feed.estimatedZeroAt).toBe(new Date(start + 8 * 24 * 60 * 60 * 1000).toISOString());
    expect(water.status).toBe("ESTIMATED");
    expect(water.dailyDeclinePercentagePoints).toBeCloseTo(4);
    expect(water.daysUntilZero).toBeCloseTo(10.5);
  });

  it("includes stable intervals so isolated drops do not dominate the directional rate", () => {
    const result = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 80 }),
      reading(12, { feedLevelPercent: 80 }),
      reading(24, { feedLevelPercent: 75 }),
      reading(36, { feedLevelPercent: 75 }),
      reading(48, { feedLevelPercent: 70 }),
      reading(60, { feedLevelPercent: 70 }),
      reading(72, { feedLevelPercent: 65 }),
    ], "feedLevelPercent");
    expect(result).toMatchObject({ status: "ESTIMATED", sampleCount: 7, declineIntervalCount: 3 });
    expect(result.dailyDeclinePercentagePoints).toBeCloseTo(5);
    expect(result.daysUntilZero).toBeCloseTo(13);
  });
  it("does not forecast with too few decline intervals even when the window spans a day", () => {
    const result = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 80 }),
      reading(24, { feedLevelPercent: 70 }),
      reading(48, { feedLevelPercent: 60 }),
    ], "feedLevelPercent");
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.estimatedZeroAt).toBeNull();
    expect(result.declineIntervalCount).toBe(2);
  });

  it("does not bridge missing level samples when estimating a rate", () => {
    const result = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 80 }),
      reading(12, { feedLevelPercent: null }),
      reading(24, { feedLevelPercent: 70 }),
      reading(36, { feedLevelPercent: 65 }),
      reading(48, { feedLevelPercent: 60 }),
    ], "feedLevelPercent");
    expect(result.status).toBe("INSUFFICIENT_DATA");
    expect(result.declineIntervalCount).toBe(2);
    expect(result.estimatedZeroAt).toBeNull();
  });

  it("restarts the calculation after a refill/reset and reports only post-reset evidence", () => {
    const result = estimateLevelDepletion([
      reading(0, { waterLevelPercent: 80 }),
      reading(12, { waterLevelPercent: 75 }),
      reading(24, { waterLevelPercent: 70 }),
      reading(36, { waterLevelPercent: 95 }),
      reading(48, { waterLevelPercent: 90 }),
      reading(60, { waterLevelPercent: 85 }),
      reading(72, { waterLevelPercent: 80 }),
      reading(84, { waterLevelPercent: 75 }),
    ], "waterLevelPercent");
    expect(result).toMatchObject({ status: "ESTIMATED", currentLevelPercent: 75, sampleCount: 5, declineIntervalCount: 4, resetIntervalCount: 1, calculationStart: new Date(start + 36 * 60 * 60 * 1000).toISOString() });
    expect(result.dailyDeclinePercentagePoints).toBeCloseTo(10);
    expect(result.limitations.some((item) => item.includes("most recent level increase"))).toBe(true);
  });

  it("returns a reset-affected state rather than a date when the newest segment is too short", () => {
    const result = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 80 }),
      reading(12, { feedLevelPercent: 75 }),
      reading(24, { feedLevelPercent: 90 }),
      reading(36, { feedLevelPercent: 85 }),
    ], "feedLevelPercent");
    expect(result.status).toBe("RESET_AFFECTED");
    expect(result.estimatedZeroAt).toBeNull();
    expect(result.resetIntervalCount).toBe(1);
  });

  it("distinguishes a stable well-covered segment and a measured zero from missing data", () => {
    const stable = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 50 }),
      reading(12, { feedLevelPercent: 50 }),
      reading(24, { feedLevelPercent: 50 }),
      reading(36, { feedLevelPercent: 50 }),
      reading(48, { feedLevelPercent: 50 }),
    ], "feedLevelPercent");
    const empty = estimateLevelDepletion([reading(0, { feedLevelPercent: 0 })], "feedLevelPercent");
    expect(stable.status).toBe("NO_DECLINE");
    expect(stable.estimatedZeroAt).toBeNull();
    expect(empty.status).toBe("AT_ZERO");
    expect(empty.estimatedZeroAt).toBeNull();
  });

  it("keeps feed-weight decreases as observed mass changes and does not label them consumption", () => {
    const result = evaluateFeedIntelligence([
      reading(0, { feedWeightGrams: 1_000 }),
      reading(12, { feedWeightGrams: 900 }),
      reading(24, { feedWeightGrams: 950 }),
      reading(36, { feedWeightGrams: 900 }),
    ]).observedWeightChange;
    expect(result).toMatchObject({ observedDecreaseGrams: 150, declineIntervalCount: 2, resetIntervalCount: 1, confidence: "NOT_CALIBRATED" });
    expect(result.limitation).toContain("not confirmed animal intake");
  });

  it("does not calculate a rate across a source change", () => {
    const result = estimateLevelDepletion([
      reading(0, { feedLevelPercent: 80 }, "SIMULATOR"),
      reading(12, { feedLevelPercent: 75 }, "HARDWARE"),
      reading(24, { feedLevelPercent: 70 }, "HARDWARE"),
      reading(36, { feedLevelPercent: 65 }, "HARDWARE"),
      reading(48, { feedLevelPercent: 60 }, "HARDWARE"),
    ], "feedLevelPercent");
    expect(result.status).toBe("ESTIMATED");
    expect(result.source).toBe("HARDWARE");
    expect(result.calculationStart).toBe(new Date(start + 12 * 60 * 60 * 1000).toISOString());
  });
});

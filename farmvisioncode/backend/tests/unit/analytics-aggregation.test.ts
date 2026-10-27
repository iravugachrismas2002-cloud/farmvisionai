import { describe, expect, it } from "vitest";
import { aggregateReadings, type AnalyticsReading } from "@/modules/analytics/aggregation";
import type { ResolvedAnalyticsRange } from "@/modules/analytics/range";

const range: ResolvedAnalyticsRange = {
  preset: "custom",
  start: new Date("2026-10-20T00:00:00.000Z"),
  end: new Date("2026-10-20T02:00:00.000Z"),
  bucketSeconds: 3_600,
  bucketCount: 2,
};

function reading(
  timestamp: string,
  values: Partial<Pick<AnalyticsReading, "temperatureC" | "humidityPercent" | "feedLevelPercent" | "waterLevelPercent" | "feedWeightGrams">> = {},
): AnalyticsReading {
  return {
    observedAt: new Date(timestamp),
    receivedAt: new Date(timestamp),
    temperatureC: null,
    humidityPercent: null,
    feedLevelPercent: null,
    waterLevelPercent: null,
    feedWeightGrams: null,
    ...values,
  };
}

describe("historical telemetry aggregation", () => {
  it("computes environmental means and observed declines without counting increases as consumption", () => {
    const points = aggregateReadings([
      reading("2026-10-20T00:30:00Z", { temperatureC: 32, humidityPercent: 80, feedWeightGrams: 900, feedLevelPercent: 45, waterLevelPercent: 38 }),
      reading("2026-10-20T01:30:00Z", { temperatureC: 36, humidityPercent: 70, feedWeightGrams: 1_050, feedLevelPercent: 79, waterLevelPercent: 40 }),
      reading("2026-10-20T00:00:00Z", { temperatureC: 30, humidityPercent: 84, feedWeightGrams: 1_000, feedLevelPercent: 50, waterLevelPercent: 40 }),
      reading("2026-10-20T01:00:00Z", { temperatureC: 34, humidityPercent: 76, feedWeightGrams: 1_100, feedLevelPercent: 80, waterLevelPercent: 40 }),
    ], range);

    expect(points).toHaveLength(2);
    expect(points[0]).toMatchObject({
      temperatureMeanC: 31,
      temperatureMinC: 30,
      temperatureMaxC: 32,
      temperatureSampleCount: 2,
      humidityMeanPercent: 82,
      feedWeightDecreaseGrams: 100,
      feedWeightIntervalCount: 1,
      feedWeightIncreaseIntervalCount: 0,
      feedLevelDropPercentagePoints: 5,
      waterLevelDropPercentagePoints: 2,
    });
    expect(points[1]).toMatchObject({
      temperatureMeanC: 35,
      feedWeightDecreaseGrams: 50,
      feedWeightIntervalCount: 2,
      feedWeightIncreaseIntervalCount: 1,
      feedLevelDropPercentagePoints: 1,
      feedLevelIncreaseIntervalCount: 1,
      waterLevelDropPercentagePoints: 0,
      waterLevelIncreaseIntervalCount: 1,
    });
  });

  it("does not infer a decline from the first in-range sample or bridge a missing measurement", () => {
    const points = aggregateReadings([
      reading("2026-10-20T00:00:00Z", { feedWeightGrams: 1_000 }),
      reading("2026-10-20T00:20:00Z", { feedWeightGrams: null }),
      reading("2026-10-20T00:40:00Z", { feedWeightGrams: 800 }),
      reading("2026-10-20T01:10:00Z", { feedWeightGrams: 750 }),
    ], range);

    expect(points[0]?.feedWeightDecreaseGrams).toBeNull();
    expect(points[0]?.feedWeightIntervalCount).toBe(0);
    expect(points[1]?.feedWeightDecreaseGrams).toBe(50);
  });

  it("excludes an event at the end boundary and preserves empty buckets as null, not zero", () => {
    const points = aggregateReadings([
      reading("2026-10-20T02:00:00Z", { temperatureC: 20, feedWeightGrams: 100 }),
    ], range);
    expect(points.every((point) => point.temperatureMeanC === null)).toBe(true);
    expect(points.every((point) => point.feedWeightDecreaseGrams === null)).toBe(true);
  });
});

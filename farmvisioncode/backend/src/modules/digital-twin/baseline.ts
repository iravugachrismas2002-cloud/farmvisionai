import type { AnalyticsPoint, AnalyticsResponse } from "../analytics/types";
import type { IntelligenceResponse } from "../intelligence/types";
import type { DigitalTwinBaseline, DigitalTwinInputs, TwinHistoryContext, TwinRange } from "./types";

function emptyHistory(): TwinHistoryContext {
  return {
    readingCount: 0,
    bucketCount: 0,
    temperature: { meanC: null, minC: null, maxC: null, sampleCount: 0 },
    humidity: { meanPercent: null, minPercent: null, maxPercent: null, sampleCount: 0 },
    feedWeight: { observedDecreaseGrams: null, intervalCount: 0, increaseIntervalCount: 0 },
    feedLevel: { observedDecreasePercentagePoints: null, intervalCount: 0, increaseIntervalCount: 0 },
    waterLevel: { observedDecreasePercentagePoints: null, intervalCount: 0, increaseIntervalCount: 0 },
  };
}

function hasBucketData(point: AnalyticsPoint): boolean {
  return [
    point.temperatureSampleCount,
    point.humiditySampleCount,
    point.feedWeightIntervalCount,
    point.feedLevelIntervalCount,
    point.waterLevelIntervalCount,
  ].some((count) => count > 0);
}

function summarizeSamples(
  points: readonly AnalyticsPoint[],
  keys: { mean: "temperatureMeanC" | "humidityMeanPercent"; min: "temperatureMinC" | "humidityMinPercent"; max: "temperatureMaxC" | "humidityMaxPercent"; count: "temperatureSampleCount" | "humiditySampleCount" },
) {
  let weightedTotal = 0;
  let sampleCount = 0;
  let minimum: number | null = null;
  let maximum: number | null = null;
  let bucketCount = 0;

  for (const point of points) {
    const count = point[keys.count];
    const mean = point[keys.mean];
    if (count > 0 && mean !== null && Number.isFinite(mean)) {
      weightedTotal += mean * count;
      sampleCount += count;
      bucketCount += 1;
    }
    const min = point[keys.min];
    const max = point[keys.max];
    if (min !== null && Number.isFinite(min)) minimum = minimum === null ? min : Math.min(minimum, min);
    if (max !== null && Number.isFinite(max)) maximum = maximum === null ? max : Math.max(maximum, max);
  }

  return {
    mean: sampleCount > 0 ? weightedTotal / sampleCount : null,
    min: minimum,
    max: maximum,
    sampleCount,
    bucketCount,
  };
}

function summarizeChanges(
  points: readonly AnalyticsPoint[],
  keys: {
    decrease: "feedWeightDecreaseGrams" | "feedLevelDropPercentagePoints" | "waterLevelDropPercentagePoints";
    intervals: "feedWeightIntervalCount" | "feedLevelIntervalCount" | "waterLevelIntervalCount";
    increases: "feedWeightIncreaseIntervalCount" | "feedLevelIncreaseIntervalCount" | "waterLevelIncreaseIntervalCount";
  },
) {
  let decrease = 0;
  let intervalCount = 0;
  let increaseIntervalCount = 0;
  for (const point of points) {
    const count = point[keys.intervals];
    intervalCount += count;
    increaseIntervalCount += point[keys.increases];
    const intervalDecrease = point[keys.decrease];
    if (count > 0 && intervalDecrease !== null) decrease += intervalDecrease;
  }
  return {
    decrease: intervalCount > 0 ? decrease : null,
    intervalCount,
    increaseIntervalCount,
  };
}

export function summarizeAnalyticsHistory(analytics: AnalyticsResponse): TwinHistoryContext {
  const points = analytics.points;
  const temperature = summarizeSamples(points, {
    mean: "temperatureMeanC",
    min: "temperatureMinC",
    max: "temperatureMaxC",
    count: "temperatureSampleCount",
  });
  const humidity = summarizeSamples(points, {
    mean: "humidityMeanPercent",
    min: "humidityMinPercent",
    max: "humidityMaxPercent",
    count: "humiditySampleCount",
  });
  const feedWeight = summarizeChanges(points, {
    decrease: "feedWeightDecreaseGrams",
    intervals: "feedWeightIntervalCount",
    increases: "feedWeightIncreaseIntervalCount",
  });
  const feedLevel = summarizeChanges(points, {
    decrease: "feedLevelDropPercentagePoints",
    intervals: "feedLevelIntervalCount",
    increases: "feedLevelIncreaseIntervalCount",
  });
  const waterLevel = summarizeChanges(points, {
    decrease: "waterLevelDropPercentagePoints",
    intervals: "waterLevelIntervalCount",
    increases: "waterLevelIncreaseIntervalCount",
  });

  return {
    readingCount: analytics.readingCount,
    bucketCount: new Set(points.filter(hasBucketData).map((point) => point.bucketStart)).size,
    temperature: { meanC: temperature.mean, minC: temperature.min, maxC: temperature.max, sampleCount: temperature.sampleCount },
    humidity: { meanPercent: humidity.mean, minPercent: humidity.min, maxPercent: humidity.max, sampleCount: humidity.sampleCount },
    feedWeight: { observedDecreaseGrams: feedWeight.decrease, intervalCount: feedWeight.intervalCount, increaseIntervalCount: feedWeight.increaseIntervalCount },
    feedLevel: { observedDecreasePercentagePoints: feedLevel.decrease, intervalCount: feedLevel.intervalCount, increaseIntervalCount: feedLevel.increaseIntervalCount },
    waterLevel: { observedDecreasePercentagePoints: waterLevel.decrease, intervalCount: waterLevel.intervalCount, increaseIntervalCount: waterLevel.increaseIntervalCount },
  };
}

function emptyBaseline(status: DigitalTwinBaseline["status"], intelligence?: IntelligenceResponse, analytics?: AnalyticsResponse): DigitalTwinBaseline {
  const preset = intelligence?.range.preset === "7d" || intelligence?.range.preset === "30d" ? intelligence.range.preset : null;
  return {
    status,
    selectedFarm: null,
    device: null,
    range: { preset, start: intelligence?.range.start ?? analytics?.range.start ?? null, end: intelligence?.range.end ?? analytics?.range.end ?? null },
    observedAt: null,
    source: null,
    observed: null,
    forecasts: { feed: null, water: null },
    history: emptyHistory(),
    persistedAlerts: [],
  };
}

export function buildDigitalTwinBaseline({ intelligence, analytics }: DigitalTwinInputs): DigitalTwinBaseline {
  const twinDevice = intelligence.device;
  const analyticsDevice = analytics.device;
  if (!twinDevice || !analyticsDevice) return emptyBaseline("NO_SELECTION", intelligence, analytics);
  if (
    twinDevice.id !== analyticsDevice.id ||
    twinDevice.farm.id !== analyticsDevice.farm.id ||
    intelligence.range.preset !== analytics.range.preset ||
    !(["7d", "30d"] as readonly string[]).includes(intelligence.range.preset)
  ) {
    return emptyBaseline("INPUT_MISMATCH", intelligence, analytics);
  }

  const observed = intelligence.latestObservation;
  const preset = intelligence.range.preset as TwinRange;
  return {
    status: observed ? "READY" : "NO_OBSERVATION",
    selectedFarm: twinDevice.farm,
    device: twinDevice,
    range: { preset, start: intelligence.range.start, end: intelligence.range.end },
    observedAt: observed?.observedAt ?? null,
    source: observed?.source ?? null,
    observed,
    forecasts: {
      feed: intelligence.analysis?.feed.level ?? null,
      water: intelligence.analysis?.water.level ?? null,
    },
    history: summarizeAnalyticsHistory(analytics),
    persistedAlerts: intelligence.analysis?.risk.signals ?? [],
  };
}

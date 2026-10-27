import type { AnalyticsPoint } from "./types";
import type { ResolvedAnalyticsRange } from "./range";

export type AnalyticsReading = {
  observedAt: Date | string;
  receivedAt?: Date | string;
  temperatureC: number | null;
  humidityPercent: number | null;
  feedLevelPercent: number | null;
  waterLevelPercent: number | null;
  feedWeightGrams: number | null;
};

type SampleAccumulator = {
  sum: number;
  min: number | null;
  max: number | null;
  count: number;
};

type ChangeAccumulator = {
  decrease: number;
  intervalCount: number;
  increaseIntervalCount: number;
};

type MutableBucket = {
  temperature: SampleAccumulator;
  humidity: SampleAccumulator;
  feedLevel: SampleAccumulator;
  waterLevel: SampleAccumulator;
  feedWeightChange: ChangeAccumulator;
  feedLevelChange: ChangeAccumulator;
  waterLevelChange: ChangeAccumulator;
};

function emptySamples(): SampleAccumulator {
  return { sum: 0, min: null, max: null, count: 0 };
}

function emptyChange(): ChangeAccumulator {
  return { decrease: 0, intervalCount: 0, increaseIntervalCount: 0 };
}

function emptyBucket(): MutableBucket {
  return {
    temperature: emptySamples(),
    humidity: emptySamples(),
    feedLevel: emptySamples(),
    waterLevel: emptySamples(),
    feedWeightChange: emptyChange(),
    feedLevelChange: emptyChange(),
    waterLevelChange: emptyChange(),
  };
}

function addSample(target: SampleAccumulator, value: number | null) {
  if (value === null || !Number.isFinite(value)) return;
  target.sum += value;
  target.min = target.min === null ? value : Math.min(target.min, value);
  target.max = target.max === null ? value : Math.max(target.max, value);
  target.count += 1;
}

function mean(target: SampleAccumulator) {
  return target.count === 0 ? null : target.sum / target.count;
}

function addDecrease(target: ChangeAccumulator, previous: number | null, current: number | null) {
  if (previous === null || current === null || !Number.isFinite(previous) || !Number.isFinite(current)) return;
  target.intervalCount += 1;
  if (current < previous) {
    target.decrease += previous - current;
  } else if (current > previous) {
    // A rising measurement is treated as a refill/restock/reset, never as negative consumption.
    target.increaseIntervalCount += 1;
  }
}

function intervalValue(target: ChangeAccumulator) {
  return target.intervalCount === 0 ? null : target.decrease;
}

export function aggregateReadings(
  readings: readonly AnalyticsReading[],
  range: ResolvedAnalyticsRange,
): AnalyticsPoint[] {
  const bucketMs = range.bucketSeconds * 1000;
  const buckets = Array.from({ length: range.bucketCount }, emptyBucket);
  const sorted = [...readings].sort((left, right) => {
    const timeDifference = new Date(left.observedAt).getTime() - new Date(right.observedAt).getTime();
    if (timeDifference !== 0) return timeDifference;
    return new Date(left.receivedAt ?? left.observedAt).getTime() - new Date(right.receivedAt ?? right.observedAt).getTime();
  });

  let previous: AnalyticsReading | null = null;
  for (const reading of sorted) {
    const observedMs = new Date(reading.observedAt).getTime();
    if (!Number.isFinite(observedMs) || observedMs < range.start.getTime() || observedMs >= range.end.getTime()) continue;
    const bucketIndex = Math.floor((observedMs - range.start.getTime()) / bucketMs);
    const bucket = buckets[bucketIndex];
    if (!bucket) continue;

    addSample(bucket.temperature, reading.temperatureC);
    addSample(bucket.humidity, reading.humidityPercent);
    addSample(bucket.feedLevel, reading.feedLevelPercent);
    addSample(bucket.waterLevel, reading.waterLevelPercent);

    if (previous && observedMs > new Date(previous.observedAt).getTime()) {
      addDecrease(bucket.feedWeightChange, previous.feedWeightGrams, reading.feedWeightGrams);
      addDecrease(bucket.feedLevelChange, previous.feedLevelPercent, reading.feedLevelPercent);
      addDecrease(bucket.waterLevelChange, previous.waterLevelPercent, reading.waterLevelPercent);
    }
    previous = reading;
  }

  return buckets.map((bucket, index) => ({
    bucketStart: new Date(range.start.getTime() + index * bucketMs).toISOString(),
    temperatureMeanC: mean(bucket.temperature),
    temperatureMinC: bucket.temperature.min,
    temperatureMaxC: bucket.temperature.max,
    temperatureSampleCount: bucket.temperature.count,
    humidityMeanPercent: mean(bucket.humidity),
    humidityMinPercent: bucket.humidity.min,
    humidityMaxPercent: bucket.humidity.max,
    humiditySampleCount: bucket.humidity.count,
    feedWeightDecreaseGrams: intervalValue(bucket.feedWeightChange),
    feedWeightIntervalCount: bucket.feedWeightChange.intervalCount,
    feedWeightIncreaseIntervalCount: bucket.feedWeightChange.increaseIntervalCount,
    feedLevelMeanPercent: mean(bucket.feedLevel),
    feedLevelDropPercentagePoints: intervalValue(bucket.feedLevelChange),
    feedLevelIntervalCount: bucket.feedLevelChange.intervalCount,
    feedLevelIncreaseIntervalCount: bucket.feedLevelChange.increaseIntervalCount,
    waterLevelMeanPercent: mean(bucket.waterLevel),
    waterLevelDropPercentagePoints: intervalValue(bucket.waterLevelChange),
    waterLevelIntervalCount: bucket.waterLevelChange.intervalCount,
    waterLevelIncreaseIntervalCount: bucket.waterLevelChange.increaseIntervalCount,
  }));
}

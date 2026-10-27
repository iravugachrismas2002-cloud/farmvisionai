import type { DepletionForecast, IntelligenceReading } from "./types";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MIN_SEGMENT_SAMPLES = 4;
const MIN_DECLINE_INTERVALS = 3;
const MIN_COVERAGE_HOURS = 24;
const FORMULA_VERSION = "directional-depletion-v1" as const;
const BASE_LIMITATIONS = [
  "The sensor percentage and its physical calibration have not been verified against the hardware contract.",
  "The estimate is a directional linear extrapolation, not a guaranteed replenishment date or agronomic recommendation.",
  "Confidence has not been calibrated; weather, animal count, operating schedules, and container geometry are not modeled.",
];

type LevelMetric = "feedLevelPercent" | "waterLevelPercent";
type Point = { time: number; value: number; source: IntelligenceReading["source"] };

function timestamp(value: Date | string): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

function median(values: number[]): number {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle] ?? 0;
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

function emptyForecast(status: DepletionForecast["status"] = "INSUFFICIENT_DATA"): DepletionForecast {
  return {
    status,
    currentLevelPercent: null,
    dailyDeclinePercentagePoints: null,
    daysUntilZero: null,
    estimatedZeroAt: null,
    asOf: null,
    calculationStart: null,
    source: null,
    sampleCount: 0,
    declineIntervalCount: 0,
    resetIntervalCount: 0,
    coverageHours: null,
    formulaVersion: FORMULA_VERSION,
    confidence: "NOT_CALIBRATED",
    limitations: [...BASE_LIMITATIONS],
  };
}

export function estimateLevelDepletion(
  readings: readonly IntelligenceReading[],
  metric: LevelMetric,
): DepletionForecast {
  const sorted = [...readings].sort((left, right) => {
    const observedDifference = timestamp(left.observedAt) - timestamp(right.observedAt);
    if (observedDifference !== 0) return observedDifference;
    return timestamp(left.receivedAt) - timestamp(right.receivedAt);
  });

  let previous: Point | null = null;
  let segment: Point[] = [];
  let intervalRates: number[] = [];
  let declineIntervalCount = 0;
  let resetIntervalCount = 0;

  for (const reading of sorted) {
    const time = timestamp(reading.observedAt);
    const value = reading[metric];
    if (!Number.isFinite(time) || value === null || !Number.isFinite(value) || value < 0 || value > 100) {
      previous = null;
      segment = [];
      intervalRates = [];
      declineIntervalCount = 0;
      continue;
    }

    const current: Point = { time, value, source: reading.source };
    if (!previous) {
      previous = current;
      segment = [current];
      intervalRates = [];
      declineIntervalCount = 0;
      continue;
    }

    if (current.source !== previous.source) {
      previous = current;
      segment = [current];
      intervalRates = [];
      declineIntervalCount = 0;
      continue;
    }

    if (current.time <= previous.time) {
      // Equal-time readings can establish the next baseline but never a rate interval.
      previous = current;
      segment.push(current);
      continue;
    }

    if (current.value > previous.value) {
      resetIntervalCount += 1;
      previous = current;
      segment = [current];
      intervalRates = [];
      declineIntervalCount = 0;
      continue;
    }

    const elapsedDays = (current.time - previous.time) / DAY_MS;
    const changeRate = (previous.value - current.value) / elapsedDays;
    if (Number.isFinite(changeRate) && changeRate >= 0) {
      // Stable intervals are kept as zero so brief drops do not dominate a mostly flat period.
      intervalRates.push(changeRate);
      if (changeRate > 0) declineIntervalCount += 1;
    }
    segment.push(current);
    previous = current;
  }

  const latest = segment.at(-1);
  if (!latest) {
    const result = emptyForecast(resetIntervalCount > 0 ? "RESET_AFFECTED" : "INSUFFICIENT_DATA");
    return { ...result, resetIntervalCount };
  }

  const first = segment[0] ?? latest;
  const coverageHours = Math.max(0, (latest.time - first.time) / HOUR_MS);
  const base: DepletionForecast = {
    status: "INSUFFICIENT_DATA",
    currentLevelPercent: latest.value,
    dailyDeclinePercentagePoints: null,
    daysUntilZero: null,
    estimatedZeroAt: null,
    asOf: new Date(latest.time).toISOString(),
    calculationStart: new Date(first.time).toISOString(),
    source: latest.source,
    sampleCount: segment.length,
    declineIntervalCount,
    resetIntervalCount,
    coverageHours,
    formulaVersion: FORMULA_VERSION,
    confidence: "NOT_CALIBRATED",
    limitations: [...BASE_LIMITATIONS],
  };

  if (latest.value === 0) return { ...base, status: "AT_ZERO" };
  if (resetIntervalCount > 0) {
    base.limitations = [
      ...base.limitations,
      "The rate uses only the measurement segment after the most recent level increase; earlier segments are excluded as possible refills or resets.",
    ];
  }
  if (segment.length >= MIN_SEGMENT_SAMPLES && coverageHours >= MIN_COVERAGE_HOURS && declineIntervalCount === 0) {
    return { ...base, status: "NO_DECLINE" };
  }
  if (
    segment.length < MIN_SEGMENT_SAMPLES ||
    coverageHours < MIN_COVERAGE_HOURS ||
    declineIntervalCount < MIN_DECLINE_INTERVALS
  ) {
    return { ...base, status: resetIntervalCount > 0 ? "RESET_AFFECTED" : "INSUFFICIENT_DATA" };
  }

  const dailyDeclinePercentagePoints = median(intervalRates);
  if (!Number.isFinite(dailyDeclinePercentagePoints) || dailyDeclinePercentagePoints <= 0) {
    return {
      ...base,
      status: "NO_SUSTAINED_DECLINE",
      limitations: [...base.limitations, "Some decreases occurred, but the median across declining and stable intervals was not positive enough to support a sustained-depletion estimate."],
    };
  }
  const daysUntilZero = latest.value / dailyDeclinePercentagePoints;
  const zeroTime = latest.time + daysUntilZero * DAY_MS;
  if (!Number.isFinite(daysUntilZero) || !Number.isFinite(zeroTime) || !Number.isFinite(new Date(zeroTime).getTime())) {
    return { ...base, status: "INSUFFICIENT_DATA" };
  }

  return {
    ...base,
    status: "ESTIMATED",
    dailyDeclinePercentagePoints,
    daysUntilZero,
    estimatedZeroAt: new Date(zeroTime).toISOString(),
  };
}

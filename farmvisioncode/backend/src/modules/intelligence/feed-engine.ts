import { estimateLevelDepletion } from "./forecast";
import type { FeedIntelligence, IntelligenceReading, ObservedMassChange } from "./types";

function timestamp(value: Date | string): number {
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

export function summarizeObservedFeedWeightChange(
  readings: readonly IntelligenceReading[],
): ObservedMassChange {
  const sorted = [...readings].sort((left, right) => {
    const observedDifference = timestamp(left.observedAt) - timestamp(right.observedAt);
    if (observedDifference !== 0) return observedDifference;
    return timestamp(left.receivedAt) - timestamp(right.receivedAt);
  });
  let previous: { time: number; value: number; source: IntelligenceReading["source"] } | null = null;
  let observedDecreaseGrams = 0;
  let sampleCount = 0;
  let declineIntervalCount = 0;
  let resetIntervalCount = 0;
  let firstObservedAt: string | null = null;
  let lastObservedAt: string | null = null;
  let source: IntelligenceReading["source"] | null = null;

  for (const reading of sorted) {
    const time = timestamp(reading.observedAt);
    const value = reading.feedWeightGrams;
    if (!Number.isFinite(time) || value === null || !Number.isFinite(value) || value < 0) {
      previous = null;
      continue;
    }
    sampleCount += 1;
    firstObservedAt ??= new Date(time).toISOString();
    lastObservedAt = new Date(time).toISOString();
    source = reading.source;
    const current = { time, value, source: reading.source };

    if (previous && current.source === previous.source && current.time > previous.time) {
      if (current.value < previous.value) {
        observedDecreaseGrams += previous.value - current.value;
        declineIntervalCount += 1;
      } else if (current.value > previous.value) {
        resetIntervalCount += 1;
      }
    }
    previous = current;
  }

  return {
    observedDecreaseGrams: declineIntervalCount > 0 ? observedDecreaseGrams : null,
    sampleCount,
    declineIntervalCount,
    resetIntervalCount,
    firstObservedAt,
    lastObservedAt,
    source,
    confidence: "NOT_CALIBRATED",
    limitation: "This is an observed pairwise mass decrease only; feed-weight meaning and calibration are unverified, so it is not confirmed animal intake or a forecast.",
  };
}

export function evaluateFeedIntelligence(readings: readonly IntelligenceReading[]): FeedIntelligence {
  return {
    level: estimateLevelDepletion(readings, "feedLevelPercent"),
    observedWeightChange: summarizeObservedFeedWeightChange(readings),
  };
}

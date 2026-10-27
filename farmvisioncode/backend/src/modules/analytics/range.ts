import type { AnalyticsQuery } from "./schema";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MS = 30 * DAY_MS;

export type ResolvedAnalyticsRange = {
  preset: AnalyticsQuery["range"];
  start: Date;
  end: Date;
  bucketSeconds: number;
  bucketCount: number;
};

export class AnalyticsRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsRangeError";
  }
}

export function resolveAnalyticsRange(
  query: AnalyticsQuery,
  now = new Date(),
): ResolvedAnalyticsRange {
  let start: Date;
  let end: Date;

  if (query.range === "custom") {
    if (!query.start || !query.end) {
      throw new AnalyticsRangeError("Custom ranges require both start and end timestamps.");
    }
    start = new Date(query.start);
    end = new Date(query.end);
  } else {
    const durationMs = query.range === "24h" ? DAY_MS : query.range === "7d" ? 7 * DAY_MS : 30 * DAY_MS;
    end = new Date(now);
    start = new Date(now.getTime() - durationMs);
  }

  const durationMs = end.getTime() - start.getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new AnalyticsRangeError("The end timestamp must be later than the start timestamp.");
  }
  if (end.getTime() > now.getTime()) {
    throw new AnalyticsRangeError("The analytics end timestamp cannot be in the future.");
  }
  if (durationMs > MAX_RANGE_MS) {
    throw new AnalyticsRangeError("The maximum analytics range is 30 days.");
  }

  const bucketMs = durationMs <= DAY_MS ? HOUR_MS : durationMs <= 7 * DAY_MS ? 6 * HOUR_MS : DAY_MS;
  return {
    preset: query.range,
    start,
    end,
    bucketSeconds: bucketMs / 1000,
    bucketCount: Math.ceil(durationMs / bucketMs),
  };
}

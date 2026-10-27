import { describe, expect, it } from "vitest";
import { analyticsQuerySchema } from "@/modules/analytics/schema";
import { AnalyticsRangeError, resolveAnalyticsRange } from "@/modules/analytics/range";

const now = new Date("2026-10-20T10:00:00.000Z");

describe("historical analytics ranges", () => {
  it.each([
    ["24h", 24, 3_600],
    ["7d", 28, 21_600],
    ["30d", 30, 86_400],
  ] as const)("resolves the %s preset into bounded UTC buckets", (preset, bucketCount, bucketSeconds) => {
    const query = analyticsQuerySchema.parse({ range: preset });
    const resolved = resolveAnalyticsRange(query, now);
    expect(resolved.bucketCount).toBe(bucketCount);
    expect(resolved.bucketSeconds).toBe(bucketSeconds);
    expect(resolved.end.toISOString()).toBe(now.toISOString());
    expect(resolved.start.getTime()).toBeLessThan(resolved.end.getTime());
  });

  it("requires offset-aware custom endpoints and keeps the selected interval", () => {
    const query = analyticsQuerySchema.parse({
      range: "custom",
      start: "2026-10-18T10:00:00+00:00",
      end: "2026-10-20T10:00:00+00:00",
    });
    const resolved = resolveAnalyticsRange(query, now);
    expect(resolved.start.toISOString()).toBe("2026-10-18T10:00:00.000Z");
    expect(resolved.end.toISOString()).toBe("2026-10-20T10:00:00.000Z");
    expect(resolved.bucketCount).toBe(8);
  });

  it("rejects missing, reversed, and preset-mixed custom timestamps", () => {
    expect(analyticsQuerySchema.safeParse({ range: "custom" }).success).toBe(false);
    expect(analyticsQuerySchema.safeParse({ range: "24h", start: "2026-10-19T00:00:00Z" }).success).toBe(false);
    expect(analyticsQuerySchema.safeParse({
      range: "custom",
      start: "2026-10-20T10:00:00Z",
      end: "2026-10-19T10:00:00Z",
    }).success).toBe(false);
  });

  it("rejects future endpoints and ranges longer than 30 days", () => {
    const future = analyticsQuerySchema.parse({
      range: "custom",
      start: "2026-10-19T00:00:00Z",
      end: "2026-10-20T10:01:00Z",
    });
    expect(() => resolveAnalyticsRange(future, now)).toThrow(AnalyticsRangeError);

    const tooLong = analyticsQuerySchema.parse({
      range: "custom",
      start: "2026-09-01T00:00:00Z",
      end: "2026-10-10T00:00:00Z",
    });
    expect(() => resolveAnalyticsRange(tooLong, now)).toThrow("maximum analytics range is 30 days");
  });
});

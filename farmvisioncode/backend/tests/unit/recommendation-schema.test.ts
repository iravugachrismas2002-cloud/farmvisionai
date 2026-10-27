import { describe, expect, it } from "vitest";
import { recommendationLimitSchema, recommendationStatusFilterSchema } from "@/modules/recommendations/schema";

describe("recommendation API query validation", () => {
  it("accepts an omitted status or a supported lifecycle value only", () => {
    expect(recommendationStatusFilterSchema.safeParse(undefined).success).toBe(true);
    expect(recommendationStatusFilterSchema.safeParse("ACKNOWLEDGED").success).toBe(true);
    expect(recommendationStatusFilterSchema.safeParse("PAUSED").success).toBe(false);
  });

  it("defaults the page size and coerces a valid query-string integer", () => {
    expect(recommendationLimitSchema.parse(undefined)).toBe(100);
    expect(recommendationLimitSchema.parse("25")).toBe(25);
  });

  it.each(["0", "101", "1.5", "many", ""]) ("rejects unsafe page size %s", (limit) => {
    expect(recommendationLimitSchema.safeParse(limit).success).toBe(false);
  });
});

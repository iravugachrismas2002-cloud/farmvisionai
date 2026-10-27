import { describe, expect, it } from "vitest";
import { buildRecommendation } from "@/modules/recommendations/rules";

const observedAt = new Date("2026-10-20T09:30:00.000Z");
const generatedAt = new Date("2026-10-20T09:30:02.000Z");

function input(alertType: "FEED_LOW" | "WATER_LOW" | "HIGH_TEMPERATURE", overrides: Partial<Parameters<typeof buildRecommendation>[0]> = {}) {
  return {
    alertType,
    severity: "WARNING" as const,
    status: "OPEN" as const,
    reason: "Prototype threshold crossed.",
    observedValue: 18,
    thresholdValue: 20,
    unit: "%",
    observedAt,
    generatedAt,
    deviceSource: "SIMULATOR" as const,
    ...overrides,
  };
}

describe("recommendation rules", () => {
  it("turns low-feed evidence into a cautious feed-check recommendation", () => {
    const result = buildRecommendation(input("FEED_LOW"));
    expect(result).toMatchObject({
      type: "FEED_CHECK",
      title: "Check feed availability",
      severity: "WARNING",
      observedValue: 18,
      thresholdValue: 20,
      unit: "%",
      deviceSource: "SIMULATOR",
      ruleVersion: "recommendation-v1",
    });
    expect(result?.suggestedAction).toContain("Verify the sensor reading");
  });

  it("maps low-water alerts without issuing a device instruction", () => {
    const result = buildRecommendation(input("WATER_LOW"));
    expect(result?.type).toBe("WATER_CHECK");
    expect(result?.title).toBe("Check water availability");
    expect(result?.suggestedAction).toContain("established water plan");
    expect(result?.suggestedAction).not.toMatch(/pump|actuat|command|mqtt/i);
  });

  it("maps high temperature to an explanatory heat-plan review", () => {
    const result = buildRecommendation(input("HIGH_TEMPERATURE", {
      severity: "CRITICAL",
      observedValue: 35,
      thresholdValue: 35,
      unit: "°C",
    }));
    expect(result).toMatchObject({ type: "HEAT_RESPONSE", severity: "CRITICAL", observedValue: 35, thresholdValue: 35, unit: "°C" });
    expect(result?.suggestedAction).toContain("does not activate equipment");
  });

  it("does not recommend action for informational or resolved alerts", () => {
    expect(buildRecommendation(input("FEED_LOW", { severity: "INFO" }))).toBeNull();
    expect(buildRecommendation(input("WATER_LOW", { status: "RESOLVED" }))).toBeNull();
  });

  it("preserves the supporting sensor timestamp, reason, and source", () => {
    const result = buildRecommendation(input("HIGH_TEMPERATURE", {
      reason: "Temperature is 32°C, at or above the configured warning threshold of 32°C.",
      observedValue: 32,
      thresholdValue: 32,
      unit: "°C",
      observedAt,
      generatedAt,
    }));
    expect(result?.reason).toContain("32°C");
    expect(result?.observedAt).toBe(observedAt);
    expect(result?.deviceSource).toBe("SIMULATOR");
  });
});
